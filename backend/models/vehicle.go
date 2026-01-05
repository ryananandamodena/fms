package models

import (
	"time"
)

// Vehicle - Model untuk kendaraan
type Vehicle struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	NoPolisi          string    `json:"noPolisi" gorm:"uniqueIndex;not null"`
	Nama              string    `json:"nama"`
	Merek             string    `json:"merek"`
	TipeKendaraan     string    `json:"tipeKendaraan"`
	Model             string    `json:"model"`
	TahunPembuatan    string    `json:"tahunPembuatan"`
	Warna             string    `json:"warna"`
	IsiSilinder       string    `json:"isiSilinder"`
	NoRangka          string    `json:"noRangka"`
	NoMesin           string    `json:"noMesin"`
	NoBpkb            string    `json:"noBpkb"`
	KeteranganBpkb    string    `json:"keteranganBpkb"`
	MasaBerlaku1      string    `json:"masaBerlaku1"`      // STNK 1 Tahun
	MasaBerlaku5      string    `json:"masaBerlaku5"`      // STNK 5 Tahun
	MasaBerlakuKir    string    `json:"masaBerlakuKir"`
	TglBeli           string    `json:"tglBeli"`
	HargaBeli         float64   `json:"hargaBeli"`
	NoPolisAsuransi   string    `json:"noPolisAsuransi"`
	JangkaPertanggungan string  `json:"jangkaPertanggungan"`
	Channel           string    `json:"channel"`
	Cabang            string    `json:"cabang"`
	Pengguna          string    `json:"pengguna"`
	PenggunaUtama     string    `json:"penggunaUtama"`
	Address           string    `json:"address"`
	SubLocation       string    `json:"subLocation"`
	Location          string    `json:"location"`
	Status            string    `json:"status" gorm:"default:'Aktif'"` // Aktif, Nonaktif, Terjual
	Ownership         string    `json:"ownership" gorm:"default:'Milik Modena'"` // Milik Modena, Sewa
	ApprovalStatus    string    `json:"approvalStatus" gorm:"default:'Pending'"` // Pending, Approved, Rejected
	
	// Depreciation
	DepreciationMethod string  `json:"depreciationMethod"`
	UsefulLife         int     `json:"usefulLife"`
	ResidualValue      float64 `json:"residualValue"`
	
	// Photos & Documents
	PhotoFront  string `json:"photoFront"`
	PhotoRear   string `json:"photoRear"`
	PhotoRight  string `json:"photoRight"`
	PhotoLeft   string `json:"photoLeft"`
	StnkUrl     string `json:"stnkUrl"`
	KirUrl      string `json:"kirUrl"`
	
	// Workflow
	Workflow    string `json:"workflow" gorm:"type:text"` // JSON array of workflow steps
	
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// VehicleContract - Model untuk kontrak sewa kendaraan
type VehicleContract struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	NoKontrak       string    `json:"noKontrak" gorm:"uniqueIndex;not null"`
	NoPolisi        string    `json:"noPolisi" gorm:"index"`
	Aset            string    `json:"aset"` // Deskripsi unit
	VendorID        *uint     `json:"vendorId"`
	Vendor          string    `json:"vendor"`
	TglMulai        string    `json:"tglMulai"`
	TglBerakhir     string    `json:"tglBerakhir"`
	BiayaSewa       float64   `json:"biayaSewa"`
	Channel         string    `json:"channel"`
	Cabang          string    `json:"cabang"`
	PenggunaUtama   string    `json:"penggunaUtama"`
	Status          string    `json:"status" gorm:"default:'Active'"` // Active, Expired
	ApprovalStatus  string    `json:"approvalStatus" gorm:"default:'Pending'"`
	
	// Vehicle Details (for rental)
	Merek           string    `json:"merek"`
	TipeKendaraan   string    `json:"tipeKendaraan"`
	Model           string    `json:"model"`
	TahunPembuatan  string    `json:"tahunPembuatan"`
	Warna           string    `json:"warna"`
	IsiSilinder     string    `json:"isiSilinder"`
	Ownership       string    `json:"ownership"`
	
	// Documents
	AttachmentUrl   string    `json:"attachmentUrl"`
	StnkUrl         string    `json:"stnkUrl"`
	KirUrl          string    `json:"kirUrl"`
	PhotoFront      string    `json:"photoFront"`
	PhotoRear       string    `json:"photoRear"`
	PhotoRight      string    `json:"photoRight"`
	PhotoLeft       string    `json:"photoLeft"`
	
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// VehicleService - Model untuk servis kendaraan
type VehicleService struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	VehicleID       *uint     `json:"vehicleId"`
	NoPolisi        string    `json:"noPolisi" gorm:"index"`
	Aset            string    `json:"aset"`
	VendorID        *uint     `json:"vendorId"`
	Vendor          string    `json:"vendor"`
	TglRequest      string    `json:"tglRequest"`
	Channel         string    `json:"channel"`
	Cabang          string    `json:"cabang"`
	KmKendaraan     string    `json:"kmKendaraan"`
	Masalah         string    `json:"masalah" gorm:"type:text"`
	JenisServis     string    `json:"jenisServis"`
	EstimasiBiaya   float64   `json:"estimasiBiaya"`
	BiayaAktual     float64   `json:"biayaAktual"`
	Technician      string    `json:"technician"`
	Status          string    `json:"status" gorm:"default:'Pending'"` // Pending, In Progress, Completed
	StatusApproval  string    `json:"statusApproval" gorm:"default:'Pending'"`
	SpareParts      string    `json:"spareParts" gorm:"type:text"` // JSON array
	CompletionDate  string    `json:"completionDate"`
	Notes           string    `json:"notes" gorm:"type:text"`
	
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// TaxKir - Model untuk pajak dan KIR
type TaxKir struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	VehicleID       *uint     `json:"vehicleId"`
	NoPolisi        string    `json:"noPolisi" gorm:"index"`
	Aset            string    `json:"aset"`
	TglRequest      string    `json:"tglRequest"`
	Jenis           string    `json:"jenis"` // Pajak STNK, KIR
	Channel         string    `json:"channel"`
	Cabang          string    `json:"cabang"`
	JatuhTempo      string    `json:"jatuhTempo"`
	EstimasiBiaya   float64   `json:"estimasiBiaya"`
	BiayaAktual     float64   `json:"biayaAktual"`
	TargetSelesai   string    `json:"targetSelesai"`
	JenisPembayaran string    `json:"jenisPembayaran"`
	Status          string    `json:"status" gorm:"default:'Pending'"` // Pending, Paid
	StatusApproval  string    `json:"statusApproval" gorm:"default:'Pending'"`
	AttachmentUrl   string    `json:"attachmentUrl"`
	
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// VehicleMutation - Model untuk mutasi kendaraan
type VehicleMutation struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	VehicleID       *uint     `json:"vehicleId"`
	NoPolisi        string    `json:"noPolisi" gorm:"index"`
	AssetNumber     string    `json:"assetNumber"`
	AssetName       string    `json:"assetName"`
	CabangAset      string    `json:"cabangAset"`
	TipeMutasi      string    `json:"tipeMutasi"`
	TglPermintaan   string    `json:"tglPermintaan"`
	LokasiAsal      string    `json:"lokasiAsal"`
	LokasiTujuan    string    `json:"lokasiTujuan"`
	PicBefore       string    `json:"picBefore"`
	PicAfter        string    `json:"picAfter"`
	BiayaMutasi     float64   `json:"biayaMutasi"`
	ChecklistCondition string `json:"checklistCondition" gorm:"type:text"` // JSON array
	Status          string    `json:"status" gorm:"default:'Pending'"`
	StatusApproval  string    `json:"statusApproval" gorm:"default:'Pending'"`
	AssetType       string    `json:"assetType" gorm:"default:'VEHICLE'"` // VEHICLE, GENERAL_ASSET
	
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

// VehicleSale - Model untuk penjualan kendaraan
type VehicleSale struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	VehicleID       *uint     `json:"vehicleId"`
	NoPolisi        string    `json:"noPolisi" gorm:"index"`
	AssetNumber     string    `json:"assetNumber"`
	AssetName       string    `json:"assetName"`
	TglRequest      string    `json:"tglRequest"`
	Channel         string    `json:"channel"`
	Cabang          string    `json:"cabang"`
	HargaPembuka    float64   `json:"hargaPembuka"`
	HargaTertinggi  float64   `json:"hargaTertinggi"`
	Status          string    `json:"status" gorm:"default:'Open'"` // Open, Closed, Sold
	StatusApproval  string    `json:"statusApproval" gorm:"default:'Pending'"`
	AssetType       string    `json:"assetType" gorm:"default:'VEHICLE'"` // VEHICLE, GENERAL_ASSET
	WinnerBidID     *uint     `json:"winnerBidId"`
	
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// Bid - Model untuk penawaran penjualan
type Bid struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	SaleID       uint      `json:"saleId" gorm:"index"`
	Amount       float64   `json:"amount"`
	BidderName   string    `json:"bidderName"`
	BidderRole   string    `json:"bidderRole"`
	BidderEmail  string    `json:"bidderEmail"`
	BidderPhone  string    `json:"bidderPhone"`
	BidderKtp    string    `json:"bidderKtp"`
	BidderAvatar string    `json:"bidderAvatar"`
	Timestamp    time.Time `json:"timestamp"`
	
	CreatedAt    time.Time `json:"createdAt"`
}




// SparePart - Model untuk spare part servis
type SparePart struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ServiceID   uint      `json:"serviceId" gorm:"index"`
	PartName    string    `json:"partName"`
	PartNumber  string    `json:"partNumber"`
	Qty         int       `json:"qty"`
	UnitPrice   float64   `json:"unitPrice"`
	TotalPrice  float64   `json:"totalPrice"`
	
	CreatedAt   time.Time `json:"createdAt"`
}
