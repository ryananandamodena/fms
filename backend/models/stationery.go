package models

import (
	"time"
)

// MasterItem - Model untuk master item ATK/ARK
type MasterItem struct {
	ID                uint      `json:"id" gorm:"primaryKey"`
	ItemCode          string    `json:"itemCode" gorm:"uniqueIndex;not null"`
	ItemName          string    `json:"itemName" gorm:"not null"`
	Category          string    `json:"category"` // ATK, ARK
	UOM               string    `json:"uom"` // Unit of Measure
	RemainingStock    int       `json:"remainingStock" gorm:"default:0"`
	MinimumStock      int       `json:"minimumStock" gorm:"default:0"`
	MaximumStock      int       `json:"maximumStock" gorm:"default:0"`
	RequestedStock    int       `json:"requestedStock" gorm:"default:0"`
	LastPurchasePrice float64   `json:"lastPurchasePrice"`
	AveragePrice      float64   `json:"averagePrice"`
	PurchaseDate      string    `json:"purchaseDate"`
	ImageUrl          string    `json:"imageUrl"`
	Status            string    `json:"status" gorm:"default:'Active'"`
	
	CreatedAt         time.Time `json:"createdAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

// StationeryRequest - Model untuk permintaan ATK/ARK
type StationeryRequest struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	RequestNo     string    `json:"requestNo" gorm:"uniqueIndex;not null"`
	Type          string    `json:"type"` // ATK, ARK
	DeliveryType  string    `json:"deliveryType"`
	LocationID    *uint     `json:"locationId"`
	Location      string    `json:"location"`
	RequestedBy   *uint     `json:"requestedBy"`
	RequesterName string    `json:"requesterName"`
	Date          string    `json:"date"`
	Remarks       string    `json:"remarks" gorm:"type:text"`
	Status        string    `json:"status" gorm:"default:'Pending'"` // Pending, Approved, Rejected, Delivered
	ApprovalStatus string   `json:"approvalStatus" gorm:"default:'Pending'"`
	Items         string    `json:"items" gorm:"type:text"` // JSON array of StationeryRequestItem
	
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// DeliveryLocation - Model untuk lokasi pengiriman
type DeliveryLocation struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Address   string    `json:"address"`
	Type      string    `json:"type"` // Warehouse, Branch
	Status    string    `json:"status" gorm:"default:'Active'"`
	
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Purchase - Model untuk pembelian item
type Purchase struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	PurchaseNo    string    `json:"purchaseNo" gorm:"uniqueIndex"`
	VendorID      *uint     `json:"vendorId"`
	VendorName    string    `json:"vendorName"`
	ItemID        *uint     `json:"itemId"`
	ItemName      string    `json:"itemName"`
	Date          string    `json:"date"`
	Qty           int       `json:"qty"`
	UnitPrice     float64   `json:"unitPrice"`
	TotalPrice    float64   `json:"totalPrice"`
	Status        string    `json:"status" gorm:"default:'Pending'"` // Pending, Received, Cancelled
	AttachmentUrl string    `json:"attachmentUrl"`
	
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}


// StationeryRequestItem - Model untuk item dalam permintaan ATK/ARK
type StationeryRequestItem struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	RequestID   uint      `json:"requestId" gorm:"index"`
	ItemID      *uint     `json:"itemId"`
	ItemCode    string    `json:"itemCode"`
	ItemName    string    `json:"itemName"`
	Qty         int       `json:"qty"`
	UOM         string    `json:"uom"`
	UnitPrice   float64   `json:"unitPrice"`
	TotalPrice  float64   `json:"totalPrice"`
	Notes       string    `json:"notes"`
	
	CreatedAt   time.Time `json:"createdAt"`
}
