package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	_ "server/docs"

	sq "github.com/Masterminds/squirrel"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/labstack/echo/v4"
	echoSwagger "github.com/swaggo/echo-swagger"
)

type user struct {
	ID         int    `gorm:"primary_key" json:"id"`
	Username   string `json:"username"`
	Firstname  string `json:"firstname"`
	Lastname   string `json:"lastname"`
	Email      string `json:"email"`
	UserStatus string `json:"userStatus"`
	Department string `json:"department"`
}

type App struct {
	db *gorm.DB
	e  *echo.Echo
}

// @title User API
// @version 1.0
// @description This is a simple API for managing users.
// @host localhost:8080
// @BasePath /
func (a *App) start() {
	a.db.AutoMigrate(&user{})

	a.e.GET("/users", a.getAllUsers)
	a.e.POST("/users", a.addUser)
	a.e.PUT("/users/:id", a.updateUser)
	a.e.DELETE("/users/:id", a.deleteUser)

	a.e.GET("/swagger/*", echoSwagger.WrapHandler)

	a.e.Static("/", "webapp/dist/webapp")
	log.Fatal(a.e.Start(":8080"))
}

// getAllUsers retrieves all users
// @Summary Get all users
// @Description Retrieve a list of users
// @Tags users
// @Produce json
// @Success 200 {array} user
// @Failure 500 {object} error
// @Router /users [get]
func (a *App) getAllUsers(c echo.Context) error {
	var users []user

	query, args, err := sq.Select("*").From("users").ToSql()
	if err != nil {
		return err
	}

	err = a.db.Raw(query, args...).Scan(&users).Error
	if err != nil {
		return err
	}
	j, err := json.Marshal(users)
	if err != nil {
		return err
	}
	return c.String(http.StatusOK, string(j))
}

// addUser creates a new user
// @Summary Add a new user
// @Description Create a user with the provided information
// @Tags users
// @Accept json
// @Produce json
// @Param user body user true "User data"
// @Success 201 {object} user
// @Failure 400 {object} error
// @Failure 409 {object} error
// @Router /users [post]
func (a *App) addUser(c echo.Context) error {
	var u user
	if err := c.Bind(&u); err != nil {
		return err
	}
	var u2 user
	query, args, err := sq.Select("*").
		From("users").
		Where("username = ?", u.Username).
		ToSql()
	if err != nil {
		return err
	}

	err = a.db.Raw(query, args...).Scan(&u2).Error
	if err != nil {
		if err.Error() != "record not found" {
			return err
		}
	}

	if u2.Username != "" {
		return c.JSON(http.StatusConflict, map[string]string{"error": "Username already exists"})
	}

	query, args, err = sq.Insert("users").
		Columns("Username",
			"Firstname",
			"Lastname",
			"Email",
			"User_status",
			"Department",
		).
		Values(
			u.Username,
			u.Firstname,
			u.Lastname,
			u.Email,
			u.UserStatus,
			u.Department,
		).
		ToSql()
	if err != nil {
		return err
	}

	err = a.db.Exec(query, args...).Error
	if err != nil {
		return err
	}
	if err != nil {
		return err
	} else {
		return c.JSON(http.StatusCreated, u)
	}
}

// updateUser modifies an existing user
// @Summary Update an existing user
// @Description Update user information by ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param user body user true "Updated user data"
// @Success 200 {object} user
// @Failure 400 {object} error
// @Router /users/{id} [put]
func (a *App) updateUser(c echo.Context) error {
	var u user
	id := c.Param("id")
	sId, err := strconv.Atoi(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	if err := c.Bind(&u); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	u.ID = sId

	query, args, err := sq.Update("users").
		Set("username", u.Username).
		Set("firstname", u.Firstname).
		Set("lastname", u.Lastname).
		Set("email", u.Email).
		Set("user_status", u.UserStatus).
		Set("department", u.Department).
		Where("id = ?", u.ID).
		ToSql()
	if err != nil {
		return err
	}

	err = a.db.Exec(query, args...).Error
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, u)
}

// deleteUser removes a user by ID
// @Summary Delete a user
// @Description Remove a user from the database by ID
// @Tags users
// @Param id path int true "User ID"
// @Success 200 {string} string "User deleted"
// @Failure 400 {object} error
// @Router /users/{id} [delete]
func (a *App) deleteUser(c echo.Context) error {
	id := c.Param("id")
	sId, err := strconv.Atoi(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
	}

	query, args, err := sq.Delete("users").
		Where("id = ?", sId).
		ToSql()
	if err != nil {
		return err
	}

	err = a.db.Exec(query, args...).Error
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, "")
}
