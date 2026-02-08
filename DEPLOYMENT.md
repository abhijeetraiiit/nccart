# Deployment Guide for NCCart

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional but recommended)
- Domain name (for production)

## Environment Setup

### 1. Production Environment Variables

Create a `.env` file in the backend directory with production values:

```env
# Database (Use managed PostgreSQL)
DATABASE_URL="postgresql://user:password@your-db-host:5432/nccart?schema=public"

# Redis (Use managed Redis)
REDIS_URL="redis://your-redis-host:6379"

# JWT (Generate a strong secret)
JWT_SECRET="your-production-jwt-secret-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# Server
NODE_ENV="production"
PORT=5000
BACKEND_URL="https://api.yourdomain.com"
FRONTEND_URL="https://yourdomain.com"

# Email Provider (Example: SendGrid)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# SMS Provider (Example: Twilio)
SMS_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="your-twilio-number"

# Storage (Example: Cloudinary)
STORAGE_PROVIDER="cloudinary"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Payment - UroPay
UROPAY_API_KEY="your-uropay-api-key"
UROPAY_MERCHANT_ID="your-merchant-id"

# Platform Settings
TRIAL_PERIOD_DAYS=240
PLATFORM_FEE=5
CURRENCY="INR"

# Security
BCRYPT_ROUNDS=10
```

## Deployment Options

### Option 1: Railway (Recommended for MVP)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Create new project
   railway init
   
   # Add PostgreSQL
   railway add postgresql
   
   # Deploy
   cd backend
   railway up
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   railway up
   ```

4. **Configure Environment Variables**
   - Go to Railway dashboard
   - Add all environment variables
   - Restart services

### Option 2: Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Note down the connection string

3. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `backend` directory
   - Build command: `npm install && npm run build && npx prisma migrate deploy && npx prisma generate`
   - Start command: `npm start`
   - Add environment variables

4. **Deploy Frontend**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Select `frontend` directory
   - Build command: `npm install && npm run build`
   - Publish directory: `.next`

### Option 3: Docker + Any VPS

1. **Create Dockerfile for Backend**

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

2. **Create Dockerfile for Frontend**

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

3. **Create docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: nccart
      POSTGRES_PASSWORD: your-password
      POSTGRES_DB: nccart
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://nccart:your-password@postgres:5432/nccart
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:5000/api
    depends_on:
      - backend

volumes:
  postgres_data:
```

4. **Deploy**
```bash
docker-compose up -d
```

## Database Migration

### Initial Setup
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Seed Initial Data (Optional)

Create `backend/prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.create({
    data: {
      email: 'admin@nccart.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // Create sample categories
  await prisma.category.createMany({
    data: [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Clothing', slug: 'clothing' },
      { name: 'Home & Kitchen', slug: 'home-kitchen' },
    ],
  });

  // Create delivery partners
  await prisma.deliveryPartner.createMany({
    data: [
      { name: 'bluedart', displayName: 'Blue Dart' },
      { name: 'shadowfax', displayName: 'Shadowfax' },
      { name: 'delhivery', displayName: 'Delhivery' },
      { name: 'dtdc', displayName: 'DTDC' },
    ],
  });

  console.log('Seed data created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npx prisma db seed
```

## SSL/HTTPS Setup

### Using Cloudflare (Free)
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

### Using Let's Encrypt (If using VPS)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Monitoring Setup

### 1. Error Tracking (Sentry)
```bash
npm install @sentry/node @sentry/nextjs
```

Add to `backend/src/index.ts`:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Uptime Monitoring
- Use UptimeRobot (free)
- Monitor: https://yourdomain.com/health

### 3. Application Logs
- Use Railway/Render built-in logging
- Or set up Papertrail/Logtail

## Backup Strategy

### Database Backups
```bash
# Daily backup script
pg_dump -h your-db-host -U user -d nccart > backup-$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d).sql s3://your-backup-bucket/
```

### Automated Backups
- Railway: Automatic backups included
- Render: Available on paid plans
- Manual: Use cron jobs

## Performance Optimization

### 1. Enable Caching
- Redis for sessions
- CDN for static assets

### 2. Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_products_seller ON "Product"("sellerId");
CREATE INDEX idx_orders_user ON "Order"("userId");
CREATE INDEX idx_products_status ON "Product"("status");
```

### 3. Enable Compression
Add to `backend/src/index.ts`:
```typescript
import compression from 'compression';
app.use(compression());
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database password strong
- [ ] JWT secret is random and long
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection (Helmet)
- [ ] Input validation on all endpoints
- [ ] File upload restrictions
- [ ] API authentication required
- [ ] Admin routes protected

## Post-Deployment

### 1. Test All Features
- User registration/login
- Product listing
- Order creation
- Payment processing
- Email sending
- SMS sending

### 2. Create Admin Account
```bash
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "secure-password",
    "role": "ADMIN"
  }'
```

### 3. Monitor
- Check error logs
- Monitor response times
- Watch database connections
- Track failed requests

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -h your-db-host -U user -d nccart

# Check DATABASE_URL format
echo $DATABASE_URL
```

### Prisma Issues
```bash
# Regenerate client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Build Failures
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
```

## Scaling Tips

### When to Scale
- Response time > 1 second
- CPU usage > 80%
- Memory usage > 80%
- Database connection pool exhausted

### Horizontal Scaling
1. Add more backend instances
2. Use load balancer (Nginx, Cloudflare)
3. Add database read replicas
4. Implement Redis for sessions

### Vertical Scaling
1. Upgrade server resources
2. Optimize database queries
3. Enable database indexing
4. Implement caching

## Cost Optimization

### Free Tier Resources
- **Railway**: $5 free credit/month
- **Render**: Free tier available
- **Cloudflare**: Free CDN
- **Cloudinary**: Free tier for images
- **SendGrid**: 100 emails/day free
- **UroPay**: Zero commission payments

### Estimated Monthly Costs (After Free Tier)
- **Database**: $7-20 (Railway/Render)
- **Backend**: $7-20 (Railway/Render)
- **Frontend**: $0-7 (Free tier or minimal)
- **Total**: $14-47/month for small scale

## Support & Maintenance

### Regular Tasks
- Weekly: Check logs for errors
- Monthly: Review and optimize database
- Quarterly: Security audit
- As needed: Update dependencies

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Test thoroughly after updates
npm test
```

---

**For production deployment assistance, create an issue on GitHub.**
