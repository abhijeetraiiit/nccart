# Testing Guide

## Overview

NCCart uses a comprehensive testing strategy to ensure code quality and reliability.

## Testing Stack

- **Backend**: Jest + Supertest
- **Frontend**: Jest + React Testing Library
- **E2E**: (Planned) Playwright or Cypress

---

## Backend Testing

### Setup

Tests are located in `backend/src/**/__tests__/`

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth.controller.test.ts
```

### Unit Tests

Test individual functions and methods.

**Example: Controller Test**
```typescript
// backend/src/controllers/__tests__/auth.controller.test.ts
import { Request, Response, NextFunction } from 'express';
import { register } from '../auth.controller';
import prisma from '../../config/database';

jest.mock('../../config/database');

describe('AuthController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('register', () => {
    it('should create a new user with valid data', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
        role: 'CUSTOMER',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser = {
        id: 'uuid',
        email: 'test@example.com',
        role: 'CUSTOMER',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      await register(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Registration successful',
        })
      );
    });

    it('should return error for duplicate email', async () => {
      req.body = {
        email: 'existing@example.com',
        password: 'password123',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'uuid' });

      await register(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email already registered',
        })
      );
    });
  });
});
```

### Integration Tests

Test API endpoints end-to-end.

**Example: API Integration Test**
```typescript
// backend/src/__tests__/integration/auth.test.ts
import request from 'supertest';
import app from '../../index';
import prisma from '../../config/database';

describe('Auth API Integration', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          role: 'CUSTOMER',
          firstName: 'New',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      // First register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          role: 'CUSTOMER',
        });

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

### Service Tests

**Example: Business Logic Test**
```typescript
// backend/src/services/__tests__/seller.service.test.ts
import { calculateSellerPayout } from '../seller.service';

describe('SellerService', () => {
  describe('calculateSellerPayout', () => {
    it('should calculate payout with platform fee after trial', () => {
      const order = {
        items: [
          { sellerId: 'seller1', price: 100, quantity: 2 },
        ],
      };

      const seller = {
        id: 'seller1',
        trialEndDate: new Date('2020-01-01'), // Trial ended
      };

      const result = calculateSellerPayout(order, seller);

      expect(result.grossAmount).toBe(200);
      expect(result.platformFee).toBe(5);
      expect(result.netPayout).toBe(195);
    });

    it('should not charge platform fee during trial', () => {
      const order = {
        items: [
          { sellerId: 'seller1', price: 100, quantity: 2 },
        ],
      };

      const seller = {
        id: 'seller1',
        trialEndDate: new Date('2099-01-01'), // Trial active
      };

      const result = calculateSellerPayout(order, seller);

      expect(result.grossAmount).toBe(200);
      expect(result.platformFee).toBe(0);
      expect(result.netPayout).toBe(200);
    });
  });
});
```

---

## Frontend Testing

### Setup

Tests are located in `frontend/**/__tests__/`

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

### Component Tests

**Example: Component Test**
```typescript
// frontend/components/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 999,
    image: '/test.jpg',
  };

  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹999')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', () => {
    const handleAddToCart = jest.fn();

    render(
      <ProductCard product={mockProduct} onAddToCart={handleAddToCart} />
    );

    const button = screen.getByRole('button', { name: /add to cart/i });
    button.click();

    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct.id);
  });
});
```

### Page Tests

**Example: Page Test**
```typescript
// frontend/app/__tests__/page.test.tsx
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home Page', () => {
  it('renders homepage', () => {
    render(<Home />);

    expect(screen.getByText('NCCart')).toBeInTheDocument();
    expect(screen.getByText(/Zero Commission/i)).toBeInTheDocument();
  });

  it('displays feature cards', () => {
    render(<Home />);

    expect(screen.getByText(/Smart Delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Indian Compliance/i)).toBeInTheDocument();
  });
});
```

### Hook Tests

**Example: Custom Hook Test**
```typescript
// frontend/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import useAuth from '../useAuth';

describe('useAuth', () => {
  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login user', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

---

## E2E Testing (Planned)

### Setup with Playwright

```bash
npm install -D @playwright/test

# Run E2E tests
npx playwright test

# Run in UI mode
npx playwright test --ui
```

**Example: E2E Test**
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  // Navigate to registration
  await page.goto('http://localhost:3000/register');

  // Fill registration form
  await page.fill('input[name="email"]', 'e2e@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Should redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('h1')).toContainText('Dashboard');
});

test('seller can create product', async ({ page }) => {
  // Login as seller
  await page.goto('http://localhost:3000/seller/login');
  await page.fill('input[name="email"]', 'seller@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to products
  await page.click('a[href="/seller/products"]');

  // Create new product
  await page.click('button:has-text("Add Product")');
  await page.fill('input[name="name"]', 'Test Product');
  await page.fill('input[name="price"]', '999');
  await page.click('button[type="submit"]');

  // Verify product created
  await expect(page.locator('text=Test Product')).toBeVisible();
});
```

---

## Test Coverage

### Coverage Goals
- Overall: > 80%
- Critical paths: > 90%
- Utilities: > 95%

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

---

## Testing Best Practices

### 1. Test Structure

Use AAA pattern: Arrange, Act, Assert

```typescript
it('should do something', () => {
  // Arrange
  const input = { value: 10 };

  // Act
  const result = doSomething(input);

  // Assert
  expect(result).toBe(20);
});
```

### 2. Descriptive Test Names

```typescript
// Good
it('should return 400 when email is invalid')

// Bad
it('test email validation')
```

### 3. Test One Thing

```typescript
// Good - focused test
it('should validate email format', () => {
  // Test email validation only
});

it('should validate password strength', () => {
  // Test password validation only
});

// Bad - testing multiple things
it('should validate form', () => {
  // Tests email AND password AND name...
});
```

### 4. Mock External Dependencies

```typescript
// Mock database
jest.mock('../config/database');

// Mock API calls
jest.mock('axios');
```

### 5. Clean Up After Tests

```typescript
afterEach(async () => {
  // Clean up test data
  await prisma.user.deleteMany({
    where: { email: { contains: 'test' } },
  });
});

afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
});
```

---

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Performance Testing (Future)

### Load Testing with Artillery

```bash
npm install -D artillery

# Run load test
artillery run load-test.yml
```

**Example: load-test.yml**
```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Login flow'
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password123'
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Supertest](https://github.com/visionmedia/supertest)

---

Happy testing! 🧪
