package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.LoadHTMLGlob("templates/*")

	r.StaticFS("/scorm", gin.Dir("public/scorm", true))
	r.StaticFS("/js", gin.Dir("public/js", true))

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "upload.html", nil)
	})

	r.POST("/upload", uploadHandler)
	err := r.Run(":8080")
	if err != nil {
		log.Fatal(err)
	}
}
