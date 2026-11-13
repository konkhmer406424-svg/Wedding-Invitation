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

const KH_DOW_KM = ["អា","ច","អ","ពុ","ព្រ","សុ","ស"];
const KH_DOW_EN = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// Whole month calendar (Sunday first) around the event day, with the Khmer lunar day under every solar day.
function khMonthCalendarHtml(dateStr, lang){
  const p = khParseDate_(dateStr);
  if(!p) return "";
  const isKm = lang === "km";
  const first = new Date(p.y, p.m - 1, 1).getDay();
  const days = new Date(p.y, p.m, 0).getDate();
  const num = n => isKm ? khDigits(n) : String(n);
  const dows = (isKm ? KH_DOW_KM : KH_DOW_EN).map((w, i) => `<div class="khcal-dow${i === 0 ? " khcal-sun" : ""}">${w}</div>`).join("");
  let cells = "";
  for(let i = 0; i < first; i++) cells += `<div class="khcal-c khcal-empty"></div>`;
  const months = [];
  for(let d = 1; d <= days; d++){
    const k = khLunarOf(p.y, p.m, d);
    if(k && months.indexOf(k.month) < 0) months.push(k.month);
    const col = (first + d - 1) % 7;
    const ev = d === p.d;
    const lunar = k ? `<i>${khDigits(k.day)}${k.phase}</i>` : "";
    cells += `<div class="khcal-c${ev ? " khcal-ev" : ""}${col === 0 ? " khcal-sun" : ""}"${ev ? ` aria-current="date"` : ""}><b>${num(d)}</b>${lunar}</div>`;
  }
  const title = isKm ? `ខែ${KM_MONTHS[p.m - 1]} ឆ្នាំ${khDigits(p.y)}` : `${EN_MONTHS[p.m - 1]} ${p.y}`;
  const hasLunar = months.length > 0;
  const foot = !hasLunar ? "" : (isKm
    ? `<p class="khcal-foot">ចន្ទគតិ៖ ${months.map(x => "ខែ" + escapeHtml(x)).join(" · ")}</p>`
    : `<p class="khcal-foot">Khmer lunar day under each date (កើត = waxing · រោច = waning) · ${months.map(escapeHtml).join(" · ")}</p>`);
  return `<div class="khcal" role="group" aria-label="${escapeHtml(title)}"><div class="khcal-head display">${escapeHtml(title)}</div><div class="khcal-grid">${dows}${cells}</div>${foot}</div>`;
}

const KHCAL_CSS = `
.khcal{max-width:430px;margin:0 auto 26px;padding:16px 12px 12px;border:1px solid color-mix(in srgb,var(--accent-1) 38%,transparent);border-radius:18px;background:color-mix(in srgb,var(--accent-1) 6%,transparent);font-style:normal;}
.khcal-head{text-align:center;font-size:21px;line-height:1.5;margin:0 0 8px;}
.khcal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;}
.khcal-dow{text-align:center;font-size:12px;font-weight:700;color:var(--accent-2);padding:4px 0;}
.khcal-c{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:44px;padding:3px 0;border-radius:10px;color:var(--ink);}
.khcal-c b{font-size:clamp(14px,4.2vw,18px);font-weight:700;line-height:1.2;}
.khcal-c i{font-style:normal;font-size:clamp(8px,2.3vw,10px);line-height:1.2;opacity:.62;white-space:nowrap;}
.khcal-sun b,.khcal-dow.khcal-sun{color:var(--accent-2);}
.khcal-c.khcal-ev{background:var(--accent-1);box-shadow:0 3px 12px color-mix(in srgb,var(--accent-1) 45%,transparent);}
.khcal-c.khcal-ev b,.khcal-c.khcal-ev i{color:#fff;opacity:1;-webkit-text-fill-color:#fff;}
.khcal-foot{text-align:center;font-size:11px;line-height:1.5;margin:10px 4px 0;color:var(--ink);opacity:.62;}
.hero-date .hd-lunar,.hero-date .hd-solar{display:block;}
.hero-date .hd-lunar{font-size:.92em;line-height:1.55;}
.hero-date .hd-solar{margin-top:2px;}
`;
