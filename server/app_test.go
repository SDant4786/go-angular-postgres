package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/labstack/echo/v4"
	_ "github.com/mattn/go-sqlite3"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

func TestExample(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "App Suite")
}

var _ = Describe("App", func() {
	var (
		app      *App
		recorder *httptest.ResponseRecorder
		e        *echo.Echo
		db       *gorm.DB
	)

	BeforeEach(func() {
		e = echo.New()
		db, _ = gorm.Open("sqlite3", ":memory:")
		db.AutoMigrate(&user{})
		app = &App{db: db, e: e}

		recorder = httptest.NewRecorder()
	})

	AfterEach(func() {
		// Clean up the test database
		db.Exec("DELETE FROM users")
	})

	Describe("GET /users", func() {
		It("should return all users", func() {
			// Prepare test data
			db.Create(&user{Username: "testuser", Firstname: "Test", Lastname: "User", Email: "test@example.com", UserStatus: "active", Department: "IT"})

			req := httptest.NewRequest(http.MethodGet, "/users", nil)
			c := e.NewContext(req, recorder)

			err := app.getAllUsers(c)
			Expect(err).To(BeNil())
			Expect(recorder.Code).To(Equal(http.StatusOK))

			var users []user
			err = json.Unmarshal(recorder.Body.Bytes(), &users)
			Expect(err).To(BeNil())
			Expect(len(users)).To(Equal(1))
		})
	})

	Describe("POST /users", func() {
		It("should add a user", func() {
			newUser := user{Username: "newuser", Firstname: "New", Lastname: "User", Email: "new@example.com", UserStatus: "active", Department: "HR"}
			body, _ := json.Marshal(newUser)
			req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewBuffer(body))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			c := e.NewContext(req, recorder)

			err := app.addUser(c)
			Expect(err).To(BeNil())
			Expect(recorder.Code).To(Equal(http.StatusCreated))

			var createdUser user
			err = json.Unmarshal(recorder.Body.Bytes(), &createdUser)
			Expect(err).To(BeNil())
			Expect(createdUser.Username).To(Equal(newUser.Username))
		})
	})

	Describe("PUT /users/:id", func() {
		It("should update a user", func() {
			// Prepare test data
			userToUpdate := user{Username: "updateuser", Firstname: "Update", Lastname: "User", Email: "update@example.com", UserStatus: "active", Department: "Finance"}
			db.Create(&userToUpdate)

			updatedUser := user{Username: "updateduser", Firstname: "Updated", Lastname: "User", Email: "updated@example.com", UserStatus: "inactive", Department: "HR"}
			body, _ := json.Marshal(updatedUser)

			req := httptest.NewRequest(http.MethodPut, "/users/"+strconv.Itoa(userToUpdate.ID), bytes.NewBuffer(body))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			c := e.NewContext(req, recorder)
			c.SetParamNames("id")
			c.SetParamValues(fmt.Sprintf("%d", userToUpdate.ID))

			err := app.updateUser(c)
			Expect(err).To(BeNil())
			fmt.Println(recorder.Body)
			Expect(recorder.Code).To(Equal(http.StatusOK))

			var userAfterUpdate user
			err = json.Unmarshal(recorder.Body.Bytes(), &userAfterUpdate)
			Expect(err).To(BeNil())
			Expect(userAfterUpdate.Username).To(Equal(updatedUser.Username))
		})
	})

	Describe("DELETE /users/:id", func() {
		It("should delete a user", func() {
			// Prepare test data
			userToDelete := user{ID: 1, Username: "deletethis", Firstname: "Delete", Lastname: "User", Email: "delete@example.com", UserStatus: "active", Department: "IT"}
			db.Create(&userToDelete)

			req := httptest.NewRequest(http.MethodDelete, "/users/"+strconv.Itoa(userToDelete.ID), nil)
			c := e.NewContext(req, recorder)
			c.SetParamNames("id")
			c.SetParamValues(fmt.Sprintf("%d", userToDelete.ID))

			err := app.deleteUser(c)
			Expect(err).To(BeNil())
			Expect(recorder.Code).To(Equal(http.StatusOK))

			// Check if the user has been deleted
			var userFound user
			result := db.First(&userFound, userToDelete.ID)
			Expect(result.RecordNotFound()).To(BeTrue())
		})
	})
})
