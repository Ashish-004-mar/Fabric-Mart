# FabricMart B2B Textile Platform — Vercel Production Deployment Guide

This guide details step-by-step instructions for deploying the **FabricMart B2B Marketplace** to **Vercel**, including configuring third-party APIs (HuggingFace, Cloudinary, Pexels, Gemini) and connecting a production **PostgreSQL** database instance (such as Supabase, Neon, or AWS RDS).

---

## 1. Prerequisites & Environment Variables Checklist

Before initiating deployment, gather the required credentials and API keys:

### Environment Variables Matrix

| Variable Name | Description | Example / Format |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini AI key for FM Copilot & textile search | `AIzaSy...` |
| `HUGGINGFACE_API_KEY` | Hugging Face API key for AI textile vision & classification | `hf_...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud account name | `fabricmart-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `a1b2c3d4e5f6...` |
| `PEXELS_API_KEY` | Pexels API key for high-resolution textile photography | `563492ad6f91700001000001...` |
| `DATABASE_URL` | PostgreSQL connection URL with SSL mode | `postgres://user:password@ep-abc.region.aws.neon.tech/neondb?sslmode=require` |
| `VITE_APP_URL` | Public app origin for CORS & Webhook redirects | `https://fabricmart.vercel.app` |

---

## 2. PostgreSQL Production Database Setup

FabricMart supports PostgreSQL for persistent B2B orders, mill profiles, fabric SKUs, and user accounts.

### Step 2.1: Provision a Cloud PostgreSQL Instance
1. Create a database on [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com).
2. Copy your pooled connection string (`DATABASE_URL`), ensuring `?sslmode=require` is appended.

### Step 2.2: Run Database Schema Migrations
In your local workspace or via CI/CD deployment pipeline:

```bash
# Apply Drizzle ORM PostgreSQL migrations
npm run db:push
```

---

## 3. Vercel Project Configuration

### Step 3.1: Create `vercel.json` (Included in Root)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 3.2: Deploy via Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link project and deploy preview:
   ```bash
   vercel
   ```

3. Deploy to Production:
   ```bash
   vercel --prod
   ```

### Step 3.3: Deploy via Vercel Web Dashboard (GitHub Integration)

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and select **Import Project**.
3. Choose your repository.
4. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Expand **Environment Variables** and add all entries from the checklist above.
6. Click **Deploy**.

---

## 4. Verifying Third-Party Services Integration

### HuggingFace API Verification
- Ensure `HUGGINGFACE_API_KEY` is set.
- Test endpoint `/api/ai/classify-textile` to verify image classification responses.

### Cloudinary Textile Asset Storage
- High-resolution fabric images fetched via Pexels service layer will automatically be converted to optimized web formats (`f_auto,q_auto,w_1200`) and stored in Cloudinary folder `fabric_mart_catalog`.

### Pexels API Service
- Automated background sync fetches textile photography matching category keywords (e.g. `silk`, `egyptian cotton`, `linen`, `denim`) and updates database product images dynamically.

---

## 5. Post-Deployment Troubleshooting

- **CORS / API 404 Errors**: Ensure API routes are properly routed in `server.ts` or Vercel serverless functions (`/api/*`).
- **Database Connection Timeout**: Use connection pooling URL (`pgbouncer` or Neon pooler) for serverless execution.
- **WebGL / 3D Canvas Rendering**: Ensure browser supports WebGL 2.0; automatic 2D fallback graphics engage seamlessly if WebGL is unavailable.
