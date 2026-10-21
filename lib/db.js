const { neon } = require("@neondatabase/serverless");

let ready = null;
function db() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("No database configured");
  return neon(url);
}
async function ensureSchema() {
  if (!ready) {
    const sql = db();
    ready = sql`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`.catch((e) => { ready = null; throw e; });
  }
  return ready;
}
module.exports = { db, ensureSchema };
