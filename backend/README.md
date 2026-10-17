# GOSAWA Backend

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set database credentials, an unpredictable `JWT_SECRET` of at least 32 characters, and the allowed frontend origin in `CLIENT_URL`.
3. Run `npm run migrate` to create missing tables and record the baseline migration. Existing tables are left in place.
4. Start the API with `npm start`.

`CLIENT_URL` may contain comma-separated origins when the frontend is deployed to more than one trusted origin. For cross-site production cookies, set `COOKIE_SAME_SITE=none` and serve the API and frontend over HTTPS.

Set `FRONTEND_URL` to the public frontend origin. SMTP settings are used only for password-reset emails; registration does not send email. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `EMAIL_USER`, and `EMAIL_PASS` on the host to enable account recovery.

## Admin account

Set `ADMIN_EMAIL`, `EMAIL_USER`, and `EMAIL_PASS` in `.env`, then run `npm run create-admin`. The command creates an admin only if none exists for that email and sends a one-time password setup link. It never prints or stores an initial usable password.

## Tests

Run backend unit tests with `npm test`.