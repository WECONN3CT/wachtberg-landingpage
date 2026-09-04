# RundUmWachtberg – Flyer-Landingpage

Statische Landingpage für den Flyer von RundUmWachtberg Hausmeisterservice (Marco Erlenbach, Wachtberg-Pech).
Gehostet über GitHub Pages: https://anfrage.rundumwachtberg.de/

## Aufbau
- `index.html` – Landingpage (Hero mit Cartoon-Marco, Leistungen, Kostenvoranschlag-Wizard, Ablauf, FAQ, CTA)
- `app.js` – Anfrage-Wizard (drei Fragen zum Objekt, dann Kontaktdaten mit E-Mail; keine Preise auf der Seite, das Angebot schickt Marco per E-Mail)
- `styles.css` – Flyer-Look (Papier, Creme-Karten, Waldgrün, Nunito + Caveat)
- `impressum.html`, `datenschutz.html`
- `assets/` – Freisteller aus dem Flyer, Logo, OG-Bild, Blatt-Skizzen

## Konfiguration (`app.js`, Block `CONFIG`)
- `whatsapp` – WhatsApp-Nummer ohne `+` (aktuell die Nummer vom Flyer)
- `formEndpoint` – POST-Endpoint für das Rückruf-Formular (Web3Forms, Formspree oder Cloudflare Worker).
  Leer = Fallback: Das E-Mail-Programm des Besuchers öffnet sich mit allen Angaben.
- Auswahltexte im Block `P` anpassen, wenn sich Leistungen ändern.

## Tracking
`track()` in `app.js` ruft `fbq`, `gtag` oder `dataLayer` auf, falls vorhanden. Events: `wizard_step`, `Lead` (WhatsApp/Formular), `Contact` (Telefon/WhatsApp).
Aktuell ist kein Pixel eingebunden (siehe Datenschutzerklärung, Abschnitt 6 – bei Einbau anpassen).

## Lokal ansehen
```bash
python3 -m http.server 8765 --directory .
```
