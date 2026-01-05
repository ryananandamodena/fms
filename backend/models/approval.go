package models

import (
	"time"
)

// MasterApproval - Model untuk konfigurasi approval workflow
type MasterApproval struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Module    string         `json:"module" gorm:"index;not null"` // VEHICLE, BUILDING, SERVICE, etc.
	Branch    string         `json:"branch"`
	Tiers     []ApprovalTier `json:"tiers" gorm:"foreignKey:MasterApprovalID"`
	UpdatedAt time.Time      `json:"updatedAt"`
	CreatedAt time.Time      `json:"createdAt"`
}

// ApprovalTier - Tier dalam approval workflow
type ApprovalTier struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	MasterApprovalID uint      `json:"masterApprovalId" gorm:"index"`
	Level            int       `json:"level"`
	Type             string    `json:"type"`  // Role, User
	Value            string    `json:"value"` // Role name or User ID
	SLA              int       `json:"sla"`   // SLA in hours
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}
