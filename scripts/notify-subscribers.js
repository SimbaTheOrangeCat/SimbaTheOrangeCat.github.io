const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../integration-bridge/.env') })

const title = process.argv[2]
const url = process.argv[3] // optional

if (!title) {
  console.error("Please provide a title: node notify-subscribers.js \"My Blog Title\" [url]")
  process.exit(1)
}

const secret = process.env.NOTIFY_SECRET
if (!secret) {
  console.error("NOTIFY_SECRET is not configured in integration-bridge/.env")
  process.exit(1)
}

console.log(`Sending notifications for blog: "${title}"...`)

fetch('http://localhost:8080/api/newsletter/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret,
    blogTitle: title,
    blogUrl: url,
  })
})
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      console.log('✅ Success:', data)
    } else {
      console.error('❌ Failed:', data)
    }
  })
  .catch(err => {
    console.error('Network Error:', err)
  })
