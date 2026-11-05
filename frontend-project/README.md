# GOSAWA LTD

GOSAWA LTD is a React and Vite application for connecting TVET students and job seekers with employers, internships, training, and employment opportunities.

## Development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend origin (without `/api`). For local development, use `http://localhost:5000`; in production, use the deployed API origin such as `https://api.gosawa.org`.
3. Start the development server with `npm run dev`.

The frontend adds `/api` to this URL automatically. For a live deployment, configure the same origin as `VITE_API_URL` in the frontend hosting environment and add the frontend origin to the backend's `CLIENT_URL`.

## Checks

- Run `npm run lint` to check the frontend source.
- Run `npm run build` to create the production build in `dist`.
