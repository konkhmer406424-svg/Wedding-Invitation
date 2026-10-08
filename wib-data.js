/* ==========================================================================
   wib-data.js — themes, fonts, labels, templates, image folders, default state, saved draft
   Load order in index.html:  wib-data.js → wib-render.js → wib-pickers.js → wib-ui.js
   (they share one global scope, so keep this order)
   ========================================================================== */
const THEMES = {
  gold:{ label:"មាស", swatch:"linear-gradient(135deg,#B8912E,#6B2D5C)",
    bg:"#FBF8EF", ink:"#3B2A1C", accent1:"#B8912E", accent2:"#6B2D5C",
    card:"#FFFFFF", border:"rgba(184,145,46,0.22)", radius:"4px",
    ornate:true },
  rose:{ label:"ផ្កាកុលាប", swatch:"linear-gradient(135deg,#A8465A,#C9A227)",
    bg:"#FFF3F0", ink:"#402530", accent1:"#A8465A", accent2:"#C9A227",
    card:"#FFFFFF", border:"rgba(168,70,90,0.2)", radius:"4px",
    ornate:true },
  minimal:{ label:"សាមញ្ញ", swatch:"linear-gradient(135deg,#1F1B16,#6B6142)",
    bg:"#F7F4EE", ink:"#1F1B16", accent1:"#1F1B16", accent2:"#6B6142",
    card:"#FFFFFF", border:"rgba(31,27,22,0.15)", radius:"0px",
    ornate:false },
  royal:{ label:"នគរ", swatch:"linear-gradient(135deg,#1B3A6B,#C9A227)",
    bg:"#F5F6FA", ink:"#1B2440", accent1:"#1B3A6B", accent2:"#C9A227",
    card:"#FFFFFF", border:"rgba(27,58,107,0.18)", radius:"4px",
    ornate:true },
  emerald:{ label:"ម្រកត", swatch:"linear-gradient(135deg,#1F5C45,#C9A227)",
    bg:"#F2F8F5", ink:"#1E3B2F", accent1:"#1F5C45", accent2:"#C9A227",
    card:"#FFFFFF", border:"rgba(31,92,69,0.18)", radius:"4px",
    ornate:true },
  blush:{ label:"ផ្កាឈូក", swatch:"linear-gradient(135deg,#C76B84,#E0A458)",
    bg:"#FFF8F5", ink:"#4A2E2A", accent1:"#C76B84", accent2:"#E0A458",
    card:"#FFFFFF", border:"rgba(199,107,132,0.18)", radius:"4px",
    ornate:true }
};

const KM_WEEKDAYS = ["អាទិត្យ","ចន្ទ","អង្គារ","ពុធ","ព្រហស្បតិ៍","សុក្រ","សៅរ៍"];
const KM_MONTHS = ["មករា","កុម្ភៈ","មីនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"];
const EN_WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const LABELS = {
  km:{ countdownTitle:"រាប់ថយក្រោយ", countdownSub:"រយៈពេលដែលនៅសល់រហូតដល់ថ្ងៃមង្គលការ",
    days:"ថ្ងៃ", hours:"ម៉ោង", minutes:"នាទី", seconds:"វិនាទី", congrats:"សូមអបអរសាទរ!",
    programTitle:"កម្មវិធីនៃពិធីមង្គលការ", galleryTitle:"រូបភាពនៃពួកយើង",
    gallerySub:"ដាក់រូបភាព pre-wedding របស់អ្នកជំនួសកន្លែងទាំងនេះ", videoTitle:"វិឌីអូនៃពួកយើង", videoSub:"សូមចុចលេងដើម្បីទស្សនា", venueTitle:"ទីតាំងកម្មវិធី",
    mapBtn:"មើលទីតាំងលើ Google Maps", calBtn:"📅 រក្សាទុកក្នុង Calendar", contactsTitle:"ទំនាក់ទំនង",
    contactsSub:"សម្រាប់ព័ត៌មានលម្អិត សូមទាក់ទងមកកាន់", thanks:"អរគុណ", and:"និង",
    toggleKm:"ខ្មែរ", toggleEn:"English" },
  en:{ countdownTitle:"Countdown", countdownSub:"Time remaining until our special day",
    days:"Days", hours:"Hours", minutes:"Minutes", seconds:"Seconds", congrats:"Congratulations!",
    programTitle:"Wedding Program", galleryTitle:"Our Moments Together",
    gallerySub:"Your pre-wedding photos will appear here", videoTitle:"Our Video", videoSub:"Tap play to watch", venueTitle:"Event Location",
    mapBtn:"View on Google Maps", calBtn:"📅 Save to Calendar", contactsTitle:"Contact Us",
    contactsSub:"For more details, please reach out to", thanks:"Thank You", and:"&",
    toggleKm:"ខ្មែរ", toggleEn:"English" }
};

const EFFECTS = {
  none:{ label:"គ្មាន", icon:"–" },
  petals:{ label:"ផ្កាធ្លាក់", icon:"🌸" },
  snow:{ label:"ព្រិលធ្លាក់", icon:"❄️" },
  stars:{ label:"ផ្កាយធ្លាក់", icon:"✨" }
};


// ---- Font styles: chosen separately from the colour theme (Khmer and English each have their own) ----
const FONT_KM = {
  moul:{ name:"Moul", display:"'Moul',serif", body:"'Kantumruy Pro',sans-serif" },
  suwannaphum:{ name:"Suwannaphum", display:"'Suwannaphum',serif", body:"'Battambang',sans-serif" },
  koulen:{ name:"Koulen", display:"'Koulen','Battambang',serif", body:"'Kantumruy Pro',sans-serif" },
  odormeanchey:{ name:"Odor Mean Chey", display:"'Odor Mean Chey','Battambang',serif", body:"'Kantumruy Pro',sans-serif" },
  angkor:{ name:"Angkor", display:"'Angkor',serif", body:"'Battambang',sans-serif" },
  moulpali:{ name:"Moulpali", display:"'Moulpali',serif", body:"'Kantumruy Pro',sans-serif" }
};
const FONT_EN = {
  greatVibes:{ name:"Great Vibes", display:"'Great Vibes',cursive", body:"'Cormorant Garamond',serif" },
  parisienne:{ name:"Parisienne", display:"'Parisienne',cursive", body:"'Cormorant Garamond',serif" },
  playfair:{ name:"Playfair Display", display:"'Playfair Display',serif", body:"'Cormorant Garamond',serif" },
  ebGaramond:{ name:"EB Garamond", display:"'EB Garamond',serif", body:"'EB Garamond',serif" },
  tangerine:{ name:"Tangerine", display:"'Tangerine',cursive", body:"'Cormorant Garamond',serif" },
  marckScript:{ name:"Marck Script", display:"'Marck Script',cursive", body:"'Cormorant Garamond',serif" }
};
// What each theme used to force. Only used to keep old drafts / saved projects looking exactly as before.
const THEME_FONT_DEFAULTS = {
  gold:["moul","greatVibes"], rose:["suwannaphum","parisienne"], minimal:["koulen","playfair"],
  royal:["odormeanchey","ebGaramond"], emerald:["angkor","tangerine"], blush:["moulpali","marckScript"]
};
// ---- Photo gallery layout: chosen separately from colour/font/theme ----
const GALLERY_STYLES = {
  grid:{ label:"ក្រឡាចត្រង្គ (រូបធំ-តូចឆ្លាស់)" },
  classic:{ label:"ក្រឡាចត្រង្គ (ស្មើគ្នា)" },
  polaroid:{ label:"រូបថតប៉ូឡារ៉ូអ៊ីត" },
  square:{ label:"ក្រឡាការ៉េ" },
  mosaic:{ label:"ម៉ូសាអ៊ិក (ចម្រុះទំហំ — លេចធ្លោ)" }
};
// What each colour theme used to force, before the layout became its own choice. Only used to keep old
// drafts/projects looking the same as before.
// ---- Text animation when the guest scrolls (chosen separately from colour/font/theme) ----
// ---- រូបតំណាង (Stand-in pictures) — បង្ហាញពេលគ្មានរូប Cover ឬគ្មានរូប Pre-wedding ----
// ដាក់ឯកសាររូបទុកក្នុង GitHub តាម folder ដូចខាងក្រោម (ក្នុង images/) ហើយប្រើ ASSET_VERSION ដូចគ្នា។
//   images/covers/   → cover1.png … cover5.png      (បង្ហាញជារូបគម្រប ពេញក្រោមឈ្មោះ — ណែនាំរូបបញ្ឈរ ឧ. 1080×1920 ឬ 1080×1620)
//   images/gallery/  → gallery1.png … gallery5.png  (បង្ហាញក្នុងផ្នែក "រូបភាពនៃពួកយើង" — ណែនាំ 1200×1200 ឬ 1200×900)
// ចង់ប្តូរឈ្មោះក្នុងបញ្ជី (label), ប្តូរប្រភេទឯកសារ (jpg / webp) ឬបន្ថែមជម្រើសថ្មី គ្រាន់តែកែ/ថែមបន្ទាត់ខាងក្រោម។
// ជម្រើសបណ្ដុំរូបភាពអាចមានរូបច្រើនសន្លឹក ដោយសរសេរ files:["a.png","b.png","c.png"] (បង្ហាញតាមទម្រង់ gallery ដែលបានជ្រើស)។
const COVER_ART = {
  none:{ label:"មិនប្រើរូបតំណាង" },
  cover1:{ label:"រូបគម្រប ១", file:"cover1.png" },
  cover2:{ label:"រូបគម្រប ២", file:"cover2.png" },
  cover3:{ label:"រូបគម្រប ៣", file:"cover3.png" },
  cover4:{ label:"រូបគម្រប ៤", file:"cover4.png" },
  cover5:{ label:"រូបគម្រប ៥", file:"cover5.png" }
};
const GALLERY_ART = {
  none:{ label:"មិនប្រើរូបតំណាង" },
  gallery1:{ label:"បណ្ដុំរូបភាព ១", files:["gallery1.png"] },
  gallery2:{ label:"បណ្ដុំរូបភាព ២", files:["gallery2.png"] },
  gallery3:{ label:"បណ្ដុំរូបភាព ៣", files:["gallery3.png"] },
  gallery4:{ label:"បណ្ដុំរូបភាព ៤", files:["gallery4.png"] },
  gallery5:{ label:"បណ្ដុំរូបភាព ៥", files:["gallery5.png"] }
};
function artUrl(file, kind){ return assetBase() + ASSET_DIRS[kind || "gallery"] + file + "?v=" + ASSET_VERSION; }   // kind: "cover" | "gallery"
function coverArtUrl(s){
  const k = s && s.coverArt;
  if(!k || !Object.prototype.hasOwnProperty.call(COVER_ART, k) || !COVER_ART[k].file) return "";
  return artUrl(COVER_ART[k].file, "cover");
}
function galleryArtUrls(s){
  const k = s && s.galleryArt;
  if(!k || !Object.prototype.hasOwnProperty.call(GALLERY_ART, k) || !Array.isArray(GALLERY_ART[k].files)) return [];
  return GALLERY_ART[k].files.map(f => artUrl(f, "gallery"));
}
const TEXT_ANIM_STYLES = {
  fadeup:{ label:"លេចឡើងពីក្រោម (Fade up)" },
  words:{ label:"ស្រាយម្តងមួយពាក្យ (Word by word)" },
  blur:{ label:"ព្រិលទៅច្បាស់ (Blur in)" },
  none:{ label:"គ្មាន" }
};
const THEME_GALLERY_DEFAULTS = { gold:"grid", rose:"polaroid", minimal:"square", royal:"grid", emerald:"grid", blush:"grid" };

// ===== រូបស៊ុម / ផ្ទៃខាងក្រោយ ជាឯកសាររូបភាព (PNG) នៅលើ GitHub =====
// ដាក់ឯកសារក្នុង  images/frames/  (frame1.png … frame5.png)  និង  images/backgrounds/  (bg1.png … bg5.png)
// ស៊ុមនីមួយៗជារូប PNG ថ្លា "ការ៉េ" ១ ឯកសារ (ទំហំណាក៏បាន ឧ. 1080×1080) ហើយកូដកាត់ជា ៩ ចំណែក (9-slice)៖
//   ជ្រុងទាំង ៤ = ផ្នែកក្បាច់ធំ  |  គែមទាំង ៤ = ផ្នែកក្បាច់ដដែលៗ  → ដូច្នេះស៊ុមមិនលាតខុសរូបលើអេក្រង់ណាក៏ដោយ។
// ទំហំជ្រុងក្នុងរូប = 3/8 នៃទំហំរូប (រូប 1080 → ជ្រុង 405px)។ តម្លៃ 405 នេះនៅក្នុង CSS ឈ្មោះ .kb-frame (border-image-slice)។
// ចង់ប្តូររូប គ្រាន់តែ upload រូបថ្មីដាក់ឈ្មោះដូចគ្នា (ជំនួសរូបចាស់) ដោយមិនចាំបាច់កែកូដ។
// ASSET_BASE_OVERRIDE៖ ទុកទទេ = ប្រើ folder តែមួយជាមួយ index.html របស់ Builder នេះ (folder images/ ស្ថិតក្នុងនោះ)។
// បើរូបនៅកន្លែងផ្សេង ដាក់ URL ពេញ ឧ. "https://USERNAME.github.io/REPO/"  (ត្រូវបញ្ចប់ដោយ /)
const ASSET_BASE_OVERRIDE = "";
// folder រូបទាំងអស់ (ទាក់ទងនឹង ASSET_BASE) — ចង់ប្តូរឈ្មោះ folder សូមកែត្រង់នេះតែមួយកន្លែង
const ASSET_DIRS = { frame:"images/frames/", bg:"images/backgrounds/", cover:"images/covers/", gallery:"images/gallery/" };
const ASSET_VERSION = "2";   // ប្តូរលេខនេះ (2, 3 …) ពេលជំនួសរូបថ្មី ដើម្បីបំបាត់ cache
function assetBase(){
  if(ASSET_BASE_OVERRIDE) return ASSET_BASE_OVERRIDE;
  try{ return new URL("./", location.href).href; }catch(e){ return "./"; }
}
const KBACH_FRAME_STYLES = {   // FRAME: នៅពីលើខ្លឹមសារ ជាប់គែមអេក្រង់
  none:{ label:"គ្មាន" },
  frame1:{ label:"ស៊ុម ១ — ផ្កាមាសជ្រុង", file:"frame1.png" },
  frame2:{ label:"ស៊ុម ២ — ស្លឹកឈើសងខាង", file:"frame2.png" },
  frame3:{ label:"ស៊ុម ៣ — ស៊ុមមាសពីរជាន់", file:"frame3.png" },
  frame4:{ label:"ស៊ុម ៤ — ផ្កាព្យួរពីលើ", file:"frame4.png" },
  frame5:{ label:"ស៊ុម ៥ — ក្បាច់ខៀវ-មាស", file:"frame5.png" },
  custom:{ label:"រូបភាពផ្ទាល់ខ្លួន (JPG / PNG / GIF)" }
};
const KBACH_BG_STYLES = {      // BACKGROUND: នៅពីក្រោយខ្លឹមសារ ជាប់អេក្រង់
  none:{ label:"គ្មាន" },
  bg1:{ label:"ផ្ទៃ ១ — មែកផ្កាទ្រេត", file:"bg1.png" },
  bg2:{ label:"ផ្ទៃ ២ — ព័ទ្ធជុំវិញ", file:"bg2.png" },
  bg3:{ label:"ផ្ទៃ ៣ — ជ្រុងតែមួយ", file:"bg3.png" },
  bg4:{ label:"ផ្ទៃ ៤ — កម្រងផ្កាក្រោម", file:"bg4.png" },
  bg5:{ label:"ផ្ទៃ ៥ — មែកសងខាង", file:"bg5.png" },
  custom:{ label:"រូបភាពផ្ទាល់ខ្លួន (JPG / PNG / GIF)" }
};
function kbachPresetUrl(layer, key){
  const m = (layer === "bg") ? KBACH_BG_STYLES : KBACH_FRAME_STYLES;
  if(!Object.prototype.hasOwnProperty.call(m, key) || !m[key].file) return "";
  return assetBase() + ASSET_DIRS[layer === "bg" ? "bg" : "frame"] + m[key].file + "?v=" + ASSET_VERSION;
}
// ឈ្មោះចាស់ (កូដគូរ) → រូបថ្មី  ដើម្បីឱ្យ draft / backup ចាស់នៅតែដំណើរការ
const KBACH_OLD_FRAME_MAP = { floralcorners:"frame1", leafborder:"frame2", goldline:"frame3", hangflowers:"frame4" };
const KBACH_OLD_BG_MAP = { diagbranch:"bg1", fullwrap:"bg2", onecorner:"bg3", bottomgarland:"bg4", sidebranch:"bg5", scatter:"bg1" };
const KBACH_WM_KEYS = ["diagbranch","fullwrap","onecorner","bottomgarland","sidebranch","scatter"];   // old frame values that are really backgrounds

// ---- Ready-made invitation templates: one click sets colour, fonts, cover animation, frame, gallery layout and
// text animation, and fills EMPTY text fields with sample content. Staff then only add photos, song, map and video. ----
const SAMPLE_NAMES = { km:["សុវណ្ណ","ស្រីល័ក្ខ"], en:["Sovann","Srey Leak"] };

const ocDarkText = c => `.open-cover.oc-s-${c} .oc-guest{color:#fff;opacity:.92;text-shadow:0 1px 8px rgba(0,0,0,.5);}
.open-cover.oc-s-${c} .oc-names{color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.55);}
.open-cover.oc-s-${c} .oc-hint{color:#fff;opacity:.85;text-shadow:0 1px 6px rgba(0,0,0,.55);}
.open-cover.oc-s-${c} .oc-btn{background:#fff;color:var(--ink);box-shadow:0 8px 22px rgba(0,0,0,.4);}`;

const LOTUS_PETALS = [   // [closed angle, open angle, closed scale, layer tint %]
  [-14,-72,.80,40],[-7,-36,.80,40],[0,0,.80,40],[7,36,.80,40],[14,72,.80,40],
  [-10,-54,.86,58],[-3,-18,.86,58],[3,18,.86,58],[10,54,.86,58],
  [-6,-32,.92,76],[0,0,.94,76],[6,32,.92,76]
];

const COVER_STYLES = {
  door:{
    label:"ទ្វារ", finishMs:1500,
    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="7" height="18" rx="1"/><rect x="13" y="3" width="7" height="18" rx="1"/><path d="M9 12v1.5M15 12v1.5"/></svg>',
    parts:c => ({ behind:'<div class="oc-leaf oc-leaf-l"></div><div class="oc-leaf oc-leaf-r"></div>' }),
    css:`.oc-s-door{background:radial-gradient(ellipse at 50% 50%,color-mix(in srgb,var(--accent-2) 45%,var(--bg)) 0%,var(--bg) 75%);perspective:1800px;}
.oc-leaf{position:absolute;top:0;bottom:0;width:50%;z-index:2;background:linear-gradient(90deg,color-mix(in srgb,var(--accent-1) 68%,#000),var(--accent-1) 42%,color-mix(in srgb,var(--accent-1) 78%,#000));box-shadow:inset 0 0 0 5px color-mix(in srgb,var(--accent-2) 55%,transparent),inset 0 0 70px rgba(0,0,0,.4);transition:transform 1.25s cubic-bezier(.66,0,.24,1);}
.oc-leaf::before{content:"";position:absolute;inset:7% 11% 9%;border:2px solid color-mix(in srgb,var(--accent-2) 62%,transparent);border-radius:3px;box-shadow:inset 0 0 26px rgba(0,0,0,.28),0 0 0 1px rgba(0,0,0,.25);}
.oc-leaf::after{content:"";position:absolute;top:76%;width:9px;height:96px;margin-top:-48px;border-radius:5px;background:linear-gradient(90deg,color-mix(in srgb,var(--accent-2) 60%,#fff),var(--accent-2) 55%,color-mix(in srgb,var(--accent-2) 70%,#000));box-shadow:0 3px 8px rgba(0,0,0,.45);}
.oc-leaf-l{left:0;transform-origin:0 50%;}
.oc-leaf-l::after{right:14px;}
.oc-leaf-r{right:0;transform-origin:100% 50%;}
.oc-leaf-r::after{left:14px;}
.open-cover.opening .oc-leaf-l{transform:rotateY(-112deg);}
.open-cover.opening .oc-leaf-r{transform:rotateY(112deg);}
${ocDarkText("door")}`
  },
  curtain:{
    label:"វាំងនន", finishMs:1800,
    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18"/><path d="M5 4c0 6-1 12-2 16h6c-1-4-2-10-2-16"/><path d="M19 4c0 6 1 12 2 16h-6c1-4 2-10 2-16"/></svg>',
    parts:c => ({ behind:'<div class="oc-drape oc-drape-l"></div><div class="oc-drape oc-drape-r"></div><div class="oc-valance"></div>' }),
    css:`.oc-s-curtain{background:radial-gradient(ellipse at 50% 45%,color-mix(in srgb,var(--accent-2) 40%,var(--bg)) 0%,var(--bg) 72%);}
.oc-drape{position:absolute;top:0;bottom:0;width:50.4%;z-index:2;background:repeating-linear-gradient(90deg,rgba(0,0,0,.34) 0,rgba(0,0,0,0) 15px,rgba(255,255,255,.13) 30px,rgba(0,0,0,.34) 46px),linear-gradient(180deg,color-mix(in srgb,var(--accent-1) 88%,#fff) 0%,var(--accent-1) 40%,color-mix(in srgb,var(--accent-1) 62%,#000) 100%);transition:transform 1.6s cubic-bezier(.62,0,.28,1);}
.oc-drape::after{content:"";position:absolute;left:0;right:0;bottom:0;height:12px;background:repeating-linear-gradient(90deg,var(--accent-2) 0 3px,transparent 3px 7px);}
.oc-drape-l{left:0;transform-origin:0 50%;}
.oc-drape-r{right:0;transform-origin:100% 50%;}
.open-cover.opening .oc-drape{transform:scaleX(.15);}
.oc-valance{position:absolute;top:0;left:0;right:0;height:58px;z-index:3;background:linear-gradient(180deg,color-mix(in srgb,var(--accent-1) 60%,#000),var(--accent-1));border-bottom:4px solid var(--accent-2);box-shadow:0 6px 16px rgba(0,0,0,.4);}
.oc-valance::after{content:"";position:absolute;left:0;right:0;top:100%;height:20px;background:radial-gradient(circle at 22px 0,var(--accent-1) 20px,transparent 21px) 0 0/44px 20px repeat-x;filter:drop-shadow(0 4px 3px rgba(0,0,0,.3));}
${ocDarkText("curtain")}`
  },
  lock:{
    label:"សោ", finishMs:1750,
    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    parts:c => ({
      behind:'<div class="oc-half oc-half-t"></div><div class="oc-half oc-half-b"></div>',
      top:'<div class="oc-lockbox"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="10" y="22" width="28" height="20" rx="4" fill="currentColor" fill-opacity=".15"/><path class="oc-shackle" d="M16 22v-6a8 8 0 0 1 16 0v6"/><circle cx="24" cy="31" r="2.6" fill="currentColor" stroke="none"/><path d="M24 33v4"/></svg></div>'
    }),
    css:`.oc-half{position:absolute;left:0;right:0;height:50.4%;z-index:1;background:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px) 0 0/34px 34px,linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px) 0 0/34px 34px,color-mix(in srgb,var(--accent-1) 26%,#080a0f);transition:transform .95s cubic-bezier(.72,0,.28,1) .6s;}
.oc-half-t{top:0;}
.oc-half-b{bottom:0;}
.oc-half::after{content:"";position:absolute;left:0;right:0;height:2px;background:color-mix(in srgb,var(--accent-2) 45%,#fff);box-shadow:0 0 14px color-mix(in srgb,var(--accent-2) 45%,#fff);opacity:.85;}
.oc-half-t::after{bottom:0;}
.oc-half-b::after{top:0;}
.open-cover.opening .oc-half-t{transform:translateY(-101%);}
.open-cover.opening .oc-half-b{transform:translateY(101%);}
.oc-lockbox{--lk:color-mix(in srgb,var(--accent-2) 45%,#fff);width:116px;height:116px;margin:0 0 26px;border-radius:50%;border:3px solid var(--lk);color:var(--lk);display:grid;place-items:center;box-shadow:0 0 0 8px rgba(255,255,255,.05),0 0 30px color-mix(in srgb,var(--lk) 50%,transparent);transition:border-color .3s ease,color .3s ease,box-shadow .3s ease,opacity .35s ease .62s;animation:oc-led 2.4s ease-in-out infinite;}
.oc-lockbox svg{width:56px;height:56px;overflow:visible;}
.oc-shackle{transition:transform .5s cubic-bezier(.3,1.5,.5,1);transform-box:fill-box;transform-origin:0 100%;}
.open-cover.opening .oc-lockbox{border-color:#3ddc84;color:#3ddc84;box-shadow:0 0 0 8px rgba(61,220,132,.12),0 0 36px rgba(61,220,132,.7);opacity:0;animation:none;}
.open-cover.opening .oc-shackle{transform:translateY(-5px) rotate(-38deg);}
@keyframes oc-led{0%,100%{box-shadow:0 0 0 8px rgba(255,255,255,.05),0 0 22px color-mix(in srgb,var(--lk) 40%,transparent);}50%{box-shadow:0 0 0 8px rgba(255,255,255,.08),0 0 38px color-mix(in srgb,var(--lk) 75%,transparent);}}
${ocDarkText("lock")}`
  },
  rings:{
    label:"ចិញ្ចៀន", finishMs:1900,
    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="15" r="5.5"/><circle cx="15.5" cy="15" r="5.5"/><path d="M12 2l1 2.2 2.2 1-2.2 1L12 8.4l-1-2.2L8.8 5.2l2.2-1z"/></svg>',
    parts:c => ({ mid:'<div class="oc-rings"><i class="oc-ring oc-ring-a"></i><i class="oc-ring oc-ring-b"></i><span class="oc-rspark">&#10022;</span></div>' }),
    css:`.oc-s-rings{background:radial-gradient(ellipse at 50% 42%,color-mix(in srgb,var(--accent-2) 22%,transparent) 0%,transparent 62%),var(--bg);}
.oc-rings{position:relative;width:210px;height:112px;margin:8px auto 34px;transition:transform .7s ease 1.15s,opacity .5s ease 1.3s;animation:oc-rglow 2.6s ease-in-out infinite;}
@keyframes oc-rglow{0%,100%{filter:drop-shadow(0 6px 10px rgba(0,0,0,.22));}50%{filter:drop-shadow(0 6px 18px color-mix(in srgb,var(--accent-2) 55%,transparent));}}
.oc-ring{position:absolute;top:4px;width:104px;height:104px;border-radius:50%;background:conic-gradient(from 30deg,var(--c1),#fff 18%,var(--c1) 38%,var(--c2) 62%,#fff 80%,var(--c1));-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 11px),#000 calc(100% - 10px));mask:radial-gradient(farthest-side,transparent calc(100% - 11px),#000 calc(100% - 10px));transition:transform 1s cubic-bezier(.5,0,.2,1);}
.oc-ring-a{left:0;--c1:color-mix(in srgb,var(--accent-1) 80%,#fff);--c2:var(--accent-1);}
.oc-ring-b{right:0;--c1:color-mix(in srgb,var(--accent-2) 65%,#fff);--c2:var(--accent-2);}
.open-cover.opening .oc-ring-a{transform:translateX(34px) rotate(140deg);}
.open-cover.opening .oc-ring-b{transform:translateX(-34px) rotate(-140deg);}
.oc-rspark{position:absolute;left:50%;top:-14px;margin-left:-15px;font-size:30px;line-height:1;color:var(--accent-1);opacity:0;transform:scale(.2) rotate(-40deg);transition:opacity .4s ease .75s,transform .6s cubic-bezier(.3,1.6,.5,1) .75s;}
.open-cover.opening .oc-rspark{opacity:1;transform:scale(1) rotate(0);}
.open-cover.opening .oc-rings{transform:scale(1.5);opacity:0;animation:none;}
@media(max-height:640px){.oc-rings{transform:scale(.8);margin-bottom:14px;}}`
  },
  lotus:{
    label:"ផ្កាឈូក", finishMs:1900,
    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20c-3-2-4-6-3-10 1 2 2 3 3 4 1-1 2-2 3-4 1 4 0 8-3 10z"/><path d="M12 20c-5 0-8-3-9-7 3 0 5 1 6.5 3"/><path d="M12 20c5 0 8-3 9-7-3 0-5 1-6.5 3"/></svg>',
    parts:c => ({ mid:'<div class="oc-lotus">' + LOTUS_PETALS.map(pt => `<svg class="oc-petal" viewBox="0 0 64 118" aria-hidden="true" style="--a0:${pt[0]}deg;--a1:${pt[1]}deg;--s0:${pt[2]};--tint:${pt[3]}%"><path d="M32 117C4 92 4 34 32 1C60 34 60 92 32 117Z"/></svg>`).join("") + '<b class="oc-core"></b><em class="oc-water"></em></div>' }),
    css:`.oc-s-lotus{background:radial-gradient(ellipse at 50% 46%,color-mix(in srgb,var(--accent-2) 24%,transparent) 0%,transparent 60%),var(--bg);}
.oc-lotus{position:relative;width:250px;height:200px;margin:4px auto 24px;transition:transform 1s cubic-bezier(.6,0,.3,1) 1s,opacity .6s ease 1.5s;}
.oc-petal{position:absolute;left:50%;bottom:16px;width:64px;height:118px;margin-left:-32px;transform-origin:50% 100%;transform:rotate(var(--a0)) scale(var(--s0));transition:transform 1.05s cubic-bezier(.3,1.25,.4,1);overflow:visible;}
.oc-petal path{fill:color-mix(in srgb,var(--accent-1) var(--tint),#fff);stroke:rgba(255,255,255,.75);stroke-width:1.5;}
.open-cover.opening .oc-petal{transform:rotate(var(--a1)) scale(1);}
.oc-core{position:absolute;left:50%;bottom:14px;width:40px;height:40px;margin-left:-20px;border-radius:50%;background:radial-gradient(circle,#fff6cf 0%,var(--accent-2) 70%);box-shadow:0 0 30px color-mix(in srgb,var(--accent-2) 80%,transparent);opacity:0;transform:scale(.3);transition:opacity .6s ease .5s,transform .8s ease .5s;}
.open-cover.opening .oc-core{opacity:1;transform:scale(1);}
.open-cover.opening .oc-lotus{transform:scale(7);opacity:0;}
.oc-water{position:absolute;left:6%;right:6%;bottom:0;height:22px;border-radius:50%;border:2px solid color-mix(in srgb,var(--accent-1) 35%,transparent);}
@media(max-height:640px){.oc-lotus{transform-origin:50% 100%;height:170px;}}`
  },
  heart:{
    label:"បេះដូង", finishMs:1900,
    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21C5 15.5 3 11.5 3 8.500a4.5 4.5 0 0 1 9-2 4.5 4.5 0 0 1 9 2c0 3-2 7-9 12.5z"/><path d="M12 6.5 10 10l3 2.500-2 4"/></svg>',
    parts:c => {
      const hs = '<svg viewBox="0 0 100 90" aria-hidden="true"><path d="M50 86C10 56 2 34 2 22 2 10 12 2 24 2c10 0 20 6 26 16C56 8 66 2 76 2c12 0 22 8 22 20 0 12-8 34-48 64Z"/></svg>';
      return { mid:'<div class="oc-heart"><i class="oc-hglow"></i><div class="oc-hbeat"><div class="oc-hh oc-hh-l">' + hs + '</div><div class="oc-hh oc-hh-r">' + hs + '</div></div><u class="oc-hp">&#9829;</u><u class="oc-hp">&#9829;</u><u class="oc-hp">&#9829;</u><u class="oc-hp">&#9829;</u><u class="oc-hp">&#9829;</u></div>' };
    },
    css:`.oc-s-heart{background:radial-gradient(ellipse at 50% 42%,color-mix(in srgb,var(--accent-2) 20%,transparent) 0%,transparent 62%),var(--bg);}
.oc-heart{position:relative;width:170px;height:153px;margin:4px auto 32px;transition:transform .7s ease 1.15s,opacity .5s ease 1.3s;}
.oc-hglow{position:absolute;inset:-30%;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--accent-2) 45%,transparent) 0%,transparent 65%);opacity:0;transition:opacity .6s ease .35s;}
.open-cover.opening .oc-hglow{opacity:1;}
.oc-hbeat{position:absolute;inset:0;animation:oc-beat 1.5s ease-in-out infinite;}
@keyframes oc-beat{0%,56%,100%{transform:scale(1);}14%{transform:scale(1.09);}28%{transform:scale(1);}42%{transform:scale(1.06);}}
.oc-hh{position:absolute;inset:0;transition:transform .95s cubic-bezier(.5,0,.2,1),opacity .6s ease .5s;}
.oc-hh svg{width:100%;height:100%;display:block;overflow:visible;}
.oc-hh path{fill:var(--accent-1);stroke:var(--accent-2);stroke-width:2.5;stroke-linejoin:round;}
.oc-hh-l{clip-path:polygon(0 0,50% 0,46% 20%,54% 40%,47% 60%,53% 80%,50% 100%,0 100%);transform-origin:50% 100%;}
.oc-hh-r{clip-path:polygon(50% 0,100% 0,100% 100%,50% 100%,53% 80%,47% 60%,54% 40%,46% 20%);transform-origin:50% 100%;}
.open-cover.opening .oc-hbeat{animation:none;}
.open-cover.opening .oc-hh-l{transform:translateX(-58%) rotate(-16deg);opacity:0;}
.open-cover.opening .oc-hh-r{transform:translateX(58%) rotate(16deg);opacity:0;}
.oc-hp{position:absolute;left:50%;top:50%;margin:-9px 0 0 -9px;font-size:18px;line-height:1;text-decoration:none;color:var(--accent-1);opacity:0;transform:translate(0,0) scale(.3);transition:transform .9s cubic-bezier(.2,.8,.3,1) .35s,opacity .9s ease .35s;}
.oc-hp:nth-of-type(1){--x:-84px;--y:-62px;}
.oc-hp:nth-of-type(2){--x:80px;--y:-70px;}
.oc-hp:nth-of-type(3){--x:-96px;--y:22px;}
.oc-hp:nth-of-type(4){--x:92px;--y:30px;}
.oc-hp:nth-of-type(5){--x:0;--y:-96px;}
.open-cover.opening .oc-hp{opacity:.95;transform:translate(var(--x),var(--y)) scale(1);}
.open-cover.opening .oc-heart{transform:scale(1.4);opacity:0;}
@media(max-height:640px){.oc-heart{transform:scale(.78);margin-bottom:6px;}.open-cover.opening .oc-heart{transform:scale(1.1);}}`
  }
};

const OC_BASE_CSS = `
.open-cover{position:fixed;inset:0;z-index:300;overflow:hidden;text-align:center;cursor:pointer;-webkit-tap-highlight-color:transparent;}
.open-cover.finish{opacity:0;visibility:hidden;pointer-events:none;transition:opacity .6s ease,visibility .6s;}
.oc-inner{position:relative;z-index:5;height:100%;max-width:440px;margin:0 auto;padding:28px 24px;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.oc-fade{transition:opacity .35s ease,transform .35s ease;}
.open-cover.opening .oc-fade{opacity:0 !important;transform:translateY(-6px);pointer-events:none;}
.oc-guest{margin:0 0 12px;font-size:15px;color:var(--ink);opacity:.85;line-height:1.7;}
.oc-guest span{font-family:var(--body-font-en);font-style:italic;opacity:.8;}
.oc-names{font-size:clamp(28px,8vw,44px);line-height:1.5;margin:0 0 28px;}
.oc-btn{border:none;cursor:pointer;background:var(--accent-1);color:#fff;border-radius:999px;padding:14px 30px;display:inline-flex;flex-direction:column;align-items:center;gap:2px;box-shadow:0 8px 22px color-mix(in srgb,var(--accent-1) 35%,transparent);font-family:var(--body-font);animation:oc-pulse 2.6s ease-in-out infinite;}
.open-cover.opening .oc-btn{animation:none;}
.oc-btn .oc-km{font-size:16px;font-weight:600;line-height:1.6;}
.oc-btn .oc-en{font-size:12.5px;opacity:.9;font-family:var(--body-font-en);font-style:italic;}
.oc-hint{margin:18px 0 0;font-size:13px;color:var(--ink);opacity:.65;line-height:1.7;}
.oc-hint span{font-family:var(--body-font-en);font-style:italic;display:block;}
.oc-hint + .oc-hint{margin-top:8px;}
.oc-btn:focus-visible,.music-btn:focus-visible{outline:2px solid var(--accent-2);outline-offset:3px;}
body.oc-noscroll{overflow:hidden;}
@keyframes oc-pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.045);}}
@media(prefers-reduced-motion:reduce){.open-cover *,.open-cover.finish{transition:none !important;animation:none !important;}}
`;

const MUSIC_BTN_CSS = `
.music-btn{position:fixed;right:16px;bottom:18px;z-index:100;width:44px;height:44px;padding:0;border-radius:50%;border:1px solid color-mix(in srgb, var(--border) 55%, transparent);background:var(--ctl-bg, var(--card));color:var(--accent-1);box-shadow:0 2px 8px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.music-btn svg{width:20px;height:20px;filter:drop-shadow(0 0 3px var(--card));}
.music-btn .ico-off{display:none;}
.music-btn:not(.on) .ico-on{display:none;}
.music-btn.on{background:var(--accent-1);color:#fff;}
`;

const TPL_LABELS = { km:["ប្រពៃណី","កក់ក្តៅ","សាមញ្ញ"], en:["Formal","Heartfelt","Simple"] };

const TEMPLATES = {
  eyebrow:{
    km:[
      "សូមគោរពអញ្ជើញអ្នកមកចូលរួមព្រឹត្តិការណ៍ដ៏មានតម្លៃមួយនេះ",
      "ក្នុងជីវិតមានតែថ្ងៃមួយប៉ុណ្ណោះ ដែលយើងចង់ឲ្យអ្នកនៅជាមួយ",
      "អញ្ជើញអ្នកមកចែករំលែកភាពរីករាយក្នុងថ្ងៃសំខាន់របស់យើង"
    ],
    en:[
      "You are cordially invited to join us in celebrating our special day",
      "Together with our families, we joyfully invite you to share in our wedding day",
      "Join us as we begin our forever — your presence means the world to us"
    ]
  },
  welcomeText:{
    km:[
      "ក្តីស្រឡាញ់ពីរដួងចិត្តបានលូតលាស់ ហើយថ្ងៃមួយដ៏មានអត្ថន័យបំផុតកំពុងតែមកដល់។ សូមគោរពអញ្ជើញលោកអ្នកជាទីគោរពស្រឡាញ់ ចូលរួមជាភ្ញៀវកិត្តិយសក្នុងពិធីមង្គលការនេះ។",
      "ពួកយើងទាំងពីរនាក់មានក្តីរីករាយយ៉ាងខ្លាំង ដែលទទួលបានឱកាសចែករំលែកថ្ងៃពិសេសនេះជាមួយអ្នក។ វត្តមានរបស់អ្នកនឹងធ្វើឲ្យថ្ងៃនេះកាន់តែមានអត្ថន័យសម្រាប់ពួកយើង។",
      "សុបិនចង់បានរបស់យើងកំពុងនឹងក្លាយជាការពិត។ សូមអញ្ជើញអ្នកមកចែករំលែកភាពសប្បាយរីករាយ និងក្តីស្រឡាញ់ជាមួយពួកយើង។"
    ],
    en:[
      "Two hearts have grown into one, and the most meaningful day is finally here. We warmly invite you, our cherished guest, to join us as an honored guest at our wedding celebration.",
      "We are so happy to share this special chapter of our lives with you. Your presence would mean so much to us as we begin our journey together as husband and wife.",
      "Our story is just beginning, and we would love for you to be part of it. Please join us for a celebration of love, laughter, and new beginnings."
    ]
  }
};

const TIMELINE_PRESETS = [
  {
    label:"ពីរថ្ងៃ (ចូលរោងពីល្ងាច)",
    labelEn:"Two Days (Pavilion opens the evening before)",
    items:[
      {time:"ថ្ងៃទី១ · ៤:០០ រសៀល", name:"ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", timeEn:"Day 1 · 4:00 PM", nameEn:"Monks' Chanting & Blessing"},
      {time:"៥:០០ ល្ងាច", name:"ពិធីចងដៃ", timeEn:"5:00 PM", nameEn:"Wrist-Tying Blessing Ceremony"},
      {time:"៥:៣០ ល្ងាច", name:"ពិធីកាត់ខានស្លា", timeEn:"5:30 PM", nameEn:"Areca Blossom Cutting Ceremony"},
      {time:"៦:០០ ល្ងាច", name:"អាហារល្ងាច", timeEn:"6:00 PM", nameEn:"Dinner"},
      {time:"ថ្ងៃទី២ · ៦:៣០ ព្រឹក", name:"ពិធីហែជំនូន", timeEn:"Day 2 · 6:30 AM", nameEn:"Gift Procession"},
      {time:"៧:៣០ ព្រឹក", name:"ពិធីរាប់ផ្លែឈើ", timeEn:"7:30 AM", nameEn:"Fruit Counting Ceremony"},
      {time:"៨:៣០ ព្រឹក", name:"ពិធីកាត់សក់បង្កក់សេរី", timeEn:"8:30 AM", nameEn:"Hair-Cutting Ceremony"},
      {time:"៩:៣០ ព្រឹក", name:"ពិធីបង្វិលពពិល", timeEn:"9:30 AM", nameEn:"Candle Circling Ceremony"},
      {time:"១០:៣០ ព្រឹក", name:"ពិធីចូលបន្ទប់ផ្សំដំណេក (ព្រះថោងតោងស្បៃ)", timeEn:"10:30 AM", nameEn:"Nuptial Chamber Ceremony (Preah Thong Holds the Scarf)"},
      {time:"១២:០០ ថ្ងៃត្រង់", name:"អាហារថ្ងៃត្រង់", timeEn:"12:00 PM", nameEn:"Lunch"},
      {time:"៥:០០ ល្ងាច", name:"ទទួលភ្ញៀវអាហារល្ងាច", timeEn:"5:00 PM", nameEn:"Evening Reception & Dinner"},
      {time:"៦:៣០ ល្ងាច", name:"ពិធីកាត់នំឬផ្លែឈើ", timeEn:"6:30 PM", nameEn:"Cake (or Fruit) Cutting Ceremony"},
      {time:"៧:៣០ ល្ងាច", name:"ពិធីថ្លែងអំណរគុណភ្ញៀវកេរ្តិ៍យស", timeEn:"7:30 PM", nameEn:"Thank-You Speech to Honoured Guests"},
      {time:"៨:០០ ល្ងាច", name:"រាំអោប", timeEn:"8:00 PM", nameEn:"Slow Dance"}
    ]
  },
  {
    label:"ពិធីមួយថ្ងៃ",
    labelEn:"One-Day Wedding",
    items:[
      {time:"៦:៣០ ព្រឹក", name:"ពិធីហែជំនូន", timeEn:"6:30 AM", nameEn:"Gift Procession"},
      {time:"៧:០០ ព្រឹក", name:"ពិធីរាប់ផ្លែឈើ", timeEn:"7:00 AM", nameEn:"Fruit Counting Ceremony"},
      {time:"៧:៣០ ព្រឹក", name:"ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", timeEn:"7:30 AM", nameEn:"Monks' Chanting & Blessing"},
      {time:"៨:៣០ ព្រឹក", name:"ពិធីបង្វិលពពិល", timeEn:"8:30 AM", nameEn:"Candle Circling Ceremony"},
      {time:"៩:០០ ព្រឹក", name:"ពិធីកាត់សក់បង្កក់សេរី", timeEn:"9:00 AM", nameEn:"Hair-Cutting Ceremony"},
      {time:"៩:៣០ ព្រឹក", name:"ពិធីចូលបន្ទប់ផ្សំដំណេក (ព្រះថោងតោងស្បៃ)", timeEn:"9:30 AM", nameEn:"Nuptial Chamber Ceremony (Preah Thong Holds the Scarf)"},
      {time:"១០:០០ ព្រឹក", name:"ពិធីចងដៃ", timeEn:"10:00 AM", nameEn:"Wrist-Tying Blessing Ceremony"},
      {time:"១០:៣០ ព្រឹក", name:"ពិធីកាត់ខានស្លា", timeEn:"10:30 AM", nameEn:"Areca Blossom Cutting Ceremony"},
      {time:"១២:០០ ថ្ងៃត្រង់", name:"អាហារថ្ងៃត្រង់", timeEn:"12:00 PM", nameEn:"Lunch"},
      {time:"៥:០០ ល្ងាច", name:"ទទួលភ្ញៀវអាហារល្ងាច", timeEn:"5:00 PM", nameEn:"Evening Reception & Dinner"},
      {time:"៦:៣០ ល្ងាច", name:"ពិធីកាត់នំឬផ្លែឈើ", timeEn:"6:30 PM", nameEn:"Cake (or Fruit) Cutting Ceremony"},
      {time:"៧:៣០ ល្ងាច", name:"ពិធីថ្លែងអំណរគុណភ្ញៀវកេរ្តិ៍យស", timeEn:"7:30 PM", nameEn:"Thank-You Speech to Honoured Guests"},
      {time:"៨:០០ ល្ងាច", name:"រាំអោប", timeEn:"8:00 PM", nameEn:"Slow Dance"}
    ]
  },
  {
    label:"ពិធីមួយព្រឹក (ចូលរោងពីល្ងាច)",
    labelEn:"Morning Wedding (Pavilion opens the evening before)",
    items:[
      {time:"ថ្ងៃទី១ · ៤:០០ រសៀល", name:"ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត", timeEn:"Day 1 · 4:00 PM", nameEn:"Monks' Chanting & Blessing"},
      {time:"៥:០០ ល្ងាច", name:"ពិធីចងដៃ", timeEn:"5:00 PM", nameEn:"Wrist-Tying Blessing Ceremony"},
      {time:"៥:៣០ ល្ងាច", name:"ពិធីកាត់ខានស្លា", timeEn:"5:30 PM", nameEn:"Areca Blossom Cutting Ceremony"},
      {time:"៦:០០ ល្ងាច", name:"អាហារល្ងាច", timeEn:"6:00 PM", nameEn:"Dinner"},
      {time:"ថ្ងៃទី២ · ៦:៣០ ព្រឹក", name:"ពិធីហែជំនូន", timeEn:"Day 2 · 6:30 AM", nameEn:"Gift Procession"},
      {time:"៧:៣០ ព្រឹក", name:"ពិធីរាប់ផ្លែឈើ", timeEn:"7:30 AM", nameEn:"Fruit Counting Ceremony"},
      {time:"៨:៣០ ព្រឹក", name:"ពិធីកាត់សក់បង្កក់សេរី", timeEn:"8:30 AM", nameEn:"Hair-Cutting Ceremony"},
      {time:"៩:៣០ ព្រឹក", name:"ពិធីបង្វិលពពិល", timeEn:"9:30 AM", nameEn:"Candle Circling Ceremony"},
      {time:"១០:៣០ ព្រឹក", name:"ពិធីចូលបន្ទប់ផ្សំដំណេក (ព្រះថោងតោងស្បៃ)", timeEn:"10:30 AM", nameEn:"Nuptial Chamber Ceremony (Preah Thong Holds the Scarf)"},
      {time:"១១:០០ ព្រឹក", name:"ទទួលភ្ញៀវអាហារថ្ងៃត្រង់", timeEn:"11:00 AM", nameEn:"Lunch Reception"},
      {time:"១២:០០ ថ្ងៃត្រង់", name:"ពិធីកាត់នំឬផ្លែឈើ", timeEn:"12:00 PM", nameEn:"Cake (or Fruit) Cutting Ceremony"},
      {time:"១២:៣០ ថ្ងៃត្រង់", name:"ពិធីថ្លែងអំណរគុណភ្ញៀវកេរ្តិ៍យស", timeEn:"12:30 PM", nameEn:"Thank-You Speech to Honoured Guests"},
      {time:"១:០០ រសៀល", name:"រាំអោប", timeEn:"1:00 PM", nameEn:"Slow Dance"}
    ]
  }
];


const INVITATION_PRESETS = {
  classic:{ label:"ប្រពៃណីខ្មែរ (មាស)", desc:"ផ្កាឈូកបើក · ក្របខណ្ឌព័ទ្ធពេញ · រូបធំ-តូចឆ្លាស់ · អក្សរលេចឡើង",
    swatch:THEMES.gold.swatch, tpl:0, timeline:0, startTime:"16:00",
    design:{ theme:"gold", fontKm:"moul", fontEn:"greatVibes", galleryStyle:"grid", kbachFrame:"none", kbachBg:"bg2", textAnim:"fadeup", openStyle:"lotus" } },
  romantic:{ label:"ស្នេហ៍ទន់ភ្លន់ (ផ្កាឈូក)", desc:"បេះដូងបែក · កម្រងផ្កាក្រោម · រូបប៉ូឡារ៉ូអ៊ីត · អក្សរព្រិលទៅច្បាស់",
    swatch:THEMES.blush.swatch, tpl:1, timeline:1, startTime:"06:30",
    design:{ theme:"blush", fontKm:"suwannaphum", fontEn:"parisienne", galleryStyle:"polaroid", kbachFrame:"none", kbachBg:"bg4", textAnim:"blur", openStyle:"heart" } },
  elegant:{ label:"ទំនើបថ្លៃថ្នូរ (ខៀវ-មាស)", desc:"វាំងនន · មែកសងខាង · រូបក្រឡាការ៉េ · អក្សរស្រាយម្តងមួយពាក្យ",
    swatch:THEMES.royal.swatch, tpl:2, timeline:2, startTime:"06:30",
    design:{ theme:"royal", fontKm:"koulen", fontEn:"playfair", galleryStyle:"square", kbachFrame:"none", kbachBg:"bg5", textAnim:"words", openStyle:"curtain" } }
};

const defaultState = {
  theme:"gold",
  fontKm:"moul",
  fontEn:"greatVibes",
  galleryStyle:"grid",
  galleryArt:"none",
  coverArt:"none",
  kbachFrame:"none", kbachBg:"bg1",
  frameFit:"stretch", frameOpacity:100,
  bgFit:"cover", bgOpacity:100,
  textAnim:"fadeup",
  openStyle:"door",
  coverAlways:false,
  groomName:"", brideName:"",
  eyebrow:"",
  groomNameEn:"", brideNameEn:"",
  eyebrowEn:"",
  eventDate:"", startTime:"",
  welcomeText:"",
  host1:"",
  host2:"",
  welcomeTextEn:"",
  host1En:"",
  host2En:"",
  timeline:[
    {time:"", name:"", timeEn:"", nameEn:""},
    {time:"", name:"", timeEn:"", nameEn:""},
    {time:"", name:"", timeEn:"", nameEn:""},
    {time:"", name:"", timeEn:"", nameEn:""}
  ],
  venueName:"",
  venueAddr:"",
  venueNameEn:"",
  venueAddrEn:"",
  venueMapLink:"",
  coverBlur:22, coverFocusX:50, coverFocusY:35, coverSharp:60,
  venueCoords:"",
  videoUrl:"",
  contacts:[
    {name:"", phone:"", nameEn:""},
    {name:"", phone:"", nameEn:""}
  ],
  photos:[],
  photoNames:[],
  coverPhoto:null,
  coverPhotoName:"",
  guestNamesFileRaw:"",
  publishToken:""
};
const MAX_PHOTOS = 10;
const COVER_STYLE_KEYS = ["door","curtain","lock","rings","lotus","heart"];   // keep in sync with COVER_STYLES below

// Background song (one per project, this device). Kept out of `state` — far too big for
// localStorage — and stored in IndexedDB instead (see the Music block below).
let musicAsset = null;   // { name, size, dataUrl, seconds, origSeconds, startSeconds } or null
// Custom decorative frame image (JPG / PNG / GIF), one per project on this device. Stored in IndexedDB (same
// database as the song, key "frame") because it is too big for localStorage. See the Frame image block below.
let frameAsset = null;   // { name, size, type, dataUrl } or null
let bgAsset = null;      // same shape — custom background image (behind the content)
let musicSource = null;  // the file as picked (kept in memory only), so length/start can change without re-picking


// Old drafts/backups: map removed style values onto the new ones so nothing looks broken.
const _ho = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
// Data saved before these style options existed: fonts / gallery layout / frame used to be forced by the theme.
function legacyFill_(r){
  if(r && typeof r === "object" && !Array.isArray(r)){
    const fd = THEME_FONT_DEFAULTS[r.theme] || THEME_FONT_DEFAULTS.gold;
    if(r.fontKm === undefined) r.fontKm = fd[0];
    if(r.fontEn === undefined) r.fontEn = fd[1];
    if(r.galleryStyle === undefined) r.galleryStyle = THEME_GALLERY_DEFAULTS[r.theme] || "grid";
    if(r.kbachFrame === undefined && typeof r.frameStyle === "string") r.kbachFrame = r.frameStyle;
    // The decorative frame used to be one list; the faint patterns are now the BACKGROUND and the frame is separate.
    if(r.kbachBg === undefined && r.kbachFrame !== undefined){
      if(KBACH_WM_KEYS.indexOf(r.kbachFrame) >= 0){ r.kbachBg = r.kbachFrame; r.kbachFrame = "none"; }
      else r.kbachBg = "none";
    }
  }
  return r;
}
function migrateStyle_(s){
  if(!s || typeof s !== "object") return s;
  delete s.effect;   // the falling effect is now chosen by each guest, not by staff
  if(typeof s.frameStyle === "string" && s.kbachFrame === undefined) s.kbachFrame = s.frameStyle;
  if(s.fontKm === "battambang") s.fontKm = "koulen";          // removed (too thin) -> bold display font
  else if(s.fontKm === "bokor") s.fontKm = "odormeanchey";    // removed (too thin) -> ornamental display font
  delete s.frameStyle;
  if(s.openStyle === "envelope") s.openStyle = "rings";
  if(s.openStyle === "book") s.openStyle = "heart";
  const fd = THEME_FONT_DEFAULTS[s.theme] || THEME_FONT_DEFAULTS.gold;
  if(!_ho(FONT_KM, s.fontKm)) s.fontKm = fd[0];
  if(!_ho(FONT_EN, s.fontEn)) s.fontEn = fd[1];
  if(!_ho(GALLERY_STYLES, s.galleryStyle)) s.galleryStyle = THEME_GALLERY_DEFAULTS[s.theme] || "grid";
  if(!_ho(GALLERY_ART, s.galleryArt)) s.galleryArt = "none";
  if(!_ho(COVER_ART, s.coverArt)) s.coverArt = "none";
  if(!_ho(TEXT_ANIM_STYLES, s.textAnim)) s.textAnim = "fadeup";
  if(KBACH_WM_KEYS.indexOf(s.kbachFrame) >= 0){ s.kbachBg = s.kbachFrame; s.kbachFrame = "none"; }
  if(KBACH_OLD_FRAME_MAP[s.kbachFrame]) s.kbachFrame = KBACH_OLD_FRAME_MAP[s.kbachFrame];
  if(KBACH_OLD_BG_MAP[s.kbachBg]) s.kbachBg = KBACH_OLD_BG_MAP[s.kbachBg];
  if(!_ho(KBACH_FRAME_STYLES, s.kbachFrame)) s.kbachFrame = defaultState.kbachFrame;
  if(!_ho(KBACH_BG_STYLES, s.kbachBg)) s.kbachBg = "none";
  if(s.bgFit !== "cover" && s.bgFit !== "stretch") s.bgFit = "cover";
  if(!COVER_STYLE_KEYS.includes(s.openStyle)) s.openStyle = "door";
  if(s.frameFit !== "stretch" && s.frameFit !== "cover") s.frameFit = "stretch";
  const num = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
  s.frameOpacity = num(s.frameOpacity, 10, 100, 100);
  s.bgOpacity = num(s.bgOpacity, 10, 100, 100);
  s.coverBlur = num(s.coverBlur, 0, 40, 22); s.coverFocusX = num(s.coverFocusX, 0, 100, 50);
  s.coverFocusY = num(s.coverFocusY, 0, 100, 35); s.coverSharp = num(s.coverSharp, 30, 95, 60);
  s.venueCoords = (typeof s.venueCoords === "string") ? s.venueCoords.slice(0, 80) : "";
  s.videoUrl = (typeof s.videoUrl === "string" && /^https?:\/\//i.test(s.videoUrl.trim())) ? s.videoUrl.trim().slice(0, 500) : "";
  return s;
}
let state = JSON.parse(JSON.stringify(defaultState));
try{
  const saved = localStorage.getItem("wib-draft-v2");
  if(saved) state = Object.assign(JSON.parse(JSON.stringify(defaultState)), legacyFill_(JSON.parse(saved)));
}catch(e){}
state = migrateStyle_(state);
state.photos = (state.photos || []).filter(Boolean);
state.photoNames = state.photoNames || [];

function saveDraft(){ try{ localStorage.setItem("wib-draft-v2", JSON.stringify(state)); }catch(e){} }

function kmDate(dateStr){
  if(!dateStr) return "";
  const d = new Date(dateStr+"T00:00:00");
  return `ថ្ងៃ${KM_WEEKDAYS[d.getDay()]} ទី${d.getDate()} ខែ${KM_MONTHS[d.getMonth()]} ឆ្នាំ${d.getFullYear()}`;
}
function enDate(dateStr){
  if(!dateStr) return "";
  const d = new Date(dateStr+"T00:00:00");
  return `${EN_WEEKDAYS[d.getDay()]}, ${EN_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function escapeHtml(s){
  return (s||"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

