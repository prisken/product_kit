const bcrypt = require("bcryptjs");
const { db, ensureSchema } = require("../../lib/db");
const { sign, setCookie } = require("../../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  const { email, password } = req.body || {};
  const mail = String(email || "").trim().toLowerCase();
  try {
    await ensureSchema();
    const sql = db();
    const rows = await sql`SELECT id, email, name, password_hash FROM users WHERE email = ${mail} LIMIT 1`;
    if (!rows.length) return res.status(401).json({ ok: false, error: "Email or password is incorrect." });
    const ok = await bcrypt.compare(String(password || ""), rows[0].password_hash);
    if (!ok) return res.status(401).json({ ok: false, error: "Email or password is incorrect." });
    setCookie(res, sign(rows[0]));
    return res.status(200).json({ ok: true, user: { id: rows[0].id, email: rows[0].email, name: rows[0].name } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
