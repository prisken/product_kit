const P = require("../prompt.js");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  const body = req.body || {};
  const notes = String(body.notes || "").trim();
  if (notes.length < 10) return res.status(400).json({ ok: false, error: "notes too short" });
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: "No server key. Add DEEPSEEK_API_KEY in Vercel settings." });

  const lang = body.language === "zh" ? "zh" : "en";
  const t0 = Date.now();
  try {
    const r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: P.system(lang) },
          { role: "user", content: `NOTES:\n${notes}\n\nKNOWN FIELDS:\n${JSON.stringify(body.fields || {})}` },
        ],
      }),
    });
    const text = await r.text();
    if (!r.ok) return res.status(502).json({ ok: false, error: "provider " + r.status + ": " + text.slice(0, 160) });
    let raw = JSON.parse(text).choices[0].message.content || "";
    raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const i = raw.indexOf("{"), j = raw.lastIndexOf("}");
    const brief = JSON.parse(raw.slice(i, j + 1));
    brief.lanes = (brief.lanes || []).filter((l) => P.LANES.includes(l));
    brief.needs = (brief.needs || []).filter((n) => P.NEEDS.includes(n));
    brief.model = "deepseek:deepseek-chat";
    brief.ms = Date.now() - t0;
    return res.status(200).json({ ok: true, brief });
  } catch (e) {
    return res.status(502).json({ ok: false, error: String(e.message || e) });
  }
};
