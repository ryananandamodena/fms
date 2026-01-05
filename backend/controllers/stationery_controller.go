package controllers

import (
	"fms-backend/config"
	"fms-backend/models"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// ========== MASTER ITEM (ATK/ARK) ==========

func GetMasterItems(c *gin.Context) {
	var items []models.MasterItem
	query := config.DB.Order("item_name ASC")
	
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("item_name ILIKE ? OR item_code ILIKE ?", 
			"%"+search+"%", "%"+search+"%")
	}
	
	query.Find(&items)
	c.JSON(http.StatusOK, items)
}

func GetMasterItem(c *gin.Context) {
	id := c.Param("id")
	var item models.MasterItem
	if err := config.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func CreateMasterItem(c *gin.Context) {
	var item models.MasterItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func UpdateMasterItem(c *gin.Context) {
	id := c.Param("id")
	var item models.MasterItem
	if err := config.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func DeleteMasterItem(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.MasterItem{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Item deleted"})
}

// ========== STATIONERY REQUEST ==========

func GetStationeryRequests(c *gin.Context) {
	var requests []models.StationeryRequest
	query := config.DB.Order("created_at DESC")
	
	if requestType := c.Query("type"); requestType != "" {
		query = query.Where("type = ?", requestType)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if location := c.Query("location"); location != "" {
		query = query.Where("location = ?", location)
	}
	
	query.Find(&requests)
	c.JSON(http.StatusOK, requests)
}

func GetStationeryRequest(c *gin.Context) {
	id := c.Param("id")
	var request models.StationeryRequest
	if err := config.DB.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}
	c.JSON(http.StatusOK, request)
}

func CreateStationeryRequest(c *gin.Context) {
	var request models.StationeryRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Generate request number
	request.RequestNo = fmt.Sprintf("REQ-%s-%d", request.Type, time.Now().UnixNano())
	
	if err := config.DB.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, request)
}

func UpdateStationeryRequest(c *gin.Context) {
	id := c.Param("id")
	var request models.StationeryRequest
	if err := config.DB.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
		return
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&request)
	c.JSON(http.StatusOK, request)
}

func DeleteStationeryRequest(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.StationeryRequest{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Request deleted"})
}

// ========== DELIVERY LOCATION ==========

func GetDeliveryLocations(c *gin.Context) {
	var locations []models.DeliveryLocation
	query := config.DB.Order("name ASC")
	
	if locationType := c.Query("type"); locationType != "" {
		query = query.Where("type = ?", locationType)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&locations)
	c.JSON(http.StatusOK, locations)
}

func GetDeliveryLocation(c *gin.Context) {
	id := c.Param("id")
	var location models.DeliveryLocation
	if err := config.DB.First(&location, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}
	c.JSON(http.StatusOK, location)
}

func CreateDeliveryLocation(c *gin.Context) {
	var location models.DeliveryLocation
	if err := c.ShouldBindJSON(&location); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&location).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, location)
}

func UpdateDeliveryLocation(c *gin.Context) {
	id := c.Param("id")
	var location models.DeliveryLocation
	if err := config.DB.First(&location, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Location not found"})
		return
	}
	if err := c.ShouldBindJSON(&location); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&location)
	c.JSON(http.StatusOK, location)
}

func DeleteDeliveryLocation(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.DeliveryLocation{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Location deleted"})
}

// ========== PURCHASE ==========

func GetPurchases(c *gin.Context) {
	var purchases []models.Purchase
	query := config.DB.Order("created_at DESC")
	
	if vendorId := c.Query("vendorId"); vendorId != "" {
		query = query.Where("vendor_id = ?", vendorId)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&purchases)
	c.JSON(http.StatusOK, purchases)
}

func CreatePurchase(c *gin.Context) {
	var purchase models.Purchase
	if err := c.ShouldBindJSON(&purchase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Calculate total
	purchase.TotalPrice = float64(purchase.Qty) * purchase.UnitPrice
	purchase.PurchaseNo = fmt.Sprintf("PO-%d", time.Now().UnixNano())
	
	if err := config.DB.Create(&purchase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// Update stock if received
	if purchase.Status == "Received" && purchase.ItemID != nil {
		config.DB.Model(&models.MasterItem{}).Where("id = ?", purchase.ItemID).
			UpdateColumn("remaining_stock", config.DB.Raw("remaining_stock + ?", purchase.Qty))
	}
	
	c.JSON(http.StatusCreated, purchase)
}

func UpdatePurchase(c *gin.Context) {
	id := c.Param("id")
	var purchase models.Purchase
	if err := config.DB.First(&purchase, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Purchase not found"})
		return
	}
	
	oldStatus := purchase.Status
	
	if err := c.ShouldBindJSON(&purchase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	purchase.TotalPrice = float64(purchase.Qty) * purchase.UnitPrice
	config.DB.Save(&purchase)
	
	// Update stock if status changed to Received
	if oldStatus != "Received" && purchase.Status == "Received" && purchase.ItemID != nil {
		config.DB.Model(&models.MasterItem{}).Where("id = ?", purchase.ItemID).
			UpdateColumn("remaining_stock", config.DB.Raw("remaining_stock + ?", purchase.Qty))
	}
	
	c.JSON(http.StatusOK, purchase)
}
