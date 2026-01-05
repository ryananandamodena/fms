package utils

import (
	"fms-backend/models"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func SeedAdminUser(db *gorm.DB) {
	// Check if admin user exists
	var count int64
	db.Model(&models.User{}).Where("username = ?", "admin").Count(&count)
	
	if count > 0 {
		log.Println("Admin user already exists")
		return
	}
	
	// Create admin user
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Failed to hash password:", err)
		return
	}
	
	admin := models.User{
		Username:   "admin",
		Email:      "admin@modena.com",
		Password:   string(hashedPassword),
		FullName:   "Administrator",
		EmployeeID: "EMP001",
		Role:       "Admin",
		Department: "IT",
		Branch:     "Head Office",
		Status:     "Active",
	}
	
	if err := db.Create(&admin).Error; err != nil {
		log.Println("Failed to create admin user:", err)
		return
	}
	
	log.Println("Admin user created successfully (username: admin, password: admin123)")
}

func SeedMasterData(db *gorm.DB) {
	// Seed some basic master data
	categories := []string{
		"VEHICLE_TYPE", "BUILDING_TYPE", "ASSET_CATEGORY", "LOCATION", 
		"DEPARTMENT", "CHANNEL", "BRAND", "COLOR", "UOM",
	}
	
	masterData := map[string][]string{
		"VEHICLE_TYPE":   {"Sedan", "SUV", "MPV", "Truck", "Motorcycle", "Bus"},
		"BUILDING_TYPE":  {"Kantor", "Gudang", "Showroom", "Workshop", "Ruko"},
		"ASSET_CATEGORY": {"HC", "IT", "CS"},
		"LOCATION":       {"Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar"},
		"DEPARTMENT":     {"IT", "HR", "Finance", "GA", "Sales", "Marketing", "Operations"},
		"CHANNEL":        {"Retail", "Project", "Online", "Dealer"},
		"BRAND":          {"Toyota", "Honda", "Mitsubishi", "Daihatsu", "Suzuki", "Isuzu"},
		"COLOR":          {"Putih", "Hitam", "Silver", "Merah", "Biru", "Abu-abu"},
		"UOM":            {"Pcs", "Box", "Rim", "Pack", "Unit", "Set", "Lusin"},
	}
	
	for category, values := range masterData {
		for _, value := range values {
			var count int64
			db.Model(&models.GeneralMaster{}).Where("category = ? AND value = ?", category, value).Count(&count)
			
			if count == 0 {
				master := models.GeneralMaster{
					Category: category,
					Name:     value,
					Value:    value,
					IsActive: true,
				}
				db.Create(&master)
			}
		}
	}
	
	// Create master categories
	for _, cat := range categories {
		var count int64
		db.Model(&models.MasterCategory{}).Where("code = ?", cat).Count(&count)
		
		if count == 0 {
			mc := models.MasterCategory{
				Code:        cat,
				Name:        cat,
				Description: "Master data for " + cat,
				IsActive:    true,
			}
			db.Create(&mc)
		}
	}
	
	log.Println("Master data seeded successfully")
}
