FROM node:20.15.1 AS ANGULAR_BUILD
RUN npm install -g @angular/cli@16.2.9 
COPY webapp /webapp
WORKDIR webapp
RUN npm install && ng build

FROM golang:1.22.5-alpine AS GO_BUILD
COPY server /server
WORKDIR /server
RUN go build -o /go/bin/server

FROM alpine:3.10
WORKDIR app
COPY --from=ANGULAR_BUILD /webapp/dist/webapp/* ./webapp/dist/webapp/
COPY --from=GO_BUILD /go/bin/server ./
RUN ls
CMD ./server
