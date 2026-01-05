package controllers

import (
	"bytes"
	"fms-backend/config"
	"fms-backend/models"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

// ExportVehiclesToExcel - Export vehicles to Excel
func ExportVehiclesToExcel(c *gin.Context) {
	var vehicles []models.Vehicle
	config.DB.Find(&vehicles)
	
	f := excelize.NewFile()
	sheet := "Vehicles"
	f.SetSheetName("Sheet1", sheet)
	
	// Headers
	headers := []string{"No", "No Polisi", "Nama", "Merek", "Tipe", "Model", "Tahun", "Warna", "Cabang", "Status"}
	for i, h := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		f.SetCellValue(sheet, cell, h)
	}
	
	// Style header
	style, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4472C4"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
	})
	f.SetCellStyle(sheet, "A1", "J1", style)
	
	// Data
	for i, v := range vehicles {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), i+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), v.NoPolisi)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), v.Nama)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), v.Merek)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), v.TipeKendaraan)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), v.Model)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), v.TahunPembuatan)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), v.Warna)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", row), v.Cabang)
		f.SetCellValue(sheet, fmt.Sprintf("J%d", row), v.Status)
	}
	
	// Auto width
	for i := 0; i < len(headers); i++ {
		col := string(rune('A' + i))
		f.SetColWidth(sheet, col, col, 15)
	}
	
	// Write to buffer
	var buf bytes.Buffer
	f.Write(&buf)
	
	filename := fmt.Sprintf("vehicles_%s.xlsx", time.Now().Format("20060102"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf.Bytes())
}


// ExportBuildingsToExcel - Export buildings to Excel
func ExportBuildingsToExcel(c *gin.Context) {
	var buildings []models.Building
	config.DB.Find(&buildings)
	
	f := excelize.NewFile()
	sheet := "Buildings"
	f.SetSheetName("Sheet1", sheet)
	
	headers := []string{"No", "Asset No", "Nama", "Tipe", "Alamat", "Kota", "Ownership", "Status"}
	for i, h := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		f.SetCellValue(sheet, cell, h)
	}
	
	style, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4472C4"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
	})
	f.SetCellStyle(sheet, "A1", "H1", style)
	
	for i, b := range buildings {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), i+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), b.AssetNo)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), b.Name)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), b.Type)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), b.Address)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), b.City)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), b.Ownership)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), b.Status)
	}
	
	for i := 0; i < len(headers); i++ {
		col := string(rune('A' + i))
		f.SetColWidth(sheet, col, col, 15)
	}
	
	var buf bytes.Buffer
	f.Write(&buf)
	
	filename := fmt.Sprintf("buildings_%s.xlsx", time.Now().Format("20060102"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf.Bytes())
}

// ExportAssetsToExcel - Export general assets to Excel
func ExportAssetsToExcel(c *gin.Context) {
	var assets []models.GeneralAsset
	
	category := c.Query("category")
	if category != "" {
		config.DB.Where("asset_category = ?", category).Find(&assets)
	} else {
		config.DB.Find(&assets)
	}
	
	f := excelize.NewFile()
	sheet := "Assets"
	f.SetSheetName("Sheet1", sheet)
	
	headers := []string{"No", "Asset Number", "Nama", "Kategori", "Tipe", "Lokasi", "PIC", "Status"}
	for i, h := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		f.SetCellValue(sheet, cell, h)
	}
	
	style, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4472C4"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
	})
	f.SetCellStyle(sheet, "A1", "H1", style)
	
	for i, a := range assets {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), i+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), a.AssetNumber)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), a.AssetName)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), a.AssetCategory)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), a.Type)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), a.AssetLocation)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), a.PIC)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), a.Status)
	}
	
	for i := 0; i < len(headers); i++ {
		col := string(rune('A' + i))
		f.SetColWidth(sheet, col, col, 15)
	}
	
	var buf bytes.Buffer
	f.Write(&buf)
	
	filename := fmt.Sprintf("assets_%s.xlsx", time.Now().Format("20060102"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf.Bytes())
}

// ExportVendorsToExcel - Export vendors to Excel
func ExportVendorsToExcel(c *gin.Context) {
	var vendors []models.Vendor
	config.DB.Find(&vendors)
	
	f := excelize.NewFile()
	sheet := "Vendors"
	f.SetSheetName("Sheet1", sheet)
	
	headers := []string{"No", "Kode", "Nama", "Tipe", "Kategori", "Email", "Telepon", "Status"}
	for i, h := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		f.SetCellValue(sheet, cell, h)
	}
	
	style, _ := f.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true},
		Fill:      excelize.Fill{Type: "pattern", Color: []string{"#4472C4"}, Pattern: 1},
		Alignment: &excelize.Alignment{Horizontal: "center"},
	})
	f.SetCellStyle(sheet, "A1", "H1", style)
	
	for i, v := range vendors {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), i+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), v.VendorCode)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), v.VendorName)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), v.Type)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), v.Category)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", row), v.Email)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", row), v.Phone)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", row), v.Status)
	}
	
	for i := 0; i < len(headers); i++ {
		col := string(rune('A' + i))
		f.SetColWidth(sheet, col, col, 15)
	}
	
	var buf bytes.Buffer
	f.Write(&buf)
	
	filename := fmt.Sprintf("vendors_%s.xlsx", time.Now().Format("20060102"))
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buf.Bytes())
}
