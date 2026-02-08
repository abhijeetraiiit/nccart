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

## Cart Endpoints

### Get User's Cart
Get the current user's shopping cart with product details.

**Endpoint:** `GET /cart`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "customerId": "customer-uuid",
    "items": [
      {
        "product": {
          "id": "product-uuid",
          "name": "Product Name",
          "slug": "product-slug",
          "price": 999.99,
          "mrp": 1299.99,
          "discount": 23,
          "stock": 50,
          "status": "ACTIVE",
          "images": ["image1.jpg", "image2.jpg"],
          "seller": {
            "id": "seller-uuid",
            "businessName": "Seller Store"
          }
        },
        "quantity": 2,
        "subtotal": 1999.98,
        "addedAt": "2024-02-08T12:00:00Z"
      }
    ],
    "total": 1999.98,
    "itemCount": 2,
    "updatedAt": "2024-02-08T12:00:00Z"
  }
}
```

### Add Item to Cart
Add a product to the shopping cart.

**Endpoint:** `POST /cart`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "productId": "product-uuid",
  "quantity": 2
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "customerId": "customer-uuid",
    "items": [...],
    "total": 1999.98,
    "itemCount": 2,
    "updatedAt": "2024-02-08T12:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid product ID, insufficient stock, or product not available
- `404 Not Found`: Product not found or customer profile not found

### Update Cart Item Quantity
Update the quantity of a product in the cart.

**Endpoint:** `PUT /cart/:productId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Note:** Setting quantity to 0 will remove the item from cart.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Cart updated successfully",
  "data": {
    "customerId": "customer-uuid",
    "items": [...],
    "total": 2999.97,
    "itemCount": 3,
    "updatedAt": "2024-02-08T12:05:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Item not in cart, insufficient stock, or invalid quantity
- `404 Not Found`: Customer profile not found

### Remove Item from Cart
Remove a specific product from the cart.

**Endpoint:** `DELETE /cart/:productId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "customerId": "customer-uuid",
    "items": [],
    "total": 0,
    "itemCount": 0,
    "updatedAt": "2024-02-08T12:10:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Item not found in cart or customer profile not found

### Clear Cart
Remove all items from the cart.

**Endpoint:** `DELETE /cart`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "data": {
    "customerId": "customer-uuid",
    "items": [],
    "total": 0,
    "itemCount": 0,
    "message": "Cart cleared successfully"
  }
}
```

### Get Cart Total
Get a summary of the cart total and item counts.

**Endpoint:** `GET /cart/total`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "customerId": "customer-uuid",
    "total": 1999.98,
    "itemCount": 2,
    "items": 1
  }
}
```

### Validate Cart
Check if all items in cart are still available and in stock.

**Endpoint:** `GET /cart/validate`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "valid": true,
    "issues": []
  }
}
```

**Response with Issues:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "issues": [
      {
        "productId": "product-uuid",
        "productName": "Product Name",
        "issue": "Insufficient stock. Only 5 available, but 10 requested",
        "availableStock": 5,
        "requestedQuantity": 10
      },
      {
        "productId": "another-uuid",
        "productName": "Another Product",
        "issue": "Product is no longer available"
      }
    ]
  }
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

## Order Management Endpoints

### Create Order from Cart
Create a new order from the current cart items.

**Endpoint:** `POST /orders`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "addressId": "address-uuid",
  "paymentMethod": "COD"
}
```

**Payment Methods:** `UPI`, `CARD`, `NETBANKING`, `WALLET`, `COD`

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid",
    "userId": "user-uuid",
    "orderNumber": "ORD24020800001",
    "subtotal": 1999.98,
    "deliveryCharge": 0,
    "tax": 359.996,
    "discount": 0,
    "total": 2359.976,
    "paymentMethod": "COD",
    "paymentStatus": "PENDING",
    "status": "PENDING",
    "shippingAddress": {
      "id": "address-uuid",
      "fullName": "John Doe",
      "phone": "9876543210",
      "addressLine1": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "items": [
      {
        "id": "order-item-uuid",
        "productId": "product-uuid",
        "quantity": 2,
        "price": 999.99,
        "tax": 179.998,
        "subtotal": 1999.98,
        "product": {
          "id": "product-uuid",
          "name": "Product Name",
          "slug": "product-slug",
          "images": ["image1.jpg"]
        },
        "seller": {
          "id": "seller-uuid",
          "businessName": "Seller Store",
          "displayName": "Seller Store"
        }
      }
    ],
    "createdAt": "2024-02-08T12:00:00Z",
    "updatedAt": "2024-02-08T12:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Cart is empty, cart validation failed, address not found, or insufficient stock
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Customer profile not found

**Notes:**
- Cart is automatically cleared after successful order creation
- Delivery charge is ₹50 for orders below ₹500, free for orders ₹500 and above
- Tax is calculated at 18% GST on subtotal
- Product stock is automatically reduced when order is created

### Get Customer Orders
Get list of orders for the authenticated customer.

**Endpoint:** `GET /orders`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by order status - `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of orders per page
- `sortBy` (optional, default: createdAt): Sort field - `createdAt`, `total`
- `sortOrder` (optional, default: desc): Sort order - `asc`, `desc`

**Example:** `GET /orders?status=PENDING&page=1&limit=10&sortBy=createdAt&sortOrder=desc`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-uuid",
        "orderNumber": "ORD24020800001",
        "status": "PENDING",
        "paymentStatus": "PENDING",
        "total": 2359.976,
        "subtotal": 1999.98,
        "deliveryCharge": 0,
        "tax": 359.996,
        "items": [
          {
            "id": "order-item-uuid",
            "quantity": 2,
            "price": 999.99,
            "subtotal": 1999.98,
            "product": {
              "id": "product-uuid",
              "name": "Product Name",
              "slug": "product-slug",
              "images": ["image1.jpg"],
              "price": 999.99
            },
            "seller": {
              "id": "seller-uuid",
              "businessName": "Seller Store",
              "displayName": "Seller Store"
            }
          }
        ],
        "shippingAddress": {
          "fullName": "John Doe",
          "city": "Mumbai",
          "state": "Maharashtra"
        },
        "createdAt": "2024-02-08T12:00:00Z",
        "updatedAt": "2024-02-08T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Get Order Details
Get detailed information about a specific order.

**Endpoint:** `GET /orders/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "userId": "user-uuid",
    "orderNumber": "ORD24020800001",
    "subtotal": 1999.98,
    "deliveryCharge": 0,
    "tax": 359.996,
    "discount": 0,
    "total": 2359.976,
    "paymentMethod": "COD",
    "paymentStatus": "PENDING",
    "paymentId": null,
    "status": "PENDING",
    "deliveryPartner": null,
    "trackingNumber": null,
    "estimatedDelivery": null,
    "deliveredAt": null,
    "shippingAddress": {
      "id": "address-uuid",
      "fullName": "John Doe",
      "phone": "9876543210",
      "addressLine1": "123 Main St",
      "addressLine2": null,
      "landmark": "Near Park",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "billingAddress": {
      "id": "address-uuid",
      "fullName": "John Doe",
      "phone": "9876543210",
      "addressLine1": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "items": [
      {
        "id": "order-item-uuid",
        "productId": "product-uuid",
        "sellerId": "seller-uuid",
        "quantity": 2,
        "price": 999.99,
        "discount": 0,
        "tax": 179.998,
        "subtotal": 1999.98,
        "product": {
          "id": "product-uuid",
          "name": "Product Name",
          "slug": "product-slug",
          "images": ["image1.jpg"],
          "price": 999.99,
          "mrp": 1299.99
        },
        "seller": {
          "id": "seller-uuid",
          "businessName": "Seller Store",
          "displayName": "Seller Store"
        }
      }
    ],
    "createdAt": "2024-02-08T12:00:00Z",
    "updatedAt": "2024-02-08T12:00:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Order not found or doesn't belong to the user
- `401 Unauthorized`: Authentication required

### Cancel Order
Cancel a pending or confirmed order.

**Endpoint:** `PUT /orders/:id/cancel`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD24020800001",
    "status": "CANCELLED",
    "items": [...]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Order cannot be cancelled (already shipped/delivered)
- `404 Not Found`: Order not found
- `401 Unauthorized`: Authentication required

**Notes:**
- Orders can only be cancelled if status is `PENDING` or `CONFIRMED`
- Product stock is automatically restored when order is cancelled
- Cancellation reason is optional

### Update Order Status (Seller Only)
Update the status of an order. Only sellers who have items in the order can update it.

**Endpoint:** `PUT /orders/:id/status`

**Headers:** `Authorization: Bearer <token>`

**Authorization:** Required role - `SELLER` or `ADMIN`

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Values:** `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD24020800001",
    "status": "CONFIRMED",
    "items": [...]
  }
}
```

**Status Transition Rules:**
- `PENDING` → `CONFIRMED` or `CANCELLED`
- `CONFIRMED` → `PROCESSING` or `CANCELLED`
- `PROCESSING` → `SHIPPED` or `CANCELLED`
- `SHIPPED` → `DELIVERED`
- `DELIVERED` → (final state)
- `CANCELLED` → (final state)
- `REFUNDED` → (final state)

**Error Responses:**
- `400 Bad Request`: Invalid status transition or order not found
- `403 Forbidden`: User is not a seller or seller doesn't have items in this order
- `401 Unauthorized`: Authentication required

### Get Seller Orders
Get list of orders containing the seller's products.

**Endpoint:** `GET /orders/seller/orders`

**Headers:** `Authorization: Bearer <token>`

**Authorization:** Required role - `SELLER` or `ADMIN`

**Query Parameters:**
- `status` (optional): Filter by order status
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Orders per page
- `sortBy` (optional, default: createdAt): Sort field
- `sortOrder` (optional, default: desc): Sort order
- `dateFrom` (optional): Filter orders from date (ISO 8601 format)
- `dateTo` (optional): Filter orders until date (ISO 8601 format)

**Example:** `GET /orders/seller/orders?status=PENDING&page=1&limit=10&dateFrom=2024-02-01`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-uuid",
        "orderNumber": "ORD24020800001",
        "status": "PENDING",
        "paymentStatus": "PENDING",
        "total": 2359.976,
        "sellerSubtotal": 1999.98,
        "sellerTax": 179.998,
        "sellerTotal": 2179.978,
        "itemCount": 2,
        "items": [
          {
            "id": "order-item-uuid",
            "productId": "product-uuid",
            "quantity": 2,
            "price": 999.99,
            "subtotal": 1999.98,
            "tax": 179.998,
            "product": {
              "id": "product-uuid",
              "name": "Product Name",
              "slug": "product-slug",
              "images": ["image1.jpg"]
            }
          }
        ],
        "shippingAddress": {
          "fullName": "John Doe",
          "phone": "9876543210",
          "addressLine1": "123 Main St",
          "city": "Mumbai",
          "state": "Maharashtra",
          "pincode": "400001"
        },
        "createdAt": "2024-02-08T12:00:00Z",
        "updatedAt": "2024-02-08T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

**Notes:**
- Only shows orders containing the seller's products
- `sellerSubtotal`, `sellerTax`, and `sellerTotal` show amounts specific to seller's items
- Multi-vendor orders will appear in multiple sellers' order lists

### Get Seller Analytics
Get order analytics and statistics for the seller.

**Endpoint:** `GET /orders/seller/analytics`

**Headers:** `Authorization: Bearer <token>`

**Authorization:** Required role - `SELLER` or `ADMIN`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalOrders": 50,
    "totalRevenue": 125000.50,
    "averageOrderValue": 2500.01,
    "recentOrders": 8,
    "recentRevenue": 18500.00,
    "statusCounts": {
      "PENDING": 5,
      "CONFIRMED": 3,
      "PROCESSING": 7,
      "SHIPPED": 10,
      "DELIVERED": 20,
      "CANCELLED": 5
    },
    "topProducts": [
      {
        "id": "product-uuid",
        "name": "Product Name",
        "slug": "product-slug",
        "images": ["image1.jpg"],
        "quantitySold": 150,
        "revenue": 45000.00
      }
    ]
  }
}
```

**Analytics Metrics:**
- `totalOrders`: Total number of orders containing seller's products
- `totalRevenue`: Total revenue from all orders (seller's items only)
- `averageOrderValue`: Average revenue per order
- `recentOrders`: Number of orders in last 7 days
- `recentRevenue`: Revenue from orders in last 7 days
- `statusCounts`: Count of orders by status
- `topProducts`: Top 5 products by revenue

---

For more details, see the source code in `backend/src/routes/` and `backend/src/controllers/`.
