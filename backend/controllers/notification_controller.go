package controllers

import (
	"fms-backend/config"
	"fms-backend/models"
	"fms-backend/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GetNotifications - Ambil semua notifikasi untuk user
func GetNotifications(c *gin.Context) {
	var notifications []models.Notification
	
	recipientID := c.Query("recipientId")
	status := c.Query("status")
	module := c.Query("module")
	limit := c.DefaultQuery("limit", "50")
	
	query := config.DB.Order("created_at DESC")
	
	if recipientID != "" {
		query = query.Where("recipient_id = ?", recipientID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if module != "" {
		query = query.Where("module = ?", module)
	}
	
	limitInt, _ := strconv.Atoi(limit)
	query = query.Limit(limitInt)
	
	if err := query.Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, notifications)
}

// GetUnreadCount - Hitung notifikasi yang belum dibaca
func GetUnreadCount(c *gin.Context) {
	recipientID := c.Query("recipientId")
	
	var count int64
	query := config.DB.Model(&models.Notification{}).Where("status = ?", "Unread")
	
	if recipientID != "" {
		query = query.Where("recipient_id = ?", recipientID)
	}
	
	if err := query.Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"count": count})
}

// MarkAsRead - Tandai notifikasi sebagai sudah dibaca
func MarkAsRead(c *gin.Context) {
	id := c.Param("id")
	
	now := time.Now()
	if err := config.DB.Model(&models.Notification{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":  "Read",
		"read_at": now,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

// MarkAllAsRead - Tandai semua notifikasi sebagai sudah dibaca
func MarkAllAsRead(c *gin.Context) {
	recipientID := c.Query("recipientId")
	
	now := time.Now()
	query := config.DB.Model(&models.Notification{}).Where("status = ?", "Unread")
	
	if recipientID != "" {
		query = query.Where("recipient_id = ?", recipientID)
	}
	
	if err := query.Updates(map[string]interface{}{
		"status":  "Read",
		"read_at": now,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

// CreateApprovalNotificationRequest - Request body untuk membuat notifikasi approval
type CreateApprovalNotificationRequest struct {
	Module          string            `json:"module" binding:"required"`
	RequestID       string            `json:"requestId" binding:"required"`
	RequestNo       string            `json:"requestNo" binding:"required"`
	RequestTitle    string            `json:"requestTitle"`
	RequestType     string            `json:"requestType"`
	RequesterID     uint              `json:"requesterId"`
	RequesterName   string            `json:"requesterName"`
	RequesterEmail  string            `json:"requesterEmail"`
	RequesterDept   string            `json:"requesterDept"`
	RequesterBranch string            `json:"requesterBranch"`
	Approvers       []ApproverInfo    `json:"approvers" binding:"required"`
	Details         map[string]string `json:"details"`
}

type ApproverInfo struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

// CreateApprovalNotification - Buat notifikasi approval baru dan kirim email
func CreateApprovalNotification(c *gin.Context) {
	var req CreateApprovalNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	moduleLabel := utils.GetModuleLabel(req.Module)
	appURL := "http://localhost:5173" // Ganti dengan URL production
	
	var notifications []models.Notification
	
	for _, approver := range req.Approvers {
		actionURL := appURL + getModuleURL(req.Module) + "?id=" + req.RequestID
		
		notification := models.Notification{
			RecipientID:    approver.ID,
			RecipientEmail: approver.Email,
			RecipientName:  approver.Name,
			RecipientRole:  approver.Role,
			Module:         req.Module,
			RequestID:      req.RequestID,
			RequestNo:      req.RequestNo,
			RequestType:    req.RequestType,
			Title:          "Permintaan Approval " + moduleLabel,
			Message:        req.RequesterName + " mengajukan permintaan " + moduleLabel + " yang memerlukan approval Anda.",
			ActionURL:      actionURL,
			RequesterID:    req.RequesterID,
			RequesterName:  req.RequesterName,
			RequesterEmail: req.RequesterEmail,
			Status:         "Unread",
			Priority:       "Normal",
		}
		
		if err := config.DB.Create(&notification).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		
		notifications = append(notifications, notification)
		
		// Kirim email ke approver
		go func(n models.Notification, approverEmail string) {
			emailData := utils.ApprovalEmailData{
				RecipientName:   n.RecipientName,
				RecipientRole:   n.RecipientRole,
				Module:          req.Module,
				ModuleLabel:     moduleLabel,
				RequestNo:       req.RequestNo,
				RequestTitle:    req.RequestTitle,
				RequesterName:   req.RequesterName,
				RequesterDept:   req.RequesterDept,
				RequesterBranch: req.RequesterBranch,
				RequestDate:     time.Now().Format("02 Jan 2006"),
				ActionURL:       n.ActionURL,
				Details:         req.Details,
				AppURL:          appURL,
			}
			
			if err := utils.SendApprovalRequestEmail(emailData, approverEmail); err == nil {
				// Update email sent status
				now := time.Now()
				config.DB.Model(&models.Notification{}).Where("id = ?", n.ID).Updates(map[string]interface{}{
					"email_sent":    true,
					"email_sent_at": now,
				})
			}
		}(notification, approver.Email)
	}
	
	c.JSON(http.StatusCreated, gin.H{
		"message":       "Notifications created and emails queued",
		"notifications": notifications,
	})
}

// ProcessApprovalRequest - Request body untuk memproses approval
type ProcessApprovalRequest struct {
	Module         string `json:"module" binding:"required"`
	RequestID      string `json:"requestId" binding:"required"`
	RequestNo      string `json:"requestNo"`
	RequestTitle   string `json:"requestTitle"`
	Action         string `json:"action" binding:"required"` // Approved, Rejected, Revised
	Comment        string `json:"comment"`
	ApproverID     uint   `json:"approverId"`
	ApproverName   string `json:"approverName"`
	ApproverEmail  string `json:"approverEmail"`
	ApproverRole   string `json:"approverRole"`
	RequesterID    uint   `json:"requesterId"`
	RequesterName  string `json:"requesterName"`
	RequesterEmail string `json:"requesterEmail"`
}

// ProcessApproval - Proses approval dan kirim notifikasi ke requester
func ProcessApproval(c *gin.Context) {
	var req ProcessApprovalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	moduleLabel := utils.GetModuleLabel(req.Module)
	appURL := "http://localhost:5173"
	actionURL := appURL + getModuleURL(req.Module) + "?id=" + req.RequestID
	
	// Buat notifikasi untuk requester
	statusText := "disetujui"
	if req.Action == "Rejected" {
		statusText = "ditolak"
	} else if req.Action == "Revised" {
		statusText = "perlu direvisi"
	}
	
	notification := models.Notification{
		RecipientID:    req.RequesterID,
		RecipientEmail: req.RequesterEmail,
		RecipientName:  req.RequesterName,
		Module:         req.Module,
		RequestID:      req.RequestID,
		RequestNo:      req.RequestNo,
		Title:          moduleLabel + " " + statusText,
		Message:        "Permintaan " + moduleLabel + " Anda telah " + statusText + " oleh " + req.ApproverName + ".",
		ActionURL:      actionURL,
		RequesterID:    req.ApproverID,
		RequesterName:  req.ApproverName,
		RequesterEmail: req.ApproverEmail,
		Status:         "Unread",
		Priority:       "High",
	}
	
	if err := config.DB.Create(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// Update notifikasi approver menjadi Actioned
	config.DB.Model(&models.Notification{}).
		Where("module = ? AND request_id = ? AND recipient_id = ?", req.Module, req.RequestID, req.ApproverID).
		Update("status", "Actioned")
	
	// Kirim email ke requester
	go func() {
		emailData := utils.ApprovalEmailData{
			RecipientName: req.RequesterName,
			Module:        req.Module,
			ModuleLabel:   moduleLabel,
			RequestNo:     req.RequestNo,
			RequestTitle:  req.RequestTitle,
			RequesterName: req.RequesterName,
			ActionURL:     actionURL,
			AppURL:        appURL,
		}
		
		if err := utils.SendApprovalResultEmail(emailData, req.RequesterEmail, req.Action, req.Comment); err == nil {
			now := time.Now()
			config.DB.Model(&models.Notification{}).Where("id = ?", notification.ID).Updates(map[string]interface{}{
				"email_sent":    true,
				"email_sent_at": now,
			})
		}
	}()
	
	c.JSON(http.StatusOK, gin.H{
		"message":      "Approval processed and notification sent",
		"notification": notification,
	})
}

// DeleteNotification - Hapus notifikasi
func DeleteNotification(c *gin.Context) {
	id := c.Param("id")
	
	if err := config.DB.Delete(&models.Notification{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted"})
}

// getModuleURL - Mendapatkan URL untuk setiap modul
func getModuleURL(module string) string {
	urls := map[string]string{
		"VEHICLE":        "/kendaraan/daftar-aset",
		"BUILDING":       "/gedung/daftar-gedung",
		"TAX_KIR":        "/kendaraan/pajak-kir",
		"SERVICE":        "/kendaraan/servis",
		"MUTATION":       "/kendaraan/mutasi",
		"SALES":          "/kendaraan/penjualan",
		"CONTRACT":       "/kendaraan/kontrak",
		"POD":            "/pod/permintaan",
		"LOKER":          "/loker/permintaan",
		"ATK":            "/atk/request",
		"MAINTENANCE":    "/gedung/pemeliharaan",
		"INSURANCE":      "/kendaraan/asuransi",
		"BUILDING_ASSET": "/gedung/aset-gedung",
	}
	if url, ok := urls[module]; ok {
		return url
	}
	return "/"
}
