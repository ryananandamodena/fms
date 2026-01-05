package models

import (
	"time"
)

// Reminder - Model untuk reminder dokumen/aset
type Reminder struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	DocumentName  string    `json:"documentName"`
	BuildingName  string    `json:"buildingName"`
	AssetNo       string    `json:"assetNo"`
	ExpiryDate    string    `json:"expiryDate"`
	DaysRemaining int       `json:"daysRemaining"`
	Status        string    `json:"status"` // Safe, Warning, Urgent, Expired
	Category      string    `json:"category"` // Insurance, Lease, Legal, Permit
	Source        string    `json:"source"` // System, Manual
	
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// VehicleReminder - Model untuk reminder kendaraan
type VehicleReminder struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	NoPolisi    string    `json:"noPolisi" gorm:"index"`
	VehicleName string    `json:"vehicleName"`
	Type        string    `json:"type"` // STNK 1 Tahunan, STNK 5 Tahunan, KIR
	ExpiryDate  string    `json:"expiryDate"`
	Branch      string    `json:"branch"`
	Status      string    `json:"status"` // Safe, Warning, Critical, Expired
	
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
