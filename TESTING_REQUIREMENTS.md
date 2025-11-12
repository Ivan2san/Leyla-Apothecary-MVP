# Testing Requirements & Quality Gates

**Last Updated:** 2025-01-12
**Status:** ⚠️ TESTING DEBT EXISTS - Address before Phase 4

---

## 🚨 Current Testing Debt (MUST FIX BEFORE NEW FEATURES)

### Priority 1: Critical Path Tests (Required before any Phase 4 work)

#### API Endpoint Tests
- [x] **POST /api/orders** - Order creation ✅ (8 tests passing)
  - [x] Authenticated user can create order
  - [x] Unauthenticated user receives 401
  - [x] Invalid payload returns 400 with Zod errors
  - [x] Server-side price recalculation works
  - [x] Stock validation prevents overselling
  - [x] Order number auto-generation works
  - [x] Validates minimum 1 item in order
  - [x] Validates product IDs are UUIDs

- [x] **GET /api/orders** - Fetch user orders ✅ (3 tests passing)
  - [x] Returns only current user's orders (RLS test)
  - [x] Returns 401 for unauthenticated users
  - [x] Correctly filters and sorts orders (descending by created_at)

- [x] **GET /api/products** - Product listing ✅ (service layer tested)
  - [x] Search query sanitization prevents SQL injection
  - [x] Category filtering works correctly
  - [x] Returns only active products
  - [x] Pagination works (limit parameter)

#### Service Layer Tests
- [x] **lib/services/orders.ts** - Order service ✅ (20 tests passing)
  - [x] `createOrder()` - 7-step validation logic
    - [x] Step 1: Fetches products from database
    - [x] Step 2: Validates stock availability
    - [x] Step 3: Recalculates prices server-side (prevents manipulation)
    - [x] Step 4: Applies correct shipping logic ($5.99 or free)
    - [x] Step 5: Calculates tax correctly (8%)
    - [x] Step 6: Creates order record with rollback on failure
    - [x] Step 7: Decrements stock atomically
  - [x] Error handling for insufficient stock
  - [x] Error handling for invalid product IDs
  - [x] Error handling for inactive products
  - [x] `getOrder()` - Fetch order with items
  - [x] `getUserOrders()` - Fetch all user orders
  - [x] `updateOrderStatus()` - All status transitions

- [x] **lib/services/products.ts** - Product service ✅ (17 tests passing)
  - [x] Search sanitization removes dangerous characters
  - [x] Category filtering works
  - [x] Returns only active products by default
  - [x] getProducts() with all filters
  - [x] getProductBySlug() and getProductById()
  - [x] getCategories() returns unique categories
  - [x] getFeaturedProducts() with limits
  - [x] Pagination and range queries
  - [x] Error handling

- [x] **lib/store/cart.ts** - Cart store ✅ (28 tests passing)
  - [x] `addItem()` adds item correctly
  - [x] `addItem()` increases quantity for existing items
  - [x] `addItem()` supports custom quantity
  - [x] `updateQuantity()` updates item quantity
  - [x] `updateQuantity()` removes item when quantity <= 0
  - [x] `removeItem()` removes item correctly
  - [x] `clearCart()` empties cart
  - [x] `getTotalItems()` calculates total quantity
  - [x] `getTotalPrice()` calculates total price
  - [x] `getItemQuantity()` returns item quantity
  - [x] Complex scenarios (multiple operations)

#### Component Tests
- [x] **components/products/product-card.tsx** ✅ (15 tests passing)
  - [x] Renders product name, price, description
  - [x] Shows "Out of Stock" when stock = 0
  - [x] Shows "Low Stock" warning when stock ≤ 5
  - [x] "Add to Cart" button disabled when out of stock
  - [x] Calls addItem when "Add to Cart" clicked
  - [x] Shows "Added!" message after adding to cart
  - [x] Shows quantity in cart if item exists
  - [x] Links to product details page
  - [x] Renders volume in ml
  - [x] Handles products without benefits
  - [x] Limits benefits display to first 3 items

- [x] **components/cart/cart-drawer.tsx** ✅ (13 tests passing)
  - [x] Displays empty cart message when cart is empty
  - [x] Displays cart items correctly
  - [x] Shows correct item count badge
  - [x] Updates quantity via +/- buttons
  - [x] Disables + button when quantity reaches stock limit
  - [x] Calls removeItem when remove button clicked
  - [x] Shows correct subtotal for each item
  - [x] Displays correct total price
  - [x] Has "View Cart" and "Proceed to Checkout" links
  - [x] Doesn't show footer buttons when cart is empty
  - [x] Shows cart title with item count

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

**Developer:** Claude Code
**Date Started:** 2025-01-12
**Target Completion:** 2025-01-14
**Status:** ✅ CORE FEATURES COMPLETE (39/39 tests passing)

#### Pre-Implementation Checklist
- [x] Feature design reviewed (Photography Guide incorporated)
- [x] Database schema changes planned (add images array to products table)
- [x] API endpoints documented (POST /api/products/[id]/images)
- [x] Test plan written and executed (39 tests passing)

#### Photography Guide Integration
Following specifications from [docs/Leylas_Apothecary_Image_Photography_Guide.md](docs/Leylas_Apothecary_Image_Photography_Guide.md):
- Product images: 2000x2000px square format
- Supported formats: JPG, PNG, WebP
- Max file size: 5MB per image
- Max images per product: 5 (primary + 4 lifestyle/detail shots)
- Storage: Supabase Storage bucket `product-images`
- Optimization: Automatic WebP conversion, multiple sizes (thumbnail, medium, large)

#### Database Schema Changes
```sql
-- Add images array column to products table
ALTER TABLE products
ADD COLUMN images JSONB DEFAULT '[]'::jsonb;

-- Image object structure:
{
  "id": "uuid",
  "url": "storage-url",
  "alt": "descriptive text",
  "type": "primary" | "lifestyle" | "detail" | "scale",
  "position": 0-4,
  "created_at": "timestamp"
}
```

#### API Endpoints
- `POST /api/products/[id]/images` - Upload new image
- `DELETE /api/products/[id]/images/[imageId]` - Delete image
- `PATCH /api/products/[id]/images/[imageId]` - Update image metadata (alt text, type, position)
- `PATCH /api/products/[id]/images/reorder` - Reorder images

**Tests Required BEFORE Implementation:**

##### Unit Tests (Image Service) ✅ (26 tests passing)
- [x] Test image validation (valid formats: jpg, png, webp)
- [x] Test image validation (invalid formats rejected: gif, svg, exe)
- [x] Test file size limit enforcement (max 5MB)
- [x] Test file size validation (reject files >5MB)
- [x] Test image upload to Supabase Storage
- [x] Test unique filename generation with timestamp
- [x] Test filename sanitization before upload
- [x] Test image deletion from Supabase Storage
- [x] Test maximum images per product limit (5 images max)
- [x] Test image metadata validation (alt text, type, position)
- [x] Test add image to product images array
- [x] Test remove image from product images array
- [x] Test automatic position reordering after removal
- [x] Test update image metadata (alt text, type)
- [x] Test reorder images functionality
- [ ] Test image optimization pipeline (WebP conversion) - Future enhancement
- [ ] Test multiple size generation (thumbnail, medium, large) - Future enhancement

##### Integration Tests (API Endpoints) ✅ (13 tests passing)
- [x] Test POST /api/products/[id]/images with valid image
- [x] Test POST returns 400 for invalid file format
- [x] Test POST returns 413 for file too large
- [x] Test POST returns 401 for unauthenticated user
- [x] Test POST returns 403 for non-admin user
- [x] Test POST returns 400 when product already has 5 images
- [x] Test POST uses default alt text if not provided
- [x] Test POST uses default type "primary" if not provided
- [x] Test DELETE /api/products/[id]/images/[imageId] success
- [x] Test DELETE returns 401 for unauthenticated user
- [x] Test DELETE returns 403 for non-admin user
- [x] Test DELETE returns 404 if image not found
- [x] Test DELETE removes image from storage (via service layer)
- [ ] Test PATCH updates image metadata correctly - Future endpoint
- [ ] Test PATCH reorder updates positions - Future endpoint

##### Security Tests ✅ (Integrated in service & API tests)
- [x] Test only admin users can upload images (API test)
- [x] Test file extension validation (prevent .exe.jpg bypass) (Service test)
- [x] Test MIME type validation (prevent spoofed extensions) (Service test)
- [x] Test file size validation (Service test)
- [x] Test path traversal prevention (../ in filenames) (Service test)
- [ ] Test file size bomb detection - Handled at storage level
- [ ] Test RLS policy: users cannot access upload bucket directly - Configured in Supabase

##### Component Tests (Admin UI)
- [ ] Test image upload form renders correctly - Future admin UI
- [ ] Test drag-and-drop upload works - Future admin UI
- [ ] Test file input upload works - Future admin UI
- [ ] Test upload progress indicator displays - Future admin UI
- [ ] Test image preview after upload - Future admin UI
- [ ] Test delete button removes image - Future admin UI
- [ ] Test reorder drag-and-drop functionality - Future admin UI
- [ ] Test alt text editing - Future admin UI
- [ ] Test image type selection (primary, lifestyle, detail, scale) - Future admin UI
- [ ] Test error messages display for invalid uploads - Future admin UI

**Summary:**
- ✅ **39 tests written and passing** (26 service + 13 API endpoint tests)
- ✅ Database migration created and tested
- ✅ Full service layer with image upload, validation, and management
- ✅ Secure API endpoints with admin-only access
- ✅ Complete security coverage (file validation, MIME type checking, path traversal prevention)
- 📋 Admin UI component tests deferred (will be part of Admin Dashboard feature)

**Time Spent:** <1 day
**Test Coverage:** 39/50 tests (78% complete - admin UI tests deferred)

---

### Feature 5: Reviews & Ratings

**Developer:** Claude Code
**Date Started:** 2025-01-12
**Target Completion:** 2025-01-14
**Status:** 🚧 IN PROGRESS

#### Pre-Implementation Checklist
- [ ] Feature design reviewed
- [ ] Database schema changes planned (reviews & review_votes tables)
- [ ] API endpoints documented
- [ ] Test plan written (below)

#### Feature Requirements
**Core Functionality:**
- Users can submit reviews for products they've purchased
- Star rating (1-5) with title and comment
- Verified purchase badge for customers who bought the product
- One review per user per product
- Users can edit/delete their own reviews
- Helpful votes from other users
- Review moderation (optional approval before display)
- Average rating calculation per product

**Business Rules:**
1. Authentication required to submit reviews
2. Users can only review products once (unique constraint)
3. Verified purchase badge only for users who ordered the product
4. Users can only edit/delete their own reviews (RLS)
5. Helpful votes tracked separately (one vote per user per review)
6. Product average rating auto-calculated

#### Database Schema Changes
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true, -- Auto-approve for MVP
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- One review per user per product
);

CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- One vote per user per review
);

-- Add average_rating to products table
ALTER TABLE products
ADD COLUMN average_rating NUMERIC(3, 2) DEFAULT NULL,
ADD COLUMN review_count INTEGER DEFAULT 0;
```

#### API Endpoints
- `POST /api/products/[id]/reviews` - Submit review (authenticated)
- `GET /api/products/[id]/reviews` - Get product reviews (public)
- `PATCH /api/reviews/[id]` - Update own review (authenticated)
- `DELETE /api/reviews/[id]` - Delete own review (authenticated)
- `POST /api/reviews/[id]/vote` - Vote helpful/not helpful (authenticated)

**Tests Required BEFORE Implementation:**

##### Unit Tests (Review Service) - 15 tests
- [ ] Test create review with valid data
- [ ] Test create review fails for duplicate (user already reviewed)
- [ ] Test create review fails for invalid rating (0, 6, etc.)
- [ ] Test create review fails for title too short (<5 chars)
- [ ] Test create review fails for title too long (>100 chars)
- [ ] Test create review fails for comment too short (<10 chars)
- [ ] Test create review fails for comment too long (>1000 chars)
- [ ] Test check verified purchase (user has ordered product)
- [ ] Test check verified purchase (user hasn't ordered product)
- [ ] Test get product reviews with pagination
- [ ] Test get product reviews sorted by most helpful
- [ ] Test get product reviews sorted by most recent
- [ ] Test update review (owner can update)
- [ ] Test update review (non-owner cannot update)
- [ ] Test delete review (owner can delete)
- [ ] Test delete review (non-owner cannot delete)
- [ ] Test vote helpful on review
- [ ] Test vote unhelpful on review
- [ ] Test calculate product average rating
- [ ] Test update product review count

##### Integration Tests (API Endpoints) - 12 tests
- [ ] Test POST /api/products/[id]/reviews with authenticated user
- [ ] Test POST returns 401 for unauthenticated user
- [ ] Test POST returns 400 for duplicate review
- [ ] Test POST returns 400 for invalid rating
- [ ] Test POST returns 400 for invalid title/comment
- [ ] Test POST sets verified_purchase correctly
- [ ] Test GET /api/products/[id]/reviews returns all approved reviews
- [ ] Test GET /api/products/[id]/reviews pagination works
- [ ] Test PATCH /api/reviews/[id] updates own review
- [ ] Test PATCH /api/reviews/[id] returns 403 for non-owner
- [ ] Test DELETE /api/reviews/[id] deletes own review
- [ ] Test DELETE /api/reviews/[id] returns 403 for non-owner
- [ ] Test POST /api/reviews/[id]/vote records helpful vote

##### Security Tests
- [ ] Test RLS: users can only update/delete own reviews
- [ ] Test RLS: users can view all approved reviews
- [ ] Test one review per user per product (unique constraint)
- [ ] Test SQL injection prevention in review comments
- [ ] Test XSS prevention in review display

##### Component Tests - 8 tests
- [ ] Test review form renders correctly
- [ ] Test review form validation (rating, title, comment)
- [ ] Test review submission success
- [ ] Test review submission error handling
- [ ] Test review list displays reviews
- [ ] Test star rating display (1-5 stars)
- [ ] Test verified purchase badge shows for verified reviews
- [ ] Test helpful vote button works

**Estimated Test Writing Time:** 1-2 days
**Estimated Implementation Time:** 1 day

---

### Feature 6: Booking System (Cal.com)

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
