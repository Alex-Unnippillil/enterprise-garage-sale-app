# 🧪 Testing Guide

This guide covers comprehensive testing strategies for the Rentiful real estate application.

## 📋 Testing Strategy

### Testing Pyramid
```
    E2E Tests (Few)
       /\
      /  \
   Integration Tests (Some)
      /\
     /  \
  Unit Tests (Many)
```

## 🧩 Unit Testing

### Frontend Unit Tests

#### Setup

1. **Install testing dependencies:**
   ```bash
   cd client
   npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
   ```

2. **Configure Jest** (`client/jest.config.js`):
   ```javascript
   module.exports = {
     testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     moduleNameMapping: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
     testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
   };
   ```

3. **Jest setup** (`client/jest.setup.js`):
   ```javascript
   import '@testing-library/jest-dom';
   ```

#### Component Testing Examples

**Property Card Component Test:**
```typescript
// client/src/components/__tests__/Card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Card from '../Card';

const mockProperty = {
  id: 1,
  name: "Test Property",
  pricePerMonth: 2500,
  beds: 2,
  baths: 2,
  photoUrls: ["test-image.jpg"],
  amenities: ["WasherDryer"],
  highlights: ["GreatView"],
  averageRating: 4.5,
  numberOfReviews: 10,
  location: {
    address: "123 Test St",
    city: "Test City",
    state: "CA"
  }
};

const mockStore = configureStore({
  reducer: {
    global: () => ({ filters: {} })
  }
});

describe('Card Component', () => {
  it('renders property information correctly', () => {
    render(
      <Provider store={mockStore}>
        <Card
          property={mockProperty}
          isFavorite={false}
          onFavoriteToggle={() => {}}
        />
      </Provider>
    );

    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('$2,500/mo')).toBeInTheDocument();
    expect(screen.getByText('2 beds')).toBeInTheDocument();
    expect(screen.getByText('2 baths')).toBeInTheDocument();
  });

  it('calls onFavoriteToggle when favorite button is clicked', () => {
    const mockToggle = jest.fn();
    
    render(
      <Provider store={mockStore}>
        <Card
          property={mockProperty}
          isFavorite={false}
          onFavoriteToggle={mockToggle}
        />
      </Provider>
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButton);
    
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
```

**Form Component Test:**
```typescript
// client/src/components/__tests__/FormField.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { CustomFormField } from '../FormField';

const TestComponent = ({ name, label, type = "text" }) => {
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <CustomFormField
        name={name}
        label={label}
        type={type}
        register={register}
      />
      <button type="submit">Submit</button>
    </form>
  );
};

describe('CustomFormField Component', () => {
  it('renders input field with correct label', () => {
    render(<TestComponent name="test" label="Test Label" />);
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders number input when type is number', () => {
    render(<TestComponent name="price" label="Price" type="number" />);
    
    const input = screen.getByLabelText('Price');
    expect(input).toHaveAttribute('type', 'number');
  });
});
```

#### Hook Testing

**Custom Hook Test:**
```typescript
// client/src/hooks/__tests__/usePropertySearch.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePropertySearch } from '../usePropertySearch';

describe('usePropertySearch Hook', () => {
  it('initializes with default filters', () => {
    const { result } = renderHook(() => usePropertySearch());
    
    expect(result.current.filters.location).toBe('Los Angeles');
    expect(result.current.filters.beds).toBe('any');
    expect(result.current.filters.baths).toBe('any');
  });

  it('updates filters correctly', () => {
    const { result } = renderHook(() => usePropertySearch());
    
    act(() => {
      result.current.updateFilters({ beds: '2', baths: '2' });
    });
    
    expect(result.current.filters.beds).toBe('2');
    expect(result.current.filters.baths).toBe('2');
  });
});
```

### Backend Unit Tests

#### Setup

1. **Install testing dependencies:**
   ```bash
   cd server
   npm install --save-dev jest @types/jest supertest @types/supertest
   ```

2. **Configure Jest** (`server/jest.config.js`):
   ```javascript
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     roots: ['<rootDir>/src'],
     testMatch: ['**/__tests__/**/*.test.ts'],
     moduleNameMapping: {
       '^@/(.*)$': '<rootDir>/src/$1',
     },
   };
   ```

#### Controller Testing

**Property Controller Test:**
```typescript
// server/src/controllers/__tests__/propertyControllers.test.ts
import { Request, Response } from 'express';
import { getProperties, createProperty } from '../propertyControllers';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client');
const mockPrisma = {
  property: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  location: {
    create: jest.fn(),
  },
};

(PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

describe('Property Controllers', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('getProperties', () => {
    it('returns properties successfully', async () => {
      const mockProperties = [
        {
          id: 1,
          name: 'Test Property',
          pricePerMonth: 2500,
        },
      ];

      mockPrisma.property.findMany.mockResolvedValue(mockProperties);
      mockRequest.query = {};

      await getProperties(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        properties: mockProperties,
      });
    });

    it('handles database errors', async () => {
      const error = new Error('Database error');
      mockPrisma.property.findMany.mockRejectedValue(error);

      await getProperties(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('createProperty', () => {
    it('creates property successfully', async () => {
      const mockProperty = {
        id: 1,
        name: 'New Property',
        pricePerMonth: 2500,
      };

      mockPrisma.property.create.mockResolvedValue(mockProperty);
      mockPrisma.location.create.mockResolvedValue({ id: 1 });

      mockRequest.body = {
        name: 'New Property',
        pricePerMonth: 2500,
        address: '123 Test St',
        city: 'Test City',
        state: 'CA',
      };

      await createProperty(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        id: 1,
        message: 'Property created successfully',
      });
    });
  });
});
```

#### Middleware Testing

**Auth Middleware Test:**
```typescript
// server/src/middleware/__tests__/authMiddleware.test.ts
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../authMiddleware';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('allows access for valid token with correct role', () => {
    const token = jwt.sign(
      { sub: 'user123', 'custom:role': 'manager' },
      'secret'
    );

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    const middleware = authMiddleware(['manager']);
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.user).toEqual({
      id: 'user123',
      role: 'manager',
    });
  });

  it('denies access for invalid token', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    const middleware = authMiddleware(['manager']);
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid token',
    });
  });

  it('denies access for missing token', () => {
    const middleware = authMiddleware(['manager']);
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Unauthorized',
    });
  });
});
```

## 🔗 Integration Testing

### API Integration Tests

**Property API Tests:**
```typescript
// server/src/routes/__tests__/propertyRoutes.test.ts
import request from 'supertest';
import express from 'express';
import propertyRoutes from '../propertyRoutes';
import { authMiddleware } from '../../middleware/authMiddleware';

// Mock auth middleware
jest.mock('../../middleware/authMiddleware');
const mockAuthMiddleware = authMiddleware as jest.MockedFunction<typeof authMiddleware>;

const app = express();
app.use(express.json());
app.use('/properties', propertyRoutes);

describe('Property Routes', () => {
  beforeEach(() => {
    mockAuthMiddleware.mockImplementation((roles) => (req, res, next) => {
      req.user = { id: 'test-user', role: 'manager' };
      next();
    });
  });

  describe('GET /properties', () => {
    it('returns properties list', async () => {
      const response = await request(app)
        .get('/properties')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      expect(Array.isArray(response.body.properties)).toBe(true);
    });

    it('filters properties by location', async () => {
      const response = await request(app)
        .get('/properties?location=Los Angeles')
        .expect(200);

      expect(response.body.properties).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            location: expect.objectContaining({
              city: 'Los Angeles',
            }),
          }),
        ])
      );
    });
  });

  describe('POST /properties', () => {
    it('creates new property', async () => {
      const propertyData = {
        name: 'Test Property',
        pricePerMonth: 2500,
        beds: 2,
        baths: 2,
        address: '123 Test St',
        city: 'Test City',
        state: 'CA',
      };

      const response = await request(app)
        .post('/properties')
        .send(propertyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.message).toBe('Property created successfully');
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/properties')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### Database Integration Tests

**Database Connection Test:**
```typescript
// server/src/__tests__/database.test.ts
import { PrismaClient } from '@prisma/client';

describe('Database Integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.property.deleteMany();
    await prisma.location.deleteMany();
    await prisma.manager.deleteMany();
  });

  it('creates and retrieves property with location', async () => {
    // Create location
    const location = await prisma.location.create({
      data: {
        address: '123 Test St',
        city: 'Test City',
        state: 'CA',
        country: 'USA',
        postalCode: '12345',
        coordinates: 'POINT(-118.2437 34.0522)',
      },
    });

    // Create manager
    const manager = await prisma.manager.create({
      data: {
        cognitoId: 'test-manager',
        name: 'Test Manager',
        email: 'manager@test.com',
        phoneNumber: '+1234567890',
      },
    });

    // Create property
    const property = await prisma.property.create({
      data: {
        name: 'Test Property',
        description: 'Test description',
        pricePerMonth: 2500,
        securityDeposit: 2500,
        applicationFee: 100,
        photoUrls: ['test-image.jpg'],
        amenities: ['WasherDryer'],
        highlights: ['GreatView'],
        isPetsAllowed: true,
        isParkingIncluded: true,
        beds: 2,
        baths: 2,
        squareFeet: 1200,
        propertyType: 'Apartment',
        locationId: location.id,
        managerCognitoId: manager.cognitoId,
      },
      include: {
        location: true,
        manager: true,
      },
    });

    expect(property.name).toBe('Test Property');
    expect(property.location.city).toBe('Test City');
    expect(property.manager.name).toBe('Test Manager');
  });
});
```

## 🎯 End-to-End Testing

### Setup with Playwright

1. **Install Playwright:**
   ```bash
   cd client
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Configure Playwright** (`client/playwright.config.ts`):
   ```typescript
   import { defineConfig, devices } from '@playwright/test';

   export default defineConfig({
     testDir: './e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: 'html',
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
     },
     projects: [
       {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'] },
       },
       {
         name: 'firefox',
         use: { ...devices['Desktop Firefox'] },
       },
       {
         name: 'webkit',
         use: { ...devices['Desktop Safari'] },
       },
     ],
     webServer: {
       command: 'npm run dev',
       url: 'http://localhost:3000',
       reuseExistingServer: !process.env.CI,
     },
   });
   ```

### E2E Test Examples

**Property Search Test:**
```typescript
// client/e2e/property-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Property Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should display property listings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible();
    await expect(page.locator('[data-testid="property-card"]')).toHaveCount(10);
  });

  test('should filter properties by location', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by location...');
    await searchInput.fill('Los Angeles');
    await searchInput.press('Enter');

    await expect(page.locator('[data-testid="property-card"]')).toHaveCount(5);
  });

  test('should filter properties by price range', async ({ page }) => {
    const priceSlider = page.locator('[data-testid="price-slider"]');
    await priceSlider.fill('2000');

    await expect(page.locator('[data-testid="property-card"]')).toHaveCount(3);
  });

  test('should open property details on click', async ({ page }) => {
    const firstProperty = page.locator('[data-testid="property-card"]').first();
    await firstProperty.click();

    await expect(page).toHaveURL(/\/search\/\d+/);
    await expect(page.getByRole('heading', { name: /Property Details/ })).toBeVisible();
  });
});
```

**Authentication Test:**
```typescript
// client/e2e/authentication.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow user registration', async ({ page }) => {
    await page.goto('/signup');
    
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByLabel('Confirm Password').fill('TestPassword123!');
    await page.getByLabel('Role').selectOption('tenant');
    
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should allow user login', async ({ page }) => {
    await page.goto('/signin');
    
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('TestPassword123!');
    
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should redirect unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page).toHaveURL('/signin');
  });
});
```

**Property Management Test:**
```typescript
// client/e2e/property-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Property Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as manager
    await page.goto('/signin');
    await page.getByLabel('Email').fill('manager@example.com');
    await page.getByLabel('Password').fill('ManagerPass123!');
    await page.getByRole('button', { name: 'Sign In' }).click();
  });

  test('should create new property', async ({ page }) => {
    await page.goto('/managers/newproperty');
    
    await page.getByLabel('Property Name').fill('New Test Property');
    await page.getByLabel('Description').fill('A beautiful test property');
    await page.getByLabel('Price per Month').fill('2500');
    await page.getByLabel('Number of Beds').fill('2');
    await page.getByLabel('Number of Baths').fill('2');
    await page.getByLabel('Square Feet').fill('1200');
    await page.getByLabel('Address').fill('123 Test St');
    await page.getByLabel('City').fill('Test City');
    await page.getByLabel('State').fill('CA');
    await page.getByLabel('Postal Code').fill('12345');
    
    await page.getByRole('button', { name: 'Create Property' }).click();
    
    await expect(page.getByText('Property created successfully')).toBeVisible();
  });

  test('should edit existing property', async ({ page }) => {
    await page.goto('/managers/properties');
    await page.locator('[data-testid="edit-property"]').first().click();
    
    await page.getByLabel('Property Name').fill('Updated Property Name');
    await page.getByRole('button', { name: 'Update Property' }).click();
    
    await expect(page.getByText('Property updated successfully')).toBeVisible();
  });
});
```

## 🧪 Test Utilities

### Test Helpers

**Mock Data Factory:**
```typescript
// client/src/__tests__/utils/mockData.ts
export const createMockProperty = (overrides = {}) => ({
  id: 1,
  name: 'Test Property',
  description: 'Test description',
  pricePerMonth: 2500,
  securityDeposit: 2500,
  applicationFee: 100,
  photoUrls: ['test-image.jpg'],
  amenities: ['WasherDryer'],
  highlights: ['GreatView'],
  isPetsAllowed: true,
  isParkingIncluded: true,
  beds: 2,
  baths: 2,
  squareFeet: 1200,
  propertyType: 'Apartment',
  postedDate: new Date().toISOString(),
  averageRating: 4.5,
  numberOfReviews: 10,
  location: {
    address: '123 Test St',
    city: 'Test City',
    state: 'CA',
    country: 'USA',
    postalCode: '12345',
  },
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 1,
  cognitoId: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  phoneNumber: '+1234567890',
  ...overrides,
});
```

**Test Setup Utilities:**
```typescript
// client/src/__tests__/utils/testUtils.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { globalSlice } from '@/state';

export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      global: globalSlice.reducer,
    },
    preloadedState: {
      global: {
        filters: {
          location: 'Los Angeles',
          beds: 'any',
          baths: 'any',
          propertyType: 'any',
          amenities: [],
          priceRange: [null, null],
          squareFeet: [null, null],
          availableFrom: 'any',
          coordinates: [-118.25, 34.05],
        },
        isFiltersFullOpen: false,
        viewMode: 'grid',
        ...initialState,
      },
    },
  });
};

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <Provider store={store}>{children}</Provider>;
  };
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
```

## 📊 Test Coverage

### Coverage Configuration

**Jest Coverage** (`client/jest.config.js`):
```javascript
module.exports = {
  // ... other config
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Coverage Reports

Run coverage reports:
```bash
# Frontend coverage
cd client
npm run test:coverage

# Backend coverage
cd server
npm run test:coverage
```

## 🚀 CI/CD Testing

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: client/package-lock.json
      
      - name: Install dependencies
        run: |
          cd client
          npm ci
      
      - name: Run unit tests
        run: |
          cd client
          npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: client/coverage/lcov.info

  test-backend:
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
          cache: 'npm'
          cache-dependency-path: server/package-lock.json
      
      - name: Install dependencies
        run: |
          cd server
          npm ci
      
      - name: Setup database
        run: |
          cd server
          npm run prisma:generate
          npm run prisma:db:push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run tests
        run: |
          cd server
          npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: client/package-lock.json
      
      - name: Install dependencies
        run: |
          cd client
          npm ci
      
      - name: Install Playwright browsers
        run: |
          cd client
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd client
          npm run test:e2e
```

## 📝 Test Scripts

### Package.json Scripts

**Client scripts:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

**Server scripts:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

## 🔧 Testing Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy
- Mock external dependencies (APIs, databases)
- Use dependency injection for better testability
- Mock time-sensitive operations

### 3. Test Data Management
- Use factories for creating test data
- Clean up test data after each test
- Use separate test database

### 4. Performance Testing
- Test critical user flows
- Monitor test execution time
- Use parallel test execution

### 5. Accessibility Testing
- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios

## 📊 Test Metrics

### Key Metrics to Track
- **Test Coverage**: Aim for >80% coverage
- **Test Execution Time**: Keep under 5 minutes for unit tests
- **Flaky Tests**: <1% of tests should be flaky
- **Test Maintenance**: Regular updates with code changes

### Reporting
- Generate HTML coverage reports
- Track test trends over time
- Monitor test failures and fixes

---

**Note**: This testing guide provides a comprehensive approach to testing the real estate application. Adjust the testing strategy based on your specific requirements and team size. 