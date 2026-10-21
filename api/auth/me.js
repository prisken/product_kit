const { currentUser } = require("../../lib/auth");
module.exports = async (req, res) => {
  const u = currentUser(req);
  if (!u) return res.status(401).json({ ok: false });
  return res.status(200).json({ ok: true, user: { id: u.sub, email: u.email, name: u.name } });
};
