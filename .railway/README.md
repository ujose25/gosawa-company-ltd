# Railway deployment

This repository defines the Railway project in `railway.ts`: a private MySQL database, the API at `api.gosawa.org`, and the frontend at `gosawa.org`. The Railway plan creates the database and both deploy services.

## Before planning

The repo-local Railway CLI must be authenticated and this repository linked to the intended Railway project/environment. From the repository root, run `railway login` and `railway link` once. The ignored `backend/.env` must contain a strong `JWT_SECRET`, `EMAIL_USER`, and `EMAIL_PASS`. The IaC file loads only these required values locally and passes them to Railway's encrypted service variables; they are not written to source files or printed by the normal plan output. The production JWT secret is derived separately from the local secret.

## Preview and apply

From the repository root, run:

```sh
npm install
npm run railway:plan
npm run railway:apply
```

Review the plan before applying. IaC creates the MySQL service and two deploy services. The API's pre-deploy command applies migrations and creates the initial admin only if it does not already exist. The admin receives a one-time password setup link at the configured mailbox.

Railway still requires its generated DNS `CNAME` and verification `TXT` records for both `gosawa.org` and `api.gosawa.org` to be added at the domain registrar and verified. Railway will issue TLS certificates after verification. The first admin setup link and future password-reset links require the configured SMTP account to permit sending mail.