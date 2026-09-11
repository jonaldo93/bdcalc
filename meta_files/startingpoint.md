# CLAUDE.md — `bdcalc`

## Purpose
`bdcalc` is a private, browser-based (HTML + vanilla JS) calculator that reproduces the
compensation rules of the **TV-ÄB Charité** physician collective agreement (Charité –
Universitätsmedizin Berlin, negotiated by Marburger Bund). It computes monthly pay
components for on-call duty (**Bereitschaftsdienst**), active-duty time supplements
(**Zeitzuschläge**), standby (**Rufbereitschaft**), short-notice rostering, and
continued-pay averaging. The owner is a Charité physician who uses it to understand and
check payslips, so **numerical correctness against the contract is the top priority** —
this tool informs real-money and labour-law decisions. When in doubt, cite the § and
verify; never guess a number.

## Authoritative contract version
TV-ÄB Charité i.d.F. **1.4.2022** + **Änderungstarifvertrag Nr. 1 (16.5.2024)**. No newer
round. Effective-date timeline the code must honor:

| Date | Change |
|---|---|
| 1.7.2023 | Tabellenentgelte — verified, the 42 h baseline |
| 1.4.2024 | new Tabellenentgelte |
| 1.8.2024 | §8 recast: +10 % Randzeit (Mo–Fr 18–20), +10 % frühe Nacht (Mo–Fr 20–21); Samstag 0,64 €→3,00 €; §8 Abs. 5 deleted. §9 Abs. 1: +16 % Ruf tier from the 8th duty/month + remote half-hour rounding |
| 1.2.2025 | new Tabellenentgelte |
| 1.2.2026 | **weekly hours 42→40** → divisor 182.62→**173.92**, switch to 40 h tables |

**Current config (June 2026): 40 h/week, "ab 1.2.2026" table, divisor 173.92.**

## Repo layout
- `tvaeb_engine.js` — **NEW core engine (this rebuild).** Pure logic, `module.exports`,
  no DOM. Build the new UI against this. *(If not yet in the repo, add the file produced in
  the previous session to the repo root.)*
- `index.html` — UI. **Still the OLD UI; not yet wired to the new engine.**
- `calculateHours1.js` — **OLD** calculation logic, superseded by `tvaeb_engine.js`. Keep
  for reference until the UI is migrated, then remove.
- `script.js` — **STALE** older calculator with divergent constants. **Delete it** (confirm
  `index.html` does not load it).
- recommended `docs/` — drop the OCR'd contract text here for reference: the 2023 TV-ÄB
  markdown and the Amendment Nr. 1 text.

## Current state of the rebuild
Done and **node-verified**:
- **Increment 1** — engine foundation: period-aware `TARIFF`, `stundenentgelt()`
  (§24 Abs. 3 divisor `monthly / (4.348 × weeklyHours)`), and the corrected
  **§21 Bereitschaftsdienst** engine.
- **Increment 2** — **§8 active-duty** Zeitzuschläge (the new 10 % tiers, Samstag 3 €,
  c–f "highest only", correct stacking), **§9 Abs. 4–5** Flex (5/15/30 %), and
  **§9 Abs. 1 Rufbereitschaft** (12.5 % standby → 16 % from the 8th duty/month + remote
  rounding helper).

Not done:
- **Increment 3 — UI.** Rebuild `index.html` to collect inputs (Entgeltgruppe/Stufe,
  period & weekly hours, BD by day-type, active shifts by time-band/day-type, Ruf duties)
  and render the result table from the engine. Delete `script.js`.
- **§9 Abs. 1 call-outs end-to-end.** Standby is done; call-out pay routes to §8
  active-overtime pricing with the 3 h off-site minimum / remote rounding — helpers exist
  (`rufFernAktivzeitStd`, `RUF_MIN_OFFSITE`), assemble the glue.
- **Entgeltfortzahlung** averaging (old `calculateAmountPerDay`, ÷ 65 / 13-week quarter)
  not yet ported into the new engine.

## Changes made in this rebuild (vs the old code)
1. **Bug fix — Feiertag-BD factor.** Old code applied **0.35** to the holiday-BD row;
   §21 Abs. 3 is **25 %**. Now `BD_SATZ.feBD = 0.25`.
2. **Bug fix — BD+ supplement.** Old code multiplied the 5th+ BD ramp by **BD hours**
   (≈ 12–19×), breaching the "≤ 100 % **je Bereitschaftsdienst**" cap. §21 Abs. 3 has no
   "je Stunde" here → now **flat per BD**: `BD_PLUS[i] × stdLohn`.
3. **Period-aware rates + divisor.** Replaced the hardcoded 01.07.2023 / 42 h table and
   `/182.62` with `TARIFF` (multi-period, 42 h & 40 h) and the §24 Abs. 3 formula. Current
   path = 40 h / 173.92.
4. **§8 updated to Amendment Nr. 1**: added 10 % Randzeit (Mo–Fr 18–20) + 10 % frühe Nacht
   (Mo–Fr 20–21); Samstag €3,00; correct c–f "highest only"; proper stacking of
   a) Überstunden / b) night-band / (c–f) day-type.
5. **§9 Abs. 1 Rufbereitschaft** added (was entirely absent): 12.5 % standby → 16 % from
   the 8th duty/month; remote call-out half-hour rounding.
6. Removed the old redundant `calculateFeiertag` double-calls and the two hardcoded hourly
   overrides (`Ä2→30.47`, `FÄ1→38.29`) — those were rounding patches specific to the 2023
   numbers; re-derive per active table instead.

## OPEN BLOCKER — wage numbers
`TARIFF` has `null` cells for **FÄ/OÄ/CA** in the 2024–2026 tables (and most of the
1.2.2025 / 42 h table). OCR of the scanned amendment recovered only the **Arzt** rows
reliably (and those are OCR-derived → verify them too). The engine **throws** rather than
invent a value when a cell is `null`. **To finish: obtain the official Entgelttabelle
Ärzteschaft 2024–2026 and fill every `null`. Never hardcode an unverified wage figure.**

## Interpretation decisions encoded (preserve / revisit with the owner)
- **BD vs §8 separation (§21 Abs. 2 S. 2):** BD hours carry **no** §8 Zeitzuschläge. Price
  each hour under exactly one regime; never stack §8 evening/night tiers onto BD hours.
- **§21 Abs. 3a 175 % cap:** **not** applied yet. Interpretation (per-hour vs per-BD;
  interaction with the now-flat BD+) is deferred to the owner — see `hinweise` in
  `bereitschaftsdienst()`.
- **§8 evening tiers are Mo–Fr only:** 18–20 and 20–21 = 10 %, weekdays only; 20–21 counts
  as night for §3b EStG (tax) but **not** for the §7 Abs. 7 supplement definition (so 10 %,
  not 25 %).
- **`BD_DIENST` hour decomposition is local Dienstplan data** (BD hours per day-type, the
  5 h/4 h night split, Sat/Sun crossover hours) — **not** contract-derived. The owner must
  confirm these against the actual roster; they may shift under the 40 h change.

## How to work in this repo
- **Verify with node** after any engine change (the engine is DOM-free and exports its API):
  ```bash
  node -e 'const E=require("./tvaeb_engine.js");
    console.log(E.stundenentgelt("Ä",0,"2023-07-01",42));               // expect 29.01 (official sheet)
    console.log(E.BD_SATZ.feBD);                                         // expect 0.25 (fixed)
    console.log(E.s8_stunde({tag:"Mo-Fr",band:"18-20"}, 33.58).zuschlag);// expect 3.36 (10%)'
  ```
- **Cite the §** in a comment for every rate/rule you add or change.
- **Keep the engine pure** (no DOM); put UI glue in a separate file so it stays node-testable.
- Contract source files are **ZIP archives of JPEG page-images**, not real PDFs — extract
  with `zipfile`, then OCR (Tesseract 5 + `deu.traineddata` from `tessdata_fast`; prose
  ~1.6× upscale `--psm 6`; dense wage tables need ~3.5× + autocontrast and still OCR poorly
  → prefer the official xlsx for numbers). The 2023 contract is already OCR'd to markdown;
  the amendment to text.