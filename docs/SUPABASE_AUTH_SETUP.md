# Supabase Auth Production Setup

Use this checklist whenever we point authentication emails at a new deployment (e.g., Vercel production):

## 1. Update the Site URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard), open the `ivpsqihvuipnzjpghdaa` project.
2. Navigate to **Authentication → URL Configuration**.
3. Set **Site URL** to `https://leylas-apothecary-mvp.vercel.app`.
4. Optional: add any preview URLs (e.g., `https://leylas-apothecary-mvp-git-feature-user.vercel.app`) if you want emails to work on preview deployments.
5. Click **Save**.

> Why: Magic-link emails and OAuth redirects always use the Site URL. Leaving it at `http://localhost:3000` forces users onto a dead link, and Supabase marks the token as expired when it cannot complete the flow.

## 2. Configure Redirect URLs

Still under **Authentication → URL Configuration**, use the **Redirect URLs** list to add:

- `https://leylas-apothecary-mvp.vercel.app/*`
- `https://leylas-apothecary-mvp.vercel.app/api/auth/*`
- `http://localhost:3000/*` (keep this for local development)

Add any other preview domains you actively use. Supabase only allows redirects to the URLs in this list; missing entries trigger `error=access_denied&error_code=otp_expired` on confirmation.

## 3. Sync Environment Variables

Run one of the following so Vercel knows the deployed hostname:

```bash
# Fastest: push the value via CLI (requires `npx vercel login`)
echo "https://leylas-apothecary-mvp.vercel.app" | \
  npx vercel env add NEXT_PUBLIC_APP_URL production
echo "https://leylas-apothecary-mvp.vercel.app/api" | \
  npx vercel env add NEXT_PUBLIC_API_URL production
```

Or set them manually in the Vercel dashboard (Project → Settings → Environment Variables). Redeploy afterward so the new values land in the build.

## 4. Verify

1. Trigger a fresh deployment (`git push origin main`).
2. Visit the production site and request a login link using one of the admin emails (`ivan2san@gmail.com` or `ivan@culturecrunch.io`).
3. Open the email and confirm that the link opens on `https://leylas-apothecary-mvp.vercel.app` and completes the session without the `otp_expired` error.

Document the completion in `COMPLETION_SUMMARY.md` (Production checklist) so we know the environment has been fully configured.
