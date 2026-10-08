#CampusKart – AWS 3-Tier E-Commerce Application

CampusKart is a full-stack e-commerce application deployed on AWS using a production-style 3-tier architecture.  
The system is designed with proper network isolation, secure API communication, and scalable cloud infrastructure.
----------
##Architecture Overview

User → CloudFront → S3 (React Frontend)  
             ↓  
ALB → EC2 (Node.js Backend) → RDS (MySQL)

- Frontend is hosted on Amazon S3 and distributed globally via CloudFront CDN
- Backend runs on EC2 inside a private subnet using Auto Scaling Groups for HA
- Database runs on Amazon RDS in a private subnet
- Application Load Balancer routes external traffic securely to backend services

---------
##Cloud Infrastructure

- Amazon S3 (Static Website Hosting)
- Amazon CloudFront (Content Delivery Network)
- AWS Application Load Balancer (Public)
- AWS EC2 (Private Subnet – Node.js Backend)
- AWS RDS MySQL (Private Subnet – Database)
- VPC with Public and Private Subnets
- Security Groups configured for tier isolation

--------
## Tech Stack

### Frontend
- React.js
- Bootstrap
- Axios

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt password hashing

### Database
- MySQL (AWS RDS)

------------

##Features Implemented

- User Registration
- User Login with JWT Authentication
- Protected API Routes
- Product Listing API
- Add to Cart
- Order Creation
- Modular Backend Architecture
- Secure Cloud Deployment

--------------
## Backend Structure

Root Directory

server.js – Application entry point

app.js – Express app configuration

config/

db.js – Database connection setup

middleware/

authMiddleware.js – JWT authentication middleware

modules/

auth/ – Registration & login logic

products/ – Product APIs

cart/ – Cart APIs

orders/ – Order APIs

utils/

Helper functions and reusable utilities
------------
## Database Schema

Tables Used:

- users
- products
- categories
- cart_items
- orders
- order_items

Relational Flow:

users → cart_items → products  
users → orders → order_items  

------------

## API Endpoints


 POST --> /api/auth/register 
 POST --> /api/auth/login 
 GET -->/api/products 
 GET --> /api/products/:id 
 POST --> /api/cart 
 GET --> /api/cart 
 DELETE -->/api/cart/:id 
 POST --> /api/orders 
|GET--> /api/orders 

-----------

## Security Implementation

- JWT-based Authentication
- Password Hashing using bcrypt
- Private Subnet Isolation for EC2 & RDS
- Security Group Controlled Access
- Backend not directly exposed to public internet
- Database accessible only from backend layer

-------------

## Deployment Flow

1. User accesses website via CloudFront
2. CloudFront serves static React app from S3
3. API requests are routed to ALB
4. ALB forwards traffic to EC2 backend
5. Backend communicates securely with RDS

------

## Learning Outcomes

- Designed and deployed AWS 3-Tier Architecture
- Implemented secure authentication using JWT
- Built modular backend with scalable structure
- Configured VPC networking and subnet isolation
- Integrated S3 + CloudFront for frontend delivery
- Managed cloud security best practices

---------

## Future Enhancements

- Microservices Architecture Migration
- CI/CD using GitHub Actions
- Docker Containerization
- Auto Scaling Group Implementation
- Payment Gateway Integration

---------

##Author

Thejas AM


## Kubernetes work (this fork)

This repository is a fork of the original CampusKart project, and the credit above stays as it is. The Kubernetes work in this fork was done by Rashid Khan: the Dockerfiles, the `k8s/` manifests, the `db/` schema and seed, the kind cluster setup, the GitHub Actions workflow and the audit write-up in `K8S-AUDIT.md`.
