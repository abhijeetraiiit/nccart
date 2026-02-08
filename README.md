# NCCart - Enterprise Multivendor E-commerce Platform

🚀 **Zero Commission | Smart Delivery | Indian Compliance**

## Vision
Production-ready multivendor e-commerce platform like Amazon, Flipkart, and Meesho with zero-commission model and intelligent delivery partner integration.

## Key Features
- ✅ Zero commission marketplace (240 days FREE trial + ₹5 platform fee)
- ✅ Smart delivery integration (Rapido, Blue Dart, Shadowfax, Delhivery, etc.)
- ✅ FREE payment gateways (UPI, UroPay, Hyperswitch)
- ✅ Full Indian legal compliance (GST, KYC, E-commerce rules)
- ✅ Enterprise-grade architecture

## Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Caching:** Redis
- **Authentication:** JWT
- **Validation:** express-validator

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **Language:** TypeScript

### Infrastructure
- **Hosting:** Railway, Render, or AWS Free Tier
- **Storage:** Cloudinary or AWS S3
- **Email:** SendGrid or AWS SES
- **SMS:** Twilio or MSG91

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Redis (optional but recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/abhijeetraiiit/nccart.git
cd nccart
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Backend**
```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# nano .env or vim .env

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate
```

4. **Setup Frontend**
```bash
cd ../frontend

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# nano .env.local or vim .env.local

# Install dependencies
npm install
```

5. **Start Development Servers**

From the root directory:
```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on port 5000
npm run dev:frontend # Frontend on port 3000
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## Database Setup

### Using PostgreSQL

1. Create a PostgreSQL database:
```bash
createdb nccart
```

2. Update `DATABASE_URL` in `backend/.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/nccart?schema=public"
```

3. Run migrations:
```bash
cd backend
npm run db:migrate
```

4. (Optional) Open Prisma Studio to view/edit data:
```bash
npm run db:studio
```

## Environment Variables

### Backend (.env)
See `backend/.env.example` for all required variables:
- Database connection
- JWT secret
- Email/SMS providers
- Payment gateway credentials
- Delivery partner API keys
- Platform settings

### Frontend (.env.local)
See `frontend/.env.example` for configuration:
- API endpoint
- Site metadata

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user (customer or seller)
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Endpoints
- `GET /api/users/profile` - Get user profile (authenticated)

### Seller Endpoints
- `GET /api/sellers/dashboard` - Seller dashboard (authenticated, seller only)

### Product Endpoints
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details

### Order Endpoints
- `GET /api/orders` - List user orders (authenticated)

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard (authenticated, admin only)

## Project Structure

```
nccart/
├── backend/              # Node.js + Express backend
│   ├── prisma/          # Prisma schema and migrations
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Utility functions
│   │   └── index.ts     # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js 14 app directory
│   │   ├── layout.tsx  # Root layout
│   │   ├── page.tsx    # Home page
│   │   └── globals.css # Global styles
│   ├── public/         # Static files
│   ├── package.json
│   └── next.config.js
│
├── package.json        # Root package.json (workspace)
├── .gitignore
└── README.md
```

## Database Schema

The platform includes comprehensive models for:
- **Users & Authentication** (Customer, Seller, Admin roles)
- **Seller Management** (KYC, trial period, platform fees)
- **Product Catalog** (Products, categories, inventory)
- **Orders & Payments** (Multi-vendor order support)
- **Delivery** (Delivery partner integration)
- **Reviews & Ratings**
- **Wishlist**
- **Platform Settings**

## Business Model

### Zero Commission Model
- **240 days FREE trial** for all new sellers
- **₹5 platform fee** after trial period
- **0% commission** on sales
- Transparent fee tracking

### Delivery Charges
- Delivery cost borne by customer (Meesho-style)
- Smart algorithm selects optimal delivery partner
- Real-time price comparison across all partners

## Compliance Features

✅ **Indian E-commerce Rules 2020**
✅ **GST Registration & Validation**
✅ **KYC Verification (PAN, Aadhaar)**
✅ **FSSAI License Support**
✅ **Consumer Protection Act 2019**
✅ **DPDP Act 2023 (Data Privacy)**

## Development Roadmap

### Phase 1: MVP Core Platform ✅ (Current)
- [x] Project structure
- [x] Database schema
- [x] Authentication system
- [x] Basic API endpoints
- [ ] Complete seller onboarding
- [ ] Product catalog CRUD
- [ ] Shopping cart
- [ ] Order management
- [ ] Payment integration

### Phase 2: Delivery & Advanced Features
- [ ] Multi-courier integration
- [ ] Smart delivery algorithm
- [ ] Real-time tracking
- [ ] Advanced search
- [ ] Reviews and ratings

### Phase 3: Compliance & Scale
- [ ] Full GST compliance
- [ ] Legal document generation
- [ ] Advanced analytics
- [ ] Mobile app (React Native/PWA)

### Phase 4: Production Launch
- [ ] Security audit
- [ ] Load testing
- [ ] Monitoring setup
- [ ] Production deployment

## Contributing

This is a production project. For contributions, please create an issue first to discuss proposed changes.

## Security

- HTTPS enforced in production
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

## License

MIT License - See LICENSE file for details

## Support

For questions or issues, please open a GitHub issue.

---

**Built for the Indian market** 🇮🇳

**Status:** 🏗️ Active Development | Production-Ready MVP Coming Soon