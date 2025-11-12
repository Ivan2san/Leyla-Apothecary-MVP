# Common Fixes Playbook - Pre-Approved Solutions

## How to Use This Document

When encountering an issue, FIRST check if it's listed here. If it is, use the EXACT solution provided. These solutions have been tested and approved for production.

---

## 🔧 COMMON BUG FIXES

### 1. Mobile Menu Not Closing After Navigation

**Symptoms:**
- Mobile menu stays open after clicking a link
- Only happens on mobile devices
- Desktop navigation works fine

**Approved Solution:**
```typescript
// components/layout/MobileMenu.tsx
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function MobileMenu({ isOpen, setIsOpen }) {
  const pathname = usePathname()
  
  // Add this effect
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, setIsOpen])
  
  // rest of component
}
```

**Test After Fix:**
```bash
npm test -- MobileMenu.test.tsx
```

---

### 2. Cart Count Not Updating in Header

**Symptoms:**
- Cart count shows wrong number
- Doesn't update after adding/removing items
- Page refresh shows correct count

**Approved Solution:**
```typescript
// components/layout/Header.tsx
import { useCart } from '@/lib/stores/cart'

export function Header() {
  // Replace any existing cart logic with:
  const itemCount = useCart((state) => state.getItemCount())
  
  return (
    <div className="cart-icon">
      {itemCount > 0 && (
        <span className="cart-count">{itemCount}</span>
      )}
    </div>
  )
}
```

**DO NOT:**
- Modify the cart store itself
- Add additional state management
- Use useState for cart count

---

### 3. Hydration Mismatch Errors

**Symptoms:**
- Console error: "Hydration failed because..."
- Content flickers on page load
- Different content on server vs client

**Approved Solution:**
```typescript
// For components using dynamic data:
import { useEffect, useState } from 'react'

export function ProblematicComponent() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <div>Loading...</div> // or skeleton
  }
  
  // Rest of component with dynamic content
}
```

**For date/time displays:**
```typescript
// lib/utils/formatDate.ts
export function formatDate(date: Date) {
  // Always use UTC for consistency
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'UTC',
    // your options
  }).format(date)
}
```

---

### 4. Stripe Checkout Not Loading

**Symptoms:**
- Stripe Elements not appearing
- Console errors about Stripe not being defined
- Payment form is blank

**Approved Solution:**
```typescript
// app/checkout/page.tsx
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

// MUST use this initialization:
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function CheckoutPage() {
  return (
    <Elements 
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#A3B18A', // sage color
          },
        },
      }}
    >
      <CheckoutForm />
    </Elements>
  )
}
```

**DO NOT:**
- Initialize Stripe inside components
- Use useEffect for Stripe loading
- Modify the webhook endpoint

---

### 5. Images Not Loading in Production

**Symptoms:**
- Images work locally but not on Vercel
- 404 errors for images
- Broken image icons

**Approved Solution:**
```typescript
// For static images:
import Image from 'next/image'
import productImage from '@/public/images/product.jpg'

<Image 
  src={productImage} 
  alt="Product"
  priority // for above-fold images
/>

// For dynamic images from Supabase:
<Image
  src={product.image_url}
  alt={product.name}
  width={500}
  height={500}
  loader={({ src }) => src} // Important for external images
/>

// next.config.js - ensure this exists:
module.exports = {
  images: {
    domains: ['your-supabase-url.supabase.co'],
  },
}
```

---

### 6. Form Submission Failing Silently

**Symptoms:**
- Form appears to submit but nothing happens
- No error messages shown
- Network tab shows 400/500 error

**Approved Solution:**
```typescript
// Always use this pattern for forms:
import { useState } from 'react'
import { toast } from 'sonner'

export function AnyForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  async function onSubmit(data: FormData) {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Something went wrong')
      }
      
      const result = await response.json()
      toast.success('Success!')
      // handle success
      
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(error.message || 'Failed to submit form')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  )
}
```

---

### 7. Supabase Auth Session Lost on Refresh

**Symptoms:**
- User logged out after page refresh
- Session exists but not recognized
- Middleware redirecting to login

**Approved Solution:**
```typescript
// app/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function RootLayout({ children }) {
  const supabase = createServerComponentClient({ cookies })
  
  // Force session refresh
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <html>
      <body>
        <SupabaseProvider session={session}>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}

// lib/supabase/provider.tsx
'use client'

export function SupabaseProvider({ 
  children, 
  session 
}: { 
  children: React.ReactNode
  session: Session | null 
}) {
  const [supabase] = useState(() => createBrowserClient())
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.refresh()
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])
  
  return children
}
```

---

### 8. TypeScript Errors After Package Update

**Symptoms:**
- Type errors after npm install
- "Cannot find module" errors
- Property does not exist on type

**Approved Solution:**
```bash
# First, try clearing caches:
rm -rf node_modules .next
rm package-lock.json
npm install
npm run build

# If errors persist, check versions:
npm list @types/react @types/react-dom

# Ensure these match in package.json:
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
}

# For specific type errors, add to types/global.d.ts:
declare module 'problematic-package' {
  const content: any
  export default content
}
```

---

### 9. API Rate Limiting Issues

**Symptoms:**
- 429 Too Many Requests errors
- Intermittent API failures
- Works locally but fails in production

**Approved Solution:**
```typescript
// lib/utils/rateLimiter.ts
import { LRUCache } from 'lru-cache'

const tokenCache = new LRUCache<string, number>({
  max: 500,
  ttl: 60000, // 1 minute
})

export async function rateLimit(identifier: string) {
  const tokenCount = tokenCache.get(identifier) || 0
  
  if (tokenCount >= 10) { // 10 requests per minute
    throw new Error('Rate limit exceeded')
  }
  
  tokenCache.set(identifier, tokenCount + 1)
}

// Use in API routes:
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous'
  
  try {
    await rateLimit(ip)
  } catch (error) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // Process request
}
```

---

### 10. Build Failing on Vercel

**Symptoms:**
- Local build works but Vercel fails
- "Module not found" errors
- Environment variable issues

**Approved Solution:**
```javascript
// vercel.json - ensure this configuration:
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "nodejs": "18.x"
}

// package.json scripts:
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}

// For environment variables, ensure in Vercel dashboard:
// - All NEXT_PUBLIC_* vars are in Environment Variables
// - Secrets are in Environment Variables (not in code)
// - Redeploy after adding variables
```

---

## 🎨 COMMON STYLING FIXES

### 11. Tailwind Classes Not Applied

**Symptoms:**
- Styles not showing up
- Classes in DOM but no visual change
- Works in dev but not production

**Approved Solution:**
```javascript
// tailwind.config.js - ensure content paths:
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}', // Don't forget lib!
  ],
  // ...
}

// For dynamic classes, always use full class names:
// BAD:
const color = 'red'
<div className={`text-${color}-500`} /> // Won't work

// GOOD:
const colorClass = isError ? 'text-red-500' : 'text-green-500'
<div className={colorClass} />
```

---

### 12. Dark Mode Flashing

**Symptoms:**
- White flash before dark mode loads
- Theme switching causes flicker
- Hydration mismatch with theme

**Approved Solution:**
```typescript
// app/layout.tsx - add before </head>:
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          const theme = localStorage.getItem('theme') || 'light';
          document.documentElement.classList.add(theme);
        } catch (e) {}
      })();
    `,
  }}
/>

// components/ThemeProvider.tsx:
'use client'

export function ThemeProvider({ children }) {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light'
    document.documentElement.classList.add(theme)
  }, [])
  
  return <>{children}</>
}
```

---

## 🚀 PERFORMANCE FIXES

### 13. Slow Initial Page Load

**Symptoms:**
- Long white screen on first visit
- Lighthouse score below 70
- Large First Contentful Paint

**Approved Solution:**
```typescript
// 1. Add loading.tsx to slow routes:
// app/products/loading.tsx
export default function Loading() {
  return <ProductGridSkeleton />
}

// 2. Optimize images:
<Image
  src={image}
  alt={alt}
  priority={isAboveFold} // Critical images
  loading={isAboveFold ? undefined : 'lazy'}
  placeholder="blur"
  blurDataURL={shimmer} // Base64 placeholder
/>

// 3. Split heavy components:
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { 
    loading: () => <Skeleton />,
    ssr: false // if not needed on server
  }
)
```

---

### 14. Memory Leaks in useEffect

**Symptoms:**
- Browser becomes slow over time
- Console warnings about memory leaks
- "Can't perform state update on unmounted component"

**Approved Solution:**
```typescript
// Always cleanup subscriptions and timers:
useEffect(() => {
  let mounted = true
  const timer = setTimeout(() => {
    if (mounted) {
      setState(newValue)
    }
  }, 1000)
  
  const subscription = subscribe(data => {
    if (mounted) {
      setData(data)
    }
  })
  
  return () => {
    mounted = false
    clearTimeout(timer)
    subscription.unsubscribe()
  }
}, [dependencies])
```

---

## 🔐 SECURITY FIXES

### 15. CORS Errors in Production

**Symptoms:**
- API calls blocked by CORS
- Works locally but not deployed
- "Access-Control-Allow-Origin" errors

**Approved Solution:**
```typescript
// app/api/route.ts - add headers:
export async function POST(request: Request) {
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL!,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }
  
  // Your logic here
  
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL!,
    },
  })
}
```

---

## 📱 RESPONSIVE DESIGN FIXES

### 16. Content Overflow on Mobile

**Symptoms:**
- Horizontal scroll on mobile
- Content cut off
- Layout broken on small screens

**Approved Solution:**
```css
/* globals.css - add to base: */
@layer base {
  * {
    @apply max-w-full;
  }
  
  img, video, iframe {
    @apply max-w-full h-auto;
  }
  
  pre, code {
    @apply overflow-x-auto;
  }
}

/* For specific components: */
.problem-container {
  @apply w-full overflow-x-hidden;
}

.problem-text {
  @apply break-words;
}
```

---

## 🔄 STATE MANAGEMENT FIXES

### 17. Zustand Store Not Persisting

**Symptoms:**
- Cart empties on refresh
- User preferences lost
- State not saving to localStorage

**Approved Solution:**
```typescript
// lib/stores/example.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // your store logic
    }),
    {
      name: 'store-name', // unique name
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        // only persist what's needed
        cart: state.cart,
        // don't persist sensitive data
      }),
    }
  )
)
```

---

## 🧪 TESTING FIXES

### 18. Tests Failing After Component Update

**Symptoms:**
- Tests that were passing now fail
- "Unable to find element" errors
- Timeout errors in tests

**Approved Solution:**
```typescript
// Always use data-testid for testing:
<button data-testid="submit-button">Submit</button>

// In tests:
import { render, screen, waitFor } from '@testing-library/react'

test('component test', async () => {
  render(<Component />)
  
  // Wait for async operations:
  await waitFor(() => {
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })
  
  // For user interactions:
  const user = userEvent.setup()
  await user.click(screen.getByTestId('submit-button'))
})
```

---

## 📝 WHEN THESE FIXES DON'T WORK

If the pre-approved solution doesn't work:

1. **Verify you applied it correctly**
   - Copy-pasted exactly as shown?
   - In the right file/location?
   - All imports added?

2. **Check for additional issues**
   - Run `npm run type-check`
   - Check browser console
   - Check network tab

3. **Document the variation**
   - What's different about this case?
   - What error messages appear?
   - What have you tried?

4. **Create a test**
   - Write a failing test for the issue
   - This helps prevent regression

5. **Propose a new solution**
   - Branch: `fix/issue-name-investigation`
   - Document your solution
   - Add to this playbook once verified

---

**Last Updated:** November 2024
**Version:** 1.0

**Remember:** These solutions are PRE-APPROVED. Use them exactly as written for guaranteed safe fixes.