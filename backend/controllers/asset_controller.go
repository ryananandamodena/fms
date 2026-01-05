package controllers

import (
	"fms-backend/config"
	"fms-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ========== GENERAL ASSET ==========

func GetGeneralAssets(c *gin.Context) {
	var assets []models.GeneralAsset
	query := config.DB.Order("created_at DESC")
	
	if category := c.Query("assetCategory"); category != "" {
		query = query.Where("asset_category = ?", category)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if department := c.Query("department"); department != "" {
		query = query.Where("department = ?", department)
	}
	if location := c.Query("assetLocation"); location != "" {
		query = query.Where("asset_location = ?", location)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("asset_number ILIKE ? OR asset_name ILIKE ?", 
			"%"+search+"%", "%"+search+"%")
	}
	
	query.Find(&assets)
	c.JSON(http.StatusOK, assets)
}

func GetGeneralAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.GeneralAsset
	if err := config.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}
	c.JSON(http.StatusOK, asset)
}

func CreateGeneralAsset(c *gin.Context) {
	var asset models.GeneralAsset
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, asset)
}

func UpdateGeneralAsset(c *gin.Context) {
	id := c.Param("id")
	var asset models.GeneralAsset
	if err := config.DB.First(&asset, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Asset not found"})
		return
	}
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&asset)
	c.JSON(http.StatusOK, asset)
}

func DeleteGeneralAsset(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.GeneralAsset{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Asset deleted"})
}

// ========== ASSET MAINTENANCE ==========

func GetAssetMaintenances(c *gin.Context) {
	var maintenances []models.AssetMaintenance
	query := config.DB.Order("next_maintenance_date ASC")
	
	if assetId := c.Query("assetId"); assetId != "" {
		query = query.Where("asset_id = ?", assetId)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	
	query.Find(&maintenances)
	c.JSON(http.StatusOK, maintenances)
}

func GetAssetMaintenance(c *gin.Context) {
	id := c.Param("id")
	var maintenance models.AssetMaintenance
	if err := config.DB.First(&maintenance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Maintenance not found"})
		return
	}
	c.JSON(http.StatusOK, maintenance)
}

func CreateAssetMaintenance(c *gin.Context) {
	var maintenance models.AssetMaintenance
	if err := c.ShouldBindJSON(&maintenance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&maintenance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, maintenance)
}

func UpdateAssetMaintenance(c *gin.Context) {
	id := c.Param("id")
	var maintenance models.AssetMaintenance
	if err := config.DB.First(&maintenance, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Maintenance not found"})
		return
	}
	if err := c.ShouldBindJSON(&maintenance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&maintenance)
	c.JSON(http.StatusOK, maintenance)
}

func DeleteAssetMaintenance(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.AssetMaintenance{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Maintenance deleted"})
}

// ========== MAINTENANCE REMINDER ==========

func GetMaintenanceReminders(c *gin.Context) {
	var reminders []models.MaintenanceReminder
	query := config.DB.Order("next_maintenance_date ASC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	
	query.Find(&reminders)
	c.JSON(http.StatusOK, reminders)
}


// ========== ASSET MUTATION ==========

func GetAssetMutations(c *gin.Context) {
	var mutations []models.AssetMutation
	query := config.DB.Order("created_at DESC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if assetType := c.Query("assetType"); assetType != "" {
		query = query.Where("asset_type = ?", assetType)
	}
	
	query.Find(&mutations)
	c.JSON(http.StatusOK, mutations)
}

func GetAssetMutation(c *gin.Context) {
	id := c.Param("id")
	var mutation models.AssetMutation
	if err := config.DB.First(&mutation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mutation not found"})
		return
	}
	c.JSON(http.StatusOK, mutation)
}

func CreateAssetMutation(c *gin.Context) {
	var mutation models.AssetMutation
	if err := c.ShouldBindJSON(&mutation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&mutation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, mutation)
}

func UpdateAssetMutation(c *gin.Context) {
	id := c.Param("id")
	var mutation models.AssetMutation
	if err := config.DB.First(&mutation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mutation not found"})
		return
	}
	if err := c.ShouldBindJSON(&mutation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&mutation)
	c.JSON(http.StatusOK, mutation)
}

func DeleteAssetMutation(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.AssetMutation{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Mutation deleted"})
}

// ========== ASSET SALE ==========

func GetAssetSales(c *gin.Context) {
	var sales []models.AssetSale
	query := config.DB.Order("created_at DESC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if assetType := c.Query("assetType"); assetType != "" {
		query = query.Where("asset_type = ?", assetType)
	}
	
	query.Find(&sales)
	c.JSON(http.StatusOK, sales)
}

func GetAssetSale(c *gin.Context) {
	id := c.Param("id")
	var sale models.AssetSale
	if err := config.DB.First(&sale, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sale not found"})
		return
	}
	c.JSON(http.StatusOK, sale)
}

func CreateAssetSale(c *gin.Context) {
	var sale models.AssetSale
	if err := c.ShouldBindJSON(&sale); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&sale).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, sale)
}

func UpdateAssetSale(c *gin.Context) {
	id := c.Param("id")
	var sale models.AssetSale
	if err := config.DB.First(&sale, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sale not found"})
		return
	}
	if err := c.ShouldBindJSON(&sale); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&sale)
	c.JSON(http.StatusOK, sale)
}

func DeleteAssetSale(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.AssetSale{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sale deleted"})
}
