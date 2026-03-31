# practice-ecommerce-fullstack

A full-stack e-commerce application built with React, Node.js, Express, and PostgreSQL.

## Tech Stack

**Frontend:** React, Tailwind CSS, Stripe.js  
**Backend:** Node.js, Express, PostgreSQL  
**Auth:** JWT, bcryptjs  
**Storage:** Cloudinary  
**Payment:** Stripe

## Features

- JWT authentication with role-based access (user / admin)
- Product listing with search, filter, sort, and pagination
- Cart with real-time stock validation
- Stripe Payment Element integration
- Order management with status transitions and history
- Admin dashboard — product CRUD with image upload, order status management

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL

### Installation
```bash
git clone https://github.com/rzalete/practice-ecommerce-fullstack.git
cd practice-ecommerce-fullstack
```

**Backend**
```bash
cd server
npm install
```

**Frontend**
```bash
cd client
npm install
```

### Environment Variables

**`server/.env`**
```
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=sk_test_...
```

**`client/.env`**
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_API_URL=your_railway_backend_url
```

### Database Setup
```bash
psql -U postgres -d your_database_name -f server/config/schema.sql
```

### Running Locally
```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm start
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register | — |
| POST | `/api/auth/login` | Login | — |
| GET | `/api/products` | List products | — |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/cart` | Get cart | User |
| POST | `/api/cart` | Add to cart | User |
| PUT | `/api/cart/:id` | Update quantity | User |
| DELETE | `/api/cart/:id` | Remove item | User |
| GET | `/api/orders` | Get user orders | User |
| GET | `/api/orders/:id` | Get order detail | User |
| GET | `/api/orders/admin` | Get all orders | Admin |
| PATCH | `/api/orders/:id/status` | Update status | Admin |
| POST | `/api/payment/create-intent` | Create payment intent | User |
| POST | `/api/payment/confirm-order` | Confirm order | User |
| POST | `/api/upload` | Upload image | Admin |

**Live Demo:** https://practice-ecommerce-delta.vercel.app