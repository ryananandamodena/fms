package models

import (
	"time"
)

// Notification - Model untuk notifikasi approval
type Notification struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	RecipientID   uint      `json:"recipientId" gorm:"index;not null"`
	RecipientEmail string   `json:"recipientEmail"`
	RecipientName string    `json:"recipientName"`
	RecipientRole string    `json:"recipientRole"`
	
	// Request Info
	Module        string    `json:"module" gorm:"not null"` // VEHICLE, BUILDING, TAX_KIR, SERVICE, MUTATION, SALES, CONTRACT, POD, LOKER, ATK, MAINTENANCE
	RequestID     string    `json:"requestId" gorm:"not null"`
	RequestNo     string    `json:"requestNo"`
	RequestType   string    `json:"requestType"` // NEW, UPDATE, DELETE
	
	// Notification Content
	Title         string    `json:"title" gorm:"not null"`
	Message       string    `json:"message" gorm:"type:text"`
	ActionURL     string    `json:"actionUrl"`
	
	// Requester Info
	RequesterID   uint      `json:"requesterId"`
	RequesterName string    `json:"requesterName"`
	RequesterEmail string   `json:"requesterEmail"`
	
	// Status
	Status        string    `json:"status" gorm:"default:'Unread'"` // Unread, Read, Actioned
	Priority      string    `json:"priority" gorm:"default:'Normal'"` // Low, Normal, High, Urgent
	
	// Email Status
	EmailSent     bool      `json:"emailSent" gorm:"default:false"`
	EmailSentAt   *time.Time `json:"emailSentAt"`
	
	// Timestamps
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
	ReadAt        *time.Time `json:"readAt"`
}

// ApprovalRequest - Model untuk tracking approval request
type ApprovalRequest struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	Module          string    `json:"module" gorm:"index;not null"`
	RequestID       string    `json:"requestId" gorm:"index;not null"`
	RequestNo       string    `json:"requestNo"`
	
	// Request Details
	RequestTitle    string    `json:"requestTitle"`
	RequestData     string    `json:"requestData" gorm:"type:text"` // JSON string of request data
	
	// Requester
	RequesterID     uint      `json:"requesterId"`
	RequesterName   string    `json:"requesterName"`
	RequesterEmail  string    `json:"requesterEmail"`
	RequesterDept   string    `json:"requesterDept"`
	RequesterBranch string    `json:"requesterBranch"`
	
	// Current Approval Level
	CurrentLevel    int       `json:"currentLevel" gorm:"default:1"`
	TotalLevels     int       `json:"totalLevels"`
	
	// Status
	Status          string    `json:"status" gorm:"default:'Pending'"` // Pending, Approved, Rejected, Revised
	
	// Timestamps
	SubmittedAt     time.Time `json:"submittedAt"`
	CompletedAt     *time.Time `json:"completedAt"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// ApprovalHistory - History setiap approval action
type ApprovalHistory struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	ApprovalRequestID uint    `json:"approvalRequestId" gorm:"index"`
	
	// Approver Info
	ApproverID      uint      `json:"approverId"`
	ApproverName    string    `json:"approverName"`
	ApproverEmail   string    `json:"approverEmail"`
	ApproverRole    string    `json:"approverRole"`
	
	// Action
	Level           int       `json:"level"`
	Action          string    `json:"action"` // Approved, Rejected, Revised
	Comment         string    `json:"comment" gorm:"type:text"`
	
	// Timestamps
	ActionAt        time.Time `json:"actionAt"`
	CreatedAt       time.Time `json:"createdAt"`
}

// EmailTemplate - Template email untuk berbagai jenis notifikasi
type EmailTemplate struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Module      string    `json:"module" gorm:"index"`
	Type        string    `json:"type"` // APPROVAL_REQUEST, APPROVED, REJECTED, REMINDER
	Subject     string    `json:"subject"`
	Body        string    `json:"body" gorm:"type:text"`
	IsActive    bool      `json:"isActive" gorm:"default:true"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// NotificationSetting - Pengaturan notifikasi per user
type NotificationSetting struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	UserID          uint      `json:"userId" gorm:"uniqueIndex;not null"`
	EmailEnabled    bool      `json:"emailEnabled" gorm:"default:true"`
	PushEnabled     bool      `json:"pushEnabled" gorm:"default:true"`
	
	// Module-specific settings (JSON)
	ModuleSettings  string    `json:"moduleSettings" gorm:"type:text"`
	
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}
