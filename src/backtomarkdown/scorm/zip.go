package scorm

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
)

func ExtractPackage(scormPath, destPath string) error {
	if err := unzip(scormPath, destPath); err != nil {
		return fmt.Errorf("could not unzip scorm: %w", err)
	}
	return nil
}

func unzip(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return fmt.Errorf("failed to open zip %q: %w", src, err)
	}
	defer r.Close()

	for _, f := range r.File {
		if err := extractZipFile(f, dest); err != nil {
			return err
		}
	}
	return nil
}

func extractZipFile(zipFile *zip.File, dest string) error {
	destPath := filepath.Join(dest, zipFile.Name)
	if !strings.HasPrefix(destPath, filepath.Clean(dest)+string(os.PathSeparator)) {
		return fmt.Errorf("zip entry has illegal path: %s", zipFile.Name)
	}

	if zipFile.FileInfo().IsDir() {
		return os.MkdirAll(destPath, 0755)
	}

	if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
		return fmt.Errorf("failed to create directory %q: %w", destPath, err)
	}

	outFile, err := os.OpenFile(destPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, zipFile.Mode())
	if err != nil {
		return fmt.Errorf("failed to open file %q: %w", destPath, err)
	}
	defer outFile.Close()

	rc, err := zipFile.Open()
	if err != nil {
		return err
	}
	defer rc.Close()

	_, err = io.Copy(outFile, rc)
	return err
}
