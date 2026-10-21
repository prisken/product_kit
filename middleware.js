import { jwtVerify } from "jose";

const COOKIE = "pk_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "");

export default async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const raw = req.headers.get("cookie") || "";
  const m = raw.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]*)"));
  const token = m ? decodeURIComponent(m[1]) : "";
  let ok = false;
  if (token) {
    try { await jwtVerify(token, secret()); ok = true; } catch {}
  }
  if (ok) return;

  if (pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ ok: false, error: "Sign in required." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const url = new URL("/signin.html", req.url);
  url.searchParams.set("next", pathname + search);
  return Response.redirect(url.toString(), 302);
}

export const config = {
  matcher: ["/", "/index.html", "/wizard.html", "/clients.html", "/setup.html", "/api/intake"],
};
