import odbc from 'odbc'

let dbConnectionPromise

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

export function getSchemaAndTable() {
  return {
    schema: requiredEnv('DB2_SCHEMA'),
    table: requiredEnv('DB2_TABLE'),
  }
}

async function getConnection() {
  if (!dbConnectionPromise) {
    const connectionString = requiredEnv('DB2_CONNECTION_STRING')
    dbConnectionPromise = odbc.connect(connectionString)
  }
  return dbConnectionPromise
}

export async function upsertNewsletterSubscription(email, source) {
  const connection = await getConnection()
  const { schema, table } = getSchemaAndTable()

  const sql = `
    MERGE INTO ${schema}.${table} AS target
    USING (VALUES (?, ?, ?)) AS input (EMAIL, EMAIL_NORM, SOURCE)
      ON target.EMAIL_NORM = input.EMAIL_NORM
    WHEN MATCHED THEN
      UPDATE SET
        EMAIL = input.EMAIL,
        SOURCE = input.SOURCE,
        STATUS = 'A',
        UPDATED_AT = CURRENT_TIMESTAMP
    WHEN NOT MATCHED THEN
      INSERT (EMAIL, EMAIL_NORM, STATUS, SOURCE, CREATED_AT, UPDATED_AT)
      VALUES (input.EMAIL, input.EMAIL_NORM, 'A', input.SOURCE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `

  const normalizedEmail = email.trim().toLowerCase()
  await connection.query(sql, [email, normalizedEmail, source])

  const result = await connection.query(
    `SELECT STATUS, CREATED_AT, UPDATED_AT
       FROM ${schema}.${table}
      WHERE EMAIL_NORM = ? FETCH FIRST 1 ROW ONLY`,
    [normalizedEmail]
  )

  const row = result?.[0]
  const createdAt = row?.CREATED_AT ? new Date(row.CREATED_AT).getTime() : 0
  const updatedAt = row?.UPDATED_AT ? new Date(row.UPDATED_AT).getTime() : 0

  // If timestamps are almost equal, treat it as newly inserted.
  const isNew = Math.abs(createdAt - updatedAt) < 2000
  return isNew ? 'subscribed' : 'already_subscribed'
}
