package controllers

import (
	"fms-backend/config"
	"fms-backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ========== VEHICLE ==========

func GetVehicles(c *gin.Context) {
	var vehicles []models.Vehicle
	query := config.DB.Order("created_at DESC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if channel := c.Query("channel"); channel != "" {
		query = query.Where("channel = ?", channel)
	}
	if cabang := c.Query("cabang"); cabang != "" {
		query = query.Where("cabang = ?", cabang)
	}
	if ownership := c.Query("ownership"); ownership != "" {
		query = query.Where("ownership = ?", ownership)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("no_polisi ILIKE ? OR nama ILIKE ? OR merek ILIKE ?", 
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	
	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit
	
	var total int64
	config.DB.Model(&models.Vehicle{}).Count(&total)
	
	query.Offset(offset).Limit(limit).Find(&vehicles)
	
	c.JSON(http.StatusOK, gin.H{
		"data":  vehicles,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func GetVehicle(c *gin.Context) {
	id := c.Param("id")
	var vehicle models.Vehicle
	
	if err := config.DB.First(&vehicle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}
	c.JSON(http.StatusOK, vehicle)
}

func CreateVehicle(c *gin.Context) {
	var vehicle models.Vehicle
	if err := c.ShouldBindJSON(&vehicle); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := config.DB.Create(&vehicle).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, vehicle)
}

func UpdateVehicle(c *gin.Context) {
	id := c.Param("id")
	var vehicle models.Vehicle
	
	if err := config.DB.First(&vehicle, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Vehicle not found"})
		return
	}
	
	if err := c.ShouldBindJSON(&vehicle); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	config.DB.Save(&vehicle)
	c.JSON(http.StatusOK, vehicle)
}

func DeleteVehicle(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Vehicle{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Vehicle deleted"})
}

// ========== VEHICLE CONTRACT ==========

func GetVehicleContracts(c *gin.Context) {
	var contracts []models.VehicleContract
	query := config.DB.Order("created_at DESC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if search := c.Query("search"); search != "" {
		query = query.Where("no_kontrak ILIKE ? OR no_polisi ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	query.Find(&contracts)
	c.JSON(http.StatusOK, contracts)
}

func GetVehicleContract(c *gin.Context) {
	id := c.Param("id")
	var contract models.VehicleContract
	if err := config.DB.First(&contract, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contract not found"})
		return
	}
	c.JSON(http.StatusOK, contract)
}

func CreateVehicleContract(c *gin.Context) {
	var contract models.VehicleContract
	if err := c.ShouldBindJSON(&contract); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&contract).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, contract)
}

func UpdateVehicleContract(c *gin.Context) {
	id := c.Param("id")
	var contract models.VehicleContract
	if err := config.DB.First(&contract, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contract not found"})
		return
	}
	if err := c.ShouldBindJSON(&contract); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&contract)
	c.JSON(http.StatusOK, contract)
}

func DeleteVehicleContract(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.VehicleContract{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Contract deleted"})
}

// ========== VEHICLE SERVICE ==========

func GetVehicleServices(c *gin.Context) {
	var services []models.VehicleService
	query := config.DB.Order("created_at DESC")
	
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if noPolisi := c.Query("noPolisi"); noPolisi != "" {
		query = query.Where("no_polisi = ?", noPolisi)
	}
	
	query.Find(&services)
	c.JSON(http.StatusOK, services)
}

func GetVehicleService(c *gin.Context) {
	id := c.Param("id")
	var service models.VehicleService
	if err := config.DB.First(&service, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}
	c.JSON(http.StatusOK, service)
}

func CreateVehicleService(c *gin.Context) {
	var service models.VehicleService
	if err := c.ShouldBindJSON(&service); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, service)
}

func UpdateVehicleService(c *gin.Context) {
	id := c.Param("id")
	var service models.VehicleService
	if err := config.DB.First(&service, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}
	if err := c.ShouldBindJSON(&service); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&service)
	c.JSON(http.StatusOK, service)
}

func DeleteVehicleService(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.VehicleService{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Service deleted"})
}

// ========== TAX KIR ==========

func GetTaxKirs(c *gin.Context) {
	var taxKirs []models.TaxKir
	query := config.DB.Order("created_at DESC")
	
	if jenis := c.Query("jenis"); jenis != "" {
		query = query.Where("jenis = ?", jenis)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&taxKirs)
	c.JSON(http.StatusOK, taxKirs)
}

func GetTaxKir(c *gin.Context) {
	id := c.Param("id")
	var taxKir models.TaxKir
	if err := config.DB.First(&taxKir, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tax/KIR not found"})
		return
	}
	c.JSON(http.StatusOK, taxKir)
}

func CreateTaxKir(c *gin.Context) {
	var taxKir models.TaxKir
	if err := c.ShouldBindJSON(&taxKir); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&taxKir).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, taxKir)
}

func UpdateTaxKir(c *gin.Context) {
	id := c.Param("id")
	var taxKir models.TaxKir
	if err := config.DB.First(&taxKir, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tax/KIR not found"})
		return
	}
	if err := c.ShouldBindJSON(&taxKir); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	config.DB.Save(&taxKir)
	c.JSON(http.StatusOK, taxKir)
}

func DeleteTaxKir(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.TaxKir{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tax/KIR deleted"})
}

// ========== MUTATION ==========

func GetMutations(c *gin.Context) {
	var mutations []models.VehicleMutation
	query := config.DB.Order("created_at DESC")
	
	if assetType := c.Query("assetType"); assetType != "" {
		query = query.Where("asset_type = ?", assetType)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&mutations)
	c.JSON(http.StatusOK, mutations)
}

func GetMutation(c *gin.Context) {
	id := c.Param("id")
	var mutation models.VehicleMutation
	if err := config.DB.First(&mutation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mutation not found"})
		return
	}
	c.JSON(http.StatusOK, mutation)
}

func CreateMutation(c *gin.Context) {
	var mutation models.VehicleMutation
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

func UpdateMutation(c *gin.Context) {
	id := c.Param("id")
	var mutation models.VehicleMutation
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

func DeleteMutation(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.VehicleMutation{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Mutation deleted"})
}

// ========== SALES ==========

func GetSales(c *gin.Context) {
	var sales []models.VehicleSale
	query := config.DB.Order("created_at DESC")
	
	if assetType := c.Query("assetType"); assetType != "" {
		query = query.Where("asset_type = ?", assetType)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	query.Find(&sales)
	c.JSON(http.StatusOK, sales)
}

func GetSale(c *gin.Context) {
	id := c.Param("id")
	var sale models.VehicleSale
	if err := config.DB.First(&sale, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sale not found"})
		return
	}
	c.JSON(http.StatusOK, sale)
}

func CreateSale(c *gin.Context) {
	var sale models.VehicleSale
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

func UpdateSale(c *gin.Context) {
	id := c.Param("id")
	var sale models.VehicleSale
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

func DeleteSale(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.VehicleSale{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Sale deleted"})
}

// ========== BIDS ==========

func GetBids(c *gin.Context) {
	saleId := c.Query("saleId")
	var bids []models.Bid
	query := config.DB.Order("amount DESC")
	
	if saleId != "" {
		query = query.Where("sale_id = ?", saleId)
	}
	
	query.Find(&bids)
	c.JSON(http.StatusOK, bids)
}

func CreateBid(c *gin.Context) {
	var bid models.Bid
	if err := c.ShouldBindJSON(&bid); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&bid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	// Update highest bid in sale
	var sale models.VehicleSale
	if err := config.DB.First(&sale, bid.SaleID).Error; err == nil {
		if bid.Amount > sale.HargaTertinggi {
			config.DB.Model(&sale).Update("harga_tertinggi", bid.Amount)
		}
	}
	
	c.JSON(http.StatusCreated, bid)
}

// ========== VEHICLE REMINDERS ==========

func GenerateVehicleReminders(c *gin.Context) {
	// Generate reminders from vehicle data
	var vehicles []models.Vehicle
	config.DB.Find(&vehicles)
	
	for _, v := range vehicles {
		// Check STNK 1 Year
		if v.MasaBerlaku1 != "" {
			reminder := models.VehicleReminder{
				NoPolisi:    v.NoPolisi,
				VehicleName: v.Nama,
				Type:        "STNK 1 Tahunan",
				ExpiryDate:  v.MasaBerlaku1,
				Branch:      v.Cabang,
				Status:      calculateReminderStatus(v.MasaBerlaku1),
			}
			config.DB.Where("no_polisi = ? AND type = ?", v.NoPolisi, "STNK 1 Tahunan").
				Assign(reminder).FirstOrCreate(&reminder)
		}
		
		// Check STNK 5 Year
		if v.MasaBerlaku5 != "" {
			reminder := models.VehicleReminder{
				NoPolisi:    v.NoPolisi,
				VehicleName: v.Nama,
				Type:        "STNK 5 Tahunan",
				ExpiryDate:  v.MasaBerlaku5,
				Branch:      v.Cabang,
				Status:      calculateReminderStatus(v.MasaBerlaku5),
			}
			config.DB.Where("no_polisi = ? AND type = ?", v.NoPolisi, "STNK 5 Tahunan").
				Assign(reminder).FirstOrCreate(&reminder)
		}
		
		// Check KIR
		if v.MasaBerlakuKir != "" {
			reminder := models.VehicleReminder{
				NoPolisi:    v.NoPolisi,
				VehicleName: v.Nama,
				Type:        "KIR",
				ExpiryDate:  v.MasaBerlakuKir,
				Branch:      v.Cabang,
				Status:      calculateReminderStatus(v.MasaBerlakuKir),
			}
			config.DB.Where("no_polisi = ? AND type = ?", v.NoPolisi, "KIR").
				Assign(reminder).FirstOrCreate(&reminder)
		}
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Reminders generated"})
}

func calculateReminderStatus(expiryDate string) string {
	// Simple status calculation - in production, parse date properly
	// For now, return "Warning" as default
	return "Warning"
}


// ========== VEHICLE MUTATION (Alias) ==========

func GetVehicleMutations(c *gin.Context) {
	GetMutations(c)
}

func GetVehicleMutation(c *gin.Context) {
	GetMutation(c)
}

func CreateVehicleMutation(c *gin.Context) {
	CreateMutation(c)
}

func UpdateVehicleMutation(c *gin.Context) {
	UpdateMutation(c)
}

func DeleteVehicleMutation(c *gin.Context) {
	DeleteMutation(c)
}

// ========== VEHICLE SALE (Alias) ==========

func GetVehicleSales(c *gin.Context) {
	GetSales(c)
}

func GetVehicleSale(c *gin.Context) {
	GetSale(c)
}

func CreateVehicleSale(c *gin.Context) {
	CreateSale(c)
}

func UpdateVehicleSale(c *gin.Context) {
	UpdateSale(c)
}

func DeleteVehicleSale(c *gin.Context) {
	DeleteSale(c)
}


