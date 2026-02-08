# Contributing to NCCart

First off, thank you for considering contributing to NCCart! This is an enterprise-grade multivendor e-commerce platform, and we welcome contributions from the community.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inspiring community for all.

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git
- Basic understanding of TypeScript, React, and Express

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/nccart.git
   cd nccart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   
   cd ../frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up database**
   ```bash
   cd backend
   npm run db:generate
   npm run db:migrate
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

---

## Development Process

### Branching Strategy

We use Git Flow:

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Emergency fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Before Starting Work

1. Check existing issues
2. Comment on the issue you want to work on
3. Wait for assignment (to avoid duplicate work)
4. Create a branch from `develop`

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define proper types, avoid `any`
- Use interfaces for object shapes

**Good:**
```typescript
interface User {
  id: string;
  email: string;
  role: UserRole;
}

function getUser(id: string): Promise<User> {
  // ...
}
```

**Bad:**
```typescript
function getUser(id: any): any {
  // ...
}
```

### Code Style

We use ESLint and Prettier. Before committing:

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Naming Conventions

- **Files:** kebab-case (e.g., `auth.controller.ts`)
- **Variables/Functions:** camelCase (e.g., `getUserProfile`)
- **Classes/Interfaces:** PascalCase (e.g., `UserService`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Database models:** PascalCase (e.g., `User`, `Product`)

### File Organization

```
backend/src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Express middleware
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
├── types/          # TypeScript types
└── index.ts        # Entry point

frontend/
├── app/            # Next.js pages
├── components/     # React components
├── lib/            # Utilities
├── hooks/          # Custom hooks
└── types/          # TypeScript types
```

### Comments

- Write self-documenting code
- Add comments for complex logic
- Document public APIs with JSDoc

```typescript
/**
 * Calculates seller payout after platform fee deduction
 * @param order - Order details
 * @param seller - Seller information
 * @returns Payout breakdown
 */
function calculateSellerPayout(
  order: Order,
  seller: Seller
): PayoutBreakdown {
  // Implementation
}
```

---

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Writing Tests

- Write tests for all new features
- Maintain test coverage > 80%
- Use descriptive test names

**Example:**
```typescript
describe('AuthController', () => {
  describe('register', () => {
    it('should create a new user with valid data', async () => {
      // Test implementation
    });

    it('should return error for duplicate email', async () => {
      // Test implementation
    });
  });
});
```

### Test Coverage

Check coverage:
```bash
npm run test:coverage
```

---

## Submitting Changes

### Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality

Implement password reset with email token verification.
Users can now reset their password via email link.

Closes #123
```

```
fix(products): resolve image upload validation

Fix issue where valid images were being rejected due to
incorrect MIME type checking.

Fixes #456
```

### Pull Request Process

1. **Update your branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature
   git rebase develop
   ```

2. **Run tests and linting**
   ```bash
   npm test
   npm run lint
   ```

3. **Push your changes**
   ```bash
   git push origin feature/your-feature
   ```

4. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Select `develop` as base branch
   - Fill in PR template
   - Link related issues

5. **PR Title Format**
   ```
   [Type] Brief description
   ```
   Examples:
   - `[Feature] Add product search functionality`
   - `[Fix] Resolve cart calculation bug`
   - `[Docs] Update API documentation`

6. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Related Issue
   Closes #123

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Updated existing tests

   ## Screenshots (if applicable)
   Add screenshots here

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added to complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

### Code Review

- Be open to feedback
- Respond to all comments
- Make requested changes
- Request re-review after updates

---

## Documentation

### When to Update Documentation

- Adding new features
- Changing APIs
- Modifying configuration
- Updating dependencies

### Documentation Files

- `README.md`: Project overview and setup
- `API.md`: API documentation
- `ARCHITECTURE.md`: System architecture
- `DEPLOYMENT.md`: Deployment guide
- `COMPLIANCE.md`: Legal compliance
- Code comments for complex logic

### API Documentation

Update `API.md` when adding/changing endpoints:

```markdown
### New Endpoint Name
Description of what this endpoint does.

**Endpoint:** `POST /api/path`

**Request Body:**
```json
{
  "field": "value"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {}
}
```
```

---

## Common Tasks

### Adding a New API Endpoint

1. Create/update route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Add validation middleware
4. Write tests
5. Update `API.md`

### Adding a New Database Model

1. Update `backend/prisma/schema.prisma`
2. Create migration: `npm run db:migrate`
3. Update TypeScript types
4. Write tests

### Adding a New Frontend Page

1. Create page in `frontend/app/`
2. Create components in `frontend/components/`
3. Add API integration
4. Style with Tailwind CSS
5. Test responsiveness

---

## Security

### Reporting Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email security concerns to: [security@nccart.com]
2. Include detailed description
3. Wait for response before disclosure

### Security Best Practices

- Never commit secrets
- Use environment variables
- Validate all user inputs
- Sanitize data before database queries
- Use parameterized queries
- Implement rate limiting
- Keep dependencies updated

---

## Getting Help

### Resources

- **Documentation:** Read all .md files
- **Issues:** Check existing issues
- **Discussions:** GitHub Discussions (coming soon)

### Questions

For questions:
1. Check documentation first
2. Search existing issues
3. Create new issue with `question` label

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (future)

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to NCCart! 🚀
