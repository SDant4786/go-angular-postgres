## System requirements 
You need to have [Docker](https://www.docker.com) 
installed in order to build and run the application.

For unit tests:
Angular v16
Go v1.22
Node v20.15

## Unit tests
1. Angular
   1. From /takehome/webapp
   2. ng test
2. GO
   1. From /takehome/server
   2. go test .
  
## How to build and run
1. Create a Docker network:
    ```shell script
    docker network create users-net
    ```
2. Start the DB:
    ```shell script
    docker run \
      -e POSTGRES_USER=go \
      -e POSTGRES_PASSWORD=your-strong-pass \
      -e POSTGRES_DB=go \
      --name users-db \
      --net=users-net \
      postgres:11.5
    ```
3. Build the application image:
    ```shell script
    docker build -t users-app .
    ```
4. Start the application container:
    ```shell script
    docker run -p 8080:8080 \
      -e DB_PASS='your-strong-pass' \
      --net=users-net users-app
    ```
Access the application via http://localhost:8080

## Swagger docs
http://localhost:8080/swagger//index.html
