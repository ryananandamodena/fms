package controllers

import (
	"fms-backend/config"
	"fms-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ========== BUILDING ==========

func GetBuildings(c *gin.Context) {
	var buildings []models.Building
	query := config.DB.Order("created_at DESC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if ownership := c.Query("ownership"); ownership != "" {
		query = query.Where("ownership = ?", ownership)
	}
	if buildingType := c.Query("type"); buildingType != "" {
		query = query.Where("type = ?", buildingType)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ? OR address ILIKE ? OR city ILIKE ?", 
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	
	query.Find(&buildings)
	c.JSON(http.StatusOK, buildings)
}

func GetBuilding(c *gin.Context) {
	id := c.Param("id")
	var building models.Building
	if err := config.DB.First(&building, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Building not found"})
		return
	}
	c.JSON(http.StatusOK, building)
}

func CreateBuilding(c *gin.Context) {
	var building models.Building
	if err := c.ShouldBindJSON(&building); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&building).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, building)
}

func UpdateBuilding(c *gin.Context) {
	id := c.Param("id")
	var building models.Building
	if err := config.DB.First(&building, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Building not found"})
		return
	}
	if err := c.ShouldBindJSON(&building); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&building)
	c.JSON(http.StatusOK, building)
}

func DeleteBuilding(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Building{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Building deleted"})
}

// ========== BUILDING ASSET ==========

func GetBuildingAssets(c *gin.Context) {
	var assets []models.BuildingAsset
	query := config.DB.Order("created_at DESC")
	
	if buildingId := c.Query("buildingId"); buildingId != "" {
		query = query.Where("building_id = ?", buildingId)
	}
	if assetType := c.Query("assetType"); assetType != "" {
		query = query.Where("asset_type = ?", assetType)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&assets)
	c.JSON(http.StatusOK, assets)
}

func GetBuildingAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.BuildingAsset
	if err := config.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Building asset not found"})
		return
	}
	c.JSON(http.StatusOK, asset)
}

func CreateBuildingAsset(c *gin.Context) {
	var asset models.BuildingAsset
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, asset)
}

func UpdateBuildingAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.BuildingAsset
	if err := config.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Building asset not found"})
		return
	}
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&asset)
	c.JSON(http.StatusOK, asset)
}

func DeleteBuildingAsset(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.BuildingAsset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Building asset deleted"})
}

// ========== BUILDING MAINTENANCE ==========

func GetBuildingMaintenances(c *gin.Context) {
	var maintenances []models.BuildingMaintenance
	query := config.DB.Order("created_at DESC")
	
	if assetId := c.Query("assetId"); assetId != "" {
		query = query.Where("asset_id = ?", assetId)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if maintenanceType := c.Query("maintenanceType"); maintenanceType != "" {
		query = query.Where("maintenance_type = ?", maintenanceType)
	}
	
	query.Find(&maintenances)
	c.JSON(http.StatusOK, maintenances)
}

func GetBuildingMaintenance(c *gin.Context) {
	id := c.Param("id")
	var maintenance models.BuildingMaintenance
	if err := config.DB.First(&maintenance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Maintenance not found"})
		return
	}
	c.JSON(http.StatusOK, maintenance)
}

func CreateBuildingMaintenance(c *gin.Context) {
	var maintenance models.BuildingMaintenance
	if err := c.ShouldBindJSON(&maintenance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&maintenance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, maintenance)
}

func UpdateBuildingMaintenance(c *gin.Context) {
	id := c.Param("id")
	var maintenance models.BuildingMaintenance
	if err := config.DB.First(&maintenance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Maintenance not found"})
		return
	}
	if err := c.ShouldBindJSON(&maintenance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&maintenance)
	c.JSON(http.StatusOK, maintenance)
}

func DeleteBuildingMaintenance(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.BuildingMaintenance{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Maintenance deleted"})
}

// ========== UTILITY ==========

func GetUtilities(c *gin.Context) {
	var utilities []models.Utility
	query := config.DB.Order("period DESC")
	
	if buildingId := c.Query("buildingId"); buildingId != "" {
		query = query.Where("building_id = ?", buildingId)
	}
	if utilityType := c.Query("type"); utilityType != "" {
		query = query.Where("type = ?", utilityType)
	}
	if period := c.Query("period"); period != "" {
		query = query.Where("period = ?", period)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&utilities)
	c.JSON(http.StatusOK, utilities)
}

func GetUtility(c *gin.Context) {
	id := c.Param("id")
	var utility models.Utility
	if err := config.DB.First(&utility, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Utility not found"})
		return
	}
	c.JSON(http.StatusOK, utility)
}

func CreateUtility(c *gin.Context) {
	var utility models.Utility
	if err := c.ShouldBindJSON(&utility); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Calculate usage
	utility.Usage = utility.MeterEnd - utility.MeterStart
	
	if err := config.DB.Create(&utility).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, utility)
}

func UpdateUtility(c *gin.Context) {
	id := c.Param("id")
	var utility models.Utility
	if err := config.DB.First(&utility, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Utility not found"})
		return
	}
	if err := c.ShouldBindJSON(&utility); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	utility.Usage = utility.MeterEnd - utility.MeterStart
	config.DB.Save(&utility)
	c.JSON(http.StatusOK, utility)
}

func DeleteUtility(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Utility{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Utility deleted"})
}

// ========== COMPLIANCE ==========

func GetCompliances(c *gin.Context) {
	var compliances []models.Compliance
	query := config.DB.Order("expiry_date ASC")
	
	if buildingId := c.Query("buildingId"); buildingId != "" {
		query = query.Where("building_id = ?", buildingId)
	}
	if documentType := c.Query("documentType"); documentType != "" {
		query = query.Where("document_type = ?", documentType)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&compliances)
	c.JSON(http.StatusOK, compliances)
}

func GetCompliance(c *gin.Context) {
	id := c.Param("id")
	var compliance models.Compliance
	if err := config.DB.First(&compliance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Compliance not found"})
		return
	}
	c.JSON(http.StatusOK, compliance)
}

func CreateCompliance(c *gin.Context) {
	var compliance models.Compliance
	if err := c.ShouldBindJSON(&compliance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&compliance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, compliance)
}

func UpdateCompliance(c *gin.Context) {
	id := c.Param("id")
	var compliance models.Compliance
	if err := config.DB.First(&compliance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Compliance not found"})
		return
	}
	if err := c.ShouldBindJSON(&compliance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&compliance)
	c.JSON(http.StatusOK, compliance)
}

func DeleteCompliance(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Compliance{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Compliance deleted"})
}

// ========== LOG BOOK ==========

func GetLogBooks(c *gin.Context) {
	var logBooks []models.LogBook
	query := config.DB.Order("tanggal_kunjungan DESC")
	
	if buildingId := c.Query("buildingId"); buildingId != "" {
		query = query.Where("building_id = ?", buildingId)
	}
	if kategori := c.Query("kategoriTamu"); kategori != "" {
		query = query.Where("kategori_tamu = ?", kategori)
	}
	if date := c.Query("date"); date != "" {
		query = query.Where("tanggal_kunjungan = ?", date)
	}
	
	query.Find(&logBooks)
	c.JSON(http.StatusOK, logBooks)
}

func GetLogBook(c *gin.Context) {
	id := c.Param("id")
	var logBook models.LogBook
	if err := config.DB.First(&logBook, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Log book not found"})
		return
	}
	c.JSON(http.StatusOK, logBook)
}

func CreateLogBook(c *gin.Context) {
	var logBook models.LogBook
	if err := c.ShouldBindJSON(&logBook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&logBook).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, logBook)
}

func UpdateLogBook(c *gin.Context) {
	id := c.Param("id")
	var logBook models.LogBook
	if err := config.DB.First(&logBook, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Log book not found"})
		return
	}
	if err := c.ShouldBindJSON(&logBook); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&logBook)
	c.JSON(http.StatusOK, logBook)
}

func DeleteLogBook(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.LogBook{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Log book deleted"})
}

// ========== LOKER ==========

func GetLokers(c *gin.Context) {
	var lokers []models.Loker
	query := config.DB.Order("created_at DESC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if location := c.Query("location"); location != "" {
		query = query.Where("location = ?", location)
	}
	
	query.Find(&lokers)
	c.JSON(http.StatusOK, lokers)
}

func GetLoker(c *gin.Context) {
	id := c.Param("id")
	var loker models.Loker
	if err := config.DB.First(&loker, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Loker not found"})
		return
	}
	c.JSON(http.StatusOK, loker)
}

func CreateLoker(c *gin.Context) {
	var loker models.Loker
	if err := c.ShouldBindJSON(&loker); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&loker).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, loker)
}

func UpdateLoker(c *gin.Context) {
	id := c.Param("id")
	var loker models.Loker
	if err := config.DB.First(&loker, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Loker not found"})
		return
	}
	if err := c.ShouldBindJSON(&loker); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&loker)
	c.JSON(http.StatusOK, loker)
}

func DeleteLoker(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Loker{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Loker deleted"})
}

// ========== LOKER REQUEST ==========

func GetLokerRequests(c *gin.Context) {
	var requests []models.LokerRequest
	query := config.DB.Order("created_at DESC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&requests)
	c.JSON(http.StatusOK, requests)
}

func GetLokerRequest(c *gin.Context) {
	id := c.Param("id")
	var request models.LokerRequest
	if err := config.DB.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Loker request not found"})
		return
	}
	c.JSON(http.StatusOK, request)
}

func CreateLokerRequest(c *gin.Context) {
	var request models.LokerRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, request)
}

func UpdateLokerRequest(c *gin.Context) {
	id := c.Param("id")
	var request models.LokerRequest
	if err := config.DB.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Loker request not found"})
		return
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&request)
	c.JSON(http.StatusOK, request)
}

func DeleteLokerRequest(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.LokerRequest{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Loker request deleted"})
}

// ========== MASTER APPROVAL ==========

func GetMasterApprovals(c *gin.Context) {
	var approvals []models.MasterApproval
	query := config.DB.Preload("Tiers").Order("module ASC")
	
	if module := c.Query("module"); module != "" {
		query = query.Where("module = ?", module)
	}
	if branch := c.Query("branch"); branch != "" {
		query = query.Where("branch = ?", branch)
	}
	
	query.Find(&approvals)
	c.JSON(http.StatusOK, approvals)
}

func GetMasterApproval(c *gin.Context) {
	id := c.Param("id")
	var approval models.MasterApproval
	if err := config.DB.Preload("Tiers").First(&approval, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Master approval not found"})
		return
	}
	c.JSON(http.StatusOK, approval)
}

func CreateMasterApproval(c *gin.Context) {
	var approval models.MasterApproval
	if err := c.ShouldBindJSON(&approval); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&approval).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, approval)
}

func UpdateMasterApproval(c *gin.Context) {
	id := c.Param("id")
	var approval models.MasterApproval
	if err := config.DB.First(&approval, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Master approval not found"})
		return
	}
	
	// Delete existing tiers
	config.DB.Where("master_approval_id = ?", id).Delete(&models.ApprovalTier{})
	
	if err := c.ShouldBindJSON(&approval); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&approval)
	c.JSON(http.StatusOK, approval)
}

func DeleteMasterApproval(c *gin.Context) {
	id := c.Param("id")
	// Delete tiers first
	config.DB.Where("master_approval_id = ?", id).Delete(&models.ApprovalTier{})
	
	if err := config.DB.Delete(&models.MasterApproval{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Master approval deleted"})
}

// ========== BUILDING REMINDERS ==========

func GetBuildingReminders(c *gin.Context) {
	var reminders []models.Reminder
	query := config.DB.Where("category IN ?", []string{"Insurance", "Lease", "Legal", "Permit"}).Order("expiry_date ASC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	
	query.Find(&reminders)
	c.JSON(http.StatusOK, reminders)
}
