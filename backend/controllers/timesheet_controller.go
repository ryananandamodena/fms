package controllers

import (
"fms-backend/config"
"fms-backend/models"
"net/http"
"github.com/gin-gonic/gin"
)

func GetTimesheets(c *gin.Context) {
var timesheets []models.Timesheet
config.DB.Order("date DESC").Find(&timesheets)
c.JSON(http.StatusOK, timesheets)
}

func GetTimesheet(c *gin.Context) {
id := c.Param("id")
var timesheet models.Timesheet
if err := config.DB.First(&timesheet, id).Error; err != nil {
c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
return
}
c.JSON(http.StatusOK, timesheet)
}

func CreateTimesheet(c *gin.Context) {
var timesheet models.Timesheet
if err := c.ShouldBindJSON(&timesheet); err != nil {
c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
return
}
config.DB.Create(&timesheet)
c.JSON(http.StatusCreated, timesheet)
}

func UpdateTimesheet(c *gin.Context) {
id := c.Param("id")
var timesheet models.Timesheet
if err := config.DB.First(&timesheet, id).Error; err != nil {
c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
return
}
c.ShouldBindJSON(&timesheet)
config.DB.Save(&timesheet)
c.JSON(http.StatusOK, timesheet)
}

func DeleteTimesheet(c *gin.Context) {
id := c.Param("id")
config.DB.Delete(&models.Timesheet{}, id)
c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
