# NCCart Architecture Documentation

## System Architecture

### Overview
NCCart is built as a modern, scalable multivendor e-commerce platform following a microservice-ready monolithic architecture.

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│           Frontend (Next.js)                    │
│  - Customer Storefront                          │
│  - Seller Dashboard                             │
│  - Admin Panel                                  │
└─────────────────┬───────────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────────┐
│           Backend (Node.js + Express)           │
│  ┌──────────────────────────────────────────┐  │
│  │        API Layer (Routes)                │  │
│  └──────────────────┬───────────────────────┘  │
│  ┌──────────────────▼───────────────────────┐  │
│  │     Controllers (Request Handling)       │  │
│  └──────────────────┬───────────────────────┘  │
│  ┌──────────────────▼───────────────────────┐  │
│  │    Services (Business Logic)             │  │
│  └──────────────────┬───────────────────────┘  │
│  ┌──────────────────▼───────────────────────┐  │
│  │    Prisma ORM (Data Access)              │  │
│  └──────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│         PostgreSQL Database                     │
│  - Users, Products, Orders, etc.                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              External Services                  │
│  - Redis (Caching)                              │
│  - Email Provider (SendGrid/SES)                │
│  - SMS Provider (Twilio/MSG91)                  │
│  - Storage (Cloudinary/S3)                      │
│  - Delivery Partners APIs                       │
│  - Payment Gateways                             │
└─────────────────────────────────────────────────┘
```

## Database Schema Design

### Core Entities

1. **User Management**
   - Users (base authentication)
   - Customers (customer profile)
   - Sellers (seller profile with KYC)

2. **Product Catalog**
   - Categories (hierarchical)
   - Products (with seller relation)

3. **Order Management**
   - Orders (with multi-vendor support)
   - OrderItems (seller-specific items)

4. **Supporting Entities**
   - Addresses
   - Reviews & Ratings
   - Wishlist
   - Delivery Partners
   - Platform Settings

### Key Design Decisions

1. **UUID Primary Keys**: For better security and distributed system support
2. **Soft Deletes**: Using status fields instead of hard deletes
3. **Audit Trails**: createdAt and updatedAt timestamps on all entities
4. **Indexes**: Strategic indexing on frequently queried fields

## API Design

### RESTful Principles
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- Proper status codes
- JSON request/response

### Authentication Flow
```
1. User registers/logs in
2. Backend generates JWT token
3. Frontend stores token (localStorage/cookies)
4. Subsequent requests include token in Authorization header
5. Backend validates token and extracts user info
```

### Authorization Levels
- **Customer**: Can browse, order, review products
- **Seller**: Can manage own products, view analytics
- **Admin**: Full platform access

## Security Architecture

### Authentication
- JWT-based authentication
- Bcrypt password hashing (10 rounds)
- Token expiration (7 days default)

### API Security
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting
- Input validation (express-validator)
- SQL injection prevention (Prisma)
- XSS protection

### Data Privacy
- Sensitive data encryption at rest
- HTTPS enforcement in production
- PII data handling per DPDP Act

## Smart Delivery Algorithm

### Partner Selection Logic
```javascript
function selectBestDeliveryPartner(order, preferences) {
  // 1. Get serviceable partners for destination PIN code
  const partners = getServiceablePartners(order.pincode);
  
  // 2. Get real-time quotes from all partners
  const quotes = await Promise.all(
    partners.map(p => p.getQuote(order))
  );
  
  // 3. Score each partner
  const scored = quotes.map(quote => {
    const priceScore = calculatePriceScore(quote.price);
    const speedScore = calculateSpeedScore(quote.estimatedDelivery);
    const reliabilityScore = quote.partner.rating * quote.partner.successRate;
    
    // Weighted scoring (configurable)
    const finalScore = (
      priceScore * PRICE_WEIGHT +
      speedScore * SPEED_WEIGHT +
      reliabilityScore * RELIABILITY_WEIGHT
    );
    
    return { partner: quote.partner, score: finalScore, quote };
  });
  
  // 4. Return best option
  return scored.sort((a, b) => b.score - a.score)[0];
}
```

### Delivery Partners Integration
- Blue Dart (Official API)
- Shadowfax (Official API)
- Delhivery (Official API)
- DTDC (indian-courier-api)
- Rapido (Unofficial API)
- India Post (indian-courier-api)

## Seller Fee Calculation

```javascript
function calculateSellerPayout(order, seller) {
  const productTotal = order.items
    .filter(item => item.sellerId === seller.id)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Trial check
  const trialEnded = new Date() > seller.trialEndDate;
  const platformFee = trialEnded ? PLATFORM_FEE : 0; // ₹5 or ₹0
  
  return {
    grossAmount: productTotal,
    platformFee: platformFee,
    netPayout: productTotal - platformFee,
  };
}
```

## Scalability Considerations

### Current Architecture
- Monolithic with clean separation
- Ready for microservices split

### Future Scalability
1. **Horizontal Scaling**: Load balancer + multiple app instances
2. **Database**: Read replicas, sharding
3. **Caching**: Redis for sessions, product catalog
4. **CDN**: Static assets, images
5. **Message Queue**: Bull for async jobs
6. **Microservices**: Can split into:
   - User Service
   - Product Service
   - Order Service
   - Payment Service
   - Delivery Service

## Monitoring & Observability

### Logging
- Winston logger
- Structured JSON logs
- Error tracking
- Request/response logging

### Metrics (Planned)
- API response times
- Error rates
- Database query performance
- Cache hit rates

### Alerting (Planned)
- Critical errors
- High latency
- Failed payments
- Delivery issues

## Deployment Architecture

### Development
```
Developer Machine → Git Push → GitHub
```

### Production (Recommended)
```
GitHub → CI/CD Pipeline → Docker Build → 
  → Railway/Render → Production
```

### Infrastructure Components
- **App Server**: Railway or Render
- **Database**: Managed PostgreSQL
- **Cache**: Redis Cloud
- **Storage**: Cloudinary or S3
- **CDN**: Cloudflare
- **DNS**: Cloudflare

## Compliance Architecture

### Data Residency
- All data stored in India (for compliance)
- Cloud provider: AWS Mumbai region or equivalent

### Audit Trails
- All critical actions logged
- User consent tracking
- KYC document storage with encryption

### Legal Documents
- Terms & Conditions
- Privacy Policy
- Refund Policy
- Seller Agreement
- Platform usage agreement

## Performance Targets

- **Page Load**: < 3 seconds
- **API Response**: < 500ms (p95)
- **Database Queries**: < 100ms (p95)
- **Uptime**: 99.9%
- **Concurrent Users**: 1000+
- **Daily Orders**: 1000+

## Technology Choices Rationale

### Why Node.js + TypeScript?
- Fast development
- Large ecosystem
- Excellent async handling
- Type safety with TypeScript

### Why PostgreSQL?
- ACID compliance
- JSON support
- Mature, battle-tested
- Great performance

### Why Prisma?
- Type-safe database client
- Auto-generated types
- Migration management
- Developer experience

### Why Next.js?
- SSR/SSG capabilities
- Great developer experience
- Built-in routing
- Image optimization
- Production-ready

## Future Enhancements

1. **GraphQL API**: For flexible frontend queries
2. **Real-time Features**: WebSocket for live tracking
3. **AI/ML**: Product recommendations, fraud detection
4. **Mobile Apps**: React Native for iOS/Android
5. **Analytics**: Advanced seller and admin analytics
6. **Internationalization**: Support for multiple languages
7. **Multi-currency**: Beyond INR
