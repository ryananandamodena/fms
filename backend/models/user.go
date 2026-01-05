package models

import (
	"time"
)

// User - Model untuk user sistem
type User struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Username     string    `json:"username" gorm:"uniqueIndex;not null"`
	Email        string    `json:"email" gorm:"uniqueIndex;not null"`
	Password     string    `json:"-" gorm:"not null"` // Hidden from JSON
	FullName     string    `json:"fullName" gorm:"not null"`
	EmployeeID   string    `json:"employeeId"`
	Phone        string    `json:"phone"`
	Avatar       string    `json:"avatar"`
	Role         string    `json:"role" gorm:"default:'Staff'"` // Admin, Manager, Staff
	Department   string    `json:"department"`
	Branch       string    `json:"branch"`
	Location     string    `json:"location"`
	JoinDate     string    `json:"joinDate"`
	Status       string    `json:"status" gorm:"default:'Active'"` // Active, Inactive
	LastActive   time.Time `json:"lastActive"`
	Permissions  string    `json:"permissions" gorm:"type:text"` // JSON array of permissions
	RefreshToken string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// UserLogin - Request body untuk login
type UserLogin struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// UserRegister - Request body untuk register
type UserRegister struct {
	Username   string `json:"username" binding:"required"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
	FullName   string `json:"fullName" binding:"required"`
	EmployeeID string `json:"employeeId"`
	Phone      string `json:"phone"`
	Role       string `json:"role"`
	Department string `json:"department"`
	Branch     string `json:"branch"`
}
