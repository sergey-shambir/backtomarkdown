package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.LoadHTMLGlob("templates/*")

	r.StaticFS("/scorm", gin.Dir("scorm_packages", true))

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "upload.html", nil)
	})

	r.POST("/upload", uploadHandler)
	err := r.Run(":8080")
	if err != nil {
		log.Fatal(err)
	}
}
