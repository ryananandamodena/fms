package models

import (
	"time"
)

// GeneralAsset - Model untuk aset umum (HC, IT, CS)
type GeneralAsset struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	AssetNumber     string    `json:"assetNumber" gorm:"uniqueIndex;not null"`
	AssetCategory   string    `json:"assetCategory"` // HC, IT, CS
	Type            string    `json:"type"` // Laptop, Chair, etc.
	AssetName       string    `json:"assetName"`
	Ownership       string    `json:"ownership"`
	AssetLocation   string    `json:"assetLocation"`
	SubLocation     string    `json:"subLocation"`
	Department      string    `json:"department"`
	Channel         string    `json:"channel"`
	Address         string    `json:"address"`
	PurchasePrice   float64   `json:"purchasePrice"`
	PurchaseDate    string    `json:"purchaseDate"`
	Brand           string    `json:"brand"`
	ModelNumber     string    `json:"modelNumber"`
	PIC             string    `json:"pic"`
	SourceCategory  string    `json:"sourceCategory"` // Asset HC, Asset IT
	Status          string    `json:"status" gorm:"default:'Active'"`
	ApprovalStatus  string    `json:"approvalStatus" gorm:"default:'Pending'"`
	AttachmentUrl   string    `json:"attachmentUrl"`
	
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// AssetMaintenance - Model untuk pemeliharaan aset umum
type AssetMaintenance struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	AssetID          *uint     `json:"assetId"`
	AssetNumber      string    `json:"assetNumber"`
	AssetName        string    `json:"assetName"`
	Location         string    `json:"location"`
	Category         string    `json:"category"` // AC, Genset, etc.
	Frequency        string    `json:"frequency"` // Monthly, Quarterly, Yearly
	LastMaintenanceDate string `json:"lastMaintenanceDate"`
	NextMaintenanceDate string `json:"nextMaintenanceDate"`
	VendorID         *uint     `json:"vendorId"`
	Vendor           string    `json:"vendor"`
	Cost             float64   `json:"cost"`
	Status           string    `json:"status"` // Safe, Warning, Overdue
	Notes            string    `json:"notes" gorm:"type:text"`
	
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// MaintenanceReminder - Model untuk reminder pemeliharaan
type MaintenanceReminder struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	AssetID             *uint     `json:"assetId"`
	AssetName           string    `json:"assetName"`
	AssetCode           string    `json:"assetCode"`
	Location            string    `json:"location"`
	Category            string    `json:"category"`
	Frequency           string    `json:"frequency"`
	LastMaintenanceDate string    `json:"lastMaintenanceDate"`
	NextMaintenanceDate string    `json:"nextMaintenanceDate"`
	Status              string    `json:"status"` // Safe, Warning, Overdue
	Vendor              string    `json:"vendor"`
	
	CreatedAt           time.Time `json:"createdAt"`
	UpdatedAt           time.Time `json:"updatedAt"`
}


// AssetMutation - Model untuk mutasi aset umum
type AssetMutation struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	AssetID         *uint     `json:"assetId"`
	AssetNumber     string    `json:"assetNumber"`
	AssetName       string    `json:"assetName"`
	AssetType       string    `json:"assetType"` // GENERAL_ASSET
	CabangAset      string    `json:"cabangAset"`
	TipeMutasi      string    `json:"tipeMutasi"`
	TglPermintaan   string    `json:"tglPermintaan"`
	LokasiAsal      string    `json:"lokasiAsal"`
	LokasiTujuan    string    `json:"lokasiTujuan"`
	BiayaMutasi     float64   `json:"biayaMutasi"`
	PICBefore       string    `json:"picBefore"`
	PICAfter        string    `json:"picAfter"`
	ChecklistCondition string `json:"checklistCondition" gorm:"type:text"` // JSON array
	Status          string    `json:"status" gorm:"default:'Pending'"`
	StatusApproval  string    `json:"statusApproval" gorm:"default:'Pending'"`
	
	// Photos
	PhotoFront      string    `json:"photoFront"`
	PhotoRear       string    `json:"photoRear"`
	PhotoRight      string    `json:"photoRight"`
	PhotoLeft       string    `json:"photoLeft"`
	PhotoInterior   string    `json:"photoInterior"`
	DocumentStnk    string    `json:"documentStnk"`
	
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// AssetSale - Model untuk penjualan aset umum
type AssetSale struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	AssetID         *uint     `json:"assetId"`
	AssetNumber     string    `json:"assetNumber"`
	AssetName       string    `json:"assetName"`
	AssetType       string    `json:"assetType"` // GENERAL_ASSET
	TglRequest      string    `json:"tglRequest"`
	Channel         string    `json:"channel"`
	Cabang          string    `json:"cabang"`
	HargaPembuka    float64   `json:"hargaPembuka"`
	HargaTertinggi  float64   `json:"hargaTertinggi"`
	Status          string    `json:"status" gorm:"default:'Open'"`
	StatusApproval  string    `json:"statusApproval" gorm:"default:'Pending'"`
	Bids            string    `json:"bids" gorm:"type:text"` // JSON array of bids
	
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}
