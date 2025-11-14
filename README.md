# Leyla's Apothecary - Digital Platform MVP

A comprehensive digital wellness platform combining e-commerce for herbal tinctures, online consultation booking, and custom herbal compound creation.

## Features

- **Product Catalog**: Browse and purchase premium herbal tinctures organized by therapeutic category
- **Custom Compound Builder**: Create personalized herbal formulations with 3-tier system
- **Consultation Booking**: Schedule naturopathy consultations online
- **Client Portal**: Manage orders, compounds, and health records
- **E-commerce**: Full shopping cart, checkout, and order tracking functionality

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ivan2san/Leyla-Apothecary-MVP.git
cd Leyla-Apothecary-MVP
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual credentials:
- Supabase URL and keys
- `ADMIN_EMAIL` that should have admin access inside the dashboard
- Stripe API keys
- Other service credentials
- (Optional) `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` for running Playwright admin smoke tests

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the database migrations (see `docs/` for SQL schema)
3. Copy your project URL and anon key to `.env.local`
4. Follow `docs/SUPABASE_AUTH_SETUP.md` to configure the Site URL + redirect list so production magic links land on Vercel (otherwise logins will fail with `otp_expired`).

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from the dashboard
3. Add them to `.env.local`
4. Set up webhook endpoints for order processing

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### End-to-end Tests (Playwright)

```bash
# Set once per shell – must match a real Supabase admin user
export E2E_ADMIN_EMAIL="admin@example.com"
export E2E_ADMIN_PASSWORD="super-secret"

# Automatically starts/stops a Next.js dev server on 127.0.0.1:3100
npm run test:e2e
```

By default the Playwright config spins up `npm run dev:e2e` so you never have to launch a dev server manually.  
If you already have one running (or want to point the tests at a remote preview), disable the helper and override the base URL:

```bash
PLAYWRIGHT_WEB_SERVER=off PLAYWRIGHT_BASE_URL="https://preview.your-app.com" npm run test:e2e
```

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
leylas-apothecary-mvp/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client/server utilities
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
├── public/               # Static assets
├── docs/                 # Project documentation
└── middleware.ts         # Next.js middleware (auth)
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

The project is configured for automatic deployments on push to main branch.

### Environment Variables

Ensure all environment variables from `.env.example` are configured in your Vercel project settings.

## Development Roadmap

See [docs/Leylas_Apothecary_Technical_Build_Plan.md](docs/Leylas_Apothecary_Technical_Build_Plan.md) for the complete 13-week implementation timeline.

### Phase 1: Foundation (Weeks 1-2)
- ✅ Project setup
- ✅ Database schema
- ✅ Authentication system
- 🚧 Basic UI components

### Phase 2: Core Features (Weeks 3-8)
- 🔲 Product catalog
- 🔲 Shopping cart
- 🔲 Booking system
- 🔲 Payment processing

### Phase 3: Advanced Features (Weeks 9-12)
- 🔲 Compound builder
- 🔲 Client portal
- 🔲 Email automation
- 🔲 Analytics integration

### Phase 4: Launch (Week 13)
- 🔲 Testing
- 🔲 Performance optimization
- 🔲 Production deployment

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved

## Support

For support, email support@leylasapothecary.com or visit our documentation.
