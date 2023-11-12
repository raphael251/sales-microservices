# Sales Microservices

## Introduction

This project has three components, the auth API, the product API, and the sales API. Each of them has its responsibility and purpose. I'll explain the responsibility of each one.

### Auth API

The auth API is resbonsible for creating the user data and putting these information on a signed JWT token. This API is just consumed and don't consume any of the others.

### Product API

The product API is responsible for managing the products, categories and suppliers. It send and receive requests and messages from the sales API. It send requests for getting orders infos and send async messages about the received orders, informing if the stock was updated successfully or if something get wrong in the place (e.g. when the product is out of stock).

### Sales API

The sales API is responsible for managing the orders. It send and receive requests and messages from the product API. It send requests for getting infos about the product stock before send the actual order message and send the order message when the first check of the stock is ok.

## The workflow

1. The token is generated in the auth API.
2. A request is made for the create order endpoint.
3. The sales API make a request for checking the product's stock in the product API.
4. If the product is out of stock the order is cancelled.
5. If the product stock is ok, then the order is saved with the pending status and the order message is sent to the product API.
6. The product API receives the message from the sales API and checks the stock again.
7. If the product is out of stock, the product API sends the message with the rejected status.
8. If the product stock is ok, the product API sends the message with the approved status.

## Technologies

### Shared

RabbitMQ 3
Docker
Docker Compose

### Product API

Java 21
PostgreSQL 11
Spring Boot 3.1
Spring Data JPA
Spring Cloud Feign
Lombok
JWT

### Sales API

Node.js 20
MongoDB
Express
AMQP lib
Mongoose
Axios
JWT

### Auth API

Node.js 20
PostgreSQL 11
Express
Sequelize
Bcrypt
JWT

## Running the project
