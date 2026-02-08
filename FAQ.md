# Frequently Asked Questions (FAQ)

## General Questions

### What is NCCart?
NCCart is an enterprise-grade multivendor e-commerce platform designed specifically for the Indian market. It features zero commission, smart delivery partner integration, and full legal compliance with Indian e-commerce regulations.

### Is NCCart free to use?
Yes! NCCart is open-source (MIT License). The platform itself charges sellers:
- **240 days FREE trial** for all new sellers
- **₹5 platform fee** per month after trial
- **0% commission** on sales

### What makes NCCart different from other platforms?
- ✅ Zero commission model (only ₹5 monthly fee)
- ✅ Built for Indian market with full legal compliance
- ✅ Smart delivery partner integration
- ✅ Open-source and self-hostable
- ✅ Enterprise-grade architecture
- ✅ Modern tech stack

---

## Technical Questions

### What technologies does NCCart use?

**Backend:**
- Node.js + TypeScript
- Express.js
- PostgreSQL + Prisma ORM
- Redis (optional)
- JWT authentication

**Frontend:**
- Next.js 14 (React 18)
- TypeScript
- Tailwind CSS

### Can I use NCCart with my existing database?
NCCart uses PostgreSQL. If you have another database, you'll need to migrate your data to PostgreSQL or modify the Prisma schema to support your database.

### Does NCCart support multiple languages?
Currently, NCCart is in English. Internationalization (i18n) support is planned for future releases.

### Can I customize NCCart?
Absolutely! NCCart is open-source. You can:
- Modify the UI/UX
- Add new features
- Change business logic
- Integrate additional services
- Deploy on your own infrastructure

---

## Setup & Installation

### What are the system requirements?

**Development:**
- Node.js 18+
- PostgreSQL 14+
- 4GB RAM minimum
- 10GB disk space

**Production:**
- Node.js 18+
- PostgreSQL 14+ (managed recommended)
- Redis (optional but recommended)
- 2GB+ RAM
- 20GB+ disk space

### How long does setup take?
- First-time setup: ~10 minutes
- Subsequent setups: ~2 minutes

### Do I need technical knowledge?
For development: Yes, basic knowledge of:
- JavaScript/TypeScript
- React
- Node.js
- Databases

For deployment: Basic server administration knowledge is helpful.

### Can I use NCCart without coding?
Currently, NCCart is a developer-focused platform. A no-code version is planned for the future.

---

## Features & Functionality

### What features are currently available?

**Phase 1 (Current - MVP):**
- ✅ User authentication (Customer, Seller, Admin)
- ✅ Database schema for all entities
- ✅ Basic API endpoints
- ✅ Seller onboarding structure
- 🚧 Product catalog (in progress)
- 🚧 Order management (in progress)
- 🚧 Payment integration (planned)

### When will feature X be available?
Check our [CHANGELOG.md](./CHANGELOG.md) for planned features and release timeline.

### Can I request features?
Yes! Open an issue on GitHub with the "feature request" label.

---

## Seller Management

### How does the trial period work?
- New sellers get 240 days (8 months) FREE
- After trial: ₹5/month platform fee
- No commission on sales (0%)

### What KYC documents are required?

**Individual Sellers:**
- PAN Card
- Aadhaar Card
- Bank account details

**Business Sellers:**
- PAN Card
- GST Certificate
- Business registration documents
- Bank account details

### How does seller verification work?
1. Seller submits KYC documents
2. System validates document format
3. Admin manually reviews documents
4. Status updated: Pending → Approved/Rejected
5. Seller receives email notification

---

## Payment & Delivery

### What payment methods are supported?

**Planned Support:**
- UPI (via UroPay or direct integration)
- Credit/Debit Cards
- Net Banking
- Wallets (Paytm, PhonePe, etc.)
- Cash on Delivery (COD)

### How does the delivery integration work?
NCCart will integrate with multiple delivery partners:
- Blue Dart
- Shadowfax
- Delhivery
- DTDC
- Rapido (for hyperlocal)
- India Post

A smart algorithm selects the best partner based on:
- Price (50% weight)
- Delivery speed (30% weight)
- Reliability (20% weight)

### Who pays for delivery?
The customer pays delivery charges (Meesho-style). The charges are included in the total order amount.

---

## Compliance & Legal

### Is NCCart legally compliant in India?
Yes, NCCart is designed to comply with:
- Consumer Protection (E-Commerce) Rules, 2020
- GST regulations
- Information Technology Act, 2000
- DPDP Act, 2023 (Data Privacy)

See [COMPLIANCE.md](./COMPLIANCE.md) for detailed information.

### Do I need a business license to use NCCart?
To operate an e-commerce platform in India:
- Register as a business entity
- Obtain GST registration
- Comply with e-commerce regulations
- Consult with legal professionals for your specific case

### How is GST handled?
- GST calculation on products
- GST invoice generation
- Support for CGST, SGST, IGST
- TCS (Tax Collected at Source) for eligible sellers

---

## Deployment

### Where can I deploy NCCart?

**Recommended Options:**
- Railway (easy, free tier available)
- Render (easy, free tier available)
- AWS/GCP/Azure (scalable, requires setup)
- Your own VPS (full control)

### How much does it cost to host?

**Free Tier (Good for testing):**
- Railway: $5 credit/month
- Render: Free tier available
- Total: $0-10/month

**Small Scale (100-1000 users):**
- Database: $7-20/month
- Backend: $7-20/month
- Frontend: $0-7/month
- Total: ~$14-47/month

**Medium Scale (1000-10000 users):**
- Managed services: $100-300/month
- Or self-hosted VPS: $50-100/month

### Can I use shared hosting?
No, NCCart requires:
- Node.js runtime
- PostgreSQL database
- Process management

Use VPS or PaaS providers.

---

## Security

### Is NCCart secure?
NCCart implements security best practices:
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- HTTPS enforcement
- Rate limiting

See [SECURITY.md](./SECURITY.md) for details.

### How do I report security issues?
Email: security@nccart.com or create a private security advisory on GitHub.

### Is my data safe?
- All passwords are hashed
- Sensitive data encrypted at rest
- HTTPS for data in transit
- Regular backups recommended
- Follows DPDP Act requirements

---

## Development & Contribution

### How can I contribute?
See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

### I found a bug. What should I do?
1. Check if issue already exists
2. Create a new issue on GitHub
3. Provide detailed reproduction steps
4. Include error messages and logs

### Can I use NCCart for commercial projects?
Yes! NCCart is MIT licensed. You can:
- Use commercially
- Modify the code
- Sell services built on NCCart
- No attribution required (but appreciated!)

---

## Performance & Scaling

### How many users can NCCart handle?
Current target:
- 1000+ concurrent users
- 1000+ orders per day
- 10,000+ products

With proper scaling:
- 10,000+ concurrent users
- 10,000+ orders per day
- 100,000+ products

### How do I scale NCCart?

**Vertical Scaling:**
- Upgrade server resources
- Optimize database queries
- Enable caching (Redis)

**Horizontal Scaling:**
- Add more backend instances
- Use load balancer
- Database read replicas
- CDN for static assets

See [ARCHITECTURE.md](./ARCHITECTURE.md) for scaling strategies.

---

## Support

### Where can I get help?
1. Read documentation files
2. Check existing GitHub issues
3. Create a new issue
4. Join community discussions (coming soon)

### Is there commercial support available?
Not currently, but may be available in the future.

### How often is NCCart updated?
The project is actively developed. Check:
- GitHub commits
- [CHANGELOG.md](./CHANGELOG.md)
- Release notes

---

## Future Plans

### What's the roadmap?

**Phase 1 (Current):** MVP Core Platform
**Phase 2:** Delivery Integration & Advanced Features
**Phase 3:** Compliance & Scaling
**Phase 4:** Production Launch

See full roadmap in [README.md](./README.md)

### Will there be a mobile app?
Yes! React Native mobile app is planned for Phase 3.

### Will NCCart support other countries?
Currently focused on India. International support may be added based on demand.

---

## Miscellaneous

### What does "NCCart" stand for?
NC = No Commission
Cart = Shopping Cart

### Who maintains NCCart?
NCCart is an open-source project. Check contributors list on GitHub.

### Can I hire someone to set up NCCart for me?
Yes, you can hire developers familiar with Node.js, React, and e-commerce platforms.

### Is training available?
Currently, documentation is the primary resource. Video tutorials may be added in the future.

---

## Still have questions?

- 📧 Email: support@nccart.com
- 🐛 GitHub Issues: https://github.com/abhijeetraiiit/nccart/issues
- 💬 Discussions: Coming soon

---

**Last Updated:** February 2024
