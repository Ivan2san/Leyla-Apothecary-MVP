# Leyla's Apothecary - Technical Build Plan

## Project Overview
A scalable, modern naturopathy platform combining e-commerce, consultation booking, and custom compound creation with practitioner-led expertise.

---

## TECHNICAL ARCHITECTURE OVERVIEW

### Core Technology Stack
```
Frontend:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- React Hook Form
- Zustand (state management)

Backend:
- Supabase (PostgreSQL + Auth + Storage)
- Next.js API Routes
- Edge Functions for serverless compute
- Stripe (payments)
- Cal.com (booking system)

Infrastructure:
- Vercel (hosting)
- GitHub (version control)
- Cloudflare (CDN + DDoS protection)
- Resend (transactional email)
- Uploadthing (file uploads)
```

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Pages          Components         Services        Utils     │
│  - Home         - ProductCard      - API Client   - Helpers │
│  - Products     - BookingForm      - Auth         - Constants│
│  - Booking      - CompoundBuilder  - Stripe       - Types    │
│  - Dashboard    - Navigation       - Analytics    - Hooks    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js Routes)               │
├─────────────────────────────────────────────────────────────┤
│  /api/auth      /api/products     /api/bookings   /api/admin│
│  /api/orders    /api/compounds    /api/users      /api/email│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                          │
├─────────────────────────────────────────────────────────────┤
│  Supabase       Stripe            Cal.com        Resend     │
│  - Database     - Payments        - Scheduling   - Email     │
│  - Auth         - Subscriptions   - Calendar     - Templates │
│  - Storage      - Invoices        - Reminders    - Tracking  │
└─────────────────────────────────────────────────────────────┘
```

### API-First Modular Design
- RESTful endpoints for all operations
- GraphQL-ready data structure
- Microservices architecture pattern
- Event-driven communication
- Webhook handlers for third-party services

### Scalability Considerations
- Static generation for product pages
- ISR (Incremental Static Regeneration)
- Edge caching with Vercel
- Database connection pooling
- Optimistic UI updates
- Image optimization with Next/Image

---

## PROJECT SETUP & FOUNDATION

### Initial Setup Commands
```bash
# Create Next.js project with TypeScript
npx create-next-app@latest leylas-apothecary --typescript --tailwind --app

# Navigate to project
cd leylas-apothecary

# Initialize Git repository
git init
git remote add origin https://github.com/[username]/leylas-apothecary.git

# Install core dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @stripe/stripe-js stripe
npm install @tanstack/react-query axios
npm install zustand immer
npm install react-hook-form zod @hookform/resolvers
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react clsx tailwind-merge
npm install date-fns react-day-picker
npm install @vercel/analytics @vercel/speed-insights

# Dev dependencies
npm install -D @types/node prettier eslint-config-prettier
npm install -D @testing-library/react @testing-library/jest-dom jest
npm install -D @playwright/test
```

### Environment Configuration (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cal.com
CAL_API_KEY=your_cal_api_key
NEXT_PUBLIC_CAL_LINK=your_cal_link

# Email
RESEND_API_KEY=your_resend_key

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_MIXPANEL_TOKEN=your_token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Schema (Supabase)
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    health_conditions JSONB,
    medications JSONB,
    allergies JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'ml',
    size INTEGER DEFAULT 50,
    active BOOLEAN DEFAULT true,
    metadata JSONB,
    benefits TEXT[],
    contraindications TEXT[],
    dosage_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compounds table
CREATE TABLE public.compounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    formula JSONB NOT NULL,
    type TEXT CHECK (type IN ('preset', 'custom', 'practitioner')),
    price DECIMAL(10,2),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2),
    shipping DECIMAL(10,2),
    total DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    practitioner_id UUID,
    booking_type TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled',
    price DECIMAL(10,2),
    notes TEXT,
    cal_event_id TEXT,
    meeting_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health assessments table
CREATE TABLE public.assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL,
    responses JSONB NOT NULL,
    score DECIMAL(5,2),
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE compounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
```

### Project Structure
```
leylas-apothecary/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/
│   │   ├── account/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── bookings/page.tsx
│   │   └── compounds/page.tsx
│   ├── admin/
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── users/page.tsx
│   │   └── analytics/page.tsx
│   ├── products/
│   │   ├── [slug]/page.tsx
│   │   └── page.tsx
│   ├── booking/
│   │   └── page.tsx
│   ├── cart/
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── products/route.ts
│   │   ├── orders/route.ts
│   │   ├── bookings/route.ts
│   │   ├── compounds/route.ts
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── form.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── navigation.tsx
│   ├── products/
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   └── product-filters.tsx
│   ├── booking/
│   │   ├── calendar.tsx
│   │   ├── time-slots.tsx
│   │   └── booking-form.tsx
│   ├── compounds/
│   │   ├── compound-builder.tsx
│   │   ├── herb-selector.tsx
│   │   └── formula-preview.tsx
│   └── cart/
│       ├── cart-drawer.tsx
│       ├── cart-item.tsx
│       └── checkout-form.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── admin.ts
│   ├── stripe/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── format.ts
│   │   └── validation.ts
│   └── hooks/
│       ├── use-cart.ts
│       ├── use-auth.ts
│       └── use-toast.ts
├── styles/
│   └── globals.css
├── types/
│   ├── database.ts
│   ├── api.ts
│   └── index.ts
└── public/
    └── images/
```

---

## CORE BUILDING BLOCKS

### User Management System

#### Authentication Provider (lib/auth/provider.tsx)
```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### Product Catalog System

#### Product Service (lib/services/products.ts)
```typescript
import { supabase } from '@/lib/supabase/client'
import { Product, ProductCategory } from '@/types/database'

export class ProductService {
  static async getProducts(filters?: {
    category?: string
    search?: string
    limit?: number
    offset?: number
  }) {
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Product[]
  }

  static async getProductBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    return data as Product
  }

  static async getCategories() {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('active', true)
    
    if (error) throw error
    
    const categories = [...new Set(data.map(p => p.category))]
    return categories
  }

  static async updateStock(productId: string, quantity: number) {
    const { error } = await supabase.rpc('decrement_stock', {
      product_id: productId,
      quantity: quantity
    })
    
    if (error) throw error
  }
}
```

### Shopping Cart System

#### Cart Store (lib/stores/cart.ts)
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types/database'

interface CartItem extends Product {
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(i => i.id === product.id)
          
          if (existingItem) {
            return {
              items: state.items.map(i =>
                i.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            }
          }
          
          return {
            items: [...state.items, { ...product, quantity }]
          }
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== productId)
        }))
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set((state) => ({
          items: state.items.map(i =>
            i.id === productId ? { ...i, quantity } : i
          )
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0
        )
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)
```

### Booking Engine

#### Booking Service (lib/services/bookings.ts)
```typescript
import { supabase } from '@/lib/supabase/client'
import { Booking } from '@/types/database'

export class BookingService {
  static async getAvailableSlots(date: Date, type: string) {
    // Integration with Cal.com API
    const response = await fetch('/api/bookings/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, type })
    })
    
    if (!response.ok) throw new Error('Failed to fetch availability')
    return response.json()
  }

  static async createBooking(data: {
    userId: string
    type: string
    startTime: Date
    endTime: Date
    notes?: string
  }) {
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: data.userId,
        booking_type: data.type,
        start_time: data.startTime.toISOString(),
        end_time: data.endTime.toISOString(),
        notes: data.notes,
        status: 'scheduled'
      }])
      .select()
      .single()
    
    if (error) throw error
    
    // Send confirmation email
    await fetch('/api/email/booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking.id })
    })
    
    return booking as Booking
  }

  static async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true })
    
    if (error) throw error
    return data as Booking[]
  }

  static async cancelBooking(bookingId: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
    
    if (error) throw error
  }
}
```

### Payment Processing

#### Stripe Integration (app/api/checkout/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { items, successUrl, cancelUrl } = await req.json()
    
    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'aud',
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        items: JSON.stringify(items)
      },
      shipping_address_collection: {
        allowed_countries: ['AU'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1000,
              currency: 'aud',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1500,
              currency: 'aud',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 2,
              },
              maximum: {
                unit: 'business_day',
                value: 3,
              },
            },
          },
        },
      ],
    })
    
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## USER EXPERIENCE COMPONENTS

### Component Library Setup

#### Theme Configuration (tailwind.config.ts)
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'forest': '#344E41',
        'sage': '#A3B18A',
        'terracotta': '#D98C4A',
        'warm-white': '#FDFBF8',
      },
      fontFamily: {
        'lora': ['Lora', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

#### Product Card Component (components/products/product-card.tsx)
```typescript
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types/database'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/stores/cart'
import { formatPrice } from '@/lib/utils/format'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-64 overflow-hidden rounded-t-lg">
          <Image
            src={product.image || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="absolute top-2 right-2 bg-terracotta text-white px-2 py-1 text-xs rounded">
              Only {product.stock_quantity} left
            </span>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <h3 className="font-lora text-forest text-lg font-semibold mb-1">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="font-inter text-forest font-bold text-xl">
            {formatPrice(product.price)}
          </span>
          <span className="text-gray-500 text-sm">
            {product.size}{product.unit}
          </span>
        </div>
        
        <Button
          onClick={() => addItem(product)}
          disabled={product.stock_quantity === 0}
          className="w-full mt-4 bg-terracotta hover:bg-terracotta/90"
        >
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  )
}
```

#### Compound Builder Component (components/compounds/compound-builder.tsx)
```typescript
import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Product } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface CompoundBuilderProps {
  herbs: Product[]
  onSave: (compound: any) => void
}

export function CompoundBuilder({ herbs, onSave }: CompoundBuilderProps) {
  const [selectedHerbs, setSelectedHerbs] = useState<any[]>([])
  const [compoundName, setCompoundName] = useState('')
  
  const addHerb = (herb: Product) => {
    if (selectedHerbs.length >= 7) {
      alert('Maximum 7 herbs per compound')
      return
    }
    
    if (selectedHerbs.find(h => h.id === herb.id)) {
      alert('Herb already added')
      return
    }
    
    setSelectedHerbs([...selectedHerbs, {
      ...herb,
      percentage: Math.floor(100 / (selectedHerbs.length + 1))
    }])
    
    rebalancePercentages()
  }
  
  const rebalancePercentages = () => {
    const total = selectedHerbs.reduce((sum, h) => sum + h.percentage, 0)
    if (total !== 100) {
      const adjustment = (100 - total) / selectedHerbs.length
      setSelectedHerbs(herbs => 
        herbs.map(h => ({
          ...h,
          percentage: h.percentage + adjustment
        }))
      )
    }
  }
  
  const updatePercentage = (herbId: string, percentage: number) => {
    setSelectedHerbs(herbs =>
      herbs.map(h =>
        h.id === herbId ? { ...h, percentage } : h
      )
    )
  }
  
  const removeHerb = (herbId: string) => {
    setSelectedHerbs(herbs => herbs.filter(h => h.id !== herbId))
    rebalancePercentages()
  }
  
  const calculatePrice = () => {
    return selectedHerbs.reduce((total, herb) => {
      const herbPrice = (herb.price * herb.percentage) / 100
      return total + herbPrice
    }, 0) * 1.3 // 30% markup for custom compounds
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Herb Selection */}
      <div>
        <h3 className="font-lora text-forest text-xl mb-4">
          Select Herbs (Max 7)
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {herbs.map(herb => (
            <button
              key={herb.id}
              onClick={() => addHerb(herb)}
              className="w-full text-left p-3 bg-white rounded-lg hover:bg-sage/10 transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{herb.name}</span>
                <span className="text-sm text-gray-500">
                  {formatPrice(herb.price)}/{herb.size}ml
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Compound Formula */}
      <div>
        <h3 className="font-lora text-forest text-xl mb-4">
          Your Formula
        </h3>
        
        <input
          type="text"
          placeholder="Name your compound"
          value={compoundName}
          onChange={(e) => setCompoundName(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        />
        
        {selectedHerbs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Select herbs to begin creating your compound
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedHerbs.map(herb => (
              <div key={herb.id} className="bg-white p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{herb.name}</span>
                  <button
                    onClick={() => removeHerb(herb.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[herb.percentage]}
                    onValueChange={(v) => updatePercentage(herb.id, v[0])}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-right">{herb.percentage}%</span>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-sage/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-lora text-forest text-lg">
                  Total Price (100ml)
                </span>
                <span className="font-bold text-xl text-forest">
                  {formatPrice(calculatePrice())}
                </span>
              </div>
            </div>
            
            <Button
              onClick={() => onSave({
                name: compoundName,
                formula: selectedHerbs,
                price: calculatePrice()
              })}
              disabled={!compoundName || selectedHerbs.length < 2}
              className="w-full bg-terracotta hover:bg-terracotta/90"
            >
              Save Compound
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## BACKEND SERVICES & APIs

### API Route Structure

#### Products API (app/api/products/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const searchParams = request.nextUrl.searchParams
  
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
  
  if (category) {
    query = query.eq('category', category)
  }
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }
  
  query = query.range(offset, offset + limit - 1)
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Admin check
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('products')
    .insert([body])
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

#### Orders API (app/api/orders/route.ts)
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const orderNumber = `LA-${nanoid(10).toUpperCase()}`
  
  const order = {
    user_id: user.id,
    order_number: orderNumber,
    items: body.items,
    subtotal: body.subtotal,
    tax: body.tax,
    shipping: body.shipping,
    total: body.total,
    shipping_address: body.shippingAddress,
    billing_address: body.billingAddress,
    status: 'pending'
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Update inventory
  for (const item of body.items) {
    await supabase.rpc('decrement_stock', {
      product_id: item.id,
      quantity: item.quantity
    })
  }
  
  // Send order confirmation email
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/order-confirmation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: data.id })
  })
  
  return NextResponse.json(data)
}
```

---

## MARKETING & ANALYTICS

### Email Marketing Integration

#### Email Service (lib/services/email.ts)
```typescript
import { Resend } from 'resend'
import { OrderConfirmationEmail } from '@/emails/order-confirmation'
import { BookingConfirmationEmail } from '@/emails/booking-confirmation'
import { WelcomeEmail } from '@/emails/welcome'

const resend = new Resend(process.env.RESEND_API_KEY!)

export class EmailService {
  static async sendOrderConfirmation(order: any) {
    const { data, error } = await resend.emails.send({
      from: 'Leyla\'s Apothecary <orders@leylas-apothecary.com>',
      to: order.user.email,
      subject: `Order Confirmation - ${order.order_number}`,
      react: OrderConfirmationEmail({ order })
    })
    
    if (error) throw error
    return data
  }
  
  static async sendBookingConfirmation(booking: any) {
    const { data, error } = await resend.emails.send({
      from: 'Leyla\'s Apothecary <bookings@leylas-apothecary.com>',
      to: booking.user.email,
      subject: 'Booking Confirmation',
      react: BookingConfirmationEmail({ booking })
    })
    
    if (error) throw error
    return data
  }
  
  static async sendWelcome(user: any) {
    const { data, error } = await resend.emails.send({
      from: 'Leyla\'s Apothecary <hello@leylas-apothecary.com>',
      to: user.email,
      subject: 'Welcome to Leyla\'s Apothecary',
      react: WelcomeEmail({ user })
    })
    
    if (error) throw error
    return data
  }
  
  static async addToMailingList(email: string, tags: string[] = []) {
    // Integration with email marketing platform (e.g., ConvertKit, Mailchimp)
    const response = await fetch('https://api.convertkit.com/v3/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CONVERTKIT_API_KEY}`
      },
      body: JSON.stringify({
        email,
        tags,
        api_key: process.env.CONVERTKIT_API_KEY
      })
    })
    
    if (!response.ok) throw new Error('Failed to add to mailing list')
    return response.json()
  }
}
```

### Analytics Setup

#### Analytics Provider (lib/analytics/provider.tsx)
```typescript
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

declare global {
  interface Window {
    gtag: any
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const url = pathname + searchParams.toString()
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      })
    }
    
    // Custom events tracking
    trackPageView(url)
  }, [pathname, searchParams])
  
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export function trackPurchase(value: number, items: any[]) {
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      value: value,
      currency: 'AUD',
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    })
  }
}

export function trackPageView(url: string) {
  // Custom page view tracking
  fetch('/api/analytics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, timestamp: new Date().toISOString() })
  }).catch(console.error)
}
```

---

## SECURITY & COMPLIANCE

### Security Middleware

#### Auth Middleware (middleware.ts)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protected routes
  const protectedPaths = ['/account', '/orders', '/bookings', '/compounds']
  const adminPaths = ['/admin']
  
  const path = req.nextUrl.pathname
  
  // Check protected routes
  if (protectedPaths.some(p => path.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  // Check admin routes
  if (adminPaths.some(p => path.startsWith(p))) {
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  
  // Security headers
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline';"
  )
  
  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Data Privacy

#### Privacy Components (components/privacy/cookie-consent.tsx)
```typescript
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])
  
  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowBanner(false)
    
    // Initialize analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      })
    }
  }
  
  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setShowBanner(false)
    
    // Disable analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      })
    }
  }
  
  if (!showBanner) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="max-w-7xl mx-auto p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          We use cookies to improve your experience and analyze site usage. 
          Read our{' '}
          <a href="/privacy" className="text-sage underline">
            Privacy Policy
          </a>{' '}
          for more information.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={declineCookies}
            variant="outline"
            size="sm"
          >
            Decline
          </Button>
          <Button
            onClick={acceptCookies}
            className="bg-terracotta hover:bg-terracotta/90"
            size="sm"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## DEPLOYMENT & SCALING

### Vercel Configuration

#### vercel.json
```json
{
  "functions": {
    "app/api/checkout/route.ts": {
      "maxDuration": 30
    },
    "app/api/webhooks/stripe/route.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/inventory-check",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/booking-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

### GitHub Actions CI/CD

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint
      
      - name: Type check
        run: npm run type-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## TESTING & QUALITY ASSURANCE

### Testing Setup

#### Jest Configuration (jest.config.js)
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

#### E2E Testing (tests/e2e/checkout.spec.ts)
```typescript
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should complete purchase successfully', async ({ page }) => {
    // Navigate to products
    await page.goto('/products')
    
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child button')
    
    // Go to cart
    await page.click('[data-testid="cart-icon"]')
    
    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]')
    
    // Fill checkout form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="fullName"]', 'Test User')
    await page.fill('[name="address"]', '123 Test St')
    await page.fill('[name="city"]', 'Sydney')
    await page.fill('[name="postcode"]', '2000')
    
    // Complete with test card
    await page.frameLocator('iframe').fill('[name="cardNumber"]', '4242424242424242')
    await page.frameLocator('iframe').fill('[name="cardExpiry"]', '12/25')
    await page.frameLocator('iframe').fill('[name="cardCvc"]', '123')
    
    // Submit order
    await page.click('[data-testid="place-order"]')
    
    // Verify success
    await expect(page).toHaveURL(/\/order-confirmation/)
    await expect(page.locator('h1')).toContainText('Thank you for your order')
  })
})
```

---

## IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2)
```bash
# Day 1-2: Project Setup
- Initialize Next.js project
- Configure Supabase
- Set up GitHub repository
- Deploy to Vercel
- Configure environment variables

# Day 3-4: Database Design
- Create all tables in Supabase
- Set up RLS policies
- Create database functions
- Test data relationships

# Day 5-7: Authentication
- Implement auth provider
- Create login/register pages
- Set up protected routes
- Add password reset flow

# Day 8-10: Core Components
- Build UI component library
- Create layout components
- Implement navigation
- Add responsive design

# Day 11-14: Testing Setup
- Configure Jest
- Set up Playwright
- Write initial tests
- Configure CI/CD
```

### Phase 2: Product Catalog (Week 3-4)
```bash
# Day 15-17: Product Management
- Create product service
- Build product pages
- Implement product grid
- Add search/filter

# Day 18-21: Shopping Cart
- Implement cart store
- Create cart components
- Add cart persistence
- Build cart drawer

# Day 22-28: Admin Dashboard
- Create admin routes
- Build product CRUD
- Add inventory management
- Implement analytics dashboard
```

### Phase 3: Booking System (Week 5-6)
```bash
# Day 29-31: Calendar Integration
- Integrate Cal.com
- Create booking interface
- Add availability checker
- Build time slot selector

# Day 32-35: Booking Management
- Create booking service
- Build user bookings page
- Add cancellation flow
- Implement reminders

# Day 36-42: Consultation Flow
- Create intake forms
- Build video integration
- Add notes system
- Implement follow-ups
```

### Phase 4: E-commerce (Week 7-8)
```bash
# Day 43-45: Checkout Process
- Integrate Stripe
- Build checkout form
- Add address validation
- Create order confirmation

# Day 46-49: Order Management
- Create order service
- Build order history
- Add tracking system
- Implement invoices

# Day 50-56: Payment Features
- Add subscriptions
- Create refund system
- Build payment methods
- Implement webhooks
```

### Phase 5: Compound Builder (Week 9-10)
```bash
# Day 57-60: Builder Interface
- Create compound builder
- Add drag-drop functionality
- Implement ratio calculator
- Build safety checker

# Day 61-63: Formula Management
- Create save system
- Add formula templates
- Build reorder feature
- Implement sharing

# Day 64-70: Custom Orders
- Create custom order flow
- Add practitioner approval
- Build batch tracking
- Implement labels
```

### Phase 6: Marketing (Week 11-12)
```bash
# Day 71-73: Email Marketing
- Set up Resend
- Create email templates
- Build automation flows
- Add newsletter signup

# Day 74-77: Analytics
- Implement GA4
- Add conversion tracking
- Build analytics dashboard
- Create reports

# Day 78-84: SEO & Content
- Add meta tags
- Create sitemap
- Build blog system
- Implement structured data
```

### Phase 7: Launch (Week 13)
```bash
# Day 85-87: Final Testing
- Complete E2E tests
- Performance testing
- Security audit
- User acceptance testing

# Day 88-90: Deployment
- Production deployment
- DNS configuration
- SSL setup
- Monitor launch

# Day 91: Post-Launch
- Monitor metrics
- Fix critical bugs
- Gather feedback
- Plan improvements
```

---

## Success Metrics

### Technical KPIs
- Page Load Speed: <2 seconds
- Lighthouse Score: >90
- Uptime: 99.9%
- Error Rate: <1%
- API Response Time: <200ms

### Business KPIs
- Conversion Rate: >3.5%
- Cart Abandonment: <65%
- Average Order Value: $95
- Customer LTV: $850
- Monthly Recurring Revenue: $3,500 by month 6

### User Experience KPIs
- Bounce Rate: <40%
- Session Duration: >3 minutes
- Pages per Session: >4
- Mobile Usage: >60%
- Return Visitor Rate: >35%

---

## Maintenance & Support

### Monthly Tasks
- Security updates
- Performance optimization
- Backup verification
- Analytics review
- Content updates

### Quarterly Tasks
- Feature additions
- UI/UX improvements
- SEO audit
- Compliance review
- Scale planning

---

## Conclusion

This comprehensive build plan provides a complete roadmap for building Leyla's Apothecary platform. The modular architecture ensures scalability, while the phased approach allows for manageable implementation with regular milestones.

The platform is designed to grow from a simple e-commerce site to a comprehensive wellness platform, supporting thousands of users and generating significant recurring revenue.

Key success factors:
1. **Focus on User Experience** - Intuitive navigation and smooth checkout
2. **Mobile-First Design** - Optimized for mobile commerce
3. **Practitioner Authority** - Highlighting expertise and credentials
4. **Automation** - Reducing manual work through smart systems
5. **Scalability** - Architecture that grows with the business

---

*Build Plan Version: 1.0*  
*Created: November 2024*  
*For: Leyla's Apothecary*  
*Prepared for: Claude Code Implementation*