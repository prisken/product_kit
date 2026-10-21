const { clearCookie } = require("../../lib/auth");
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  clearCookie(res);
  return res.status(200).json({ ok: true });
};
