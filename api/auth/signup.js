const bcrypt = require("bcryptjs");
const { db, ensureSchema } = require("../../lib/db");
const { sign, setCookie } = require("../../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  const { email, password, name } = req.body || {};
  const mail = String(email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return res.status(400).json({ ok: false, error: "Enter a valid email." });
  if (String(password || "").length < 8) return res.status(400).json({ ok: false, error: "Password must be at least 8 characters." });
  try {
    await ensureSchema();
    const sql = db();
    const exists = await sql`SELECT id FROM users WHERE email = ${mail} LIMIT 1`;
    if (exists.length) return res.status(409).json({ ok: false, error: "That email already has an account. Sign in instead." });
    const hash = await bcrypt.hash(String(password), 10);
    const rows = await sql`INSERT INTO users (email, name, password_hash) VALUES (${mail}, ${String(name || "").trim()}, ${hash}) RETURNING id, email, name`;
    const user = rows[0];
    setCookie(res, sign(user));
    return res.status(200).json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
