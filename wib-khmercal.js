/* wib-khmercal.js — Khmer lunar (ចន្ទគតិ) + solar (សូរិយគតិ) date line and month calendar for the invitation.
   Lunar dates come from momentkh.js (MIT, ThyrithSor — see momentkh.LICENSE.txt), loaded before this file.
   Everything here runs while the page is BUILT (builder / preview / publish): the guest page only receives finished HTML. */

const KH_DIGITS = ["០","១","២","៣","៤","៥","៦","៧","៨","៩"];
function khDigits(n){ return String(n).replace(/\d/g, d => KH_DIGITS[+d]); }

// "2026-12-12" -> { y, m, d } or null
function khParseDate_(dateStr){
  const mm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr || "").trim());
  if(!mm) return null;
  const y = +mm[1], m = +mm[2], d = +mm[3];
  const t = new Date(y, m - 1, d);
  if(t.getFullYear() !== y || t.getMonth() !== m - 1 || t.getDate() !== d) return null;
  return { y, m, d };
}

// Khmer lunar info of one Gregorian day, or null when the library is missing / the year is out of range.
function khLunarOf(y, m, d){
  try{
    if(typeof momentkh === "undefined" || !momentkh.fromGregorian) return null;
    const k = momentkh.fromGregorian(y, m, d).khmer;
    if(!k || !k.monthName) return null;
    return { day: k.day, phase: k.moonPhaseName, month: k.monthName, animal: k.animalYearName, sak: k.sakName, be: k.beYear, weekday: k.dayOfWeekName };
  }catch(e){ return null; }
}

// Hero date line. Khmer: lunar line + "ត្រូវនឹង" solar line.  English: "December 12, 2026".
// Returns inner HTML for <p class="hero-date">, or "" when it cannot be built (caller then keeps the old plain date).
function khHeroDateHtml(dateStr, lang){
  const p = khParseDate_(dateStr);
  if(!p) return "";
  if(lang !== "km") return `${EN_MONTHS[p.m - 1]} ${p.d}, ${p.y}`;
  const k = khLunarOf(p.y, p.m, p.d);
  const solar = `ត្រូវនឹងថ្ងៃទី${khDigits(p.d)} ខែ${KM_MONTHS[p.m - 1]} ឆ្នាំ${khDigits(p.y)}`;
  if(!k) return "";
  const lunar = `ថ្ងៃ${k.weekday} ${khDigits(k.day)}${k.phase} ខែ${k.month} ឆ្នាំ${k.animal} ${k.sak} ពុទ្ធសករាជ ${khDigits(k.be)}`;
  return `<span class="hd-lunar">${escapeHtml(lunar)}</span> <span class="hd-solar">${escapeHtml(solar)}</span>`;
}

// Plain-text version for the builder's read-back under the date field.
function khDateReadback(dateStr){
  const p = khParseDate_(dateStr);
  if(!p) return "";
  const k = khLunarOf(p.y, p.m, p.d);
  if(!k) return "";
  return `ថ្ងៃ${k.weekday} ${khDigits(k.day)}${k.phase} ខែ${k.month} ឆ្នាំ${k.animal} ${k.sak} ព.ស. ${khDigits(k.be)}`;
}

// Whole month calendar (Sunday first) around the event day.
//  Khmer:   header = full solar date of the event, full weekday names, Khmer lunar day under every solar day,
//           footer = the event day's real lunar date (weekday, កើត/រោច, month, animal year, sak, BE).
//  English: plain English calendar (month + year, full weekday names, no lunar text at all).
function khMonthCalendarHtml(dateStr, lang){
  const p = khParseDate_(dateStr);
  if(!p) return "";
  const isKm = lang === "km";
  const first = new Date(p.y, p.m - 1, 1).getDay();
  const days = new Date(p.y, p.m, 0).getDate();
  // ceremony on the 1st of a month that starts on a Sunday: still show the previous month's last week, so the eve (ចូលរោង) is visible
  const lead = (first === 0 && p.d === 1) ? 7 : first;
  const trail = (7 - (lead + days) % 7) % 7;
  const num = n => isKm ? khDigits(n) : String(n);
  const names = isKm ? KM_WEEKDAYS : EN_WEEKDAYS;
  const dows = names.map((w, i) => `<div class="khcal-dow${i === 0 ? " khcal-sun" : ""}">${escapeHtml(w)}</div>`).join("");
  const eveKey = new Date(p.y, p.m - 1, p.d - 1).getTime();   // the day before the ceremony (ចូលរោង), also when it falls in the previous month
  // one cell for any real calendar day: days of the neighbouring months fill the first / last week (lighter), like a paper calendar
  const cell = (dt, adj, col) => {
    const k = isKm ? khLunarOf(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()) : null;
    const t = dt.getTime();
    const ev = !adj && dt.getDate() === p.d, eve = t === eveKey;
    const lunar = k ? `<i>${khDigits(k.day)}${k.phase}</i>` : "";
    const tag = ev ? `<em>${isKm ? "មង្គលការ" : "Wedding"}</em>` : (eve ? `<em>${isKm ? "ចូលរោង" : "Eve"}</em>` : "");
    return `<div class="khcal-c${adj ? " khcal-adj" : ""}${ev ? " khcal-ev" : ""}${eve ? " khcal-eve" : ""}${col === 0 ? " khcal-sun" : ""}"${ev ? ` aria-current="date"` : ""}>${tag}<b>${num(dt.getDate())}</b>${lunar}</div>`;
  };
  let cells = "", col = 0;
  for(let i = lead; i > 0; i--) cells += cell(new Date(p.y, p.m - 1, 1 - i), true, col++ % 7);
  for(let d = 1; d <= days; d++) cells += cell(new Date(p.y, p.m - 1, d), false, col++ % 7);
  for(let d = 1; d <= trail; d++) cells += cell(new Date(p.y, p.m, d), true, col++ % 7);
  const title = isKm ? `ថ្ងៃទី${khDigits(p.d)} ខែ${KM_MONTHS[p.m - 1]} ឆ្នាំ${khDigits(p.y)}` : `${EN_MONTHS[p.m - 1]} ${p.y}`;
  const evLunar = isKm ? khLunarOf(p.y, p.m, p.d) : null;
  const foot = evLunar
    ? `<p class="khcal-foot">${escapeHtml(`ថ្ងៃ${evLunar.weekday} ${khDigits(evLunar.day)}${evLunar.phase} ខែ${evLunar.month} ឆ្នាំ${evLunar.animal} ${evLunar.sak} ពុទ្ធសករាជ ${khDigits(evLunar.be)}`)}</p>`
    : "";
  return `<div class="khcal" role="group" aria-label="${escapeHtml(title)}"><div class="khcal-head display">${escapeHtml(title)}</div><div class="khcal-grid">${dows}${cells}</div>${foot}</div>`;
}

const KHCAL_CSS = `
.khcal{max-width:620px;margin:0 auto 30px;padding:20px 14px 16px;font-style:normal;box-sizing:border-box;container-type:inline-size;}
.khcal-head{text-align:center;font-size:clamp(19px,5.4vw,26px);line-height:1.6;margin:0 0 12px;}
.khcal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;}
.khcal-dow{text-align:center;font-size:clamp(8.5px,2.5vw,13px);font-size:clamp(8.5px,2.9cqw,13px);font-weight:700;color:var(--accent-2);padding:6px 0 8px;white-space:nowrap;overflow:hidden;letter-spacing:-.02em;}
.khcal-c{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:clamp(52px,14vw,76px);min-height:clamp(52px,14cqw,76px);padding:11px 0 4px;border-radius:10px;border:1px solid color-mix(in srgb,var(--accent-1) 30%,transparent);color:var(--ink);box-sizing:border-box;}
.khcal-c b{font-size:clamp(15px,4.8vw,24px);font-size:clamp(15px,5.2cqw,24px);font-weight:700;line-height:1.2;}
.khcal-c i{font-style:normal;font-size:clamp(8.5px,2.5vw,12px);font-size:clamp(8.5px,2.7cqw,12px);line-height:1.25;opacity:.64;white-space:nowrap;}
.khcal-c em{position:absolute;top:3px;left:0;right:0;text-align:center;font-style:normal;font-weight:700;font-size:clamp(7.5px,2.2vw,11px);font-size:clamp(7.5px,2.4cqw,11px);line-height:1.3;white-space:nowrap;overflow:hidden;color:var(--accent-1);}
.khcal-sun b,.khcal-dow.khcal-sun{color:var(--accent-2);}
.khcal-c.khcal-adj{background:color-mix(in srgb,var(--accent-1) 7%,transparent);border-color:color-mix(in srgb,var(--accent-1) 16%,transparent);}
.khcal-c.khcal-adj b,.khcal-c.khcal-adj i{opacity:.4;}
.khcal-c.khcal-eve,.khcal-c.khcal-adj.khcal-eve{background:color-mix(in srgb,var(--accent-1) 20%,transparent);border-color:color-mix(in srgb,var(--accent-1) 70%,transparent);}
.khcal-c.khcal-adj.khcal-eve b,.khcal-c.khcal-adj.khcal-eve i{opacity:1;}
.khcal-c.khcal-ev{background:var(--accent-1);border-color:var(--accent-1);box-shadow:0 4px 14px color-mix(in srgb,var(--accent-1) 45%,transparent);}
.khcal-c.khcal-ev b,.khcal-c.khcal-ev i,.khcal-c.khcal-ev em{color:#fff;opacity:1;-webkit-text-fill-color:#fff;}
.khcal-foot{text-align:center;font-size:clamp(13px,3.6vw,16px);font-weight:600;line-height:1.7;margin:14px 6px 2px;color:var(--accent-1);}
@media(max-width:520px){.khcal-grid{gap:3px;}}
.hero-date .hd-lunar,.hero-date .hd-solar{display:block;}
.hero-date .hd-lunar{font-size:.92em;line-height:1.55;}
.hero-date .hd-solar{margin-top:2px;}
`;