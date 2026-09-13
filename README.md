# RundUmWachtberg – Flyer-Landingpage

Statische Landingpage für den Flyer von RundUmWachtberg Hausmeisterservice (Marco Erlenbach, Wachtberg-Pech).
Gehostet über Cloudflare Pages (Projekt `rundumwachtberg-landingpage`, Konto WECONN3CT): https://anfrage.rundumwachtberg.de/

## Aufbau
- `index.html` – Landingpage (Hero mit Cartoon-Marco, Leistungen, Kostenvoranschlag-Wizard, Ablauf, FAQ, CTA)
- `app.js` – Anfrage-Wizard (drei Fragen zum Objekt, dann Kontaktdaten mit E-Mail; keine Preise auf der Seite, das Angebot schickt Marco per E-Mail)
- `styles.css` – Flyer-Look (Papier, Creme-Karten, Waldgrün, Nunito + Caveat)
- `functions/api/lead.js` – Cloudflare Pages Function `POST /api/lead`: nimmt das Formular entgegen, Honeypot, Mail per Resend an Marco plus Eingangsbestätigung an den Kunden, optional Telegram
- `impressum.html`, `datenschutz.html`
- `assets/` – Freisteller aus dem Flyer, Logo, OG-Bild, Blatt-Skizzen

## Konfiguration (`app.js`, Block `CONFIG`)
- `whatsapp` – WhatsApp-Nummer ohne `+` (aktuell die Nummer vom Flyer)
- `formEndpoint` – POST-Endpoint für das Formular, Standard `/api/lead` (Pages Function).
  Leer oder Fehler beim Senden = Fallback: Das E-Mail-Programm des Besuchers öffnet sich mit allen Angaben.
- Auswahltexte im Block `P` anpassen, wenn sich Leistungen ändern.

## Tracking
`track()` in `app.js` ruft `fbq`, `gtag` oder `dataLayer` auf, falls vorhanden. Events: `wizard_step`, `Lead` (WhatsApp/Formular), `Contact` (Telefon/WhatsApp).
Aktuell ist kein Pixel eingebunden (siehe Datenschutzerklärung, Abschnitt 6 – bei Einbau anpassen).

## Deployment (Cloudflare Pages)
Direct Upload per Wrangler, kein Build-Schritt:
```bash
npx wrangler pages deploy .
```
Env-Vars / Secrets im Cloudflare-Dashboard (Pages → rundumwachtberg-landingpage → Settings → Environment variables)
oder per `npx wrangler pages secret put RESEND_API_KEY`:
- `RESEND_API_KEY` – Pflicht, Domain `rundumwachtberg.de` muss bei Resend verifiziert sein (SPF/DKIM bei Strato)
- `MAIL_TO` (Standard info@rundumwachtberg.de), `MAIL_FROM` (Standard `RundUmWachtberg <anfrage@rundumwachtberg.de>`)
- `MAIL_CONFIRM=0` schaltet die Eingangsbestätigung ab · `TG_BOT_TOKEN` + `TG_CHAT_ID` optional für Telegram

DNS bei Strato: `anfrage` → CNAME `rundumwachtberg-landingpage.pages.dev`

## Lokal ansehen
```bash
npx wrangler pages dev .        # mit Function unter /api/lead, Secrets in .dev.vars
python3 -m http.server 8765     # nur statisch
```
