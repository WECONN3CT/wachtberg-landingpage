/**
 * Cloudflare Pages Function: POST /api/lead
 *
 * Nimmt das Anfrage-Formular der Landingpage (app.js, JSON-Payload) entgegen
 * und verschickt es per Resend als E-Mail an Marco. Der Kunde bekommt eine
 * kurze Eingangsbestätigung. Optional geht zusätzlich ein Telegram-Ping raus.
 *
 * Env-Vars / Secrets (Cloudflare Pages → Settings → Environment variables):
 *   RESEND_API_KEY  – Pflicht. API-Key aus resend.com (als Secret hinterlegen)
 *   MAIL_TO         – Empfänger der Anfragen (Standard: info@rundumwachtberg.de)
 *   MAIL_FROM       – Absender, Domain muss bei Resend verifiziert sein
 *                     (Standard: "RundUmWachtberg <anfrage@rundumwachtberg.de>")
 *   MAIL_CONFIRM    – "0" schaltet die Eingangsbestätigung an den Kunden ab
 *   TG_BOT_TOKEN    – (optional) Telegram-Bot-Token
 *   TG_CHAT_ID      – (optional) Telegram-Chat-ID
 *
 * Antwort: JSON { ok: true } bzw. { ok: false, error } mit passendem Status.
 * Schlägt der Versand fehl, öffnet app.js als Fallback das E-Mail-Programm.
 */

const DEFAULT_TO = "info@rundumwachtberg.de";
const DEFAULT_FROM = "RundUmWachtberg <anfrage@rundumwachtberg.de>";

const clean = (v, max) => (v ?? "").toString().trim().slice(0, max);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });

async function sendMail(env, msg) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(msg),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Nur Anfragen von der eigenen Seite annehmen
  const origin = request.headers.get("Origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return json({ ok: false, error: "forbidden" }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  const name = clean(body.name, 200);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 50);
  const ort = clean(body.ort, 200);
  const message = clean(body.message, 2000);
  const angaben = clean(body.angaben, 3000);
  const page = clean(body.page, 500);
  const honeypot = clean(body.company, 200);
  const subject = clean(body.subject, 150) || "Anfrage Landingpage";

  // Spam (Honeypot gefüllt): still verwerfen, aber Erfolg melden
  if (honeypot) return json({ ok: true });

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (!name || !emailOk) {
    return json({ ok: false, error: "validation" }, 400);
  }
  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY fehlt");
    return json({ ok: false, error: "not_configured" }, 503);
  }

  const to = env.MAIL_TO || DEFAULT_TO;
  const from = env.MAIL_FROM || DEFAULT_FROM;
  const when = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });

  const rows = [
    ["Name", name],
    ["E-Mail", email],
    ["Telefon", phone || "–"],
    ["Ort / Straße", ort || "–"],
    ["Hinweis", message || "–"],
  ];

  const text = [
    "Neue Anfrage über die Landingpage",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Angaben aus dem Anfrage-Wizard:",
    angaben || "–",
    "",
    `Eingegangen: ${when}`,
    page ? `Seite: ${page}` : "",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#222;max-width:600px">
      <h2 style="margin:0 0 12px;color:#2f5d3a">Neue Anfrage über die Landingpage</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse">
        ${rows.map(([k, v]) => `<tr><td style="color:#666;padding-right:14px;vertical-align:top"><b>${esc(k)}</b></td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}
      </table>
      <h3 style="margin:18px 0 6px;color:#2f5d3a">Angaben aus dem Anfrage-Wizard</h3>
      <pre style="white-space:pre-wrap;font:inherit;background:#f6f3ea;padding:12px;border-radius:8px">${esc(angaben || "–")}</pre>
      <p style="color:#888;font-size:13px;margin-top:18px">Eingegangen: ${esc(when)}${page ? `<br>Seite: ${esc(page)}` : ""}<br>Antworten geht direkt an ${esc(email)}.</p>
    </div>`;

  try {
    await sendMail(env, { from, to: [to], reply_to: email, subject: `${subject} – ${name}`, text, html });
  } catch (err) {
    console.error("Mail an Marco fehlgeschlagen:", err.message);
    return json({ ok: false, error: "send_failed" }, 502);
  }

  // Nebenläufig: Bestätigung an den Kunden + Telegram. Dürfen die Antwort nicht blockieren.
  const tasks = [];

  if (env.MAIL_CONFIRM !== "0") {
    const first = name.split(/\s+/)[0];
    const confirmText = [
      `Hallo ${first},`,
      "",
      "vielen Dank für Ihre Anfrage. Ich schaue mir Ihre Angaben an und melde mich innerhalb eines Werktags mit einem Angebot.",
      "",
      "Ihre Angaben:",
      angaben || "–",
      ort ? `Ort / Straße: ${ort}` : "",
      message ? `Hinweis: ${message}` : "",
      "",
      "Bei Rückfragen erreichen Sie mich unter +49 151 72443749 oder per Antwort auf diese E-Mail.",
      "",
      "Viele Grüße",
      "Marco Erlenbach",
      "RundUmWachtberg Hausmeisterservice",
    ].filter((l) => l !== "").join("\n");
    tasks.push(
      sendMail(env, { from, to: [email], reply_to: to, subject: "Ihre Anfrage bei RundUmWachtberg", text: confirmText })
        .catch((err) => console.error("Bestätigung fehlgeschlagen:", err.message))
    );
  }

  if (env.TG_BOT_TOKEN && env.TG_CHAT_ID) {
    const tg = ["🌿 Neue Anfrage — RundUmWachtberg", "", `👤 ${name}`, `✉️ ${email}`, phone ? `📞 ${phone}` : null, ort ? `📍 ${ort}` : null, "", angaben].filter(Boolean).join("\n");
    tasks.push(
      fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text: tg }),
      }).catch(() => {})
    );
  }

  context.waitUntil(Promise.allSettled(tasks));
  return json({ ok: true });
}
