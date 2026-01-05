package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var uploadDir = "./uploads"

func init() {
	// Create upload directories
	dirs := []string{
		uploadDir,
		filepath.Join(uploadDir, "vehicles"),
		filepath.Join(uploadDir, "buildings"),
		filepath.Join(uploadDir, "assets"),
		filepath.Join(uploadDir, "documents"),
		filepath.Join(uploadDir, "avatars"),
	}
	
	for _, dir := range dirs {
		os.MkdirAll(dir, os.ModePerm)
	}
}

// UploadFile - Upload single file
func UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	
	category := c.PostForm("category")
	if category == "" {
		category = "documents"
	}
	
	// Validate file type
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true,
		".pdf": true, ".doc": true, ".docx": true,
		".xls": true, ".xlsx": true,
	}
	
	if !allowedExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File type not allowed"})
		return
	}
	
	// Max 10MB
	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large (max 10MB)"})
		return
	}
	
	// Generate unique filename
	filename := fmt.Sprintf("%s_%s%s", time.Now().Format("20060102150405"), uuid.New().String()[:8], ext)
	filePath := filepath.Join(uploadDir, category, filename)
	
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}
	
	// Return URL
	fileUrl := fmt.Sprintf("/uploads/%s/%s", category, filename)
	
	c.JSON(http.StatusOK, gin.H{
		"message":  "File uploaded successfully",
		"filename": filename,
		"url":      fileUrl,
		"size":     file.Size,
	})
}


// UploadMultipleFiles - Upload multiple files
func UploadMultipleFiles(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
		return
	}
	
	files := form.File["files"]
	category := c.PostForm("category")
	if category == "" {
		category = "documents"
	}
	
	var uploadedFiles []map[string]interface{}
	
	for _, file := range files {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		allowedExts := map[string]bool{
			".jpg": true, ".jpeg": true, ".png": true, ".gif": true,
			".pdf": true, ".doc": true, ".docx": true,
			".xls": true, ".xlsx": true,
		}
		
		if !allowedExts[ext] {
			continue
		}
		
		if file.Size > 10*1024*1024 {
			continue
		}
		
		filename := fmt.Sprintf("%s_%s%s", time.Now().Format("20060102150405"), uuid.New().String()[:8], ext)
		filePath := filepath.Join(uploadDir, category, filename)
		
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			continue
		}
		
		fileUrl := fmt.Sprintf("/uploads/%s/%s", category, filename)
		uploadedFiles = append(uploadedFiles, map[string]interface{}{
			"filename": filename,
			"url":      fileUrl,
			"size":     file.Size,
		})
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Files uploaded",
		"files":   uploadedFiles,
		"count":   len(uploadedFiles),
	})
}

// DeleteFile - Delete uploaded file
func DeleteFile(c *gin.Context) {
	category := c.Param("category")
	filename := c.Param("filename")
	
	filePath := filepath.Join(uploadDir, category, filename)
	
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}
	
	if err := os.Remove(filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "File deleted"})
}
