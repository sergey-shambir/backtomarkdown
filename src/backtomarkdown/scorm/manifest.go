package scorm

import (
	"encoding/xml"
	"fmt"
	"os"
	"path/filepath"
)

type Manifest struct {
	XMLName       xml.Name      `xml:"manifest"`
	Organizations Organizations `xml:"organizations"`
	Resources     []Resource    `xml:"resources>resource"`
}

type Organizations struct {
	Default       string         `xml:"default,attr"`
	Organizations []Organization `xml:"organization"`
}

type Organization struct {
	Identifier string             `xml:"identifier,attr"`
	Items      []OrganizationItem `xml:"item"`
}

type OrganizationItem struct {
	IdentifierRef string `xml:"identifierref,attr"`
}

type Resource struct {
	Identifier string `xml:"identifier,attr"`
	Href       string `xml:"href,attr"`
}

func GetPackageEntryPoint(dirPath string) (string, error) {
	manifest, err := loadScormManifest(dirPath)
	if err != nil {
		return "", fmt.Errorf("could not load SCORM manifest: %w", err)
	}

	org, err := findDefaultOrganization(manifest)
	if err != nil {
		return "", fmt.Errorf("could not find SCORM organization: %w", err)
	}

	item, err := findFirstOrganizationItem(org)
	if err != nil {
		return "", fmt.Errorf("could not find organization item: %w", err)
	}

	resource, err := findResource(manifest, item.IdentifierRef)
	if err != nil {
		return "", fmt.Errorf("could not find resource: %w", err)
	}

	if err := validateEntryPoint(dirPath, resource.Href); err != nil {
		return "", err
	}

	return resource.Href, nil
}

func loadScormManifest(dirPath string) (*Manifest, error) {
	manifestPath := filepath.Join(dirPath, "imsmanifest.xml")
	file, err := os.Open(manifestPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open SCORM manifest file %q: %w", manifestPath, err)
	}
	defer file.Close()

	var manifest Manifest
	if err := xml.NewDecoder(file).Decode(&manifest); err != nil {
		return nil, fmt.Errorf("failed to parse SCORM manifest %q: %w", manifestPath, err)
	}
	return &manifest, nil
}

func findDefaultOrganization(manifest *Manifest) (*Organization, error) {
	for _, org := range manifest.Organizations.Organizations {
		if org.Identifier == manifest.Organizations.Default {
			return &org, nil
		}
	}
	return nil, fmt.Errorf("manifest has no default organization")
}

func findFirstOrganizationItem(org *Organization) (*OrganizationItem, error) {
	if len(org.Items) == 0 {
		return nil, fmt.Errorf("manifest has no any organizations")
	}
	return &org.Items[0], nil
}

func findResource(manifest *Manifest, identifier string) (*Resource, error) {
	for _, res := range manifest.Resources {
		if res.Identifier == identifier {
			return &res, nil
		}
	}
	return nil, fmt.Errorf("resource %q not found", identifier)
}

func validateEntryPoint(dirPath, href string) error {
	if _, err := os.Stat(filepath.Join(dirPath, href)); err != nil {
		return fmt.Errorf("entry point %q not found: %w", href, err)
	}
	return nil
}
