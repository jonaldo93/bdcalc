/*
 * TV-ÄB Charité — Vergütungs-Engine  ·  Neuaufbau, INKREMENT 1
 * Tarifstand: TV-ÄB i.d.F. 1.4.2022 + Änderungstarifvertrag Nr. 1 (16.5.2024)
 * Aktuelle Standard-Konfiguration (ab 1.2.2026): 40 Wochenstunden → Teiler 173.92
 *
 * Enthalten:  § 6 / § 15 / § 24 (Perioden, Wochenstunden, Tabellenentgelt, Stundenentgelt)
 *             § 21 Bereitschaftsdienst (mit beiden korrigierten Fehlern)
 * Folgt:      § 8 Aktiv-Zeitzuschläge (neue 10%-Stufen, Samstag 3,00 €)  ·  § 9 Abs.1
 *             Rufbereitschaft (12,5%/16%)  ·  index.html-Anbindung
 *
 * >>> OFFEN <<<  Tabellenentgelte FÄ/OÄ/CA der aktuellen Tabelle (1.2.2026/40h) fehlen
 *               noch (offizielle Entgelttabelle). Siehe `null`-Felder in TARIFF.
 */
'use strict';

/* ======================================================================
 *  § 24 Abs. 4 — Rundung
 * ==================================================================== */
const r2 = x => Math.round((x + Number.EPSILON) * 100) / 100;   // 2 Dezimalstellen

/* ======================================================================
 *  § 6 / § 15 / § 24 — Perioden · Wochenstunden · Tabellenentgelte
 *  Stufen aufsteigend (0-basiert). null = noch zu verifizieren / fehlt.
 * ==================================================================== */
const FAKTOR_624 = 4.348;                       // § 24 Abs. 3: Teiler = 4,348 × Wochenstunden

const TARIFF = [
  // ---- 42-Stunden-Tabellen (Standard bis 31.1.2026) ----
  { ab:'2023-07-01', h:42, t:{                  // verifiziert (Stundensätze-xlsx)
      'Ä' :[5298,5563,5829,6095,6361,6627],
      'FÄ':[6991,7284,7578,8092,8757,9271],
      'OÄ':[8757,9271,9839],
      'CA':[10301] } },
  { ab:'2024-04-01', h:42, t:{                  // OCR (Anhang) — CA fehlt
      'Ä' :[5510,5786,6063,6339,6616,6893],
      'FÄ':[7271,7576,7882,8416,9108,9642],
      'OÄ':[9108,9642,10233],
      'CA':[null] } },
  { ab:'2025-02-01', h:42, t:{                  // TODO (OCR unleserlich)
      'Ä' :[null,null,null,null,null,null],
      'FÄ':[null,null,null,null,null,null],
      'OÄ':[null,null,null], 'CA':[null] } },
  // ---- 40-Stunden-Tabellen ----
  { ab:'2024-04-01', h:40, t:{                  // OCR teilweise
      'Ä' :[5247,5511,5775,6037,6301,null,6926],
      'FÄ':[null,null,null,null,null,null],
      'OÄ':[null,null,null], 'CA':[null] } },
  { ab:'2025-02-01', h:40, t:{                  // Ä per OCR, Rest TODO
      'Ä' :[5562,5842,6122,6400,6680,6958,7342],
      'FÄ':[null,null,null,null,null,null],
      'OÄ':[null,null,null], 'CA':[null] } },
  { ab:'2026-02-01', h:40, t:{                  // <<< AKTUELL >>>  Ä per OCR, Rest TODO
      'Ä' :[5841,6135,6429,6720,7014,7306,7710],
      'FÄ':[null,null,null,null,null,null],      // TODO offizielle Tabelle
      'OÄ':[null,null,null],                     // TODO
      'CA':[null] } },                           // TODO
];

/** Gültige Periode für (Datum, Wochenstunden). */
function periode(datumISO, h) {
  return TARIFF.filter(p => p.h === h && p.ab <= datumISO)
               .sort((a,b) => (a.ab < b.ab ? 1 : -1))[0] || null;
}

/** Monatliches Tabellenentgelt. gruppe ∈ {Ä,FÄ,OÄ,CA}, stufeIdx 0-basiert. */
function tabellenentgelt(gruppe, stufeIdx, datumISO, h) {
  const p = periode(datumISO, h);
  if (!p) throw new Error(`Keine Tabelle für ${datumISO} / ${h}h`);
  const v = (p.t[gruppe] || [])[stufeIdx];
  if (v == null) throw new Error(`Tabellenentgelt ${gruppe} Stufe ${stufeIdx+1} (${p.ab}/${p.h}h) noch nicht hinterlegt`);
  return v;
}

/** § 24 Abs. 3: individuelles Stundenentgelt = Monatsentgelt / (4,348 × Wochenstunden). */
function stundenentgelt(gruppe, stufeIdx, datumISO, h) {
  return r2(tabellenentgelt(gruppe, stufeIdx, datumISO, h) / (FAKTOR_624 * h));
}

/* ======================================================================
 *  § 21 — Bereitschaftsdienst
 * ==================================================================== */

/* Lokale Dienst-Stundenzerlegung je Diensttyp (aus Dienstplan — bei Bedarf anpassen).
 *   bd       als Arbeitszeit gewertete BD-Stunden          (× 0,95)
 *   n25/n40  Nachtstunden 25% (21–24 & 04–06) / 40% (00–04)
 *   soBD     Sonntags-BD-Stunden  (§21: 25%)
 *   feBD     Feiertags-BD-Stunden (§21: 25%)
 *   saBD     Samstags-BD-Stunden  (§21 ab 2024: 30%)
 *   so8/fe8  AKTIV-Stunden (kein BD) → § 8: Sonntag 25% bzw. Feiertag m. FZA 35%   */
const BD_DIENST = {
  MoDo:     { bd:11.75, n25:5, n40:4 },
  Fr:       { bd:13.25, n25:5, n40:4, saBD:9.25 },
  Sa:       { bd:19.00, n25:5, n40:4, saBD:10.25, soBD:8.75, so8:0.5 },
  So:       { bd:18.00, n25:5, n40:4,             soBD:10.25, so8:4.25 },
  Feiertag: { bd:18.00, n25:5, n40:4,             feBD:10.25, fe8:4.75 },
};

/* § 21-Sätze (Nacht/So/Fei ab 1.1.2023; Samstag-BD ab 1.1.2024) */
const BD_SATZ = {
  bd:0.95, n25:0.25, n40:0.40, soBD:0.25,
  feBD:0.25,   /* << KORRIGIERT: § 21 Abs.3 Feiertag = 25% (Code hatte fälschlich 0,35) */
  saBD:0.30,
};
/* § 8-Sätze für die Aktiv-Anteile der BD-Tage */
const AKTIV_SATZ = { so8:0.25 /*§8 c Sonntag*/, fe8:0.35 /*§8 d Feiertag m. FZA*/ };

/* § 21 Abs.3: ab 5. BD/Monat 20/40/60/80/100% — PRO BD, max 100% je BD */
const BD_PLUS = [0.20, 0.40, 0.60, 0.80, 1.00];   // 5., 6., 7., 8., 9. BD

const LABELS = {
  bd:'Bereitschaft 95%', n25:'Nacht-BD 25%', n40:'Nacht-BD 40%',
  soBD:'Sonntag-BD 25%', feBD:'Feiertag-BD 25%', saBD:'Samstag-BD 30%',
  so8:'Sonntag aktiv 25% (§8)', fe8:'Feiertag aktiv 35% m.FZA (§8)',
};

/**
 * BD-Entgelt für einen Monat.
 * @param {Object} dienste     z.B. { MoDo:2, Fr:1, Sa:1, So:1, Feiertag:0 }
 * @param {string[]} bdPlusReihe Diensttypen ab dem 5. BD, z.B. ['Sa','So']
 * @param {number} stdLohn     individuelles Stundenentgelt (€)
 * @returns {{positionen:Array, summe:number, hinweise:string[]}}
 */
function bereitschaftsdienst(dienste, bdPlusReihe, stdLohn) {
  const stdJeKat = {};                       // Stunden je Kategorie summiert
  for (const [typ, anzahl] of Object.entries(dienste)) {
    const z = BD_DIENST[typ]; if (!z || !anzahl) continue;
    for (const [kat, std] of Object.entries(z))
      stdJeKat[kat] = (stdJeKat[kat] || 0) + std * anzahl;
  }

  const positionen = [];
  const satzVon = k => BD_SATZ[k] ?? AKTIV_SATZ[k];
  for (const [kat, std] of Object.entries(stdJeKat)) {
    const faktor = satzVon(kat);
    positionen.push({
      lohnart: LABELS[kat] || kat,
      stunden: r2(std),
      faktor,
      betrag: r2(std * faktor * stdLohn),     // jede Position einzeln gerundet (§24 Abs.4)
    });
  }

  /* BD+ ab dem 5. BD — FLACH pro BD (§21 Abs.3: "…v.H. … je Bereitschaftsdienst",
     ohne "je Stunde"; vorher fälschlich × BD-Stunden gerechnet). */
  bdPlusReihe.forEach((typ, i) => {
    if (i >= BD_PLUS.length || !BD_DIENST[typ]) return;
    const faktor = BD_PLUS[i];
    positionen.push({
      lohnart: `BD+ (${i+5}. BD, ${typ})`,
      stunden: 1, faktor,
      betrag: r2(faktor * stdLohn),           // 1 × Stundenlohn × Faktor (KORRIGIERT)
    });
  });

  const summe = r2(positionen.reduce((s,p) => s + p.betrag, 0));
  const hinweise = [
    '§ 21 Abs. 3a (Kappung Summe Abs.-3-Zuschläge ≤ 175%/Std je BD) ist noch nicht ' +
    'angewandt — Auslegung (pro Stunde vs. je BD, Wechselwirkung mit BD+) bitte festlegen.',
  ];
  return { positionen, summe, hinweise };
}

/* ======================================================================
 *  § 8 — Zeitzuschläge bei AKTIVER Arbeitsleistung (kein Bereitschaftsdienst)
 *  Fassung inkl. Änderungstarifvertrag Nr. 1, § 8 n.F. ab 1.8.2024.
 *  WICHTIG: § 21 Abs.2 S.2 — auf BD-Stunden bestehen KEINE §8-Zuschläge;
 *           diese Funktionen gelten nur für aktive/reguläre Dienststunden.
 * ==================================================================== */

/* (b) Stufen je Uhrzeit-Band — stapelbar, da zeitlich disjunkt (ab 1.8.2024). */
const S8_BAND = {
  'tag'   : 0.00,   //  außerhalb der Bänder
  '18-20' : 0.10,   //  aa) Randzeit Mo–Fr 18:00–20:00
  '20-21' : 0.10,   //  bb) frühe Nacht Mo–Fr 20:00–21:00 (zählt NICHT als Nacht i.S. §7 Abs.7)
  '21-24' : 0.25,   //  cc) Nachtarbeit
  '04-06' : 0.25,   //  cc) Nachtarbeit
  '00-04' : 0.40,   //  dd) Nacht 00:00–04:00
};
const S8_UEBERSTUNDE = 0.15;   // a) Überstunden 15%
const S8_SAMSTAG_EUR = 3.00;   // f) Samstag 13–21 Uhr (ab 1.8.2024; vorher 0,64 €)

/* (c–f) gegenseitig ausschließend → höchster Zuschlag (§8 Abs.1 S.3); Vergleich in €. */
function s8_tageszuschlag(tag, { feiertagFZA = true, weihnachten = false } = {}, stdLohn) {
  const cand = [];
  if (tag === 'So')       cand.push(0.25 * stdLohn);                    // c) Sonntag 25%
  if (tag === 'Feiertag') cand.push((feiertagFZA ? 0.35 : 1.35) * stdLohn); // d) 35%/135%
  if (weihnachten)        cand.push(0.35 * stdLohn);                    // e) 24./31.12. ab 6 Uhr 35%
  if (tag === 'Sa')       cand.push(S8_SAMSTAG_EUR);                    // f) Samstag 3,00 €
  return cand.length ? Math.max(...cand) : 0;
}

/**
 * Preis EINER aktiven Arbeitsstunde nach § 8.
 * @param o {tag:'Mo-Fr'|'Sa'|'So'|'Feiertag', band:'tag'|'18-20'|'20-21'|'21-24'|'00-04'|'04-06',
 *           ueberstunde?:bool, feiertagFZA?:bool, weihnachten?:bool}
 * @returns {basis,zuschlag}  basis (100%) nur bei Überstunde, sonst im Monatsentgelt enthalten.
 */
function s8_stunde(o, stdLohn) {
  let bandSatz = S8_BAND[o.band] ?? 0;
  if (o.tag !== 'Mo-Fr' && (o.band === '18-20' || o.band === '20-21')) bandSatz = 0; // aa/bb nur Mo–Fr
  const zuschlag = bandSatz * stdLohn
                 + (o.ueberstunde ? S8_UEBERSTUNDE * stdLohn : 0)
                 + s8_tageszuschlag(o.tag, o, stdLohn);
  return { basis: o.ueberstunde ? r2(stdLohn) : 0, zuschlag: r2(zuschlag) };
}

/** Aggregiert aktive Stunden. Jeder Eintrag = 1 Std, oder {…, n:Anzahl}. */
function zeitzuschlaegeAktiv(stunden, stdLohn) {
  let basis = 0, zuschlag = 0; const positionen = [];
  for (const s of stunden) {
    const n = s.n ?? 1;
    const { basis: b, zuschlag: z } = s8_stunde(s, stdLohn);
    basis += b * n; zuschlag += z * n;
    positionen.push({ ...s, n, basis: r2(b * n), zuschlag: r2(z * n) });
  }
  return { positionen, basis: r2(basis), zuschlag: r2(zuschlag), summe: r2(basis + zuschlag) };
}

/* ======================================================================
 *  § 9 Abs. 4–5 — kurzfristige Dienstplanänderung ("Flex")
 * ==================================================================== */
const FLEX = { ab4wochen: 0.05, unter96h: 0.15, unter48h: 0.30 };   // §9 Abs.5 / Abs.4 a) / b)
/** zuschlag = Faktor × Dienststunden × Stundenlohn (je Stunde des Dienstes). */
function flexZuschlag(dienstStunden, fall, stdLohn) {
  return r2((FLEX[fall] ?? 0) * dienstStunden * stdLohn);
}

/* ======================================================================
 *  § 9 Abs. 1 — Rufbereitschaft (inkl. Änderungstarifvertrag Nr. 1 ab 1.8.2024)
 *  Standby: 12,5% der Zeit als Arbeitszeit, vergütet mit Überstundenvergütung (=100%).
 *  Einsätze: als Überstunden vergütet (§8-Preisung), Mindestens 3 Std je Off-Site-
 *  Heranziehung (einmal, kürzeste); Ferneinsatz auf nächste halbe Stunde aufgerundet.
 * ==================================================================== */
const RUF_STANDBY     = 0.125;   // S.3
const RUF_STANDBY_AB8 = 0.16;    // n.F. S.4: ab 8. Ruf-Dienst/Monat
const RUF_MIN_OFFSITE = 3;       // S.5 (n.F. S.7)

/** § 9 Abs.1 S.8 (n.F.): Telefon-/Ferneinsatz → nächste halbe Stunde Aktivzeit. */
const rufFernAktivzeitStd = min => Math.ceil(Math.max(0, min) / 30) * 0.5;

/**
 * Standby-Vergütung. ruefe = Ruf-Dienste des Monats mit Standby-Stunden, z.B. [{std:14},{std:10}];
 * ab dem 8. Dienst (Index 7) gilt 16%.
 */
function rufbereitschaftStandby(ruefe, stdLohn) {
  const positionen = []; let summe = 0;
  ruefe.forEach((rd, i) => {
    const satz = (i >= 7) ? RUF_STANDBY_AB8 : RUF_STANDBY;
    const betrag = r2(rd.std * satz * stdLohn);
    summe += betrag;
    positionen.push({ ruf: i + 1, stunden: rd.std, satz, betrag });
  });
  return { positionen, summe: r2(summe) };
}

/* Export (Node-Test / spätere UI-Anbindung) */
if (typeof module !== 'undefined') module.exports = {
  // § 6/15/24
  TARIFF, periode, tabellenentgelt, stundenentgelt, r2,
  // § 21 BD
  BD_DIENST, BD_SATZ, BD_PLUS, bereitschaftsdienst,
  // § 8 aktiv
  S8_BAND, s8_stunde, zeitzuschlaegeAktiv,
  // § 9
  FLEX, flexZuschlag, rufbereitschaftStandby, rufFernAktivzeitStd,
};