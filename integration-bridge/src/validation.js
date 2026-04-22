const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email)
}
