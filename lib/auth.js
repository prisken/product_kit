const jwt = require("jsonwebtoken");
const COOKIE = "pk_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function sign(user) {
  return jwt.sign({ sub: String(user.id), email: user.email, name: user.name || "" }, process.env.AUTH_SECRET, { expiresIn: MAX_AGE });
}
function verify(token) {
  try { return jwt.verify(token, process.env.AUTH_SECRET); } catch { return null; }
}
function readCookie(req) {
  const raw = req.headers.cookie || "";
  const m = raw.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : "";
}
function setCookie(res, token) {
  res.setHeader("Set-Cookie", `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}
function clearCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}
function currentUser(req) {
  const t = readCookie(req);
  return t ? verify(t) : null;
}
module.exports = { COOKIE, sign, verify, setCookie, clearCookie, currentUser };
