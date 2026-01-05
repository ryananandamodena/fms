package controllers

import (
	"fms-backend/config"
	"fms-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ========== VENDOR ==========

func GetVendors(c *gin.Context) {
	var vendors []models.Vendor
	query := config.DB.Order("vendor_name ASC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if vendorType := c.Query("type"); vendorType != "" {
		query = query.Where("type = ?", vendorType)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("vendor_name ILIKE ? OR vendor_code ILIKE ?", 
			"%"+search+"%", "%"+search+"%")
	}
	
	query.Find(&vendors)
	c.JSON(http.StatusOK, vendors)
}

func GetVendor(c *gin.Context) {
	id := c.Param("id")
	var vendor models.Vendor
	if err := config.DB.First(&vendor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vendor not found"})
		return
	}
	c.JSON(http.StatusOK, vendor)
}

func CreateVendor(c *gin.Context) {
	var vendor models.Vendor
	if err := c.ShouldBindJSON(&vendor); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&vendor).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, vendor)
}

func UpdateVendor(c *gin.Context) {
	id := c.Param("id")
	var vendor models.Vendor
	if err := config.DB.First(&vendor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vendor not found"})
		return
	}
	if err := c.ShouldBindJSON(&vendor); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&vendor)
	c.JSON(http.StatusOK, vendor)
}

func DeleteVendor(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Vendor{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Vendor deleted"})
}

// ========== INSURANCE ==========

func GetInsurances(c *gin.Context) {
	var insurances []models.Insurance
	query := config.DB.Order("end_date ASC")
	
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if insuranceType := c.Query("type"); insuranceType != "" {
		query = query.Where("type = ?", insuranceType)
	}
	if assetId := c.Query("assetId"); assetId != "" {
		query = query.Where("asset_id = ?", assetId)
	}
	
	query.Find(&insurances)
	c.JSON(http.StatusOK, insurances)
}

func GetInsurance(c *gin.Context) {
	id := c.Param("id")
	var insurance models.Insurance
	if err := config.DB.First(&insurance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Insurance not found"})
		return
	}
	c.JSON(http.StatusOK, insurance)
}

func CreateInsurance(c *gin.Context) {
	var insurance models.Insurance
	if err := c.ShouldBindJSON(&insurance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&insurance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, insurance)
}

func UpdateInsurance(c *gin.Context) {
	id := c.Param("id")
	var insurance models.Insurance
	if err := config.DB.First(&insurance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Insurance not found"})
		return
	}
	if err := c.ShouldBindJSON(&insurance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&insurance)
	c.JSON(http.StatusOK, insurance)
}

func DeleteInsurance(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Insurance{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Insurance deleted"})
}

// ========== INSURANCE CLAIM ==========

func GetInsuranceClaims(c *gin.Context) {
	var claims []models.InsuranceClaim
	query := config.DB.Order("created_at DESC")
	
	if insuranceId := c.Query("insuranceId"); insuranceId != "" {
		query = query.Where("insurance_id = ?", insuranceId)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&claims)
	c.JSON(http.StatusOK, claims)
}

func CreateInsuranceClaim(c *gin.Context) {
	var claim models.InsuranceClaim
	if err := c.ShouldBindJSON(&claim); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&claim).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, claim)
}

func UpdateInsuranceClaim(c *gin.Context) {
	id := c.Param("id")
	var claim models.InsuranceClaim
	if err := config.DB.First(&claim, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Claim not found"})
		return
	}
	if err := c.ShouldBindJSON(&claim); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&claim)
	c.JSON(http.StatusOK, claim)
}
