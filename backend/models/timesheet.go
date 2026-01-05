package models

import (
	"time"
)

// Timesheet - Model untuk timesheet/absensi
type Timesheet struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	EmployeeID   *uint     `json:"employeeId"`
	EmployeeName string    `json:"employeeName"`
	EmployeeRole string    `json:"employeeRole"`
	Avatar       string    `json:"avatar"`
	Location     string    `json:"location"`
	Area         string    `json:"area"`
	Date         string    `json:"date"`
	Shift        string    `json:"shift"`
	ClockIn      string    `json:"clockIn"`
	ClockOut     string    `json:"clockOut"`
	Status       string    `json:"status"` // Tepat Waktu, Terlambat, Absen, Izin, Sakit
	Tasks        string    `json:"tasks" gorm:"type:text"` // JSON array
	Photos       string    `json:"photos" gorm:"type:text"` // JSON array
	Notes        string    `json:"notes" gorm:"type:text"`
	
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// Absensi - Model untuk absensi harian
type Absensi struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	EmployeeID   *uint     `json:"employeeId"`
	EmployeeName string    `json:"employeeName"`
	Department   string    `json:"department"`
	Location     string    `json:"location"`
	Date         string    `json:"date"`
	CheckIn      string    `json:"checkIn"`
	CheckOut     string    `json:"checkOut"`
	WorkHours    float64   `json:"workHours"`
	Status       string    `json:"status"` // Hadir, Tidak Hadir, Izin, Sakit, Cuti
	Notes        string    `json:"notes"`
	PhotoIn      string    `json:"photoIn"`
	PhotoOut     string    `json:"photoOut"`
	
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// StockOpname - Model untuk stock opname
type StockOpname struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	OpnameNo      string    `json:"opnameNo" gorm:"uniqueIndex;not null"`
	Date          string    `json:"date"`
	Location      string    `json:"location"`
	Category      string    `json:"category"` // ATK, ARK, Asset
	ConductedBy   string    `json:"conductedBy"`
	Status        string    `json:"status" gorm:"default:'Draft'"` // Draft, In Progress, Completed
	Items         string    `json:"items" gorm:"type:text"` // JSON array of stock items
	Notes         string    `json:"notes" gorm:"type:text"`
	
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}
