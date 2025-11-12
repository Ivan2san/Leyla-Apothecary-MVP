# Critical Test Suite

This directory contains tests for **critical business functionality** that MUST ALWAYS PASS before any commit.

## Purpose

Critical tests protect core revenue-generating and user-essential features. If ANY of these tests fail, the commit should be blocked.

## What Goes Here

Tests for these critical paths (per .claude/TEST_REQUIREMENTS.md):

### 1. Payment Flow (`payment.test.ts`)
- User can complete checkout
- Stripe webhook processes payment
- Order is created after payment
- Payment failures are handled correctly

### 2. Authentication (`auth.test.ts`)
- User can register
- User can login
- Protected routes require auth
- Session management works

### 3. Shopping Cart (`cart.test.ts`)
- Can add product to cart
- Cart persists across sessions
- Cart calculates total correctly
- Quantity updates work

### 4. Booking System (`booking.test.ts`)
- Can view available slots
- Can create booking
- Booking appears in user dashboard
- Double-booking prevention works

## Running Critical Tests

```bash
# Run only critical tests
npm run test:critical

# Run in watch mode for development
npm run test:critical -- --watch
```

## Test Naming Convention

All tests in this directory MUST start with `CRITICAL:` in their describe block:

```typescript
describe('CRITICAL: Payment Flow', () => {
  test('User can complete checkout', async () => {
    // Test implementation
  })
})
```

## Coverage Requirements

Critical tests should aim for:
- **100% coverage** of happy paths
- **95%+ coverage** of error scenarios
- **All edge cases** documented and tested

## When to Add Tests Here

Add a test to `/critical` when:
1. Feature directly impacts revenue (payments, orders)
2. Feature is required for basic site function (auth, cart)
3. Failure would block all users (database, API)
4. Bug would cause data loss or security issues

## Current Status

✅ Cart tests exist (in `components/cart/__tests__/`)
✅ Order tests exist (in `lib/services/__tests__/orders.test.ts`)
⚠️ Authentication tests needed (placeholders below)
⚠️ Payment integration tests needed (placeholders below)
⚠️ Booking system tests needed (not yet implemented)

---

**Note:** As features are implemented, move relevant existing tests here and update this README.
