# Visual Repository Manager

A stunning, Crystal White UI web application for visually managing all your GitHub repositories and their deployments across Vercel, GitHub Pages, Netlify, and custom domains. 

Built with Next.js App Router, Tailwind CSS, shadcn/ui, Prisma, and PostgreSQL.

## Features

- **Crystal White UI:** A modern, glassmorphism-inspired design with high contrast, crisp blue accents, and responsive layouts.
- **GitHub Sync:** Automatically imports all your GitHub repositories.
- **Website Auto-Detection:** Automatically discovers the deployment URLs for each repository.
- **Live Previews & Thumbnails:** Extracts metadata and images to present a beautiful, clear grid of your projects.
- **Dashboard Management:** Search, filter, switch between Grid and List views.
- **Background Cron Checks:** Automatically pings websites periodically to ensure they are LIVE.
- **Copy Link & Quick Preview:** Expand a card instantly or copy its link with one click.
- **Secure & Optimized:** SSRF protection for metadata fetching, properly constrained NextAuth, and prepared for Vercel Serverless deployments.

## Prerequisites

- Node.js 18.x or later
- A PostgreSQL Database (Neon DB, Supabase, or Vercel Postgres recommended)
- GitHub Account (for creating an OAuth App)
- Vercel Account (for deployment)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the sample environment file:

```bash
cp .env.example .env.local
```

Fill in the required variables:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `AUTH_SECRET`: Generate one using `npx auth secret` or `openssl rand -hex 32`.
- `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET`: Create an OAuth App in GitHub Settings > Developer settings > OAuth Apps. The callback URL should be `http://localhost:3000/api/auth/callback/github` (or your production URL).
- `CRON_SECRET`: A secure string used to protect the cron endpoint.

### 3. Database Migration & Seeding

Since Prisma is used, apply the schema to your database:

```bash
npx prisma db push
# or npx prisma migrate dev
```

To populate the development database with a sample card ("STARTER VIP LEOENGLISH"):

```bash
npm run prisma seed
```

### 4. Running Locally

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000`. You will be prompted to sign in with GitHub. Once authenticated, you can sync your repositories.

## Deployment to Vercel

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Vercel will automatically detect the Next.js framework.
4. Add the required Environment Variables in the Vercel Dashboard.
5. If you are using **Vercel Postgres**, link the database and its environment variables will be injected automatically (make sure Prisma uses `POSTGRES_PRISMA_URL` in `schema.prisma` if needed, or map it to `DATABASE_URL`).
6. Deploy.

The Vercel Cron is already configured via `vercel.json` and will run the website status checker automatically once per hour.

## Project Structure

- `src/app/api`: Next.js Route Handlers (Auth, GitHub Sync, Metadata Fetching, Cron).
- `src/components/dashboard`: Core UI components (DashboardClient, RepositoryCard, QuickPreviewModal).
- `src/components/ui`: shadcn/ui and basic components.
- `src/lib`: Database and utilities.
- `prisma/`: Database schema and seed script.

## Technical Assumptions

- **Authentication:** For MVP, any user who authenticates via GitHub will see the same dashboard if the DB is shared, or you can constrain the `findMany` queries by user ID if you expand it for multiple users.
- **Screenshot Provider:** Currently, it extracts the `og:image` or uses a beautiful fallback placeholder. In a production Vercel environment, running Puppeteer is heavy and error-prone due to size limits. It is highly recommended to integrate an API like `ScreenshotOne` or `Urlbox` in the `website-preview` API if `og:image` is missing.
- **Database:** Prisma `upsert` handles duplicate records efficiently when syncing from GitHub.
