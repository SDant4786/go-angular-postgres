package main

import (
	"os"

	"github.com/jinzhu/gorm"
	"github.com/labstack/echo/v4"
)

func main() {
	pass := os.Getenv("DB_PASS")
	db, err := gorm.Open(
		"postgres",
		"host=users-db user=go password="+pass+" dbname=go sslmode=disable")
	if err != nil {
		panic(err.Error())
	}
	app := App{
		db: db,
		e:  echo.New(),
	}
	app.start()
}
