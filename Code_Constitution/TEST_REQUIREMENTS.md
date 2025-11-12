# Test Requirements - Mandatory Before Any Commit

## 🎯 Critical Tests That MUST ALWAYS PASS

These tests protect core business functionality. If ANY of these fail after your changes, DO NOT COMMIT.

### Run Critical Tests:
```bash
npm run test:critical
# or
npm test -- --testNamePattern="CRITICAL:"
```

### The Critical Test Suite:

```typescript
// __tests__/critical/payment.test.ts
describe('CRITICAL: Payment Flow', () => {
  test('User can complete checkout', async () => {
    // Must always work
  })
  
  test('Stripe webhook processes payment', async () => {
    // Must always work
  })
  
  test('Order is created after payment', async () => {
    // Must always work
  })
})

// __tests__/critical/auth.test.ts
describe('CRITICAL: Authentication', () => {
  test('User can register', async () => {
    // Must always work
  })
  
  test('User can login', async () => {
    // Must always work
  })
  
  test('Protected routes require auth', async () => {
    // Must always work
  })
})

// __tests__/critical/cart.test.ts
describe('CRITICAL: Shopping Cart', () => {
  test('Can add product to cart', async () => {
    // Must always work
  })
  
  test('Cart persists across sessions', async () => {
    // Must always work
  })
  
  test('Cart calculates total correctly', async () => {
    // Must always work
  })
})

// __tests__/critical/booking.test.ts
describe('CRITICAL: Booking System', () => {
  test('Can view available slots', async () => {
    // Must always work
  })
  
  test('Can create booking', async () => {
    // Must always work
  })
  
  test('Booking appears in user dashboard', async () => {
    // Must always work
  })
})
```

---

## ✅ Pre-Commit Test Checklist

### Before EVERY commit, run these commands IN ORDER:

```bash
# 1. TypeScript compilation
npm run type-check
# Expected: No errors

# 2. Linting
npm run lint
# Expected: No errors (warnings are ok)

# 3. Unit tests
npm test
# Expected: All pass

# 4. Critical path tests
npm run test:critical
# Expected: 100% pass

# 5. Build verification
npm run build
# Expected: Build succeeds

# 6. E2E smoke test (if available)
npm run test:e2e:smoke
# Expected: Core flows work
```

### If ANY step fails:
```bash
# DO NOT:
git commit -m "WIP" # Never commit broken code
git commit --no-verify # Never skip checks

# DO:
# Fix the issue first
# Run the entire checklist again
# Only commit when ALL tests pass
```

---

## 🧪 Test File Organization

### Where to Find/Add Tests:

```
project-root/
├── __tests__/
│   ├── critical/          # Tests that MUST pass
│   │   ├── payment.test.ts
│   │   ├── auth.test.ts
│   │   ├── cart.test.ts
│   │   └── booking.test.ts
│   ├── unit/             # Component/function tests
│   │   ├── components/
│   │   ├── lib/
│   │   └── utils/
│   └── integration/      # API/database tests
│       ├── api/
│       └── db/
├── e2e/                  # End-to-end tests
│   ├── smoke/           # Quick critical path tests
│   └── full/            # Comprehensive tests
└── cypress/             # Alternative E2E tests
```

### Test Naming Convention:
```typescript
// Format: [PRIORITY]: [Feature] - [Specific Test]

"CRITICAL: Payment - Stripe webhook processes payment"
"SMOKE: Auth - User can login with email"
"UNIT: ProductCard - Displays price correctly"
"E2E: Checkout - Complete purchase flow"
```

---

## 🚨 Tests You Must Write for New Features

### When Adding a New API Endpoint:

```typescript
// Required tests for /api/new-endpoint
describe('API: /api/new-endpoint', () => {
  test('Returns 200 for valid request', async () => {
    const response = await fetch('/api/new-endpoint', {
      method: 'POST',
      body: JSON.stringify(validData),
    })
    expect(response.status).toBe(200)
  })
  
  test('Returns 400 for invalid data', async () => {
    const response = await fetch('/api/new-endpoint', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    })
    expect(response.status).toBe(400)
  })
  
  test('Returns 401 for unauthenticated request', async () => {
    // If endpoint requires auth
  })
  
  test('Handles errors gracefully', async () => {
    // Test error scenarios
  })
})
```

### When Adding a New Component:

```typescript
// Required tests for components
describe('Component: NewComponent', () => {
  test('Renders without crashing', () => {
    render(<NewComponent />)
  })
  
  test('Displays correct content', () => {
    render(<NewComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
  
  test('Handles user interaction', async () => {
    const handleClick = jest.fn()
    render(<NewComponent onClick={handleClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
  
  test('Applies correct styling', () => {
    // Test critical CSS classes
  })
})
```

### When Modifying Database Operations:

```typescript
// Required tests for database changes
describe('Database: Table/Operation', () => {
  test('Migration runs successfully', async () => {
    // Test schema changes
  })
  
  test('Data integrity maintained', async () => {
    // Verify no data loss
  })
  
  test('Rollback works', async () => {
    // Test migration rollback
  })
  
  test('Performance acceptable', async () => {
    // Query should complete in <100ms
  })
})
```

---

## 📊 Test Coverage Requirements

### Minimum Coverage Targets:
```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,    // 70% branch coverage
      functions: 75,   // 75% function coverage
      lines: 80,       // 80% line coverage
      statements: 80   // 80% statement coverage
    },
    // Critical files need higher coverage
    './lib/stripe/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './lib/auth/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
}
```

### Check Coverage:
```bash
# Generate coverage report
npm run test:coverage

# View report
open coverage/lcov-report/index.html

# Check if meets requirements
npm run test:coverage:check
```

---

## 🔴 Test Red Flags - FIX IMMEDIATELY

### If you see these patterns, STOP and fix:

```typescript
// ❌ NEVER: Skip or disable tests
test.skip('Important test', () => {}) // BAD
xit('Critical flow', () => {}) // BAD
// test('Something', () => {}) // Commented out - BAD

// ❌ NEVER: Ignore failures
try {
  await someOperation()
} catch {
  // Swallowing errors in tests - BAD
}

// ❌ NEVER: Use arbitrary waits
await new Promise(resolve => setTimeout(resolve, 5000)) // BAD
// Use waitFor instead:
await waitFor(() => expect(element).toBeVisible())

// ❌ NEVER: Test implementation details
expect(component.state.internalValue).toBe(5) // BAD
// Test behavior instead:
expect(screen.getByText('5')).toBeInTheDocument()

// ❌ NEVER: Hardcode test data that might change
expect(response.id).toBe('123') // BAD
// Use patterns instead:
expect(response.id).toMatch(/^\d+$/)
```

---

## 🎯 E2E Smoke Tests (Must Pass Before Deploy)

### Quick E2E Smoke Test Suite:

```typescript
// e2e/smoke/critical-paths.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Smoke: Critical User Journeys', () => {
  test('Homepage loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Leyla's Apothecary/)
  })
  
  test('Can browse products', async ({ page }) => {
    await page.goto('/products')
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0)
  })
  
  test('Can add to cart', async ({ page }) => {
    await page.goto('/products')
    await page.click('[data-testid="add-to-cart"]:first-of-type')
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })
  
  test('Can reach checkout', async ({ page }) => {
    // Add item first
    await page.goto('/products')
    await page.click('[data-testid="add-to-cart"]:first-of-type')
    // Go to checkout
    await page.click('[data-testid="cart-icon"]')
    await page.click('[data-testid="checkout-button"]')
    await expect(page).toHaveURL(/\/checkout/)
  })
  
  test('Booking system accessible', async ({ page }) => {
    await page.goto('/booking')
    await expect(page.locator('[data-testid="calendar"]')).toBeVisible()
  })
})
```

### Run Smoke Tests:
```bash
# Quick smoke test (2-3 minutes)
npm run test:e2e:smoke

# Run before deployment
npm run test:e2e:smoke -- --browser=chromium --browser=safari --browser=firefox
```

---

## 🔧 Fixing Broken Tests

### When Existing Tests Fail After Your Changes:

1. **Understand why it failed**
   ```bash
   # Run single test with details
   npm test -- --verbose path/to/failing.test.ts
   ```

2. **Check if it's a valid failure**
   - Did you change expected behavior?
   - Is the test outdated?
   - Is it testing implementation details?

3. **Fix the right thing**
   ```typescript
   // If behavior changed intentionally:
   // Update the test to match new behavior
   
   // If behavior should not have changed:
   // Revert your code changes
   
   // If test is wrong:
   // Fix the test AND document why
   ```

4. **Never just delete failing tests**
   ```typescript
   // Instead of deleting, mark for review:
   test.todo('Needs update: [reason]')
   ```

---

## 📈 Performance Tests

### Critical Performance Benchmarks:

```typescript
// __tests__/performance/benchmarks.test.ts
describe('Performance Benchmarks', () => {
  test('Homepage loads in <2s', async () => {
    const start = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(2000)
  })
  
  test('API responds in <200ms', async () => {
    const start = Date.now()
    await fetch('/api/products')
    const responseTime = Date.now() - start
    expect(responseTime).toBeLessThan(200)
  })
  
  test('Cart operations <100ms', () => {
    const start = Date.now()
    cartStore.addItem(product)
    const operationTime = Date.now() - start
    expect(operationTime).toBeLessThan(100)
  })
})
```

---

## 🚀 Continuous Integration Tests

### What Runs on Every PR:

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type Check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Unit Tests
        run: npm test
      
      - name: Critical Tests
        run: npm run test:critical
      
      - name: Build
        run: npm run build
      
      - name: E2E Smoke Tests
        run: npm run test:e2e:smoke
```

### If CI Fails:
- PR cannot be merged
- Fix locally first
- Push fixes
- Wait for green check

---

## 📝 Test Documentation

### Every Test Should Have:

```typescript
describe('Feature: Clear description', () => {
  // Document setup requirements
  beforeEach(() => {
    // Explain any complex setup
  })
  
  test('Should behavior when condition', () => {
    // Arrange: Set up test data
    const testData = { id: 1, name: 'Test' }
    
    // Act: Perform the action
    const result = functionUnderTest(testData)
    
    // Assert: Check the outcome
    expect(result).toBe(expected)
    
    // Document why if not obvious
    // This ensures backward compatibility with v1 API
  })
})
```

---

## ✍️ Writing New Tests Checklist

When adding new code, ask yourself:

- [ ] Did I test the happy path?
- [ ] Did I test error cases?
- [ ] Did I test edge cases?
- [ ] Did I test authentication/authorization?
- [ ] Did I test with invalid data?
- [ ] Did I test performance?
- [ ] Are my tests maintainable?
- [ ] Do tests document the behavior?

---

**Remember:** Tests are not optional. They are your safety net. A feature without tests is not complete.

**Last Updated:** November 2024
**Version:** 1.0

**NO COMMITS WITHOUT PASSING TESTS!**