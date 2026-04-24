# Mindfactor Pub400 Bridge

This service receives newsletter form submissions from the website and writes them to Pub400 Db2.

## 1) Install

```bash
cd integration-bridge
npm install
```

## 2) Configure

Copy `.env.example` to `.env` and fill values:

- `PORT`: API port
- `CORS_ORIGINS`: comma-separated allowed frontend origins
- `DB2_CONNECTION_STRING`: IBM i ODBC connection string
- `DB2_SCHEMA`: library name (for example `YOURLIB`)
- `DB2_TABLE`: table name (for example `NEWSLETTER_SUBS`)

## 3) Run

```bash
npm run dev
```

Health check:

- `GET /health`

Newsletter endpoint:

- `POST /api/newsletter/subscribe`
- Body:

```json
{
  "email": "user@example.com",
  "source": "mindfactor_footer"
}
```

## 4) Response contract

- `200 { "ok": true, "status": "subscribed" }`
- `200 { "ok": true, "status": "already_subscribed" }`
- `400 { "ok": false, "error": "invalid_email" }`
- `429 { "ok": false, "error": "rate_limited" }`
- `503 { "ok": false, "error": "temporary_unavailable" }`

## 5) Required driver

Install IBM i Access ODBC driver on the machine running this bridge and configure DSN/connection values for Pub400.
