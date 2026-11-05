# GOSAWA LTD

GOSAWA LTD is a React and Vite application for connecting TVET students and job seekers with employers, internships, training, and employment opportunities.

## Development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend origin (without `/api`). For local development, use `http://localhost:5000`; the production API is `https://gosawa-company-ltd.onrender.com`.
3. Start the development server with `npm run dev`.

The frontend adds `/api` to this URL automatically. For the live Render deployment, set `VITE_API_URL` to `https://gosawa-company-ltd.onrender.com` in the frontend service and set the frontend origin in the backend's `CLIENT_URL`. Redeploy the frontend after changing `VITE_API_URL`.

The `public/_redirects` file rewrites frontend routes such as `/register` to `index.html` on Render Static Sites. Keep it in place so direct links and browser refreshes work.

## Checks

- Run `npm run lint` to check the frontend source.
- Run `npm run build` to create the production build in `dist`.
