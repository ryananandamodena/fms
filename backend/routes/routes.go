package routes

import (
	"fms-backend/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// General Masters
	r.GET("/api/general-masters", controllers.GetGeneralMasters)
	r.GET("/api/general-masters/category/:category", controllers.GetMastersByCategory)
	r.GET("/api/general-masters/:id", controllers.GetGeneralMaster)
	r.POST("/api/general-masters", controllers.CreateGeneralMaster)
	r.PUT("/api/general-masters/:id", controllers.UpdateGeneralMaster)
	r.DELETE("/api/general-masters/:id", controllers.DeleteGeneralMaster)
	r.POST("/api/general-masters/bulk", controllers.BulkCreateGeneralMasters)

	// Master Categories
	r.GET("/api/master-categories", controllers.GetMasterCategories)
	r.POST("/api/master-categories", controllers.CreateMasterCategory)
	r.PUT("/api/master-categories/:id", controllers.UpdateMasterCategory)
	r.DELETE("/api/master-categories/:id", controllers.DeleteMasterCategory)

	// Users
	r.GET("/api/users", controllers.GetUsers)
	r.GET("/api/users/:id", controllers.GetUser)
	r.POST("/api/users", controllers.CreateUser)
	r.PUT("/api/users/:id", controllers.UpdateUser)
	r.DELETE("/api/users/:id", controllers.DeleteUser)
	r.POST("/api/auth/login", controllers.Login)

	// Vendors
	r.GET("/api/vendors", controllers.GetVendors)
	r.GET("/api/vendors/:id", controllers.GetVendor)
	r.POST("/api/vendors", controllers.CreateVendor)
	r.PUT("/api/vendors/:id", controllers.UpdateVendor)
	r.DELETE("/api/vendors/:id", controllers.DeleteVendor)

	// Vehicles
	r.GET("/api/vehicles", controllers.GetVehicles)
	r.GET("/api/vehicles/:id", controllers.GetVehicle)
	r.POST("/api/vehicles", controllers.CreateVehicle)
	r.PUT("/api/vehicles/:id", controllers.UpdateVehicle)
	r.DELETE("/api/vehicles/:id", controllers.DeleteVehicle)

	// Vehicle Contracts
	r.GET("/api/vehicle-contracts", controllers.GetVehicleContracts)
	r.GET("/api/vehicle-contracts/:id", controllers.GetVehicleContract)
	r.POST("/api/vehicle-contracts", controllers.CreateVehicleContract)
	r.PUT("/api/vehicle-contracts/:id", controllers.UpdateVehicleContract)
	r.DELETE("/api/vehicle-contracts/:id", controllers.DeleteVehicleContract)

	// Vehicle Services
	r.GET("/api/vehicle-services", controllers.GetVehicleServices)
	r.GET("/api/vehicle-services/:id", controllers.GetVehicleService)
	r.POST("/api/vehicle-services", controllers.CreateVehicleService)
	r.PUT("/api/vehicle-services/:id", controllers.UpdateVehicleService)
	r.DELETE("/api/vehicle-services/:id", controllers.DeleteVehicleService)

	// Tax & KIR
	r.GET("/api/tax-kirs", controllers.GetTaxKirs)
	r.GET("/api/tax-kirs/:id", controllers.GetTaxKir)
	r.POST("/api/tax-kirs", controllers.CreateTaxKir)
	r.PUT("/api/tax-kirs/:id", controllers.UpdateTaxKir)
	r.DELETE("/api/tax-kirs/:id", controllers.DeleteTaxKir)

	// Vehicle Mutations
	r.GET("/api/vehicle-mutations", controllers.GetVehicleMutations)
	r.GET("/api/vehicle-mutations/:id", controllers.GetVehicleMutation)
	r.POST("/api/vehicle-mutations", controllers.CreateVehicleMutation)
	r.PUT("/api/vehicle-mutations/:id", controllers.UpdateVehicleMutation)
	r.DELETE("/api/vehicle-mutations/:id", controllers.DeleteVehicleMutation)

	// Vehicle Sales
	r.GET("/api/vehicle-sales", controllers.GetVehicleSales)
	r.GET("/api/vehicle-sales/:id", controllers.GetVehicleSale)
	r.POST("/api/vehicle-sales", controllers.CreateVehicleSale)
	r.PUT("/api/vehicle-sales/:id", controllers.UpdateVehicleSale)
	r.DELETE("/api/vehicle-sales/:id", controllers.DeleteVehicleSale)

	// Buildings
	r.GET("/api/buildings", controllers.GetBuildings)
	r.GET("/api/buildings/:id", controllers.GetBuilding)
	r.POST("/api/buildings", controllers.CreateBuilding)
	r.PUT("/api/buildings/:id", controllers.UpdateBuilding)
	r.DELETE("/api/buildings/:id", controllers.DeleteBuilding)

	// Building Assets
	r.GET("/api/building-assets", controllers.GetBuildingAssets)
	r.GET("/api/building-assets/:id", controllers.GetBuildingAsset)
	r.POST("/api/building-assets", controllers.CreateBuildingAsset)
	r.PUT("/api/building-assets/:id", controllers.UpdateBuildingAsset)
	r.DELETE("/api/building-assets/:id", controllers.DeleteBuildingAsset)

	// Building Maintenance
	r.GET("/api/building-maintenances", controllers.GetBuildingMaintenances)
	r.GET("/api/building-maintenances/:id", controllers.GetBuildingMaintenance)
	r.POST("/api/building-maintenances", controllers.CreateBuildingMaintenance)
	r.PUT("/api/building-maintenances/:id", controllers.UpdateBuildingMaintenance)
	r.DELETE("/api/building-maintenances/:id", controllers.DeleteBuildingMaintenance)

	// Utilities
	r.GET("/api/utilities", controllers.GetUtilities)
	r.GET("/api/utilities/:id", controllers.GetUtility)
	r.POST("/api/utilities", controllers.CreateUtility)
	r.PUT("/api/utilities/:id", controllers.UpdateUtility)
	r.DELETE("/api/utilities/:id", controllers.DeleteUtility)

	// Compliances
	r.GET("/api/compliances", controllers.GetCompliances)
	r.GET("/api/compliances/:id", controllers.GetCompliance)
	r.POST("/api/compliances", controllers.CreateCompliance)
	r.PUT("/api/compliances/:id", controllers.UpdateCompliance)
	r.DELETE("/api/compliances/:id", controllers.DeleteCompliance)

	// General Assets
	r.GET("/api/general-assets", controllers.GetGeneralAssets)
	r.GET("/api/general-assets/:id", controllers.GetGeneralAsset)
	r.POST("/api/general-assets", controllers.CreateGeneralAsset)
	r.PUT("/api/general-assets/:id", controllers.UpdateGeneralAsset)
	r.DELETE("/api/general-assets/:id", controllers.DeleteGeneralAsset)

	// Asset Mutations
	r.GET("/api/asset-mutations", controllers.GetAssetMutations)
	r.GET("/api/asset-mutations/:id", controllers.GetAssetMutation)
	r.POST("/api/asset-mutations", controllers.CreateAssetMutation)
	r.PUT("/api/asset-mutations/:id", controllers.UpdateAssetMutation)
	r.DELETE("/api/asset-mutations/:id", controllers.DeleteAssetMutation)

	// Asset Sales
	r.GET("/api/asset-sales", controllers.GetAssetSales)
	r.GET("/api/asset-sales/:id", controllers.GetAssetSale)
	r.POST("/api/asset-sales", controllers.CreateAssetSale)
	r.PUT("/api/asset-sales/:id", controllers.UpdateAssetSale)
	r.DELETE("/api/asset-sales/:id", controllers.DeleteAssetSale)

	// Insurances
	r.GET("/api/insurances", controllers.GetInsurances)
	r.GET("/api/insurances/:id", controllers.GetInsurance)
	r.POST("/api/insurances", controllers.CreateInsurance)
	r.PUT("/api/insurances/:id", controllers.UpdateInsurance)
	r.DELETE("/api/insurances/:id", controllers.DeleteInsurance)

	// Stationery (ATK/ARK)
	r.GET("/api/master-items", controllers.GetMasterItems)
	r.GET("/api/master-items/:id", controllers.GetMasterItem)
	r.POST("/api/master-items", controllers.CreateMasterItem)
	r.PUT("/api/master-items/:id", controllers.UpdateMasterItem)
	r.DELETE("/api/master-items/:id", controllers.DeleteMasterItem)

	r.GET("/api/stationery-requests", controllers.GetStationeryRequests)
	r.GET("/api/stationery-requests/:id", controllers.GetStationeryRequest)
	r.POST("/api/stationery-requests", controllers.CreateStationeryRequest)
	r.PUT("/api/stationery-requests/:id", controllers.UpdateStationeryRequest)
	r.DELETE("/api/stationery-requests/:id", controllers.DeleteStationeryRequest)

	// Delivery Locations
	r.GET("/api/delivery-locations", controllers.GetDeliveryLocations)
	r.GET("/api/delivery-locations/:id", controllers.GetDeliveryLocation)
	r.POST("/api/delivery-locations", controllers.CreateDeliveryLocation)
	r.PUT("/api/delivery-locations/:id", controllers.UpdateDeliveryLocation)
	r.DELETE("/api/delivery-locations/:id", controllers.DeleteDeliveryLocation)

	// Timesheets
	r.GET("/api/timesheets", controllers.GetTimesheets)
	r.GET("/api/timesheets/:id", controllers.GetTimesheet)
	r.POST("/api/timesheets", controllers.CreateTimesheet)
	r.PUT("/api/timesheets/:id", controllers.UpdateTimesheet)
	r.DELETE("/api/timesheets/:id", controllers.DeleteTimesheet)

	// LogBooks
	r.GET("/api/logbooks", controllers.GetLogBooks)
	r.GET("/api/logbooks/:id", controllers.GetLogBook)
	r.POST("/api/logbooks", controllers.CreateLogBook)
	r.PUT("/api/logbooks/:id", controllers.UpdateLogBook)
	r.DELETE("/api/logbooks/:id", controllers.DeleteLogBook)

	// Modena POD
	r.GET("/api/pods", controllers.GetPODs)
	r.GET("/api/pods/:id", controllers.GetPOD)
	r.POST("/api/pods", controllers.CreatePOD)
	r.PUT("/api/pods/:id", controllers.UpdatePOD)
	r.DELETE("/api/pods/:id", controllers.DeletePOD)

	r.GET("/api/pod-occupants", controllers.GetPODOccupants)
	r.GET("/api/pod-occupants/:id", controllers.GetPODOccupant)
	r.POST("/api/pod-occupants", controllers.CreatePODOccupant)
	r.PUT("/api/pod-occupants/:id", controllers.UpdatePODOccupant)
	r.DELETE("/api/pod-occupants/:id", controllers.DeletePODOccupant)

	r.GET("/api/pod-requests", controllers.GetPODRequests)
	r.GET("/api/pod-requests/:id", controllers.GetPODRequest)
	r.POST("/api/pod-requests", controllers.CreatePODRequest)
	r.PUT("/api/pod-requests/:id", controllers.UpdatePODRequest)
	r.DELETE("/api/pod-requests/:id", controllers.DeletePODRequest)

	// Loker
	r.GET("/api/lokers", controllers.GetLokers)
	r.GET("/api/lokers/:id", controllers.GetLoker)
	r.POST("/api/lokers", controllers.CreateLoker)
	r.PUT("/api/lokers/:id", controllers.UpdateLoker)
	r.DELETE("/api/lokers/:id", controllers.DeleteLoker)

	r.GET("/api/loker-requests", controllers.GetLokerRequests)
	r.GET("/api/loker-requests/:id", controllers.GetLokerRequest)
	r.POST("/api/loker-requests", controllers.CreateLokerRequest)
	r.PUT("/api/loker-requests/:id", controllers.UpdateLokerRequest)
	r.DELETE("/api/loker-requests/:id", controllers.DeleteLokerRequest)

	// Master Approvals
	r.GET("/api/master-approvals", controllers.GetMasterApprovals)
	r.GET("/api/master-approvals/:id", controllers.GetMasterApproval)
	r.POST("/api/master-approvals", controllers.CreateMasterApproval)
	r.PUT("/api/master-approvals/:id", controllers.UpdateMasterApproval)
	r.DELETE("/api/master-approvals/:id", controllers.DeleteMasterApproval)

	// Notifications
	r.GET("/api/notifications", controllers.GetNotifications)
	r.GET("/api/notifications/unread-count", controllers.GetUnreadCount)
	r.PUT("/api/notifications/:id/read", controllers.MarkAsRead)
	r.PUT("/api/notifications/mark-all-read", controllers.MarkAllAsRead)
	r.POST("/api/notifications/approval", controllers.CreateApprovalNotification)
	r.POST("/api/notifications/process-approval", controllers.ProcessApproval)
	r.DELETE("/api/notifications/:id", controllers.DeleteNotification)

	// Reminders
	r.GET("/api/reminders", controllers.GetReminders)
	r.GET("/api/reminders/vehicle", controllers.GetVehicleReminders)
	r.GET("/api/reminders/building", controllers.GetBuildingReminders)
	r.GET("/api/reminders/asset", controllers.GetAssetReminders)

	// File Upload
	r.POST("/api/upload", controllers.UploadFile)
	r.POST("/api/upload/multiple", controllers.UploadMultipleFiles)
	r.DELETE("/api/upload/:category/:filename", controllers.DeleteFile)

	// Export
	r.GET("/api/export/vehicles", controllers.ExportVehiclesToExcel)
	r.GET("/api/export/buildings", controllers.ExportBuildingsToExcel)
	r.GET("/api/export/assets", controllers.ExportAssetsToExcel)
	r.GET("/api/export/vendors", controllers.ExportVendorsToExcel)

	// Insurance Claims
	r.GET("/api/insurance-claims", controllers.GetInsuranceClaims)
	r.POST("/api/insurance-claims", controllers.CreateInsuranceClaim)
	r.PUT("/api/insurance-claims/:id", controllers.UpdateInsuranceClaim)

	// Asset Maintenance
	r.GET("/api/asset-maintenances", controllers.GetAssetMaintenances)
	r.GET("/api/asset-maintenances/:id", controllers.GetAssetMaintenance)
	r.POST("/api/asset-maintenances", controllers.CreateAssetMaintenance)
	r.PUT("/api/asset-maintenances/:id", controllers.UpdateAssetMaintenance)
	r.DELETE("/api/asset-maintenances/:id", controllers.DeleteAssetMaintenance)
}
