# Setup Guide - Leyla's Apothecary MVP

## ✅ Completed Steps

- [x] Next.js project initialized
- [x] Dependencies installed
- [x] Git repository created
- [x] Code pushed to GitHub
- [x] Local environment file created (`.env.local`)
- [x] Database migration file created

## 🚀 Next Steps

### 1. Run Supabase Database Migration

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project: https://supabase.com/dashboard/project/ivpsqihvuipnzjpghdaa

2. Click on **SQL Editor** in the left sidebar

3. Click **New Query**

4. Open the migration file at: `supabase/migrations/20250112000000_initial_schema.sql`

5. Copy ALL the SQL content from that file

6. Paste it into the Supabase SQL Editor

7. Click **Run** (or press Ctrl+Enter)

8. You should see: "Success. No rows returned"

9. Verify the tables were created:
   - Click **Table Editor** in the left sidebar
   - You should see: profiles, products, compounds, orders, order_items, bookings, health_assessments, newsletter_subscribers

#### Option B: Using Supabase CLI (For advanced users)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref ivpsqihvuipnzjpghdaa

# Run migration
supabase db push
```

### 2. Verify Sample Data

After running the migration, you should have 23 sample products:
- 20 individual herbal tinctures
- 3 pre-made compound protocols

To view them:
1. Go to **Table Editor** > **products**
2. You should see all the products listed

### 3. Get Your Service Role Key (Important!)

1. In Supabase Dashboard, go to **Settings** > **API**
2. Scroll down to **Project API keys**
3. Copy the **service_role** key (it's hidden by default - click the eye icon)
4. Open `.env.local` in your project
5. Replace `your_supabase_service_role_key_here` with your actual service role key
6. **Important:** Never commit this key to git!

### 4. Test Local Development

```bash
# Make sure you're in the project directory
cd c:\Users\Ivan\source\repos\Leyla-Apothecary-MVP

# Start the development server
npm run dev
```

Open http://localhost:3000 in your browser. You should see the homepage!

### 5. Deploy to Vercel

#### Step-by-Step Vercel Setup:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/ivans-projects-40600ee2
   - Click **Add New...** > **Project**

2. **Import Git Repository**
   - Click **Import** next to "Import Git Repository"
   - Select **GitHub**
   - Find and select: `Ivan2san/Leyla-Apothecary-MVP`
   - Click **Import**

3. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (leave as default)
   - **Output Directory**: `.next` (leave as default)

4. **Add Environment Variables** (Critical!)
   Click on **Environment Variables** section and add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   https://ivpsqihvuipnzjpghdaa.supabase.co

   NEXT_PUBLIC_SUPABASE_ANON_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2cHNxaWh2dWlwbnpqcGdoZGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzExNTgsImV4cCI6MjA3ODQ0NzE1OH0.WQMYS356fUGgSKvCL5ylhXXRDYKq-bdTqysJWGb6aN4

   SUPABASE_SERVICE_ROLE_KEY
   [Paste your service role key from step 3]

   NEXT_PUBLIC_APP_URL
   [Leave empty for now - Vercel will provide this after first deployment]
   ```

   **Important:** Make sure to select **Production**, **Preview**, and **Development** for each variable.

5. **Deploy**
   - Click **Deploy**
   - Wait 2-3 minutes for the build to complete
   - You'll get a live URL like: `https://leyla-apothecary-mvp-xxxx.vercel.app`

6. **Update App URL**
   - After deployment, go to **Settings** > **Environment Variables**
   - Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
   - Redeploy (Vercel will auto-redeploy, or you can push a new commit)

7. **Enable Automatic Deployments**
   - Already configured! Every push to `main` branch will auto-deploy
   - Preview deployments are created for every pull request

### 6. Configure Supabase for Production

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**

2. Add your Vercel URL to **Site URL**:
   ```
   https://your-app-url.vercel.app
   ```

3. Add to **Redirect URLs**:
   ```
   https://your-app-url.vercel.app/**
   http://localhost:3000/**
   ```

4. Click **Save**

## 🔐 Security Checklist

- [x] `.env.local` is in `.gitignore` (already configured)
- [ ] Service role key is added to Vercel (do not share publicly)
- [ ] Redirect URLs configured in Supabase
- [ ] Row Level Security (RLS) is enabled on all tables (already done in migration)

## 📊 What's Included in the Database

### Tables Created:
- **profiles** - User accounts and health information
- **products** - Herbal tinctures catalog (23 pre-loaded)
- **compounds** - Custom herbal formulations
- **orders** - Purchase records
- **order_items** - Individual items in orders
- **bookings** - Consultation appointments
- **health_assessments** - User health questionnaires
- **newsletter_subscribers** - Email list

### Sample Data:
- ✅ 20 individual herbal tinctures across 9 categories
- ✅ 3 pre-made compound protocols (Tier 1)
- ✅ All products include detailed descriptions, benefits, dosage, and contraindications

## 🧪 Testing the Setup

### Test Database Connection:

1. Start your local server: `npm run dev`
2. Open browser console (F12)
3. Try to fetch products (we'll add this feature next)

### Test Vercel Deployment:

1. Visit your Vercel URL
2. You should see the homepage
3. Check that there are no errors in the browser console

## 📝 Next Development Steps

Now that infrastructure is set up, you're ready to build features:

1. **Product Catalog Page** - Display all herbal tinctures
2. **Product Detail Page** - Individual product information
3. **Shopping Cart** - Add to cart functionality
4. **Authentication** - Sign up/login with Supabase Auth
5. **Checkout Flow** - Stripe payment integration
6. **Booking System** - Consultation scheduling
7. **Compound Builder** - Custom formulation tool

## 🆘 Troubleshooting

### Migration Fails
- Make sure you copied the ENTIRE SQL file
- Check for any syntax errors in the SQL editor
- Verify you have the correct project URL

### Build Fails on Vercel
- Check the build logs in Vercel dashboard
- Verify all environment variables are set correctly
- Make sure `NEXT_PUBLIC_` prefix is on public variables

### Can't Connect to Supabase
- Verify URLs and keys in `.env.local`
- Check that RLS policies are set up (already done in migration)
- Try accessing Supabase directly in browser

### Local Development Issues
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and restart: `rm -rf .next && npm run dev`
- Check that port 3000 is not already in use

## 📞 Need Help?

If you encounter any issues:
1. Check the Vercel deployment logs
2. Check the browser console for errors
3. Verify Supabase connection in the Supabase dashboard
4. Check this README for troubleshooting steps

---

**You're all set!** 🎉 Once you complete these steps, your infrastructure will be fully operational.
