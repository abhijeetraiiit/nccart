# Smart Logistics & Risk Management API Documentation

This document details the new API endpoints for the Enterprise Multi-Vendor E-Commerce Platform's Smart Dispatch Engine, Buyer Trust Score system, and Delivery Partner management.

## Table of Contents
1. [Delivery Partner Management](#delivery-partner-management)
2. [Smart Dispatch Engine](#smart-dispatch-engine)
3. [Buyer Trust Score & Risk Management](#buyer-trust-score--risk-management)

---

## Delivery Partner Management

### Partner Registration

**Endpoint:** `POST /api/partners/register`

Register a new delivery partner with KYC information.

**Request Body:**
```json
{
  "name": "John Walker",
  "phone": "9876543210",
  "email": "john@example.com",
  "partnerType": "WALKER",
  "aadhaarNumber": "123456789012",
  "aadhaarDocument": "https://example.com/aadhaar.jpg"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Partner registered successfully. KYC verification pending.",
  "data": {
    "id": "uuid",
    "name": "John Walker",
    "phone": "9876543210",
    "partnerType": "WALKER",
    "kycStatus": "PENDING"
  }
}
```

---

### Update Partner Location

**Endpoint:** `PUT /api/partners/:id/location`

Update partner's real-time location for dispatch algorithm.

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "updatedAt": "2024-02-08T12:00:00Z"
  }
}
```

---

### Toggle Partner Availability

**Endpoint:** `PUT /api/partners/:id/availability`

Set partner as online/offline for receiving delivery requests.

**Request Body:**
```json
{
  "isAvailable": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Partner is now online",
  "data": {
    "id": "uuid",
    "isAvailable": true
  }
}
```

---

### Get Available Delivery Requests

**Endpoint:** `GET /api/partners/:id/orders`

Get nearby orders available for delivery.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "uuid",
      "orderNumber": "ORD-12345",
      "pickupLocation": {
        "latitude": 28.6139,
        "longitude": 77.2090
      },
      "deliveryLocation": {
        "latitude": 28.6200,
        "longitude": 77.2150
      },
      "deliveryAddress": {
        "addressLine1": "123 Main St",
        "city": "New Delhi",
        "pincode": "110001"
      },
      "estimatedEarnings": 50,
      "items": 3
    }
  ]
}
```

---

### Accept Delivery Request

**Endpoint:** `POST /api/partners/:id/accept`

Accept an order for delivery.

**Request Body:**
```json
{
  "orderId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Delivery accepted successfully",
  "data": {
    "orderId": "uuid",
    "orderNumber": "ORD-12345",
    "status": "PROCESSING"
  }
}
```

---

### Get Partner Dashboard

**Endpoint:** `GET /api/partners/:id/dashboard`

Get partner's earnings, stats, and recent deliveries.

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "name": "John Walker",
      "phone": "9876543210",
      "partnerType": "WALKER",
      "rating": 4.8,
      "level": 5,
      "badges": ["STAR_PERFORMER", "100_DELIVERIES"]
    },
    "stats": {
      "totalDeliveries": 150,
      "successfulDeliveries": 145,
      "totalEarnings": 7500,
      "successRate": 96.67
    },
    "recentDeliveries": [...],
    "availability": {
      "isAvailable": true,
      "lastLocationUpdate": "2024-02-08T12:00:00Z"
    }
  }
}
```

---

## Smart Dispatch Engine

### Assign Delivery Partner

**Endpoint:** `POST /api/dispatch/assign`

Triggers the 3-stage smart dispatch algorithm to assign optimal delivery partner.

**Stages:**
1. **Neighborhood Mesh:** Walkers within 1.5km (180s timeout)
2. **Gig-Pool:** Bike/EV within 10km (15min timeout)
3. **Enterprise Bridge:** National courier partners

**Request Body:**
```json
{
  "orderId": "uuid",
  "vendorLocation": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "customerLocation": {
    "latitude": 28.6200,
    "longitude": 77.2150
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Assigned to nearby walker: John Walker",
  "data": {
    "orderId": "uuid",
    "stage": "MESH",
    "partnerId": "uuid",
    "partnerName": "John Walker",
    "estimatedDelivery": "2024-02-08T12:45:00Z"
  }
}
```

---

### Get Dispatch Status

**Endpoint:** `GET /api/dispatch/:orderId/status`

Get dispatch logs and current status for an order.

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "totalAttempts": 3,
    "stages": ["MESH", "MESH", "GIG"],
    "accepted": true,
    "finalStage": "GIG",
    "logs": [
      {
        "stage": "MESH",
        "partnerId": "uuid-1",
        "partnerName": "Partner 1",
        "partnerType": "WALKER",
        "distanceKm": 1.2,
        "pingedAt": "2024-02-08T12:00:00Z",
        "respondedAt": "2024-02-08T12:00:30Z",
        "accepted": false,
        "responseTimeSeconds": 30
      },
      {
        "stage": "GIG",
        "partnerId": "uuid-2",
        "partnerName": "Partner 2",
        "partnerType": "BIKE",
        "distanceKm": 3.5,
        "pingedAt": "2024-02-08T12:03:00Z",
        "respondedAt": "2024-02-08T12:03:15Z",
        "accepted": true,
        "responseTimeSeconds": 15
      }
    ]
  }
}
```

---

### Get Nearby Partners

**Endpoint:** `GET /api/dispatch/nearby`

Utility endpoint to check available partners in an area.

**Query Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radius` (optional): Search radius in km (default: 5, max: 50)
- `type` (optional): Partner type filter (WALKER, BIKE, EV)

**Example:** `GET /api/dispatch/nearby?latitude=28.6139&longitude=77.2090&radius=3&type=WALKER`

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "radius": 3,
    "partners": [
      {
        "id": "uuid",
        "name": "John Walker",
        "partnerType": "WALKER",
        "distance": 0.8,
        "rating": 4.8,
        "totalDeliveries": 150
      }
    ]
  }
}
```

---

## Buyer Trust Score & Risk Management

### Get Buyer Trust Score

**Endpoint:** `GET /api/buyers/:id/trust-score`

Get current trust score and statistics for a buyer.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "trustScore": 0.85,
    "scoreCategory": "PLATINUM",
    "stats": {
      "totalOrders": 50,
      "returnedOrders": 2,
      "cancelledOrders": 1,
      "successRate": "96.00%",
      "accountAgeDays": 180
    },
    "lastUpdated": "2024-02-08T12:00:00Z"
  }
}
```

**Score Categories:**
- **PLATINUM** (> 0.8): All payment methods, no COD fee
- **STANDARD** (> 0.5): All methods, COD with ₹29 deposit
- **HIGH_RISK** (≤ 0.5): Prepaid only (no COD)

---

### Get Available Payment Methods

**Endpoint:** `GET /api/buyers/:id/payment-methods`

Get payment methods available based on trust score.

**Query Parameters:**
- `orderTotal` (optional): Order total for commitment fee calculation

**Example:** `GET /api/buyers/uuid/payment-methods?orderTotal=1500`

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "trustScore": 0.65,
    "scoreCategory": "STANDARD",
    "paymentMethods": ["UPI", "CARD", "COD_WITH_DEPOSIT", "NETBANKING", "WALLET"],
    "codAvailable": true,
    "commitmentFee": 29,
    "message": "COD available with ₹29 commitment fee"
  }
}
```

---

### Refresh Trust Score

**Endpoint:** `POST /api/buyers/:id/refresh-score`

Recalculate buyer trust score based on latest data.

**Request Body:**
```json
{
  "pincode": "110001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trust score updated successfully",
  "data": {
    "userId": "uuid",
    "trustScore": 0.87,
    "scoreCategory": "PLATINUM",
    "updatedAt": "2024-02-08T12:00:00Z"
  }
}
```

---

### Get Pincode Risk Score

**Endpoint:** `GET /api/buyers/pincode/:pincode/risk`

Get RTO risk score for a specific pincode.

**Example:** `GET /api/buyers/pincode/110001/risk`

**Response:**
```json
{
  "success": true,
  "data": {
    "pincode": "110001",
    "riskScore": 0.25,
    "riskCategory": "LOW",
    "stats": {
      "totalOrders": 1000,
      "returnedOrders": 50,
      "cancelledOrders": 30,
      "returnRate": "5.00%"
    },
    "lastUpdated": "2024-02-08T12:00:00Z"
  }
}
```

**Risk Categories:**
- **HIGH** (> 0.7): High fraud/RTO area
- **MEDIUM** (> 0.4): Moderate risk
- **LOW** (≤ 0.4): Safe area

---

### Update Order Outcome

**Endpoint:** `POST /api/buyers/orders/:orderId/outcome`

Update order outcome for trust score recalculation.

**Request Body:**
```json
{
  "wasReturned": false,
  "wasCancelled": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order outcome recorded successfully",
  "data": {
    "orderId": "uuid",
    "newTrustScore": 0.88,
    "wasReturned": false,
    "wasCancelled": false
  }
}
```

---

## Algorithm Details

### Buyer Trust Score Calculation

The trust score is calculated using the following weighted formula:

```
Trust Score = (Order Completion Rate × 0.6) - (Pincode Risk × 0.3) + (Account Maturity × 0.1) - (Cancellation Penalty)
```

Where:
- **Order Completion Rate**: (Total Orders - Returned Orders) / Total Orders
- **Pincode Risk**: Historical RTO data for the delivery pincode (0-1)
- **Account Maturity**: Account age in days / 365 (capped at 1)
- **Cancellation Penalty**: Number of cancelled orders × 0.05

The final score is clamped between 0 and 1.

### Smart Dispatch Algorithm

**Stage 1: Neighborhood Mesh (1.5km radius)**
1. Find all available walkers within 1.5km of vendor
2. Calculate commute path score (pickup distance + delivery distance)
3. Rank by: distance (50%), rating (30%), success rate (20%)
4. Send notification to best walker
5. Timeout: 180 seconds

**Stage 2: Gig-Pool (10km radius)**
1. Find all available bike/EV riders within 10km
2. Apply same ranking algorithm
3. Send notification
4. Timeout: 15 minutes

**Stage 3: Enterprise Bridge**
1. Select national courier partner with highest success rate
2. Generate shipping label via courier API
3. Estimated delivery: 48 hours

### Distance Calculation

Uses Haversine formula for accurate distance between coordinates:

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c
```

Where R = 6371 km (Earth's radius)

---

## Error Responses

All endpoints follow a standard error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Schema Additions

### DeliveryPartner
Stores individual delivery partners (walkers, bike riders, EV drivers).

**Key Fields:**
- `currentLatitude`, `currentLongitude` - Real-time location
- `isAvailable` - Online/offline status
- `aadhaarVerified` - KYC status
- `rating`, `totalDeliveries`, `successfulDeliveries` - Performance metrics
- `badges`, `level` - Gamification

### DispatchLog
Tracks all dispatch attempts for analytics.

**Key Fields:**
- `stage` - MESH, GIG, or COURIER
- `accepted` - Whether partner accepted
- `distanceKm` - Distance at time of ping
- `responseTimeSeconds` - Time taken to respond

### PincodeRisk
Stores RTO risk scores by pincode.

**Key Fields:**
- `riskScore` - 0 (safe) to 1 (high risk)
- `totalOrders`, `returnedOrders`, `cancelledOrders` - Historical data

### Customer Updates
Added trust score fields:

- `totalOrders`, `returnedOrders`, `cancelledOrders`
- `trustScore` - Current trust score (0-1)
- `lastScoreUpdate` - Last calculation timestamp

### Order Updates
Added delivery partner tracking:

- `deliveryPartnerId` - Assigned partner
- `commitmentFee` - COD commitment fee (if applicable)
- `deliveryLatitude`, `deliveryLongitude` - Delivery coordinates
- `pickupLatitude`, `pickupLongitude` - Pickup coordinates

---

## Performance Considerations

### PostGIS in Production

For optimal performance with geospatial queries, enable PostGIS:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create geospatial index
CREATE INDEX idx_partner_location_geo 
ON delivery_partners 
USING GIST (ST_MakePoint(current_longitude, current_latitude));
```

### Caching

Recommended caching strategy:
- **Trust Scores**: Cache for 1 hour
- **Pincode Risk**: Cache for 24 hours
- **Nearby Partners**: Real-time (no cache)

### Real-time Notifications

In production, use MQTT or WebSockets for:
- Partner notifications (dispatch requests)
- Live order tracking
- Availability updates

---

## Testing Examples

### Test Smart Dispatch

```bash
curl -X POST http://localhost:5000/api/dispatch/assign \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-123",
    "vendorLocation": {
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "customerLocation": {
      "latitude": 28.6200,
      "longitude": 77.2150
    }
  }'
```

### Test Trust Score

```bash
curl http://localhost:5000/api/buyers/user-uuid/trust-score
```

### Register Partner

```bash
curl -X POST http://localhost:5000/api/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Walker",
    "phone": "9876543210",
    "partnerType": "WALKER"
  }'
```

---

## Future Enhancements

1. **ML-based RTO Prediction**: Use TensorFlow for advanced fraud detection
2. **Route Optimization**: Integrate Google Maps Directions API
3. **Live Tracking**: WebSocket-based real-time location updates
4. **Automated KYC**: DigiLocker API integration for instant verification
5. **Dynamic Pricing**: Surge pricing during high demand
6. **Partner Matching AI**: Learn optimal partner selection patterns

---

For more information, see the main API documentation in `API.md`.
