package models

import (
	"time"
)

// Building - Model untuk gedung
type Building struct {
	ID                  uint      `json:"id" gorm:"primaryKey"`
	AssetNo             string    `json:"assetNo" gorm:"uniqueIndex;not null"`
	Name                string    `json:"name" gorm:"not null"`
	Type                string    `json:"type"`
	Location            string    `json:"location"`
	Address             string    `json:"address"`
	City                string    `json:"city"`
	District            string    `json:"district"`
	Province            string    `json:"province"`
	
	// Location Details
	DistanceToDealer    string    `json:"distanceToDealer"`
	RoadCondition       string    `json:"roadCondition"`
	
	// Utilities
	ElectricityPower    string    `json:"electricityPower"`
	WaterSource         string    `json:"waterSource"`
	PhoneLineCount      string    `json:"phoneLineCount"`
	
	// Physical Specs
	LandArea            string    `json:"landArea"`
	BuildingArea        string    `json:"buildingArea"`
	FrontYardArea       string    `json:"frontYardArea"`
	TotalFloors         string    `json:"totalFloors"`
	ParkingCapacity     string    `json:"parkingCapacity"`
	BuildingAge         string    `json:"buildingAge"`
	FenceCondition      string    `json:"fenceCondition"`
	GateCondition       string    `json:"gateCondition"`
	
	// Checklist & Features (JSON)
	StructureChecklist  string    `json:"structureChecklist" gorm:"type:text"`
	EnvironmentConditions string  `json:"environmentConditions" gorm:"type:text"`
	SecurityFeatures    string    `json:"securityFeatures" gorm:"type:text"`
	DocumentsAvailable  string    `json:"documentsAvailable" gorm:"type:text"`
	
	// Renovation
	RenovationNeeded       bool    `json:"renovationNeeded"`
	RenovationCostEstimate string  `json:"renovationCostEstimate"`
	RenovationTimeEstimate string  `json:"renovationTimeEstimate"`
	RenovationDetailsObj   string  `json:"renovationDetailsObj" gorm:"type:text"`
	LocationContext        string  `json:"locationContext" gorm:"type:text"`
	
	// Cost
	RentCost               string  `json:"rentCost"`
	TotalMaintenanceCost   string  `json:"totalMaintenanceCost"`
	UtilityCost            string  `json:"utilityCost"`
	PurchasePrice          string  `json:"purchasePrice"`
	
	// Lease Details
	StartDate              string  `json:"startDate"`
	EndDate                string  `json:"endDate"`
	TaxPPH                 string  `json:"taxPPH"`
	NotaryFee              string  `json:"notaryFee"`
	
	// Owner
	OwnerName              string  `json:"ownerName"`
	OwnerPhone             string  `json:"ownerPhone"`
	OwnerAddress           string  `json:"ownerAddress"`
	
	// Business Notes
	BusinessNotes          string  `json:"businessNotes" gorm:"type:text"`
	
	// Status
	Status                 string  `json:"status" gorm:"default:'Pending'"`
	Ownership              string  `json:"ownership" gorm:"default:'Rent'"` // Rent, Own
	
	// Proposals & Workflow (JSON)
	Proposals              string  `json:"proposals" gorm:"type:text"`
	Workflow               string  `json:"workflow" gorm:"type:text"`
	
	// Floor Plan
	FloorPlanImage         string  `json:"floorPlanImage"`
	
	CreatedAt              time.Time `json:"createdAt"`
	UpdatedAt              time.Time `json:"updatedAt"`
}

// BuildingAsset - Model untuk aset di dalam gedung
type BuildingAsset struct {
	ID                   uint      `json:"id" gorm:"primaryKey"`
	BuildingID           *uint     `json:"buildingId"`
	AssetCode            string    `json:"assetCode" gorm:"uniqueIndex;not null"`
	AssetName            string    `json:"assetName" gorm:"not null"`
	AssetType            string    `json:"assetType"` // AC, Genset, Lift, etc.
	BuildingName         string    `json:"buildingName"`
	Floor                string    `json:"floor"`
	RoomName             string    `json:"roomName"`
	Brand                string    `json:"brand"`
	Ownership            string    `json:"ownership"`
	PurchasePrice        string    `json:"purchasePrice"`
	PurchaseDate         string    `json:"purchaseDate"`
	MaintenanceFrequency string    `json:"maintenanceFrequency"` // Monthly, Quarterly, Yearly
	PIC                  string    `json:"pic"`
	Status               string    `json:"status" gorm:"default:'Active'"`
	ApprovalStatus       string    `json:"approvalStatus" gorm:"default:'Draft'"` // Draft, Pending Approval, Approved, Rejected
	AttachmentUrl        string    `json:"attachmentUrl"`
	Proposals            string    `json:"proposals" gorm:"type:text"` // JSON array of MaintenanceProposal
	
	CreatedAt            time.Time `json:"createdAt"`
	UpdatedAt            time.Time `json:"updatedAt"`
}

// BuildingMaintenance - Model untuk pemeliharaan gedung
type BuildingMaintenance struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	AssetID          *uint     `json:"assetId"`
	AssetName        string    `json:"assetName"`
	BuildingLocation string    `json:"buildingLocation"`
	VendorID         *uint     `json:"vendorId"`
	Vendor           string    `json:"vendor"`
	Technician       string    `json:"technician"`
	RequestDate      string    `json:"requestDate"`
	CompletionDate   string    `json:"completionDate"`
	MaintenanceType  string    `json:"maintenanceType"` // Preventive, Corrective, Emergency
	Description      string    `json:"description" gorm:"type:text"`
	Cost             float64   `json:"cost"`
	Status           string    `json:"status" gorm:"default:'Scheduled'"` // Scheduled, In Progress, Completed, Pending
	ApprovalStatus   string    `json:"approvalStatus" gorm:"default:'Draft'"`
	EvidenceBefore   string    `json:"evidenceBefore"`
	EvidenceAfter    string    `json:"evidenceAfter"`
	Rating           int       `json:"rating"`
	
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

// Utility - Model untuk monitoring utilitas
type Utility struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	BuildingID    *uint     `json:"buildingId"`
	Period        string    `json:"period"` // YYYY-MM
	Date          string    `json:"date"`
	Location      string    `json:"location"`
	Type          string    `json:"type"` // Listrik, Air, Internet, Gas
	MeterStart    float64   `json:"meterStart"`
	MeterEnd      float64   `json:"meterEnd"`
	Usage         float64   `json:"usage"`
	Unit          string    `json:"unit"` // kWh, m3, etc.
	Cost          float64   `json:"cost"`
	Status        string    `json:"status" gorm:"default:'Pending'"` // Paid, Unpaid, Pending, Pending Review
	AttachmentUrl string    `json:"attachmentUrl"`
	
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// Compliance - Model untuk dokumen compliance/legal
type Compliance struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	BuildingID    *uint     `json:"buildingId"`
	BuildingName  string    `json:"buildingName"`
	DocumentName  string    `json:"documentName" gorm:"not null"`
	DocumentType  string    `json:"documentType"` // Contract, Permit, License, Certificate
	IssueDate     string    `json:"issueDate"`
	ExpiryDate    string    `json:"expiryDate"`
	IssuingBody   string    `json:"issuingBody"`
	Status        string    `json:"status"` // Safe, Warning, Urgent, Expired
	AttachmentUrl string    `json:"attachmentUrl"`
	Notes         string    `json:"notes" gorm:"type:text"`
	
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// LogBook - Model untuk log book kunjungan
type LogBook struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	BuildingID       *uint     `json:"buildingId"`
	LokasiModena     string    `json:"lokasiModena"`
	KategoriTamu     string    `json:"kategoriTamu"`
	NamaTamu         string    `json:"namaTamu" gorm:"not null"`
	TanggalKunjungan string    `json:"tanggalKunjungan"`
	JamDatang        string    `json:"jamDatang"`
	JamPulang        string    `json:"jamPulang"`
	Wanita           int       `json:"wanita"`
	LakiLaki         int       `json:"lakiLaki"`
	AnakAnak         int       `json:"anakAnak"`
	Note             string    `json:"note" gorm:"type:text"`
	
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}


// Loker - Model untuk loker karyawan
type Loker struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	KodeLoker     string    `json:"kodeLoker" gorm:"uniqueIndex;not null"`
	NomorLoker    string    `json:"nomorLoker"`
	Location      string    `json:"location"`
	BuildingID    *uint     `json:"buildingId"`
	Floor         string    `json:"floor"`
	Status        string    `json:"status" gorm:"default:'Tersedia'"` // Tersedia, Terpakai, Rusak
	CurrentUser   string    `json:"currentUser"`
	CurrentUserID *uint     `json:"currentUserId"`
	AssignedDate  string    `json:"assignedDate"`
	Notes         string    `json:"notes" gorm:"type:text"`
	
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// LokerRequest - Model untuk permintaan loker
type LokerRequest struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	NoRequest      string    `json:"noRequest" gorm:"uniqueIndex;not null"`
	NamaKaryawan   string    `json:"namaKaryawan" gorm:"not null"`
	NIK            string    `json:"nik"`
	Departemen     string    `json:"departemen"`
	Cabang         string    `json:"cabang"`
	TglRequest     string    `json:"tglRequest"`
	Alasan         string    `json:"alasan" gorm:"type:text"`
	Status         string    `json:"status" gorm:"default:'Pending'"` // Pending, Approved, Rejected
	ApprovedBy     string    `json:"approvedBy"`
	ApprovedDate   string    `json:"approvedDate"`
	LokerID        *uint     `json:"lokerId"`
	Loker          *Loker    `json:"loker" gorm:"foreignKey:LokerID"`
	Keterangan     string    `json:"keterangan" gorm:"type:text"`
	
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}
