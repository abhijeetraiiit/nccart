# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete project structure with monorepo setup
- Backend API with Express.js and TypeScript
- Frontend with Next.js 15 and Tailwind CSS
- Comprehensive database schema with Prisma ORM
- Authentication system with JWT
- User roles (Customer, Seller, Admin)
- Seller management with KYC fields
- Product catalog structure
- Order management system
- Delivery partner integration framework
- Docker configuration for deployment
- Comprehensive documentation
  - README.md with setup instructions
  - ARCHITECTURE.md with system design
  - DEPLOYMENT.md with deployment guides
  - API.md with API documentation
  - COMPLIANCE.md with legal requirements
  - CONTRIBUTING.md with contribution guidelines
  - DEVELOPMENT.md with development guide
  - SECURITY.md with security policy

### Security
- **CRITICAL:** Updated multer from 1.4.5-lts.1 to 2.0.2 to fix multiple DoS vulnerabilities
- **HIGH:** Updated nodemailer from 6.9.7 to 7.0.7 to fix email domain interpretation issue
- **HIGH:** Updated Next.js from 14.0.4 to 15.0.8 to fix HTTP request deserialization DoS
- Password hashing with bcrypt
- JWT-based authentication
- Input validation with express-validator
- SQL injection prevention with Prisma
- Rate limiting middleware
- CORS configuration
- Helmet.js security headers

### Changed
- Upgraded multer to v2.0.2 (breaking changes - see SECURITY-ADVISORY.md)
- Upgraded nodemailer to v7.0.7 (breaking changes - see SECURITY-ADVISORY.md)
- Upgraded Next.js to v15.0.8 (breaking changes - see SECURITY-ADVISORY.md)

## [0.1.0] - 2024-02-08

### Added
- Initial project setup
- Basic README
- Repository structure

---

## Version History

### Upcoming (v1.0.0) - MVP Release
**Target Features:**
- Complete seller onboarding with KYC
- Full product CRUD operations
- Shopping cart and checkout
- Payment integration (UPI)
- Order management
- Admin dashboard
- Seller dashboard
- Email notifications
- SMS notifications
- Basic analytics

### Future Versions

**v1.1.0 - Delivery Integration**
- Multi-courier integration
- Smart delivery partner selection
- Real-time tracking
- Delivery cost calculation

**v1.2.0 - Advanced Features**
- Product search and filters
- Reviews and ratings
- Wishlist functionality
- Product recommendations

**v1.3.0 - Compliance**
- Full GST compliance
- Invoice generation
- Tax calculations
- Legal document generation

**v2.0.0 - Scale & Polish**
- Mobile app (React Native)
- Advanced analytics
- Performance optimizations
- Microservices architecture

---

## Release Notes Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```

---

For migration guides between versions, see [MIGRATION.md](./MIGRATION.md) (coming soon).
