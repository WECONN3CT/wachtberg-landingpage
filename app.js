/* RundUmWachtberg Landingpage – Kostenvoranschlag-Wizard
   Preise laut Preisliste 2026 (docs/preisstruktur im Hauptprojekt). Alles "ab"-Richtwerte,
   Festpreis gibt es nach der kostenlosen Besichtigung. */

(function () {
  "use strict";

  // ---------- Konfiguration ----------
  const CONFIG = {
    whatsapp: "4915172443749",           // Nummer vom Flyer, ohne + und Leerzeichen
    phoneDisplay: "+49 151 72443749",
    email: "info@rundumwachtberg.de",
    // Formular-Endpoint (z. B. Web3Forms/Formspree/Cloudflare Worker). Leer = Fallback per E-Mail-Programm.
    formEndpoint: "",
  };

  const P = {
    hourly: 42, minHours: 2, taxBonus: 0.20,
    privat: {
      S: { label: "Klein", area: "bis 300 m² Grundstück", hedge: "bis 20 m Hecke", path: "bis 25 m Räumstrecke", garden: 52, winterAdd: 27, winterSeason: 349, winterSingle: 49 },
      M: { label: "Mittel", area: "bis 700 m² Grundstück", hedge: "bis 40 m Hecke", path: "bis 50 m Räumstrecke", garden: 100, winterAdd: 35, winterSeason: 449, winterSingle: 69 },
      L: { label: "Groß", area: "bis 1.500 m² Grundstück", hedge: "bis 80 m Hecke", path: "bis 100 m Räumstrecke", garden: 179, winterAdd: 50, winterSeason: 649, winterSingle: 99 },
    },
    tonnenPaket: 19,
    mfh: { perUnit: 29, min: 149, garden: 59, stairsPerFloor: 45, winterSeason: 590 },
    tasks: {
      rasen: { label: "Rasen mähen & Kanten", hours: 2 },
      hecke: { label: "Heckenschnitt", hours: 3 },
      laub: { label: "Laub, Rinnen & Herbstputz", hours: 3 },
      reparatur: { label: "Kleinreparaturen & Montage", hours: 2 },
      entruempelung: { label: "Entrümpelung & Transport", hours: 4 },
      urlaub: { label: "Bewässerung im Urlaub", hours: 3, note: "3 Besuche à 1 Std." },
      winter: { label: "Winterdienst, Einzeleinsatz", flat: 49 },
    },
  };

  const SVG_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L19 7"/></svg>';
  const ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20c0-9 5-14 16-16-1 11-6 16-16 16z"/><path d="M4 20c4-4 7-7 10-10"/></svg>',
    snow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/></svg>',
    bin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 3h4M6 7l1 14h10l1-14"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 7l3 3M3 21l9-9M14.5 3.5a4 4 0 015.7 5.7L17 12l-5-5 2.5-3.5z"/></svg>',
    stairs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h4v-4h4v-4h4V9h4V5"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2zM13 10h5l3 3v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z"/></svg>',
    scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.5 15.5M8.5 8.5L20 20"/></svg>',
    mower: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15h10l3-6h4M13 15l-2 4"/><circle cx="7" cy="18" r="2.5"/><circle cx="18" cy="17" r="2"/><path d="M9 15V9h3"/></svg>',
  };

  // ---------- Zustand ----------
  const state = { type: null, size: null, tasks: new Set(), timing: null, modules: new Set(["garten"]), season: null, units: 6, floors: 3, mfhModules: new Set() };
  let step = 1;
  const TOTAL = 4;

  const el = (s, r = document) => r.querySelector(s);
  const wizard = el("#wizard");
  if (!wizard) return;
  const body = el("#wizard-body");
  const nav = el("#wizard-nav");
  const progress = el("#wizard-progress");
  const stepLabel = el("#wizard-step");

  const eur = (n, dec = 0) => n.toLocaleString("de-DE", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + " €";
  const track = (name, data) => {
    try {
      if (window.fbq) window.fbq("trackCustom", name, data || {});
      if (window.gtag) window.gtag("event", name, data || {});
      if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, data || {}));
    } catch (e) { /* Tracking optional */ }
  };

  // ---------- Render ----------
  function render() {
    progress.style.width = (step / TOTAL * 100) + "%";
    stepLabel.textContent = step < TOTAL ? `Schritt ${step} von ${TOTAL}` : "Ihr Kostenvoranschlag";
    body.innerHTML = "";
    nav.innerHTML = "";
    const view = { 1: stepType, 2: stepDetails, 3: stepOptions, 4: stepResult }[step];
    view();
    if (rendered) {
      const top = wizard.getBoundingClientRect().top;
      if (top < 0 || top > 120) window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
      track("wizard_step", { step, type: state.type });
    }
    rendered = true;
  }
  let rendered = false;

  function choiceBtn({ key, icon, title, sub, price, on, onClick, multi }) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "choice" + (on ? " on" : ""); b.dataset.key = key;
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.innerHTML = `${icon ? `<span class="ic">${icon}</span>` : ""}<span><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</span>${price ? `<span class="price">${price}</span>` : ""}${multi ? `<span class="check">${SVG_CHECK}</span>` : ""}`;
    b.addEventListener("click", onClick);
    return b;
  }

  function navButtons({ backTo, next, nextLabel = "Weiter", canNext = true }) {
    const back = document.createElement("button");
    back.type = "button"; back.className = "link-btn"; back.textContent = backTo ? "← Zurück" : "";
    if (backTo) back.addEventListener("click", () => { step = backTo; render(); });
    const fwd = document.createElement("button");
    fwd.type = "button"; fwd.className = "btn btn-primary"; fwd.innerHTML = nextLabel + " →";
    fwd.disabled = !canNext;
    fwd.addEventListener("click", next);
    nav.append(back, fwd);
    return fwd;
  }

  // Schritt 1: Für wen?
  function stepType() {
    const s = document.createElement("div"); s.className = "step";
    s.innerHTML = `<h3>Wofür brauchen Sie Unterstützung?</h3><p class="hint">Wählen Sie, was am besten passt. Dauert keine Minute.</p>`;
    const grid = document.createElement("div"); grid.className = "choices cols-3";
    const opts = [
      { key: "privat", icon: ICONS.home, title: "Haus mit Garten", sub: "Regelmäßige Betreuung, das ganze Jahr. Monatlich, ein Ansprechpartner." },
      { key: "zuruf", icon: ICONS.clock, title: "Ab und zu, auf Zuruf", sub: "Einzelne Aufgaben, stundenweise. Kein Vertrag, keine Laufzeit." },
      { key: "mfh", icon: ICONS.building, title: "Hausverwaltung / WEG", sub: "Mehrfamilienhaus, laufende Betreuung mit Kontrollgang." },
    ];
    opts.forEach(o => grid.appendChild(choiceBtn({ ...o, on: state.type === o.key, onClick: () => { state.type = o.key; step = 2; render(); } })));
    s.appendChild(grid); body.appendChild(s);
    navButtons({ backTo: null, next: () => { step = 2; render(); }, canNext: !!state.type });
  }

  // Schritt 2: Details je Typ
  function stepDetails() {
    const s = document.createElement("div"); s.className = "step";
    if (state.type === "privat") {
      s.innerHTML = `<h3>Wie groß ist Ihr Grundstück?</h3><p class="hint">Grob geschätzt reicht. Den genauen Preis gibt es nach der kostenlosen Besichtigung.</p>`;
      const grid = document.createElement("div"); grid.className = "choices cols-3";
      Object.entries(P.privat).forEach(([k, v]) => grid.appendChild(choiceBtn({
        key: k, title: `${k} · ${v.label}`, sub: `${v.area}<br>${v.hedge}, ${v.path}`, on: state.size === k,
        onClick: () => { state.size = k; step = 3; render(); },
      })));
      s.appendChild(grid); body.appendChild(s);
      navButtons({ backTo: 1, next: () => { step = 3; render(); }, canNext: !!state.size });
    } else if (state.type === "zuruf") {
      s.innerHTML = `<h3>Was soll erledigt werden?</h3><p class="hint">Mehrfachauswahl möglich. Ich rechne mit 42 € pro Stunde, mindestens zwei Stunden, Anfahrt und Werkzeug inklusive.</p>`;
      const grid = document.createElement("div"); grid.className = "choices cols-2";
      const icons = { rasen: ICONS.mower, hecke: ICONS.scissors, laub: ICONS.leaf, reparatur: ICONS.tool, entruempelung: ICONS.truck, urlaub: ICONS.drop, winter: ICONS.snow };
      Object.entries(P.tasks).forEach(([k, t]) => {
        const price = t.flat ? `ab ${eur(t.flat)}` : `ca. ${t.hours} Std.`;
        grid.appendChild(choiceBtn({
          key: k, icon: icons[k], title: t.label, sub: t.note || "", price, multi: true, on: state.tasks.has(k),
          onClick: (e) => { const b = e.currentTarget; state.tasks.has(k) ? state.tasks.delete(k) : state.tasks.add(k); b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on")); fwd.disabled = state.tasks.size === 0; },
        }));
      });
      s.appendChild(grid); body.appendChild(s);
      const fwd = navButtons({ backTo: 1, next: () => { step = 3; render(); }, canNext: state.tasks.size > 0 });
    } else {
      s.innerHTML = `<h3>Wie groß ist das Objekt?</h3><p class="hint">Für die Grundbetreuung rechne ich je Wohneinheit, mindestens 149 € im Monat.</p>`;
      const row = document.createElement("div"); row.className = "field-row";
      row.innerHTML = `
        <div><label>Wohneinheiten</label><div class="stepper" data-k="units"><button type="button" aria-label="weniger">−</button><output>${state.units}</output><button type="button" aria-label="mehr">+</button></div><small>Je Wohneinheit 29 € netto im Monat</small></div>
        <div><label>Etagen im Treppenhaus</label><div class="stepper" data-k="floors"><button type="button" aria-label="weniger">−</button><output>${state.floors}</output><button type="button" aria-label="mehr">+</button></div><small>Nur relevant, wenn ich das Treppenhaus reinigen soll</small></div>`;
      row.querySelectorAll(".stepper").forEach(st => {
        const k = st.dataset.k, out = st.querySelector("output"), [minus, plus] = st.querySelectorAll("button");
        const lim = k === "units" ? [2, 60] : [1, 12];
        minus.addEventListener("click", () => { state[k] = Math.max(lim[0], state[k] - 1); out.textContent = state[k]; });
        plus.addEventListener("click", () => { state[k] = Math.min(lim[1], state[k] + 1); out.textContent = state[k]; });
      });
      s.appendChild(row); body.appendChild(s);
      navButtons({ backTo: 1, next: () => { step = 3; render(); } });
    }
  }

  // Schritt 3: Bausteine / Zeitpunkt
  function stepOptions() {
    const s = document.createElement("div"); s.className = "step";
    if (state.type === "privat") {
      const sz = P.privat[state.size];
      s.innerHTML = `<h3>Was soll ich übernehmen?</h3><p class="hint">Gartenpflege ist die Basis. Winterdienst und Tonnen-Service können Sie dazunehmen.</p>`;
      const grid = document.createElement("div"); grid.className = "choices cols-3";
      const mods = [
        { key: "garten", icon: ICONS.mower, title: "Gartenpflege", sub: "Rasen alle 14 Tage, Hecken 2×, Laub 2×, Frühjahrs- und Herbstreinigung", price: `ab ${eur(sz.garden)}/Monat`, fixed: true },
        { key: "winter", icon: ICONS.snow, title: "Winterdienst", sub: "Räumen und streuen ab 6 Uhr, Räum- und Streupflicht übernommen, Streugut inklusive", price: `+ ${eur(sz.winterAdd)}/Monat` },
        { key: "tonnen", icon: ICONS.bin, title: "Tonnen-Service", sub: "Alle Tonnen an allen Abfuhrtagen raus und wieder rein", price: `+ ${eur(P.tonnenPaket)}/Monat` },
      ];
      mods.forEach(m => grid.appendChild(choiceBtn({
        ...m, multi: true, on: state.modules.has(m.key),
        onClick: (e) => { if (m.fixed) return; const b = e.currentTarget; state.modules.has(m.key) ? state.modules.delete(m.key) : state.modules.add(m.key); b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on")); },
      })));
      s.appendChild(grid);
      s.insertAdjacentHTML("beforeend", `<h3 style="margin-top:1.6rem">Wann soll es losgehen?</h3><p class="hint">Damit ich weiß, was zuerst ansteht.</p>`);
      s.appendChild(chips(["Sofort", "Frühjahr", "Sommer", "Herbst", "Winter"], "season"));
      body.appendChild(s);
      navButtons({ backTo: 2, next: () => { step = 4; render(); }, nextLabel: "Kostenvoranschlag anzeigen" });
    } else if (state.type === "zuruf") {
      s.innerHTML = `<h3>Wann soll ich kommen?</h3><p class="hint">Termine nach Absprache, oft auch kurzfristig. Rückmeldung innerhalb eines Werktags.</p>`;
      s.appendChild(chips(["So bald wie möglich", "In den nächsten Wochen", "Frühjahr", "Herbst", "Winter"], "timing"));
      body.appendChild(s);
      navButtons({ backTo: 2, next: () => { step = 4; render(); }, nextLabel: "Kostenvoranschlag anzeigen" });
    } else {
      s.innerHTML = `<h3>Welche Module brauchen Sie?</h3><p class="hint">Die Grundbetreuung ist immer dabei: wöchentlicher Kontrollgang, Tonnen, Außenanlagen kehren, Kleinreparaturen bis 30 Minuten, Kurzbericht an die Verwaltung.</p>`;
      const grid = document.createElement("div"); grid.className = "choices cols-3";
      const mods = [
        { key: "garten", icon: ICONS.mower, title: "Gartenpflege", sub: "Rasen, Hecken, Beete, Laub in festem Rhythmus", price: `ab ${eur(P.mfh.garden)}/Monat` },
        { key: "treppe", icon: ICONS.stairs, title: "Treppenhausreinigung", sub: `${state.floors} Etagen, wöchentlich`, price: `ab ${eur(P.mfh.stairsPerFloor * state.floors)}/Monat` },
        { key: "winter", icon: ICONS.snow, title: "Winterdienst", sub: "Saison November bis März, Räumpflicht übernommen", price: `ab ${eur(P.mfh.winterSeason)}/Saison` },
      ];
      mods.forEach(m => grid.appendChild(choiceBtn({
        ...m, multi: true, on: state.mfhModules.has(m.key),
        onClick: (e) => { const b = e.currentTarget; state.mfhModules.has(m.key) ? state.mfhModules.delete(m.key) : state.mfhModules.add(m.key); b.classList.toggle("on"); b.setAttribute("aria-pressed", b.classList.contains("on")); },
      })));
      s.appendChild(grid); body.appendChild(s);
      navButtons({ backTo: 2, next: () => { step = 4; render(); }, nextLabel: "Kostenvoranschlag anzeigen" });
    }
  }

  function chips(list, key) {
    const c = document.createElement("div"); c.className = "chips";
    list.forEach(l => {
      const b = document.createElement("button"); b.type = "button"; b.className = "chip" + (state[key] === l ? " on" : ""); b.textContent = l;
      b.addEventListener("click", () => { state[key] = l; c.querySelectorAll(".chip").forEach(x => x.classList.remove("on")); b.classList.add("on"); });
      c.appendChild(b);
    });
    return c;
  }

  // ---------- Kalkulation ----------
  function calc() {
    const lines = []; let total = 0, unit = "", taxable = false, net = false;
    if (state.type === "privat") {
      const sz = P.privat[state.size]; unit = "im Monat"; taxable = true;
      lines.push({ t: "Rundum-Paket Gartenpflege", s: `Grundstück ${state.size} (${sz.area}) · Rasen alle 14 Tage, Hecken 2×, Laub 2×, Frühjahrs- und Herbstreinigung, Entsorgung bis 4 m³`, p: sz.garden });
      total += sz.garden;
      if (state.modules.has("winter")) { lines.push({ t: "Winterdienst als Saisonbaustein", s: `${sz.path}, Räum- und Streupflicht übernommen, Streugut inklusive (${eur(sz.winterSeason)} je Saison, auf 12 Monate verteilt)`, p: sz.winterAdd }); total += sz.winterAdd; }
      if (state.modules.has("tonnen")) { lines.push({ t: "Tonnen-Service", s: "Alle Tonnen an allen Abfuhrtagen, bis 4 Tonnen", p: P.tonnenPaket }); total += P.tonnenPaket; }
    } else if (state.type === "zuruf") {
      unit = "je Einsatz"; taxable = true; let hours = 0;
      state.tasks.forEach(k => { const t = P.tasks[k]; if (t.flat) { lines.push({ t: t.label, s: "Räumstrecke bis 25 m, größere Strecken 69 bis 99 €", p: t.flat }); total += t.flat; } else hours += t.hours; });
      if (hours > 0) {
        const h = Math.max(P.minHours, hours);
        const labels = [...state.tasks].filter(k => !P.tasks[k].flat).map(k => P.tasks[k].label).join(", ");
        lines.unshift({ t: `Arbeitszeit, ca. ${h} Std. × ${eur(P.hourly)}`, s: `${labels}. Anfahrt und Werkzeug inklusive, Abrechnung im 15-Minuten-Takt`, p: h * P.hourly });
        total += h * P.hourly;
      }
    } else {
      unit = "im Monat, netto"; net = true;
      const base = Math.max(P.mfh.min, state.units * P.mfh.perUnit);
      lines.push({ t: "Grundbetreuung Mehrfamilienhaus", s: `${state.units} Wohneinheiten × ${eur(P.mfh.perUnit)} (mindestens ${eur(P.mfh.min)}) · wöchentlicher Kontrollgang, Tonnen, Außenanlagen kehren, Kleinreparaturen bis 30 Min., Kurzbericht`, p: base });
      total += base;
      if (state.mfhModules.has("garten")) { lines.push({ t: "Modul Gartenpflege", s: "Rasen, Hecken, Beete, Laub in festem Rhythmus", p: P.mfh.garden }); total += P.mfh.garden; }
      if (state.mfhModules.has("treppe")) { const p = P.mfh.stairsPerFloor * state.floors; lines.push({ t: "Modul Treppenhausreinigung", s: `${state.floors} Etagen × ${eur(P.mfh.stairsPerFloor)}, wöchentlich`, p }); total += p; }
      if (state.mfhModules.has("winter")) { const p = Math.round(P.mfh.winterSeason / 12); lines.push({ t: "Modul Winterdienst", s: `${eur(P.mfh.winterSeason)} je Saison, auf 12 Monate verteilt`, p }); total += p; }
    }
    return { lines, total, unit, taxable, net, effective: taxable ? Math.round(total * (1 - P.taxBonus)) : null };
  }

  function summaryText(c) {
    const who = { privat: `Haus mit Garten, Grundstück ${state.size}`, zuruf: "Einzelne Aufgaben auf Zuruf", mfh: `Hausverwaltung, ${state.units} Wohneinheiten` }[state.type];
    const when = state.season || state.timing;
    let t = `Hallo Marco, ich habe den Kostenvoranschlag auf Ihrer Seite gemacht:\n• ${who}\n`;
    c.lines.forEach(l => t += `• ${l.t}: ${eur(l.p)}\n`);
    t += `= ca. ${eur(c.total)} ${c.unit}`;
    if (c.effective) t += ` (nach Steuerbonus ca. ${eur(c.effective)})`;
    if (when) t += `\n• Zeitpunkt: ${when}`;
    t += `\n\nIch hätte gern eine kostenlose Besichtigung. `;
    return t;
  }

  // Schritt 4: Ergebnis
  function stepResult() {
    const c = calc();
    const s = document.createElement("div"); s.className = "step";
    const no = "KV-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(100 + Math.random() * 900);
    const who = { privat: `Haus mit Garten · Grundstück ${state.size}`, zuruf: "Einzelne Aufgaben auf Zuruf", mfh: `Mehrfamilienhaus · ${state.units} Wohneinheiten` }[state.type];
    const when = state.season || state.timing;

    let rows = c.lines.map(l => `<tr><td>${l.t}<small>${l.s}</small></td><td>${eur(l.p)}</td></tr>`).join("");
    rows += `<tr class="total"><td>Richtwert gesamt<small>${c.net ? "zzgl. 19 % USt." : "Endpreis, keine versteckten Kosten"}</small></td><td>${eur(c.total)}<small>${c.unit}</small></td></tr>`;
    if (c.effective) rows += `<tr class="eff"><td>Effektiv nach Steuerbonus (20 %)</td><td>${eur(c.effective)}</td></tr>`;

    const note = c.net
      ? `<p><b>Für Vermieter und Verwaltungen:</b> Hausmeister-, Garten- und Winterdienstkosten sind in der Regel als Betriebskosten auf die Mieter umlegbar (§ 2 BetrKV). Die Rechnung kommt getrennt nach umlagefähigen und nicht umlagefähigen Kosten.</p>`
      : `<p><b>Steuerbonus für Privathaushalte:</b> 20 % der Arbeitskosten holen Sie sich über die Steuererklärung zurück (haushaltsnahe Dienstleistungen, § 35a EStG, bis 4.000 € im Jahr). Voraussetzung: Rechnung und Überweisung. ${state.type === "privat" ? `Das sind bei Ihnen etwa <b>${(c.effective / 30).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € am Tag</b>.` : ""} Keine Steuerberatung.</p>`;

    s.innerHTML = `
      <h3>Ihr Kostenvoranschlag ist fertig.</h3>
      <p class="hint">Ein ehrlicher Richtwert nach meiner Preisliste 2026. Den Festpreis bekommen Sie nach der kostenlosen Besichtigung, und dabei bleibt es.</p>
      <div class="result-grid">
        <div class="estimate">
          <div class="estimate-head"><div><b>Unverbindlicher Kostenvoranschlag</b><small>${who}${when ? " · " + when : ""}</small></div><div class="no">${no}<br><span style="color:#fff;letter-spacing:0">${new Date().toLocaleDateString("de-DE")}</span></div></div>
          <table>${rows}</table>
          <div class="estimate-note">${note}<p>Richtwert auf Basis der Preisliste 2026. Anfahrt und Werkzeug inklusive (Wachtberg, Bad Godesberg, Meckenheim). ${state.type === "privat" ? "Paket: 12 Monate, danach monatlich kündbar, Preis ein Jahr fest." : state.type === "zuruf" ? "Mindestens zwei Stunden, danach im 15-Minuten-Takt. Grünschnitt-Entsorgung 19 € je m³ nach Absprache." : "Angebot nach Objektbesichtigung, je nach Größe und Aufgaben."}</p></div>
        </div>
        <div class="lead-box" id="lead-box">
          <h4>Kostenlose Besichtigung anfragen</h4>
          <p class="hint">Ich melde mich innerhalb eines Werktags, schaue mir alles an und nenne Ihnen den Festpreis.</p>
          <a class="btn btn-wa btn-lg" id="wa-result" href="#" target="_blank" rel="noopener">${waIcon()} Per WhatsApp senden</a>
          <div class="or">oder Rückruf</div>
          <form id="lead-form" novalidate>
            <label for="lf-name">Ihr Name</label>
            <input id="lf-name" name="name" type="text" autocomplete="name" required placeholder="Vor- und Nachname">
            <label for="lf-phone">Telefon</label>
            <input id="lf-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="z. B. 0151 1234567">
            <label for="lf-ort">Ort / Straße <span class="muted" style="font-weight:600">(optional)</span></label>
            <input id="lf-ort" name="ort" type="text" autocomplete="street-address" placeholder="z. B. Pech, Musterweg 3">
            <button class="btn btn-primary btn-lg" type="submit">Rückruf & Festpreis anfordern</button>
            <p class="privacy">Keine Werbung, keine Weitergabe. Ihre Daten nutze ich nur für die Rückmeldung. <a href="datenschutz.html">Datenschutz</a></p>
          </form>
        </div>
      </div>`;
    body.appendChild(s);

    const text = summaryText(c);
    el("#wa-result", s).href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
    el("#wa-result", s).addEventListener("click", () => track("Lead", { channel: "whatsapp", type: state.type, value: c.total }));

    const form = el("#lead-form", s);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value.trim(), phone = form.phone.value.trim(), ort = form.ort.value.trim();
      if (!name || phone.replace(/\D/g, "").length < 6) { form.querySelector(!name ? "#lf-name" : "#lf-phone").focus(); form.querySelector(!name ? "#lf-name" : "#lf-phone").style.borderColor = "#c0392b"; return; }
      const payload = { subject: `Anfrage Landingpage: ${who}`, name, phone, ort, kostenvoranschlag: text, nr: no, page: location.href };
      const btn = form.querySelector("button"); btn.disabled = true; btn.textContent = "Wird gesendet …";
      let ok = false;
      if (CONFIG.formEndpoint) {
        try { const r = await fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) }); ok = r.ok; } catch (err) { ok = false; }
      }
      if (!ok) {
        // Fallback ohne Backend: E-Mail-Programm mit allen Angaben öffnen
        const mail = `mailto:${CONFIG.email}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(`${text}\n\nName: ${name}\nTelefon: ${phone}\nOrt: ${ort || "-"}\n${no}`)}`;
        window.location.href = mail;
      }
      track("Lead", { channel: ok ? "form" : "mail", type: state.type, value: c.total });
      el("#lead-box", s).innerHTML = `<div class="success"><div class="hand">Danke, ${name.split(" ")[0]}!</div><p>${ok ? "Ihre Anfrage ist bei mir angekommen. Ich melde mich innerhalb eines Werktags." : "Ihr E-Mail-Programm hat sich mit allen Angaben geöffnet. Einfach absenden, ich melde mich innerhalb eines Werktags."}</p><p style="margin-top:1rem"><a class="btn btn-outline" href="tel:+${CONFIG.whatsapp}">Oder direkt anrufen: ${CONFIG.phoneDisplay}</a></p></div>`;
    });

    const back = document.createElement("button"); back.type = "button"; back.className = "link-btn"; back.textContent = "← Angaben ändern";
    back.addEventListener("click", () => { step = 3; render(); });
    const restart = document.createElement("button"); restart.type = "button"; restart.className = "link-btn"; restart.textContent = "Neu starten";
    restart.addEventListener("click", () => { Object.assign(state, { type: null, size: null, timing: null, season: null }); state.tasks.clear(); state.mfhModules.clear(); state.modules = new Set(["garten"]); step = 1; render(); });
    nav.append(back, restart);
  }

  function waIcon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.1.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.2c0-.1-.2-.2-.4-.3z"/></svg>';
  }

  // ---------- Init ----------
  render();

  // WhatsApp-Links auf der Seite mit Standardtext füllen
  document.querySelectorAll("a[data-wa]").forEach(a => {
    a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(a.dataset.wa || "Hallo Marco, ich komme über Ihren Flyer und hätte gern ein Angebot für ")}`;
    a.addEventListener("click", () => track("Contact", { channel: "whatsapp" }));
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(a => a.addEventListener("click", () => track("Contact", { channel: "phone" })));

  // Scroll-Reveal
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(n => io.observe(n));
})();
