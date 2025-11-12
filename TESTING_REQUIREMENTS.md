# Testing Requirements & Quality Gates

**Last Updated:** 2025-01-12
**Status:** ⚠️ TESTING DEBT EXISTS - Address before Phase 4

---

## 🚨 Current Testing Debt (MUST FIX BEFORE NEW FEATURES)

### Priority 1: Critical Path Tests (Required before any Phase 4 work)

#### API Endpoint Tests
- [ ] **POST /api/orders** - Order creation
  - [ ] Authenticated user can create order
  - [ ] Unauthenticated user receives 401
  - [ ] Invalid payload returns 400 with Zod errors
  - [ ] Server-side price recalculation works
  - [ ] Stock validation prevents overselling
  - [ ] Order number auto-generation works

- [ ] **GET /api/orders** - Fetch user orders
  - [ ] Returns only current user's orders (RLS test)
  - [ ] Returns 401 for unauthenticated users
  - [ ] Correctly filters and sorts orders

- [ ] **GET /api/products** - Product listing
  - [ ] Search query sanitization prevents SQL injection
  - [ ] Category filtering works correctly
  - [ ] Returns only active products
  - [ ] Pagination works (limit parameter)

#### Service Layer Tests
- [ ] **lib/services/orders.ts** - Order service
  - [ ] `createOrder()` - 7-step validation logic
    - [ ] Step 1: Fetches products from database
    - [ ] Step 2: Validates stock availability
    - [ ] Step 3: Recalculates prices server-side (prevents manipulation)
    - [ ] Step 4: Applies correct shipping logic ($5.99 or free)
    - [ ] Step 5: Calculates tax correctly (8%)
    - [ ] Step 6: Creates order record
    - [ ] Step 7: Decrements stock atomically
  - [ ] Error handling for insufficient stock
  - [ ] Error handling for invalid product IDs

- [ ] **lib/services/products.ts** - Product service
  - [ ] Search sanitization removes dangerous characters
  - [ ] Category filtering works
  - [ ] Returns only active products by default

- [ ] **lib/store/cart.ts** - Cart store
  - [ ] `addItem()` adds item correctly
  - [ ] `updateQuantity()` validates stock limits
  - [ ] `removeItem()` removes item
  - [ ] `clearCart()` empties cart
  - [ ] Persistence to localStorage works
  - [ ] Rehydration from localStorage works

#### Component Tests
- [ ] **components/products/product-card.tsx**
  - [ ] Renders product name, price, description
  - [ ] Shows "Out of Stock" when stock = 0
  - [ ] Shows "Low Stock" when stock < 10
  - [ ] "Add to Cart" button disabled when out of stock

- [ ] **components/cart/cart-drawer.tsx**
  - [ ] Displays cart items correctly
  - [ ] Updates quantity via +/- buttons
  - [ ] Shows correct subtotal
  - [ ] Shows shipping cost ($5.99 or "FREE")
  - [ ] "Checkout" button navigates to /checkout

- [ ] **app/checkout/page.tsx**
  - [ ] Requires authentication (redirects if not logged in)
  - [ ] Form validation works (Zod schema)
  - [ ] Submits order on valid form
  - [ ] Shows error messages on failed submission

### Priority 2: Security Tests (Before production launch)

#### RLS (Row Level Security) Tests
- [ ] **orders table** - Users can only see their own orders
  - [ ] User A cannot read User B's orders
  - [ ] User cannot UPDATE other users' orders
  - [ ] User cannot DELETE other users' orders

- [ ] **order_items table** - Users can only create items for their orders
  - [ ] User can INSERT items for their own orders
  - [ ] User cannot INSERT items for other users' orders

- [ ] **profiles table** - Users can only edit their own profile
  - [ ] User can read own profile
  - [ ] User cannot read other profiles
  - [ ] User can update own profile
  - [ ] User cannot update other profiles

#### Input Validation Tests
- [ ] SQL injection attempts fail (search, filters)
- [ ] XSS attempts are sanitized
- [ ] CSRF protection on POST endpoints
- [ ] Rate limiting on order creation

### Priority 3: Mobile & Responsive Tests (Before marketing launch)

#### Browser & Device Matrix
- [ ] **Chrome Desktop** (1920x1080)
  - [ ] Homepage renders correctly
  - [ ] Product grid displays properly
  - [ ] Cart drawer opens/closes
  - [ ] Checkout flow works

- [ ] **Safari iOS 17** (iPhone 13: 390x844)
  - [ ] Touch interactions work (tap, scroll)
  - [ ] Cart drawer opens/closes on mobile
  - [ ] Checkout form inputs work
  - [ ] Payment flow works (if Stripe added)

- [ ] **Chrome Android 13** (Pixel 5: 393x851)
  - [ ] Product cards tap correctly
  - [ ] Navigation menu opens/closes
  - [ ] Cart updates work
  - [ ] Checkout submission works

- [ ] **Firefox Desktop** (1920x1080)
  - [ ] All features work (regression test)

---

## 🔄 Feature-Specific Testing Requirements

### ⚠️ RULE: No feature ships without tests. Use this checklist for EVERY new feature.

### Template: New Feature Testing Checklist

When adding a new feature, copy this template and fill it out:

```markdown
## Feature: [Feature Name]

**Developer:** [Your Name]
**Date Started:** YYYY-MM-DD
**Target Completion:** YYYY-MM-DD

### Pre-Implementation Checklist
- [ ] Feature design reviewed
- [ ] Database schema changes planned (if any)
- [ ] API endpoints documented
- [ ] Test plan written (below)

### Test Plan

#### Unit Tests
- [ ] Test 1 description
- [ ] Test 2 description
- [ ] Test 3 description

#### Integration Tests
- [ ] Integration test 1 description
- [ ] Integration test 2 description

#### E2E Tests (if user-facing)
- [ ] E2E test 1 description
- [ ] E2E test 2 description

#### Mobile Tests (if user-facing)
- [ ] iOS Safari test
- [ ] Android Chrome test

#### Security Tests (if handling user data)
- [ ] RLS policy test
- [ ] Input validation test

### Definition of Done
- [ ] All tests written and passing
- [ ] Code coverage >85% for new code
- [ ] Mobile responsive (if UI change)
- [ ] Security review completed (if data/auth change)
- [ ] Documentation updated
- [ ] PR approved and merged
```

---

## 📋 Phase 4 Features - Required Tests (Before Implementation)

### Feature 1: Stripe Payment Integration

**Tests Required BEFORE Implementation:**
- [ ] Mock Stripe API responses in tests
- [ ] Test successful payment flow
- [ ] Test failed payment handling
- [ ] Test webhook signature validation
- [ ] Test refund processing
- [ ] Test duplicate order prevention
- [ ] Mobile test: Payment on iOS Safari
- [ ] Mobile test: Payment on Android Chrome

**Estimated Test Writing Time:** 2 days

---

### Feature 2: Email Notifications (Resend)

**Tests Required BEFORE Implementation:**
- [ ] Test email template rendering
- [ ] Test order confirmation email trigger
- [ ] Test shipping notification email
- [ ] Test failed email handling (retry logic)
- [ ] Test unsubscribe link works
- [ ] Test email rate limiting

**Estimated Test Writing Time:** 1 day

---

### Feature 3: Admin Dashboard

**Tests Required BEFORE Implementation:**
- [ ] Test admin-only route access (non-admins blocked)
- [ ] Test admin can view all orders
- [ ] Test admin can update order status
- [ ] Test admin can manage inventory
- [ ] Test admin cannot delete users (if restricted)
- [ ] Test audit log for admin actions

**Estimated Test Writing Time:** 2 days

---

### Feature 4: Product Images (Upload)

**Tests Required BEFORE Implementation:**
- [ ] Test image upload (valid formats: jpg, png, webp)
- [ ] Test image upload (invalid formats rejected)
- [ ] Test image size limit enforcement (max 5MB)
- [ ] Test image optimization pipeline
- [ ] Test multiple images per product
- [ ] Test image deletion

**Estimated Test Writing Time:** 1 day

---

### Feature 5: Booking System (Cal.com)

**Tests Required BEFORE Implementation:**
- [ ] Mock Cal.com API responses
- [ ] Test booking creation
- [ ] Test booking cancellation
- [ ] Test availability checking
- [ ] Test double-booking prevention
- [ ] Test reminder email triggers

**Estimated Test Writing Time:** 2 days

---

### Feature 6: Custom Compounds Builder

**Tests Required BEFORE Implementation:**
- [ ] Test drag-and-drop UI interactions (Playwright)
- [ ] Test herb ratio calculations
- [ ] Test max herb limit enforcement (e.g., max 5 herbs)
- [ ] Test price calculation based on ratios
- [ ] Test saving custom formula
- [ ] Test loading saved formula
- [ ] Mobile test: Drag-drop on touch devices

**Estimated Test Writing Time:** 3 days

---

### Feature 7: Reviews & Ratings

**Tests Required BEFORE Implementation:**
- [ ] Test review submission (authenticated users only)
- [ ] Test review RLS (users can edit own reviews)
- [ ] Test verified purchase badge logic
- [ ] Test rating average calculation
- [ ] Test review moderation (if implemented)
- [ ] Test spam detection (if implemented)

**Estimated Test Writing Time:** 1.5 days

---

### Feature 8: Inventory Alerts

**Tests Required BEFORE Implementation:**
- [ ] Test low stock threshold detection
- [ ] Test out-of-stock alert trigger
- [ ] Test email notification to admin
- [ ] Test alert deduplication (don't spam)
- [ ] Test restock notification to waitlist users

**Estimated Test Writing Time:** 1 day

---

## 📊 Code Coverage Targets

### Minimum Coverage Requirements (Enforced by CI/CD)

| Module | Current Coverage | Target Coverage | Status |
|--------|------------------|----------------|--------|
| `lib/services/orders.ts` | 0% ⚠️ | 90% | 🔴 BLOCKING |
| `lib/services/products.ts` | 0% ⚠️ | 85% | 🔴 BLOCKING |
| `lib/store/cart.ts` | 0% ⚠️ | 85% | 🔴 BLOCKING |
| `app/api/orders/route.ts` | 0% ⚠️ | 80% | 🔴 BLOCKING |
| `app/api/products/route.ts` | 0% ⚠️ | 80% | 🔴 BLOCKING |
| `components/**/*.tsx` | 0% ⚠️ | 70% | 🟡 WARNING |

**Overall Target:** >85% coverage on critical modules

---

## ⚙️ CI/CD Quality Gates (GitHub Actions)

The following checks MUST pass before merging to `main`:

### Gate 1: Tests Pass
```bash
npm run test
```
- All unit tests pass
- All integration tests pass
- Zero test failures

### Gate 2: Code Coverage
```bash
npm run test:coverage
```
- Coverage meets minimums (see table above)
- No decrease in coverage from previous commit

### Gate 3: Type Safety
```bash
npm run type-check
```
- Zero TypeScript errors
- All types properly defined

### Gate 4: Linting
```bash
npm run lint
```
- Zero ESLint errors
- Zero ESLint warnings (optional)

### Gate 5: Build Success
```bash
npm run build
```
- Production build completes successfully
- No build warnings

### Gate 6: Lighthouse CI (On PRs)
```bash
lighthouse-ci
```
- Performance score: >90
- Accessibility score: >90
- Best Practices score: >90
- SEO score: >90

---

## 🛡️ Security Audit Checklist (Before Production)

- [ ] Run `npm audit` - Zero vulnerabilities
- [ ] Test all RLS policies (see Priority 2 above)
- [ ] Test authentication flows (login, logout, password reset)
- [ ] Test CSRF protection on all POST routes
- [ ] Test rate limiting on sensitive endpoints
- [ ] Test input sanitization on all user inputs
- [ ] Review environment variables (no secrets in code)
- [ ] Test file upload restrictions (if applicable)
- [ ] Test webhook signature validation (Stripe, Cal.com)
- [ ] Penetration testing (external audit recommended)

---

## 📱 Mobile Responsive Checklist (Before Marketing)

### Viewports to Test
- [ ] iPhone 13 Pro (390x844)
- [ ] iPhone SE (375x667)
- [ ] Pixel 5 (393x851)
- [ ] iPad Pro (1024x1366)
- [ ] Desktop 1080p (1920x1080)
- [ ] Desktop 4K (3840x2160)

### Key Flows to Test on Mobile
- [ ] Homepage loads and scrolls smoothly
- [ ] Product grid displays correctly (2 columns on mobile)
- [ ] Product detail page readable
- [ ] Cart drawer opens/closes with touch
- [ ] Checkout form inputs work on mobile keyboard
- [ ] Payment flow works on mobile (Stripe, when added)
- [ ] Navigation menu opens/closes on hamburger tap
- [ ] All buttons are touch-friendly (min 44x44px)

---

## 📈 Performance Metrics (Before Production)

### Target Metrics (Lighthouse)
- [ ] First Contentful Paint (FCP): <1.8s
- [ ] Largest Contentful Paint (LCP): <2.5s
- [ ] Total Blocking Time (TBT): <300ms
- [ ] Cumulative Layout Shift (CLS): <0.1
- [ ] Speed Index: <3.4s

### Optimization Checklist
- [ ] Images optimized (Next/Image used)
- [ ] Fonts preloaded (Lora, Inter)
- [ ] CSS minimized and bundled
- [ ] JavaScript code-split by route
- [ ] Database queries optimized (indexed)
- [ ] Edge caching enabled (Vercel)

---

## 🔄 How to Use This Document

### Before Starting ANY New Work:

1. **Check Testing Debt Section** - If Priority 1 tests aren't done, STOP and write those first
2. **Copy Feature Template** - For new features, fill out the template above
3. **Write Tests First (TDD)** - Write failing tests, then implement feature
4. **Update Coverage Table** - After writing tests, update the coverage table
5. **Run CI/CD Locally** - Before pushing, run all quality gates locally
6. **Create PR** - Use the PR template (references this doc)
7. **Merge Only After Tests Pass** - Never merge failing tests

### Weekly Review (Every Monday):
1. Review Testing Debt - Are Priority 1 items decreasing?
2. Review Coverage Table - Are we meeting targets?
3. Review Feature Templates - Are new features following the process?
4. Update "Last Updated" date at top of this doc

---

## 🚀 Definition of "Production Ready"

A feature is **production ready** when:

- ✅ All tests written and passing (unit, integration, E2E)
- ✅ Code coverage meets minimum targets
- ✅ Mobile responsive (if UI feature)
- ✅ Security review completed (if data/auth feature)
- ✅ Performance metrics met (if user-facing)
- ✅ Documentation updated
- ✅ Lighthouse CI passing
- ✅ All CI/CD quality gates green

**If ANY of the above are not met, the feature is NOT production ready.**

---

**Remember:** Tests are not optional. They are the safety net that allows you to move fast without breaking things. Every hour spent writing tests saves 10 hours debugging production issues.
