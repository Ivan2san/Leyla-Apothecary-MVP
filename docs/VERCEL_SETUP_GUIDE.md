# Vercel Deployment Setup Guide

## Problem: GitHub Account Mismatch

**Issue:** Vercel is trying to connect to `ivan-ai-san` but your repository is owned by `Ivan2san`.

## Solution Steps

### Step 1: Fix GitHub Account in Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Disconnect the wrong account:**
   - Go to https://vercel.com/account
   - Click on **"Connected Accounts"** in the left sidebar
   - Find **GitHub** section
   - If `ivan-ai-san` is connected, click **"Disconnect"**

2. **Connect the correct account:**
   - Still in Connected Accounts, click **"Connect"** next to GitHub
   - Authorize the `Ivan2san` GitHub account
   - Grant access to the `Leyla-Apothecary-MVP` repository

3. **Reconnect your project:**
   - Go to your project: https://vercel.com/culturecrunch/leylas-apothecary-mvp
   - Navigate to **Settings → Git**
   - If a repository is currently connected, click **"Disconnect"**
   - Click **"Connect Git Repository"**
   - Select: **`Ivan2san/Leyla-Apothecary-MVP`**
   - Set Production Branch: **`main`**
   - Click **"Connect"**

#### Option B: Create New Project (Alternative)

If the above doesn't work:

1. Go to https://vercel.com/new
2. Import from the correct GitHub account (`Ivan2san`)
3. Select `Leyla-Apothecary-MVP` repository
4. Configure:
   - Project Name: `leylas-apothecary-mvp`
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **Don't deploy yet** - add environment variables first

---

### Step 2: Add Environment Variables

You need to add all environment variables from your `.env.local` file to Vercel.

#### Method 1: Using PowerShell Script (Fastest)

```powershell
# Run this in PowerShell
cd C:\Users\Ivan\source\repos\Leyla-Apothecary-MVP
.\scripts\setup-vercel-env.ps1
```

This will automatically read from `.env.local` and add all variables to Vercel.

#### Method 2: Using Bash Script

```bash
# Run this in Git Bash or WSL
bash scripts/setup-vercel-env.sh
```

#### Method 3: Manual via Vercel Dashboard

1. Go to: https://vercel.com/culturecrunch/leylas-apothecary-mvp/settings/environment-variables

2. Click **"Add New"** for each variable:

   **Required Variables:**

   | Variable Name | Environment | Value Source |
   |--------------|-------------|--------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | From .env.local |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | From .env.local |
   | `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development | From .env.local |
   | `ADMIN_EMAIL` | Production, Preview, Development | Admin Supabase email |
   | `E2E_ADMIN_EMAIL` | (Optional) QA environments only | Admin login for Playwright |
   | `E2E_ADMIN_PASSWORD` | (Optional) QA environments only | Admin password for Playwright |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production, Preview, Development | From .env.local |
   | `STRIPE_SECRET_KEY` | Production only | From .env.local |
   | `STRIPE_WEBHOOK_SECRET` | Production only | From .env.local |
   | `NEXT_PUBLIC_APP_URL` | Production | Your Vercel domain |
   | `NEXT_PUBLIC_API_URL` | Production | Your Vercel domain + /api |
   | `RESEND_API_KEY` | Production, Preview, Development | From .env.local |
   | `EMAIL_FROM` | Production, Preview, Development | From .env.local |

   **Optional Variables:**

   | Variable Name | Environment | Value Source |
   |--------------|-------------|--------------|
   | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Production | Google Analytics |
   | `NEXT_PUBLIC_MIXPANEL_TOKEN` | Production | Mixpanel |
   | `CAL_COM_API_KEY` | Production | Cal.com |

3. For `NEXT_PUBLIC_APP_URL` in Production:
   - Use your Vercel domain (e.g., `https://leylas-apothecary-mvp.vercel.app`)
   - Or your custom domain if you have one

4. For `NEXT_PUBLIC_API_URL` in Production:
   - Use your Vercel domain + /api (e.g., `https://leylas-apothecary-mvp.vercel.app/api`)

#### Method 4: Using Vercel CLI (One by one)

```bash
# Add each variable to production
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste value when prompted

# Add to preview
npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview
# Paste value when prompted

# Add to development
npx vercel env add NEXT_PUBLIC_SUPABASE_URL development
# Paste value when prompted

# Repeat for all variables...
```

---

### Step 3: Test Deployment

#### Option A: Manual Deployment Test

1. Go to Vercel Dashboard → Your Project → **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Watch the build logs
4. Ensure all environment variables are loaded
5. Check for any build errors

#### Option B: Trigger via Git Push

```bash
# Make a small change to trigger deployment
git commit --allow-empty -m "Test Vercel auto-deployment"
git push origin main
```

Watch the Vercel dashboard - you should see:
- A new deployment appear within 10-30 seconds
- Status: Queued → Building → Deploying → Ready
- Build logs showing successful compilation

---

### Step 4: Verify Auto-Deployment Works

1. **Check deployment status:**
   - Go to https://vercel.com/culturecrunch/leylas-apothecary-mvp
   - Look for the latest deployment
   - Status should be "Ready" with a green checkmark

2. **Test the deployed site:**
   - Click on the deployment URL
   - Navigate through your pages
   - Check that environment variables are working:
     - Supabase connection works (authentication)
     - Stripe integration loads
     - Images display correctly

3. **Test auto-deployment:**
   - Make a small change to any file
   - Commit and push to `main`
   - Vercel should automatically start a new deployment
   - You'll receive a notification email/Slack (if configured)

---

### Step 5: Configure Webhook Secret for Stripe (Important!)

After deployment, you need to update the Stripe webhook secret:

1. **Get your Vercel deployment URL:**
   - Copy your production URL (e.g., `https://leylas-apothecary-mvp.vercel.app`)

2. **Create Stripe webhook:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click **"Add endpoint"**
   - Endpoint URL: `https://your-vercel-domain.vercel.app/api/webhooks/stripe`
   - Select events to listen for:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Click **"Add endpoint"**

3. **Copy webhook signing secret:**
   - After creating the webhook, click on it
   - Click **"Reveal"** next to Signing secret
   - Copy the secret (starts with `whsec_`)

4. **Update Vercel environment variable:**
   - Go to Vercel → Settings → Environment Variables
   - Find `STRIPE_WEBHOOK_SECRET`
   - Update with the new webhook signing secret
   - Save changes

5. **Redeploy:**
   - Go to Deployments tab
   - Click **"Redeploy"** to apply the new webhook secret

---

## Troubleshooting

### Issue: "Failed to connect repository"

**Solution:**
- Make sure you've authorized Vercel to access the `Ivan2san` GitHub account
- Check that the repository is not already connected to another Vercel project
- Try disconnecting and reconnecting the GitHub integration

### Issue: "Build failed: Missing environment variables"

**Solution:**
- Check Vercel Dashboard → Settings → Environment Variables
- Ensure all required variables are added
- Make sure they're enabled for the correct environment (Production/Preview/Development)
- Redeploy after adding variables

### Issue: "Deployment succeeded but site shows errors"

**Solution:**
1. Check browser console for errors
2. Check Vercel Function logs: Vercel Dashboard → Your Project → Logs
3. Common issues:
   - Wrong `NEXT_PUBLIC_APP_URL` (should match your Vercel domain)
   - Missing Supabase configuration
   - Incorrect Stripe keys (test vs production)

### Issue: "Auto-deployment not triggering"

**Solution:**
1. Verify Git integration is properly connected
2. Check that auto-deploy is enabled:
   - Settings → Git → Auto-deploy: Enabled
3. Make sure you're pushing to the correct branch (`main`)
4. Check GitHub webhook delivery:
   - GitHub → Repo Settings → Webhooks
   - Look for Vercel webhook
   - Check recent deliveries for errors

---

## Verification Checklist

After completing all steps, verify:

- [ ] Correct GitHub account (`Ivan2san`) is connected to Vercel
- [ ] Repository `Leyla-Apothecary-MVP` is linked to Vercel project
- [ ] Production branch is set to `main`
- [ ] All required environment variables are added
- [ ] Production deployment is successful
- [ ] Deployed site is accessible and functional
- [ ] Auto-deployment triggers on `git push origin main`
- [ ] Stripe webhook is configured with correct URL
- [ ] Build logs show no errors or warnings

---

## Quick Commands Reference

```bash
# Check Vercel authentication
npx vercel whoami

# List environment variables
npx vercel env ls

# Pull environment variables to local
npx vercel env pull

# Trigger deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main

# Check deployment status
npx vercel ls

# View deployment logs
npx vercel logs [deployment-url]
```

---

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **GitHub Integration Guide:** https://vercel.com/docs/git/vercel-for-github
- **Environment Variables:** https://vercel.com/docs/projects/environment-variables
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs

---

## Need Help?

If you're still having issues:

1. Check Vercel Status: https://www.vercel-status.com/
2. Contact Vercel Support: https://vercel.com/support
3. Check project build logs for specific errors
4. Review this guide's troubleshooting section

---

*Last Updated: November 13, 2025*
*Project: Leyla's Apothecary MVP*
*Vercel Project ID: prj_puMVYSJamEtbgFwUdFCwysWlOAkO*
