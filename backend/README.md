# GOSAWA Backend

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set database credentials, an unpredictable `JWT_SECRET` of at least 32 characters, and the allowed frontend origin in `CLIENT_URL`.
3. Run `npm run migrate` to create missing tables and record the baseline migration. Existing tables are left in place.
4. Start the API with `npm start`.

`CLIENT_URL` and `FRONTEND_URL` may contain comma-separated origins when the frontend is deployed to more than one trusted origin. The server allows these origins as well as `localhost:3000` and `localhost:5173`. For cross-site production cookies, set `COOKIE_SAME_SITE=none` and serve the API and frontend over HTTPS.

For an Aiven production database, provide its CA certificate using `DB_CA_CERT` or `DB_CA_PATH`. Railway's private MySQL service does not require the ignored local `ca.pem` file.

Set `FRONTEND_URL` to the public frontend origin. SMTP settings are used only for password-reset emails; registration does not send email. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `EMAIL_USER`, and `EMAIL_PASS` on the host to enable account recovery.

## Admin account

Set `ADMIN_EMAIL`, `EMAIL_USER`, and `EMAIL_PASS` in `.env`, then run `npm run create-admin`. The command creates an admin only if none exists for that email and sends a one-time password setup link. It never prints or stores an initial usable password.

## Tests

Run backend unit tests with `npm test`.

## Deploy to Render with Aiven MySQL

The frontend and API are separate Render services:

- Frontend: `https://gosawa-company-ltd2.onrender.com`
- API: `https://gosawa-company-ltd.onrender.com`

### API web service

Create or update a Render **Web Service** connected to this repository:

1. Set the root directory to `backend`.
2. Set the build command to `npm ci` and the start command to `npm start`.
3. Set the health check path to `/health`.
4. Add these environment variables in Render. Use the current values from Aiven's service connection information for the database variables; never commit them to the repository.

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://gosawa-company-ltd2.onrender.com` |
| `FRONTEND_URL` | `https://gosawa-company-ltd2.onrender.com` |
| `COOKIE_SAME_SITE` | `none` |
| `JWT_SECRET` | A new, randomly generated secret with at least 32 characters |
| `DB_HOST` | Aiven MySQL host |
| `DB_PORT` | Aiven MySQL port |
| `DB_USER` | Aiven MySQL user |
| `DB_PASSWORD` | Aiven MySQL password |
| `DB_NAME` | Aiven MySQL database name |

`backend/ca.pem` is included in this repository and is loaded automatically for production connections. If using a different Aiven CA, set `DB_CA_CERT` to the PEM certificate contents or set `DB_CA_PATH` to its deployed file path.

After setting the database variables, run `npm run migrate` once from the API service's shell (or another trusted environment with the same database variables) to create/update the schema. Do not run `npm run create-admin` on every deployment; it is a one-time setup and requires `ADMIN_EMAIL`, `EMAIL_USER`, and `EMAIL_PASS`.

Password reset and admin setup emails are optional. To enable them, configure `EMAIL_USER`, `EMAIL_PASS` (use a Gmail App Password, not your normal account password), and `SMTP_HOST`, `SMTP_PORT`, and `SMTP_SECURE` in Render.

### Frontend static site

Create or update a Render **Static Site** connected to the same repository:

1. Set the root directory to `frontend-project`.
2. Set the build command to `npm ci && npm run build`.
3. Set the publish directory to `dist`.
4. Add `VITE_API_URL=https://gosawa-company-ltd.onrender.com`.
5. Add a rewrite from `/*` to `/index.html` with status `200` so client-side routes work when opened directly.
6. Deploy the site again after changing the build environment variable.

### Verify the deployment

Open `https://gosawa-company-ltd.onrender.com/health`. A healthy service returns `{"success":true,"status":"healthy"}`. Then check `https://gosawa-company-ltd.onrender.com/api/companies` and `https://gosawa-company-ltd.onrender.com/api/seeker/opportunities`. If health returns `503`, check the API service logs, Aiven connection details, and CA certificate. If the browser reports a CORS error, confirm `CLIENT_URL` matches the frontend URL exactly, including `https://` and without a trailing slash.

## API endpoints

The API is mounted at `/api`. On Render, the base URL is `https://gosawa-company-ltd.onrender.com`.

| Method | Path | Access |
| --- | --- | --- |
| GET | `/` | Public service status |
| GET | `/health` | Public API and database health |
| POST | `/api/auth/register` | Public seeker registration |
| POST | `/api/auth/login` | Public login; sets a session cookie |
| POST | `/api/auth/logout` | Public; clears the session cookie |
| GET | `/api/auth/me` | Signed in |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| POST | `/api/employer/register` | Public employer registration |
| GET | `/api/companies` | Public approved companies |
| GET | `/api/seeker/opportunities` | Public approved opportunities |
| GET | `/api/seeker/me` | Seeker session |
| GET, POST | `/api/seeker/applications` | Seeker session |
| GET, POST | `/api/employer/opportunities` | Approved employer session |
| GET | `/api/employer/me` | Employer session |
| GET | `/api/employer/applications` | Employer session |
| PATCH | `/api/employer/applications/:id/status` | Employer session |
| POST | `/api/employer/admin-messages` | Employer session |
| GET | `/api/admin/overview` | Admin session |
| GET | `/api/admin/students` | Admin session |
| GET | `/api/admin/employers` | Admin session |
| GET | `/api/admin/employer-messages` | Admin session |
| PATCH | `/api/admin/employers/:id/status` | Admin session |
| GET | `/api/admin/opportunities` | Admin session |
| GET | `/api/admin/applications` | Admin session |
| PATCH | `/api/admin/applications/:id/status` | Admin session |

Open `https://gosawa-company-ltd.onrender.com/health` in a browser to check the live API and database. Test write or login endpoints with an API client such as Postman; authenticated endpoints use the `gosawa_session` cookie created by login.