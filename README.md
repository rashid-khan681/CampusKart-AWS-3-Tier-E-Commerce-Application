> **Note about this fork:** This repository is a fork of [Thejasam04/CampusKart-AWS-3-Tier-E-Commerce-Application](https://github.com/Thejasam04/CampusKart-AWS-3-Tier-E-Commerce-Application). The text below is the original README of the AWS deployment, kept as it is for credit. In this fork I changed the app and added Docker and Kubernetes (kind) support. See [Changes in this fork](#changes-in-this-fork) at the bottom.

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


## Changes in this fork

The original project above was built for AWS (S3, CloudFront, ALB, EC2 and RDS). In this fork I made the app run in containers and on Kubernetes. The original author's work and credit stay as they are.

### Backend

- `config/db.js` now reads the database settings from environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) instead of fixed values.
- Fixed the register query in `modules/auth/authController.js`. It used the columns `name` and `password`, but the table has `full_name` and `password_hash`.
- Added a `/health` route in `app.js` for the Kubernetes probes.
- Added `Dockerfile` and `.dockerignore`.

### Frontend

- `src/services/api.js` and `src/pages/Products.js` no longer use a fixed load balancer URL. The API URL comes from `REACT_APP_API_URL`. If it is empty, the app calls `/api` on the same host.
- New pages: Register and Orders. The Cart page now has a Place Order button.
- New look: a new navbar (logo, search box and cart count), a new Home page, and a Products page with search, category filter and sorting. There is also a shared product card and a theme file (`theme.css`). Product pictures are emoji icons by category.
- Added `Dockerfile`, `nginx.conf` and `.dockerignore`.

### Database

- Added `db/01-schema.sql` and `db/02-seed.sql`. I made the schema from the backend queries. The seed has 5 categories and 26 sample products.

### Kubernetes and CI

- `k8s/` has the manifests: namespace, ConfigMap, Secret, MySQL with a PVC, backend, frontend, Ingress, HPA, RBAC and a backup CronJob.
- `kind/` has the 3-node kind cluster config, and `audit.sh` is the audit script.
- `.github/workflows/kind-deploy.yml` creates a kind cluster, deploys the app and runs a smoke test on every push.
- `K8S-AUDIT.md` has the audit with evidence, and the full steps to run the app on kind from a fresh machine.

### What is different from the original README above

- The database runs inside the cluster as `mysql:8.0` with a PVC. It does not use RDS.
- The frontend is served by nginx. It does not use S3 and CloudFront.
- Two items from "Future Enhancements" are now done in this fork: Docker containerization and CI with GitHub Actions.
- I did not test the AWS deployment steps from the original README in this fork.
- The passwords in `k8s/01-config.yaml` are demo values for local testing only.
