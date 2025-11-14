# How to Change GitHub Account from ivan-ai-san to Ivan2san

## The Problem
Vercel is connected to the wrong GitHub account (`ivan-ai-san`) and you need to connect `Ivan2san` instead.

## Solution: Use GitHub's Vercel App Installation Settings

Since you can't change it directly in Vercel, you need to manage it from **GitHub's side**:

### Method 1: Via GitHub (Recommended)

1. **Go to GitHub Settings (for ivan-ai-san account):**
   - Log into GitHub as `ivan-ai-san`
   - Go to: https://github.com/settings/installations
   - Find **"Vercel"** in the list of installed apps
   - Click **"Configure"**

2. **Remove Vercel access from ivan-ai-san:**
   - Scroll down to the **"Uninstall"** section
   - Click **"Uninstall"** to remove Vercel from this account
   - Confirm the uninstallation

3. **Switch to Ivan2san GitHub account:**
   - Log out of `ivan-ai-san`
   - Log into `Ivan2san` GitHub account

4. **Install Vercel on Ivan2san account:**
   - Go to: https://github.com/apps/vercel
   - Click **"Install"** or **"Configure"**
   - Select which repositories to grant access:
     - Choose **"Only select repositories"**
     - Select: **`Leyla-Apothecary-MVP`**
   - Click **"Install"**

5. **Back to Vercel - Connect the Repository:**
   - Go to: https://vercel.com/ivans-projects-40600ee2/leylas-apothecary-mvp
   - Go to **Settings → Git**
   - If any repo is connected, click **"Disconnect"**
   - Click **"Connect Git Repository"**
   - You should now see repositories from `Ivan2san` account
   - Select: **`Ivan2san/Leyla-Apothecary-MVP`**
   - Production Branch: **`main`**
   - Click **"Connect"**

---

### Method 2: Via Vercel Dashboard (Alternative)

If Method 1 doesn't work, try this:

1. **Go to Vercel Account Settings:**
   - Visit: https://vercel.com/account
   - Click on **"Connected Accounts"** in the left sidebar

2. **Manage GitHub Connection:**
   - Find the **GitHub** section
   - Click **"Manage"** or **"Configure"**
   - This will open GitHub's authorization page

3. **On the GitHub Authorization Page:**
   - Look for **"Organization access"** section
   - You should see both `ivan-ai-san` and `Ivan2san`
   - **Grant** access to `Ivan2san`
   - **Revoke** access from `ivan-ai-san` (if possible)
   - Click **"Authorize"** or **"Update"**

4. **Reconnect Your Project:**
   - Go back to: https://vercel.com/ivans-projects-40600ee2/leylas-apothecary-mvp
   - Settings → Git → Connect Git Repository
   - Select: `Ivan2san/Leyla-Apothecary-MVP`

---

### Method 3: Create New Project (Last Resort)

If the above methods don't work:

1. **Delete the current Vercel project:**
   - Go to: https://vercel.com/ivans-projects-40600ee2/leylas-apothecary-mvp/settings
   - Scroll to **"Delete Project"** at the bottom
   - Confirm deletion

2. **Create a new project with correct account:**
   - Go to: https://vercel.com/new
   - Make sure you're logged into Vercel with the account that has access to `Ivan2san` GitHub
   - Import from GitHub
   - You should now see repositories from `Ivan2san`
   - Select: `Leyla-Apothecary-MVP`
   - Configure:
     - Project Name: `leylas-apothecary-mvp`
     - Framework: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - **DON'T CLICK DEPLOY YET** - Add environment variables first!

3. **Add Environment Variables:**
   - Before deploying, add all env vars from `.env.local`
   - See the main VERCEL_SETUP_GUIDE.md for the full list

4. **Deploy:**
   - Click **"Deploy"**
   - Watch the build process

---

## Quick Check: Which Account is Currently Connected?

Run this to see your current Vercel configuration:

```bash
npx vercel whoami
```

To see which GitHub account Vercel is trying to use, check:
- Vercel Dashboard → Your Project → Settings → Git
- Look at the "Connected Git Repository" section

---

## After Connecting the Correct Account

Once `Ivan2san` is connected:

1. **Verify the connection:**
   - Go to: https://vercel.com/ivans-projects-40600ee2/leylas-apothecary-mvp/settings/git
   - Should show: `Ivan2san/Leyla-Apothecary-MVP`
   - Production Branch: `main`

2. **Add Environment Variables:**
   - Run the PowerShell script:
     ```powershell
     .\scripts\setup-vercel-env.ps1
     ```
   - Or add them manually in Settings → Environment Variables

3. **Test Deployment:**
   ```bash
   git commit --allow-empty -m "Test Vercel deployment with correct GitHub account"
   git push origin main
   ```

4. **Watch Vercel Dashboard:**
   - Should see a new deployment start within 10-30 seconds
   - Status: Queued → Building → Ready

---

## Troubleshooting

### Issue: "Can't see Ivan2san repositories in Vercel"

**Solution:**
- Make sure Vercel app is installed on the `Ivan2san` GitHub account
- Go to: https://github.com/settings/installations (while logged in as Ivan2san)
- Verify Vercel is listed
- If not, install it: https://github.com/apps/vercel

### Issue: "Repository already connected to another project"

**Solution:**
- The repo might be connected to your old `culturecrunch` project
- Go to that project and disconnect it first
- Or delete the old project entirely
- Then reconnect to your new project

### Issue: "Vercel keeps using ivan-ai-san"

**Solution:**
- Clear browser cache and cookies for vercel.com
- Log out of Vercel completely
- Log out of all GitHub accounts
- Log into GitHub as `Ivan2san` first
- Then log into Vercel
- Try connecting the repository again

---

## Need More Help?

If you're still stuck:

1. **Check GitHub App Installation:**
   - https://github.com/settings/installations (as Ivan2san)
   - Ensure Vercel app is installed with access to `Leyla-Apothecary-MVP`

2. **Check Vercel Connected Accounts:**
   - https://vercel.com/account
   - Verify GitHub is connected to the correct account

3. **Contact Vercel Support:**
   - Go to: https://vercel.com/help
   - Explain you need to change GitHub account connection from one account to another

---

*Project: Leyla's Apothecary MVP*
*New Team URL: vercel.com/ivans-projects-40600ee2*
*Target GitHub: Ivan2san/Leyla-Apothecary-MVP*
