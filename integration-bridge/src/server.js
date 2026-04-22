import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { upsertNewsletterSubscription } from './db2.js'
import { isValidEmail, normalizeEmail } from './validation.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT || 8080)
const origins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(express.json())
app.use(
  cors({
    origin: origins.length > 0 ? origins : false,
    methods: ['POST', 'GET'],
  })
)

app.use(
  '/api/newsletter/subscribe',
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'rate_limited' },
  })
)

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'mindfactor-pub400-bridge' })
})

app.post('/api/newsletter/subscribe', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? normalizeEmail(req.body.email) : ''
  const source = typeof req.body?.source === 'string' ? req.body.source.trim().slice(0, 64) : 'unknown'

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'invalid_email' })
  }

  try {
    const status = await upsertNewsletterSubscription(email, source)
    return res.status(200).json({ ok: true, status })
  } catch (error) {
    console.error('newsletter subscribe failed', {
      message: error?.message,
      sqlState: error?.odbcErrors?.[0]?.state,
    })
    return res.status(503).json({ ok: false, error: 'temporary_unavailable' })
  }
})

app.listen(port, () => {
  console.log(`Bridge listening on port ${port}`)
})
