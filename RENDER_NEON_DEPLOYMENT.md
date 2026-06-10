# AfriAds Render + Neon Deployment

This setup deploys the AfriAds backend as a Render web service and uses Neon for Postgres.

## 1. Create Neon Postgres

1. Go to https://neon.com and create a free project.
2. Copy the pooled or direct Postgres connection string.
3. In the Neon SQL editor, run:

```sql
-- First run the base schema
```

Paste and run the contents of `backend/database_schema.sql`.

Then run the contents of:

```txt
backend/migrations/001_add_missing_tables.sql
```

## 2. Deploy Backend on Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint from the repository.
3. Render will read `render.yaml` and create the `afriads-backend` web service.
4. Set the required secret environment variables.

Required Render environment variables:

```env
DATABASE_URL=postgresql://...
BASE_URL=https://your-render-service.onrender.com
FRONTEND_BASE_URL=https://your-frontend-url
MPESA_CONSUMER_KEY=your_sandbox_key
MPESA_CONSUMER_SECRET=your_sandbox_secret
MPESA_PASSKEY=your_sandbox_passkey
MPESA_CALLBACK_URL=https://your-render-service.onrender.com/api/payments/mpesa/callback
```

Render will generate:

```env
JWT_SECRET
JWT_REFRESH_SECRET
```

## 3. Verify Backend

Open:

```txt
https://your-render-service.onrender.com/health
https://your-render-service.onrender.com/api/test-db
https://your-render-service.onrender.com/ad-widget.js
```

Expected:

- `/health` returns `status: ok`
- `/api/test-db` returns `success: true`
- `/ad-widget.js` returns the widget JavaScript

## 4. Connect Fentech Website

In the Fentech Vercel project, set:

```env
NEXT_PUBLIC_AFRIADS_WIDGET_URL=https://your-render-service.onrender.com/ad-widget.js
```

Redeploy Fentech after setting the environment variable.

## 5. Free Tier Notes

Render free services can sleep when idle. The first ad request after inactivity may be slow. This is acceptable for sandbox and demos, but upgrade the Render service before serving production ad traffic.
