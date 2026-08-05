# Pets Social

A Next.js 14 (App Router + TypeScript + Tailwind) social app for pet photos and
videos, backed by Supabase for auth, database, and storage.

## Stack

- Next.js 14, App Router, TypeScript, Tailwind CSS
- Supabase: Postgres database, email/password auth, storage bucket for media
- `@supabase/ssr` for cookie-based auth across Server Components, Server
  Actions, and middleware

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). It
   creates the `profiles`, `posts`, `likes`, and `comments` tables with row
   level security policies, a trigger that creates a profile on sign-up, and
   a public `post-media` storage bucket for images/videos.
3. In **Project Settings → API**, copy the Project URL and `anon` public key.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NEXT_PUBLIC_SITE_URL` is used to build the email-confirmation redirect link;
set it to your production URL when deploying.

If your Supabase project has "Confirm email" enabled (default), sign-up links
users must click will redirect to `/auth/callback`, which exchanges the code
for a session. You can disable email confirmation in **Authentication →
Providers → Email** for faster local testing.

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Signed-out users are
redirected to `/login`, where they can sign up or log in. Signed-in users see
a feed, can upload an image/video with a caption, like posts, and comment.

## Project structure

```
src/
  app/
    page.tsx              feed (list posts, create post)
    actions.ts             server actions: createPost, toggleLike, addComment
    login/                 sign-up / login page + server actions
    auth/callback/         email-confirmation redirect handler
    auth/sign-out/         sign-out route handler
  middleware.ts             refreshes the Supabase session on every request
  utils/supabase/           browser / server / middleware Supabase clients
  types/database.ts         hand-written types matching schema.sql
supabase/schema.sql          Postgres schema, RLS policies, storage bucket
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the environment variables from step 2 (use your production URL for
   `NEXT_PUBLIC_SITE_URL`) in the Vercel project settings.
4. In Supabase, add your Vercel deployment URL to **Authentication → URL
   Configuration → Redirect URLs** (e.g. `https://your-app.vercel.app/auth/callback`).
5. Deploy. No further configuration is needed — the app has no server-only
   secrets beyond the two public Supabase keys, which are safe to expose
   client-side (access is enforced by RLS policies).
