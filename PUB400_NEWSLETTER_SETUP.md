# Pub400 Newsletter Integration Setup

This document describes the complete setup to store website newsletter emails in Pub400 Db2.

## Architecture

1. User submits email in website footer.
2. Website sends HTTPS request to external bridge API.
3. Bridge API validates input and writes to Pub400 Db2 via ODBC.
4. Bridge returns status to UI.

## A) IBM i / Pub400 setup

1. Create Db2 table and indexes:
   - Run [`ibmi/newsletter_table_setup.sql`](ibmi/newsletter_table_setup.sql)
2. (Optional) Compile and keep RPGLE business program:
   - Source template: [`ibmi/NEWSUBS.rpgle`](ibmi/NEWSUBS.rpgle)
3. Apply authority grant helper:
   - CLLE template: [`ibmi/DEPLOYNEWS.clle`](ibmi/DEPLOYNEWS.clle)
4. Create or select dedicated service user (least privilege) and grant only what is needed on newsletter table.

## B) Bridge API setup

1. Go to [`integration-bridge/`](integration-bridge/)
2. Install dependencies and configure `.env`.
3. Run bridge and verify `GET /health`.
4. Test `POST /api/newsletter/subscribe` with Postman/curl.

## C) Website setup (this repo)

1. Set `NEXT_PUBLIC_NEWSLETTER_API_URL` during build/deploy.
2. Rebuild site.
3. Submit test email from footer and verify row appears in Pub400.

## Environment Variables

### Website

- `NEXT_PUBLIC_NEWSLETTER_API_URL=https://your-bridge-domain.example`

### Bridge

- `PORT=8080`
- `CORS_ORIGINS=https://your-site.example`
- `DB2_CONNECTION_STRING=DSN=PUB400;UID=YOUR_USER;PWD=YOUR_PASSWORD;NAM=1`
- `DB2_SCHEMA=YOURLIB`
- `DB2_TABLE=NEWSLETTER_SUBS`

## Operational hardening checklist

- Restrict CORS to your exact site domains.
- Enable HTTPS only.
- Keep Pub400 credentials in secret manager, not source control.
- Add alerting on repeated 503 or database failures.
- Keep request logs without storing raw sensitive payload beyond email and status.
