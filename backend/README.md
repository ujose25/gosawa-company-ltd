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

## API endpoints

The API is mounted at `/api`. When deployed with the Railway configuration in this repository, the base URL is `https://api.gosawa.org`.

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

Open `https://api.gosawa.org/health` in a browser to check the live API and database. Test write or login endpoints with an API client such as Postman; authenticated endpoints use the `gosawa_session` cookie created by login.