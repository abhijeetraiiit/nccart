# NCCart API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

## Authentication
Most endpoints require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
Create a new customer or seller account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "role": "CUSTOMER",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "My Store"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CUSTOMER"
    },
    "token": "jwt-token-here"
  }
}
```

### Login
Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CUSTOMER",
      "status": "ACTIVE"
    },
    "token": "jwt-token-here"
  }
}
```

### Forgot Password
Request password reset email.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "If email exists, password reset link has been sent"
}
```

---

## User Endpoints

### Get User Profile
Get current authenticated user's profile.

**Endpoint:** `GET /users/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User profile endpoint"
}
```

---

## Seller Endpoints

### Seller Dashboard
Get seller dashboard data.

**Endpoint:** `GET /sellers/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Role Required:** SELLER

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Seller dashboard endpoint"
}
```

---

## Product Endpoints

### List All Products
Get paginated list of all active products.

**Endpoint:** `GET /products`

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `category` (optional): Filter by category slug
- `search` (optional): Search in product name/description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Products list endpoint"
}
```

### Get Product Details
Get details of a specific product.

**Endpoint:** `GET /products/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product detail endpoint"
}
```

---

## Order Endpoints

### List User Orders
Get all orders for authenticated user.

**Endpoint:** `GET /orders`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20
- `status` (optional): Filter by order status

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Orders list endpoint"
}
```

---

## Category Endpoints

### List All Categories
Get all active categories.

**Endpoint:** `GET /categories`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Categories list endpoint"
}
```

---

## Admin Endpoints

### Admin Dashboard
Access admin dashboard.

**Endpoint:** `GET /admin/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Role Required:** ADMIN

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Admin dashboard endpoint"
}
```

---

## Health Check

### API Health Check
Check if API is running.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "ok",
  "message": "NCCart API is running"
}
```

---

## Error Responses

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Validation Error Response
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Invalid email format",
      "param": "email",
      "location": "body"
    }
  ]
}
```

---

## Rate Limiting
- **Window:** 15 minutes
- **Max Requests:** 100 requests per IP per window
- **Response when exceeded:** `429 Too Many Requests`

---

## API Versioning
Current version: v1 (implicit)

Future versions will be prefixed: `/api/v2/...`

---

## Testing the API

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "CUSTOMER",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get profile (with token):**
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman
1. Import the API endpoints
2. Set environment variable for `baseUrl`: `http://localhost:5000/api`
3. Set environment variable for `token` after login
4. Use `{{baseUrl}}` and `{{token}}` in requests

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response includes:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Filtering & Sorting

Many list endpoints support filtering and sorting:

**Common filters:**
- `status`: Filter by status
- `createdAfter`: ISO 8601 date
- `createdBefore`: ISO 8601 date

**Sorting:**
- `sortBy`: Field name (e.g., `createdAt`, `price`)
- `sortOrder`: `asc` or `desc`

Example:
```
GET /products?sortBy=price&sortOrder=asc&minPrice=100&maxPrice=1000
```

---

## Future Endpoints (Coming Soon)

### Products
- `POST /products` - Create product (Seller)
- `PUT /products/:id` - Update product (Seller)
- `DELETE /products/:id` - Delete product (Seller)

### Orders
- `POST /orders` - Create order (Customer)
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/cancel` - Cancel order

### Reviews
- `POST /products/:id/reviews` - Add review
- `GET /products/:id/reviews` - Get product reviews

### Wishlist
- `POST /wishlist` - Add to wishlist
- `GET /wishlist` - Get user wishlist
- `DELETE /wishlist/:productId` - Remove from wishlist

### Delivery
- `POST /delivery/quote` - Get delivery quotes
- `GET /delivery/track/:trackingNumber` - Track shipment

### Payment
- `POST /payment/initiate` - Initiate payment
- `POST /payment/verify` - Verify payment

---

For more details, see the source code in `backend/src/routes/` and `backend/src/controllers/`.
