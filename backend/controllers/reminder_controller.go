package controllers

import (
"fms-backend/config"
"fms-backend/models"
"net/http"
"time"

"github.com/gin-gonic/gin"
)

func GetReminders(c *gin.Context) {
var reminders []models.Reminder
query := config.DB.Order("expiry_date ASC")

if status := c.Query("status"); status != "" {
query = query.Where("status = ?", status)
}
if category := c.Query("category"); category != "" {
query = query.Where("category = ?", category)
}

query.Find(&reminders)

for i := range reminders {
updateReminderStatus(&reminders[i])
}

c.JSON(http.StatusOK, reminders)
}

func GetVehicleReminders(c *gin.Context) {
var vehicles []models.Vehicle
config.DB.Find(&vehicles)

var reminders []map[string]interface{}

for _, v := range vehicles {
if v.MasaBerlaku1 != "" {
status, days := calculateStatus(v.MasaBerlaku1)
reminders = append(reminders, map[string]interface{}{
"id":            v.ID,
"noPolisi":      v.NoPolisi,
"vehicleName":   v.Nama,
"type":          "STNK 1 Tahunan",
"expiryDate":    v.MasaBerlaku1,
"branch":        v.Cabang,
"status":        status,
"daysRemaining": days,
})
}

if v.MasaBerlaku5 != "" {
status, days := calculateStatus(v.MasaBerlaku5)
reminders = append(reminders, map[string]interface{}{
"id":            v.ID,
"noPolisi":      v.NoPolisi,
"vehicleName":   v.Nama,
"type":          "STNK 5 Tahunan",
"expiryDate":    v.MasaBerlaku5,
"branch":        v.Cabang,
"status":        status,
"daysRemaining": days,
})
}

if v.MasaBerlakuKir != "" {
status, days := calculateStatus(v.MasaBerlakuKir)
reminders = append(reminders, map[string]interface{}{
"id":            v.ID,
"noPolisi":      v.NoPolisi,
"vehicleName":   v.Nama,
"type":          "KIR",
"expiryDate":    v.MasaBerlakuKir,
"branch":        v.Cabang,
"status":        status,
"daysRemaining": days,
})
}
}

c.JSON(http.StatusOK, reminders)
}

func GetAssetReminders(c *gin.Context) {
var maintenances []models.AssetMaintenance
config.DB.Find(&maintenances)

var reminders []map[string]interface{}

for _, m := range maintenances {
if m.NextMaintenanceDate != "" {
status, days := calculateStatus(m.NextMaintenanceDate)
reminders = append(reminders, map[string]interface{}{
"id":            m.ID,
"assetNo":       m.AssetNumber,
"assetName":     m.AssetName,
"type":          "Maintenance",
"expiryDate":    m.NextMaintenanceDate,
"location":      m.Location,
"status":        status,
"daysRemaining": days,
})
}
}

c.JSON(http.StatusOK, reminders)
}

func calculateStatus(expiryDateStr string) (string, int) {
expiryDate, err := time.Parse("2006-01-02", expiryDateStr)
if err != nil {
return "Warning", 0
}

days := int(time.Until(expiryDate).Hours() / 24)

if days < 0 {
return "Expired", days
} else if days <= 7 {
return "Critical", days
} else if days <= 30 {
return "Warning", days
}
return "Safe", days
}

func updateReminderStatus(r *models.Reminder) {
if r.ExpiryDate == "" {
return
}

expiryDate, err := time.Parse("2006-01-02", r.ExpiryDate)
if err != nil {
return
}

days := int(time.Until(expiryDate).Hours() / 24)
r.DaysRemaining = days

if days < 0 {
r.Status = "Expired"
} else if days <= 7 {
r.Status = "Urgent"
} else if days <= 30 {
r.Status = "Warning"
} else {
r.Status = "Safe"
}

config.DB.Save(r)
}
