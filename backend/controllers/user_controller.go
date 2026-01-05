package controllers

import (
	"fms-backend/config"
	"fms-backend/middleware"
	"fms-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// GetUsers - Get all users
func GetUsers(c *gin.Context) {
	var users []models.User
	
	query := config.DB.Order("created_at DESC")
	
	// Filters
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if role := c.Query("role"); role != "" {
		query = query.Where("role = ?", role)
	}
	if department := c.Query("department"); department != "" {
		query = query.Where("department = ?", department)
	}
	if branch := c.Query("branch"); branch != "" {
		query = query.Where("branch = ?", branch)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("full_name ILIKE ? OR username ILIKE ? OR email ILIKE ?", 
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	
	if err := query.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, users)
}

// GetUser - Get single user
func GetUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

// CreateUser - Create new user
func CreateUser(c *gin.Context) {
	var input models.UserRegister
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	
	user := models.User{
		Username:   input.Username,
		Email:      input.Email,
		Password:   string(hashedPassword),
		FullName:   input.FullName,
		EmployeeID: input.EmployeeID,
		Phone:      input.Phone,
		Role:       input.Role,
		Department: input.Department,
		Branch:     input.Branch,
		Status:     "Active",
	}
	
	if user.Role == "" {
		user.Role = "Staff"
	}
	
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, user)
}

// UpdateUser - Update user
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// If password is being updated, hash it
	if password, ok := input["password"].(string); ok && password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		input["password"] = string(hashedPassword)
	} else {
		delete(input, "password")
	}
	
	if err := config.DB.Model(&user).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, user)
}

// DeleteUser - Delete user
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	
	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// Login - User login
func Login(c *gin.Context) {
	var input models.UserLogin
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	var user models.User
	if err := config.DB.Where("username = ? OR email = ?", input.Username, input.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	
	if user.Status != "Active" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User is inactive"})
		return
	}
	
	// Update last active
	config.DB.Model(&user).Update("last_active", time.Now())
	
	// Generate JWT token
	token, err := middleware.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	
	refreshToken, _ := middleware.GenerateRefreshToken(user)
	
	c.JSON(http.StatusOK, gin.H{
		"message":      "Login successful",
		"user":         user,
		"token":        token,
		"refreshToken": refreshToken,
	})
}
