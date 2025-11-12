# Leyla's Apothecary - Project Rules for Claude Code

## 🚨 CRITICAL: Read This First

This document governs ALL code changes. Violating these rules may break production systems.

## Project Overview

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Supabase (Database + Auth)
- Stripe (Payments)
- Zustand (State Management)

**Production URL:** https://leylas-apothecary.com
**Staging URL:** https://staging.leylas-apothecary.com

## Immutable Systems (NEVER MODIFY)

### 1. Database Schema
```sql
-- These tables/columns are in production with live data
-- NEVER change column names, types, or delete tables
- products (id, name, slug, price, stock_quantity)
- orders (id, user_id, order_number, total, status)
- bookings (id, user_id, start_time, end_time, status)
- profiles (id, email, full_name)
```

### 2. Payment Flow
```typescript
// Files that must NEVER be modified without explicit permission:
- app/api/checkout/route.ts
- app/api/webhooks/stripe/route.ts
- lib/stripe/client.ts
- lib/stripe/server.ts
- components/checkout/CheckoutForm.tsx
```

### 3. Authentication System
```typescript
// The auth flow is battle-tested. DO NOT CHANGE:
- lib/auth/provider.tsx
- lib/supabase/client.ts
- lib/supabase/server.ts
- middleware.ts (auth sections only)
```

### 4. Brand Constants
```typescript
// These values are used throughout the app and marketing materials:
const BRAND_COLORS = {
  forest: '#344E41',      // NEVER CHANGE
  sage: '#A3B18A',        // NEVER CHANGE
  terracotta: '#D98C4A',  // NEVER CHANGE
  warmWhite: '#FDFBF8',   // NEVER CHANGE
}

const FONTS = {
  heading: 'Lora',  // NEVER CHANGE
  body: 'Inter',    // NEVER CHANGE
}
```

### 5. API Response Formats
```typescript
// External systems depend on these exact formats:
// GET /api/products response shape
{
  id: string,
  name: string,
  price: number,
  stock_quantity: number
}

// GET /api/orders response shape
{
  id: string,
  order_number: string,
  items: Array,
  total: number
}
```

## Git Workflow Rules

### Branch Naming
```bash
# ALWAYS create a branch before making changes:
fix/issue-description      # For bug fixes
feature/feature-name       # For new features
hotfix/critical-issue      # For production emergencies
test/experiment-name       # For experiments

# NEVER commit directly to:
- main
- production
- staging
```

### Commit Message Format
```bash
# Use conventional commits:
fix: resolve mobile menu not closing on iOS
feat: add email notification for order confirmation
test: add regression tests for cart functionality
docs: update API documentation
refactor: simplify product card component
```

### Before Committing
```bash
# MUST run these commands successfully:
npm run lint
npm run type-check
npm test
npm run build

# If ANY fail, fix before committing
```

## Code Style Rules

### Component Structure
```typescript
// ALWAYS follow this component structure:
import statements (external first, then internal)
type definitions
component function
export statement

// Example:
import { useState } from 'react'
import { Button } from '@/components/ui'

type Props = {
  // types here
}

export function ComponentName({ props }: Props) {
  // component logic
  return JSX
}
```

### File Naming
```
Components: PascalCase.tsx (ProductCard.tsx)
Utilities: camelCase.ts (formatPrice.ts)
API Routes: route.ts (always)
Types: types.ts or *.types.ts
Tests: *.test.ts or *.spec.ts
```

### Import Order
```typescript
// 1. React/Next imports
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. External packages
import { format } from 'date-fns'
import { z } from 'zod'

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui'
import { useCart } from '@/lib/hooks'

// 4. Relative imports
import { localHelper } from './utils'

// 5. Types
import type { Product } from '@/types'
```

## Testing Requirements

### Critical Paths That Must Have Tests
1. Add to cart functionality
2. Checkout process
3. User registration/login
4. Booking creation
5. Product search/filter

### Test Files Location
```
- __tests__/         # Unit tests
- e2e/              # End-to-end tests
- integration/      # Integration tests
```

### Running Tests
```bash
# Before ANY commit:
npm test            # Runs all unit tests
npm run test:e2e    # Runs E2E tests
npm run test:all    # Runs everything
```

## Error Handling Rules

### API Routes
```typescript
// ALWAYS use this error format:
return NextResponse.json(
  { error: 'Human readable message' },
  { status: appropriateStatusCode }
)

// NEVER expose internal errors:
// BAD: { error: error.message }
// GOOD: { error: 'Failed to process request' }
```

### Client-Side Errors
```typescript
// ALWAYS show user-friendly messages:
try {
  // operation
} catch (error) {
  console.error('Detailed error:', error) // For debugging
  toast.error('Something went wrong. Please try again.') // For user
}
```

## Performance Rules

### Images
- ALWAYS use Next/Image component
- ALWAYS specify width and height
- ALWAYS use WebP format when possible
- NEVER load images >200KB for web display

### API Calls
- ALWAYS implement loading states
- ALWAYS handle errors gracefully
- ALWAYS use React Query for caching
- NEVER make API calls in loops

### Bundle Size
- ALWAYS lazy load heavy components
- ALWAYS check bundle analysis before adding packages
- NEVER import entire libraries (use tree-shaking)

## Security Rules

### Never Expose
- API keys in client-side code
- Database connection strings
- Internal error messages
- User PII in console logs
- Admin functionality to non-admin users

### Always Validate
- User inputs (use Zod schemas)
- API request bodies
- File uploads (type and size)
- URL parameters
- Authentication on protected routes

## Environment Variables

### Required Variables
```bash
# These MUST be set for the app to function:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

### Naming Convention
```bash
NEXT_PUBLIC_* # For client-side variables
*_SECRET      # For sensitive keys
*_URL         # For service endpoints
*_KEY         # For API keys
```

## Common Pitfalls to Avoid

1. **State Management**
   - DON'T create new stores for features that fit existing ones
   - DON'T store sensitive data in local storage
   - DON'T mutate state directly

2. **Database**
   - DON'T make database calls from components
   - DON'T bypass Row Level Security
   - DON'T store calculated values that can become stale

3. **Styling**
   - DON'T use inline styles for responsive design
   - DON'T override brand colors
   - DON'T use !important unless absolutely necessary

4. **Performance**
   - DON'T fetch data in loops
   - DON'T render large lists without virtualization
   - DON'T load all data when pagination is available

## Getting Help

If you're unsure about a change:
1. Check COMMON_FIXES.md first
2. Run tests to ensure nothing breaks
3. Create a draft PR for review
4. Ask for clarification rather than guessing

## Verification Checklist

Before submitting ANY change, verify:
- [ ] Read all governance files
- [ ] Created feature/fix branch
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Follows code style rules
- [ ] Doesn't modify forbidden files
- [ ] Includes tests for new features
- [ ] Updates documentation if needed

---

**Last Updated:** November 2024
**Version:** 1.0
**Approved By:** Lead Developer

IF YOU'RE UNSURE, ASK BEFORE CHANGING!