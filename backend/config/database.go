package config

import (
	"fms-backend/models"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5433"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "12345"
	}
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "fms_db"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")

	// Auto migrate all models
	DB.AutoMigrate(
		// Master Data
		&models.GeneralMaster{},
		&models.MasterCategory{},
		&models.MasterApproval{},
		&models.ApprovalTier{},
		
		// Users & Auth
		&models.User{},
		
		// Vendors
		&models.Vendor{},
		
		// Vehicles
		&models.Vehicle{},
		&models.VehicleContract{},
		&models.VehicleService{},
		&models.SparePart{},
		&models.TaxKir{},
		&models.VehicleMutation{},
		&models.VehicleSale{},
		&models.Bid{},
		
		// Buildings
		&models.Building{},
		&models.BuildingAsset{},
		&models.BuildingMaintenance{},
		&models.Utility{},
		&models.Compliance{},
		&models.LogBook{},
		
		// General Assets
		&models.GeneralAsset{},
		&models.AssetMutation{},
		&models.AssetSale{},
		&models.AssetMaintenance{},
		&models.MaintenanceReminder{},
		
		// Insurance
		&models.Insurance{},
		&models.InsuranceClaim{},
		
		// Stationery (ATK/ARK)
		&models.MasterItem{},
		&models.StationeryRequest{},
		&models.StationeryRequestItem{},
		&models.DeliveryLocation{},
		
		// Timesheet
		&models.Timesheet{},
		&models.Absensi{},
		&models.StockOpname{},
		
		// POD
		&models.ModenaPOD{},
		&models.PODOccupant{},
		&models.PODRequest{},
		
		// Loker
		&models.Loker{},
		&models.LokerRequest{},
		
		// Notifications
		&models.Notification{},
		&models.ApprovalRequest{},
		&models.ApprovalHistory{},
		&models.EmailTemplate{},
		&models.NotificationSetting{},
		
		// Reminders
		&models.Reminder{},
		&models.VehicleReminder{},
	)
	log.Println("Database migrated successfully")
}
