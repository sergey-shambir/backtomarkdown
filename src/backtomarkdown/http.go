package main

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"backtomarkdown/scorm"
)

func uploadHandler(c *gin.Context) {
	file, err := getUploadedFile(c)
	if abortOnError(c, err, http.StatusBadRequest) {
		return
	}

	dirPath, err := createPackageDir()
	if abortOnError(c, err, http.StatusInternalServerError) {
		return
	}

	if err := processSCORMPackage(c, file, dirPath); abortOnError(c, err, http.StatusInternalServerError) {
		return
	}

	entry, err := scorm.GetPackageEntryPoint(dirPath)
	if abortOnError(c, err, http.StatusBadRequest) {
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":    filepath.Base(dirPath),
		"entry": entry,
	})
}

func processSCORMPackage(c *gin.Context, file *multipart.FileHeader, destPath string) error {
	zipPath := filepath.Join(destPath, file.Filename)
	if err := c.SaveUploadedFile(file, zipPath); err != nil {
		return fmt.Errorf("could not save uploaded scorm archive: %w", err)
	}

	return scorm.ExtractPackage(zipPath, destPath)
}

func getUploadedFile(c *gin.Context) (*multipart.FileHeader, error) {
	file, err := c.FormFile("file")
	if err != nil {
		return nil, fmt.Errorf("file upload error: %w", err)
	}
	return file, nil
}

func createPackageDir() (string, error) {
	id := uuid.New().String()
	dirPath := filepath.Join("scorm_packages", id)
	return dirPath, os.MkdirAll(dirPath, 0755)
}

func abortOnError(c *gin.Context, err error, code int) bool {
	if err != nil {
		c.AbortWithStatusJSON(code, gin.H{"error": err.Error()})
		return true
	}
	return false
}
