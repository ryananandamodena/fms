package models

import (
	"time"
)

// Vendor - Model untuk vendor/supplier
type Vendor struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	VendorCode   string    `json:"vendorCode" gorm:"uniqueIndex;not null"`
	VendorName   string    `json:"vendorName" gorm:"not null"`
	Nama         string    `json:"nama"` // Alias for vendorName
	Type         string    `json:"type"` // Goods, Service, Both
	Tipe         string    `json:"tipe"` // Alias
	Category     string    `json:"category"`
	Email        string    `json:"email"`
	Phone        string    `json:"phone"`
	NoTelp       string    `json:"noTelp"` // Alias
	Address      string    `json:"address"`
	Alamat       string    `json:"alamat"` // Alias
	Merek        string    `json:"merek"`
	Cabang       string    `json:"cabang"`
	PICName      string    `json:"picName"`
	BankName     string    `json:"bankName"`
	BankAccount  string    `json:"bankAccount"`
	NPWP         string    `json:"npwp"`
	Status       string    `json:"status" gorm:"default:'Active'"` // Active, Inactive, Blacklist
	Aktif        bool      `json:"aktif" gorm:"default:true"`
	
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// Insurance - Model untuk asuransi (kendaraan & gedung)
type Insurance struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	PolicyNumber  string    `json:"policyNumber" gorm:"uniqueIndex;not null"`
	AssetID       string    `json:"assetId"` // Vehicle ID or Building ID
	AssetName     string    `json:"assetName"` // No Polisi or Building Name
	Category      string    `json:"category"` // Vehicle, Building
	VendorID      *uint     `json:"vendorId"`
	Provider      string    `json:"provider"` // Insurance Vendor
	Type          string    `json:"type"` // All Risk, TLO, Property All Risk, Earthquake
	StartDate     string    `json:"startDate"`
	EndDate       string    `json:"endDate"`
	Premium       float64   `json:"premium"` // Biaya Premi
	SumInsured    float64   `json:"sumInsured"` // Nilai Pertanggungan
	Deductible    float64   `json:"deductible"` // Biaya resiko sendiri (OR)
	Status        string    `json:"status"` // Active, Expiring, Expired
	AttachmentUrl string    `json:"attachmentUrl"` // Softcopy Polis
	Claims        string    `json:"claims" gorm:"type:text"` // JSON array of InsuranceClaim
	
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// InsuranceClaim - Model untuk klaim asuransi
type InsuranceClaim struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	InsuranceID    uint      `json:"insuranceId" gorm:"index"`
	IncidentDate   string    `json:"incidentDate"`
	Description    string    `json:"description" gorm:"type:text"`
	ClaimAmount    float64   `json:"claimAmount"` // Estimasi biaya klaim
	CoveredAmount  float64   `json:"coveredAmount"` // Yang dibayar asuransi
	Status         string    `json:"status"` // Submitted, Survey, Approved, Paid, Rejected
	EvidencePhotos string    `json:"evidencePhotos" gorm:"type:text"` // JSON array
	Remarks        string    `json:"remarks" gorm:"type:text"`
	
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
