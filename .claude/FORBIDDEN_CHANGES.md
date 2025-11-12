# FORBIDDEN CHANGES - Do Not Modify These Files/Systems

## 🚫 ABSOLUTELY FORBIDDEN FILES

These files are in production and must NEVER be modified without explicit written permission:

### Payment System (CRITICAL - PROCESSES REAL MONEY)
```
❌ app/api/checkout/route.ts
❌ app/api/webhooks/stripe/route.ts
❌ lib/stripe/client.ts
❌ lib/stripe/server.ts
❌ components/checkout/CheckoutForm.tsx
❌ components/checkout/PaymentMethodSelector.tsx
❌ lib/utils/calculateTax.ts
❌ lib/utils/calculateShipping.ts
```

### Authentication System (CRITICAL - SECURITY)
```
❌ lib/auth/provider.tsx
❌ lib/supabase/client.ts
❌ lib/supabase/server.ts
❌ lib/supabase/admin.ts
❌ middleware.ts (lines 15-87: auth logic)
❌ app/api/auth/[...nextauth]/route.ts
```

### Database Migrations (CRITICAL - DATA INTEGRITY)
```
❌ supabase/migrations/*
❌ supabase/seed.sql
❌ prisma/schema.prisma
❌ lib/db/schema.ts
```

### Environment Configuration
```
❌ .env.production
❌ .env.local (only add, never modify existing)
❌ vercel.json (deployment settings)
❌ next.config.js (security headers section)
```

### Legal/Compliance Pages
```
❌ app/privacy-policy/page.tsx
❌ app/terms-of-service/page.tsx
❌ app/refund-policy/page.tsx
❌ app/disclaimer/page.tsx
```

## ⚠️ MODIFY WITH EXTREME CAUTION

These files can be modified but require extra care:

### State Management Stores
```
⚠️ lib/stores/cart.ts
   - CAN: Add new methods
   - CANNOT: Change existing method signatures
   - CANNOT: Modify storage key names

⚠️ lib/stores/user.ts
   - CAN: Add new fields
   - CANNOT: Remove or rename existing fields
   - CANNOT: Change data types

⚠️ lib/stores/booking.ts
   - CAN: Add validation
   - CANNOT: Change date formats
   - CANNOT: Modify booking statuses
```

### API Response Shapes
```
⚠️ app/api/products/route.ts
   - CAN: Add new optional fields
   - CANNOT: Remove fields
   - CANNOT: Change field types
   - CANNOT: Rename fields

⚠️ app/api/orders/route.ts
   - CAN: Add metadata
   - CANNOT: Change order number format
   - CANNOT: Modify status values
```

### Core Components
```
⚠️ components/ui/Button.tsx
   - CAN: Add new variants
   - CANNOT: Change existing variant styles
   - CANNOT: Modify prop interfaces

⚠️ components/layout/Navigation.tsx
   - CAN: Add new menu items
   - CANNOT: Change routing structure
   - CANNOT: Modify auth checking logic
```

## 🔒 IMMUTABLE CONSTANTS

These values are hardcoded in multiple places and emails/marketing:

### Brand Colors (NEVER CHANGE)
```typescript
const FORBIDDEN_TO_CHANGE = {
  colors: {
    forest: '#344E41',
    sage: '#A3B18A', 
    terracotta: '#D98C4A',
    warmWhite: '#FDFBF8',
    textGray: 'text-gray-600'
  },
  fonts: {
    heading: 'Lora',
    body: 'Inter'
  },
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px'
  }
}
```

### API Endpoints (External Dependencies)
```typescript
const EXTERNAL_DEPENDENCIES = {
  '/api/checkout': 'Used by mobile app',
  '/api/products': 'Used by partner sites',
  '/api/booking/availability': 'Used by Cal.com',
  '/api/webhooks/stripe': 'Registered with Stripe',
  '/api/webhooks/email': 'Registered with Resend'
}
```

### Database Tables/Columns in Production
```sql
-- These have live data - NEVER rename or delete
FORBIDDEN_TABLES = [
  'products (id, slug, name, price, stock_quantity)',
  'orders (id, order_number, user_id, total, status)',
  'profiles (id, email, full_name, created_at)',
  'bookings (id, start_time, end_time, status)',
  'compounds (id, formula, user_id, created_at)'
]
```

## 🛑 FORBIDDEN ACTIONS

### NEVER DO THESE:
1. **Delete any file** without explicit permission
2. **Rename core files** (can break imports)
3. **Change file extensions** (.ts to .js, .tsx to .jsx)
4. **Modify git history** (no force push, no rebase on shared branches)
5. **Update major versions** of core dependencies without testing
6. **Remove error boundaries** or try-catch blocks
7. **Disable TypeScript** strict mode or ignore errors
8. **Comment out tests** instead of fixing them
9. **Add console.log** with sensitive data
10. **Hardcode API keys** or secrets in code

### Database FORBIDDEN Actions:
1. **DROP TABLE** or **DROP COLUMN** on any production table
2. **RENAME** columns that are referenced in code
3. **Change data types** of existing columns
4. **Remove indexes** without performance testing
5. **Disable Row Level Security** policies
6. **Modify trigger functions** without backup

### Style FORBIDDEN Actions:
1. **Override Tailwind config** base values
2. **Use different color hex codes** for brand colors
3. **Import new font families** without approval
4. **Add global CSS** that affects all components
5. **Use !important** on brand elements

### Security FORBIDDEN Actions:
1. **Disable CORS** protections
2. **Remove rate limiting**
3. **Skip input validation**
4. **Store passwords** in plain text
5. **Log sensitive user data**
6. **Expose internal error messages** to users
7. **Remove authentication checks**
8. **Disable HTTPS** requirements

## ⚡ FORBIDDEN Performance Changes

### Never Remove:
- Image optimization (Next/Image)
- Code splitting
- Lazy loading
- Memoization in critical paths
- Database connection pooling
- API response caching
- Static generation for marketing pages

## 🔍 How to Check If Something Is Forbidden

Before modifying ANY file, ask yourself:

1. **Is it in the forbidden list above?** → DON'T TOUCH IT
2. **Does it process payments?** → DON'T TOUCH IT
3. **Does it handle authentication?** → DON'T TOUCH IT
4. **Is it a database migration?** → DON'T TOUCH IT
5. **Has it not been modified in 6+ months?** → PROBABLY STABLE, BE CAREFUL
6. **Does it have a "DO NOT MODIFY" comment?** → DON'T TOUCH IT
7. **Is it imported by many files?** → BE VERY CAREFUL
8. **Does it have security implications?** → GET APPROVAL FIRST

## 📝 Getting Permission to Modify Forbidden Files

If you absolutely must modify a forbidden file:

1. Document the exact change needed
2. Explain why it can't be solved another way
3. List all systems that might be affected
4. Provide rollback plan
5. Get written approval
6. Make change in isolated branch
7. Extensive testing required
8. Deploy to staging first
9. Monitor for 24 hours
10. Then deploy to production

## 🚨 EMERGENCY PROTOCOL

If you accidentally modify a forbidden file:

```bash
# IMMEDIATELY:
git status                          # See what changed
git diff [forbidden-file]           # Review changes
git checkout -- [forbidden-file]    # Revert the file
git status                          # Verify reverted

# If already committed:
git reset HEAD~1                    # Undo last commit
git checkout -- [forbidden-file]    # Restore file
git add .                          # Re-add safe changes
git commit -m "fix: [issue] without touching forbidden files"

# If already pushed:
# ALERT THE TEAM IMMEDIATELY
# DO NOT FORCE PUSH
# Create a revert commit instead
```

---

**Remember:** These restrictions exist because real users, real money, and real data are at stake. When in doubt, DON'T touch it. Ask for clarification first.

**Last Updated:** November 2024
**This document is LAW - violations may result in production downtime**