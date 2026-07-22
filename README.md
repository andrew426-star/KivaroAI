# Kivaro AI — Website

AI Automation & Intelligence for Institutional Investment Firms — hedge funds, investment banks, private equity, and venture capital.  
Live at [kivaroai.com](https://kivaroai.com).

## Tech Stack

- **React 18** + TypeScript + Vite
- **Tailwind CSS** + shadcn/ui
- **Framer Motion** animations
- **Supabase** — auth, form submissions, analytics
- **React Router v6** — client-side routing

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your Supabase credentials
cp .env.example .env

# 3. Start dev server
npm run dev
```

## Deployment

This project deploys to Vercel from GitHub. Every push to `main` triggers an automatic deploy.

**Environment variables** required in Vercel project settings:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in **Supabase → SQL Editor**:
   - `supabase/migrations/20250505000000_analytics.sql`
   - `supabase/migrations/20250505000001_submissions.sql`
3. Deploy the edge function: `supabase functions deploy submit-inquiry`
4. Set edge function secrets in Supabase Dashboard → Edge Functions → Secrets:
   - `RESEND_API_KEY` — for email notifications
   - `N8N_WEBHOOK_URL` — optional, forwards submissions to n8n

## Project Structure

```
src/
  components/
    admin/      # Admin dashboard tabs
    features/   # Animated UI components
    layout/     # Header, Footer, Layout
    ui/         # shadcn/ui primitives
  constants/    # Site config, nav links, mock data
  hooks/        # useAuth, usePageMeta, etc.
  pages/        # Home, Services, About, Process, Contact, Admin
  lib/          # Supabase client, utils
supabase/
  functions/    # Edge functions (submit-inquiry)
  migrations/   # SQL migrations
```
