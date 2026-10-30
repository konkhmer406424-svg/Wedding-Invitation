/* ==========================================================================
   layouts/l5/wib-layout-l5.js — LAYOUT l5: ស្នេហ៍ផ្កា · រូបពីរ កូនកម្លោះ-ក្រមុំ · ជ្រើសផ្កាបាន ៣ ប្រភេទ
   ឈុតតែមួយ មាន ៣ ប្រភេទផ្កា (sets) — អ្នកប្រើជ្រើសក្នុង «ប្រភេទផ្កា» (state.flowerSet) ហើយរូបទាំងអស់ប្តូរតាម៖
     set1 = កុលាបស/ក្រែម + ស៊ុមមាស     set2 = ផ្ការំដួល + ស៊ុមមាស     set3 = លីលីឈូក + ស៊ុមឈូក
   រូបនីមួយៗក្នុងមួយប្រភេទ ដាក់តាមទីតាំង៖
     portrait        → ស៊ុមរូបកូនកម្លោះ          portrait-2     → ស៊ុមរូបកូនក្រមុំ
     oval-landscape  → ស៊ុមឈ្មោះភ្ញៀវ
     corner-tl / corner-br → ផ្កាមុំ (ទំព័រគម្រប + ទំព័រធៀប)     bg → ផ្ទៃក្រោយស្រាលៗ
     landscape       → ស៊ុមជុំវិញស្រោមសំបុត្រ (ទំព័រគម្រប) + ផ្កាមុំជុំវិញប្លុកព័ត៌មានទាំងអស់ (សារជូនពរ · ពណ៌សម្លៀកបំពាក់ · ទីតាំង · ទំនាក់ទំនង · KHQR)
     oval-portrait   → ស៊ុមលេខរាប់ថយក្រោយ (ថ្ងៃ · ម៉ោង · នាទី · វិនាទី)
     open/envelope.webp → ស្រោមសំបុត្រដែលបើកធៀប (ដាក់ក្នុង layouts/l5/images/open/)
   រូបទាំងអស់នៅក្នុង  layouts/l5/images/frames/  (ឈ្មោះ set1_portrait.webp …) ។ ពួកវាត្រូវបានបង្កើតដោយ make_l5_assets.py
   រង្វាស់រន្ធដាក់រូបនៃស៊ុមនីមួយៗ មកពី  layouts/l5/l5-clips.js  (បង្កើតដោយស្គ្រីបដដែល) — បើគ្មាន ឯកសារនោះ ប្រើរាងស្តង់ដារជំនួស។
   Delete the folder (and its <script> lines) and the layout is gone — no other layout is touched.
   Load order in index.html:  wib-data.js → layouts/l1/… → layouts/l5/l5-clips.js → layouts/l5/wib-layout-l5.js → wib-layouts.js → …
   ========================================================================== */
window.WIB_LAYOUTS = window.WIB_LAYOUTS || {};
(function(){
  const IMG  = "layouts/l5/images/frames/";   // all flower pictures of this layout
  const OPEN = "layouts/l5/images/open/";     // wax seal
  const AUTO = window.WIB_L5_AUTO || {};      // measured photo openings (l5-clips.js)

  // ---- standard shapes (used only while l5-clips.js is not yet there, or a frame has no measured opening) ----
  const ellipse = (cx, cy, rx, ry) => {
    const pts = [];
    for(let i = 0; i < 48; i++){ const a = Math.PI * 2 * i / 48; pts.push((cx + rx * Math.cos(a)).toFixed(4) + " " + (cy + ry * Math.sin(a)).toFixed(4)); }
    return "M" + pts.join(" L") + "Z";
  };
  const ENV_RATIO = 1299 / 647;   // width ÷ height of open/envelope.webp
  const STD = { rect:"M0.12 0.09 L0.88 0.09 L0.88 0.91 L0.12 0.91Z", oval:ellipse(0.5, 0.5, 0.36, 0.38) };

  // ---- the 3 flower types ----
  const SET_DEF = {
    set1:{ label:"កុលាបស", palette:{ bg:"#FFFBF3", ink:"#4A3E2C", accent1:"#9C7A3C", accent2:"#C9A227", card:"#FFFFFF", border:"rgba(156,122,60,.28)" },
           swatch:"linear-gradient(135deg,#FFFBF3,#EADBB5 55%,#C9A227)" },
    set2:{ label:"ផ្ការំដួល", palette:{ bg:"#FAFBF1", ink:"#3E4630", accent1:"#6F8A2E", accent2:"#C9A227", card:"#FFFFFF", border:"rgba(111,138,46,.28)" },
           swatch:"linear-gradient(135deg,#FAFBF1,#DDE6A8 55%,#C9A227)" },
    set3:{ label:"លីលីឈូក", palette:{ bg:"#FFF8F9", ink:"#4A3340", accent1:"#B5587F", accent2:"#D79AB0", card:"#FFFFFF", border:"rgba(181,88,127,.28)" },
           swatch:"linear-gradient(135deg,#FFF8F9,#F3C6D4 55%,#B5587F)" }
  };

  // ---- CSS of the page for one flower set: flower corners around every information block + oval frames for the countdown ----
  function setCss(k){
    const a = AUTO[k] || {};
    const B = a.block || { tl:{ ar:1, ax:0.15, ay:0.13 }, br:{ ar:1, ax:0.15, ay:0.13 } };
    const ob = a.ovalBox || [0.1, 0.07, 0.9, 0.93], oar = (a.ar && a.ar["oval-portrait"]) || 0.8, K = 0.62;   // K = how much of the oval opening the numbers may use
    const bw = ob[2] - ob[0], bh = ob[3] - ob[1];
    const tx0 = ob[0] + bw * (1 - K) / 2, tx1 = ob[2] - bw * (1 - K) / 2, ty0 = ob[1] + bh * (1 - K) / 2, ty1 = ob[3] - bh * (1 - K) / 2;
    // padding as multiples of the unit width (--cdw): a % padding would be measured against the whole countdown row, not the unit
    const pd = v => "calc(var(--cdw) * " + v.toFixed(4) + ")";
    const padCd = pd(ty0 / oar) + " " + pd(1 - tx1) + " " + pd((1 - ty1) / oar) + " " + pd(tx0);
    const url = f => "url('" + lyUrl_(IMG + k + "_" + f + ".webp") + "')";
    const SEL = ".welcome,.dress-card,.venue-card,.contact-card,.gift-card";
    return `
/* ---- l5: flower corners around each information block (pieces cut from the landscape frame, anchored on the frame-line corner) ---- */
${SEL}{position:relative;overflow:visible;--bpw:min(24vw,118px);padding-top:44px !important;padding-bottom:44px !important;border:1.5px solid var(--accent-2) !important;border-radius:3px !important;box-shadow:none !important;background:color-mix(in srgb,var(--card) 84%,transparent) !important;-webkit-backdrop-filter:none !important;backdrop-filter:none !important;}
.contact-card,.gift-card{--bpw:min(17vw,84px);padding-top:34px !important;padding-bottom:34px !important;}
${SEL.split(",").map(x => x + "::before").join(",")},${SEL.split(",").map(x => x + "::after").join(",")}{content:"";position:absolute;width:var(--bpw);pointer-events:none;background-size:100% 100%;background-repeat:no-repeat;z-index:2;}
${SEL.split(",").map(x => x + "::before").join(",")}{background-image:${url("block-tl")};aspect-ratio:${B.tl.ar};left:calc(var(--bpw) * -${B.tl.ax});top:calc(var(--bpw) / ${B.tl.ar} * -${B.tl.ay});}
${SEL.split(",").map(x => x + "::after").join(",")}{background-image:${url("block-br")};aspect-ratio:${B.br.ar};right:calc(var(--bpw) * -${B.br.ax});bottom:calc(var(--bpw) / ${B.br.ar} * -${B.br.ay});}
.dress-row + .dress-row{border-top-color:var(--border);}
/* ---- l5: every countdown unit sits inside an oval flower frame ---- */
.countdown{--cdw:min(20vw,128px);gap:8px;flex-wrap:nowrap;align-items:flex-start;}
.countdown .cd-unit{flex:0 0 auto;width:var(--cdw);min-width:0;aspect-ratio:${oar};box-sizing:border-box;border:0 !important;border-radius:0 !important;background:${url("oval-portrait")} center/100% 100% no-repeat !important;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:${padCd} !important;}
.countdown .cd-num{font-size:clamp(19px,6vw,34px);font-weight:800;line-height:1.05;color:var(--accent-1);-webkit-text-fill-color:var(--accent-1);text-shadow:none;letter-spacing:0;}
.countdown .cd-label{font-size:clamp(9.5px,2.7vw,12px);line-height:1.2;margin-top:2px;color:var(--ink);opacity:.85;text-shadow:none;white-space:nowrap;font-weight:600;}
/* ---- l5: the guest name on the envelope = a small outlined tag ---- */
.oc-ei-nf .ly-nf.ly-missing{min-height:0;}
.oc-ei-nf .ly-nf.ly-missing .ly-nf-txt{padding:4px 12px;font-size:calc(var(--env-w) * .04);border-color:var(--accent-2);color:var(--accent-1);background:color-mix(in srgb,var(--card) 70%,transparent);}
`;
  }

  function build(k){
    const d = SET_DEF[k], a = AUTO[k] || {};
    const id = n => "l5-" + k + "-" + n;
    const shape = (n, kind) => a[n] || STD[kind];
    const clips = {};
    clips[id("portrait")]   = shape("portrait", "rect");
    clips[id("portrait-2")] = shape("portrait-2", "rect");
    return {
      label:d.label, thumb:IMG + k + "_portrait.webp", palette:d.palette, swatch:d.swatch, clips:clips,
      css:() => setCss(k),
      art:{
        bg:     { file:IMG + k + "_bg.webp", mode:"plain", opacity:0.30 },                                   // ផ្កាធំស្រាលៗ ក្រោយទំព័រ
        // ទំព័រគម្រប៖ ស្រោមសំបុត្រ នៅក្នុងស៊ុម landscape (រន្ធនៃស៊ុមវាស់ដោយស្គ្រីប)
        envelope:{ file:OPEN + "envelope.webp", ratio:ENV_RATIO, width:"min(86vw,440px)", sealX:50, sealY:28.6, sealSize:60,
                   vx:50, vy:56.9, ty:8.4, fy:8.9, fvy:57.4 },                                            // រាងក្រវ៉ាត់ស្រោមសំបុត្រ (% នៃរូប) — វាស់ពីរូប envelope.webp
        envFrame:{ file:IMG + k + "_landscape.webp", width:"min(96vw,560px)", ratio:(a.ar && a.ar.landscape) || 1.25, box:a.landscapeBox || [0.1, 0.12, 0.9, 0.88], fill:0.9 },
        coverName:{ width:"70%" },                                                                          // ឈ្មោះភ្ញៀវលើស្រោមសំបុត្រ = ស្លាកមានគ្រោងសាមញ្ញ
        frame:  { file:IMG + k + "_corner-tl.webp", file2:IMG + k + "_corner-br.webp", layout:"diag", width:"min(28vw,135px)", offset:"0px", z:60 },   // ផ្កាមុំលើទំព័រធៀប (ជាប់អេក្រង់)
        name:   { file:IMG + k + "_oval-landscape.webp", mode:"plain", width:"min(92%,400px)", inset:a.nameInset || "28% 18% 28% 18%" },   // ស៊ុមឈ្មោះភ្ញៀវ
        photo:  { file:IMG + k + "_portrait.webp",   mode:"plain", clip:id("portrait"),   width:"100%", photoPos:"center 20%" },            // កូនកម្លោះ
        photo2: { file:IMG + k + "_portrait-2.webp", mode:"plain", clip:id("portrait-2"), width:"100%", photoPos:"center 20%" },            // កូនក្រមុំ
        seal:   { file:OPEN + "seal.webp", size:86 }                                                                                         // ចិញ្ចៀនរៀបការ
      }
    };
  }

  const sets = {};
  Object.keys(SET_DEF).forEach(k => { sets[k] = build(k); });
  const DEFAULT_SET = "set1";

  const LAYOUT = {
    label:"ស្នេហ៍ផ្កា",
    desc:"ស្នេហ៍ទន់ភ្លន់ · ជ្រើសផ្កា ៣ ប្រភេទ (កុលាបស · ផ្ការំដួល · លីលីឈូក) · ស៊ុមរូបកូនកម្លោះ · កូនក្រមុំ · បើកស្រោមសំបុត្រ",
    kind:"pair", openStyle:"seal", theme:"blush",
    swatch:sets[DEFAULT_SET].swatch,
    hint:"ក្នុងឈុតនេះ រូបទី១ = កូនកម្លោះ រូបទី២ = កូនក្រមុំ (ពីបញ្ជីរូប Pre-wedding)។ ជ្រើស «ប្រភេទផ្កា» ខាងក្រោមដើម្បីប្តូរផ្កា។",
    // the sets: wib-layouts.js layoutOf_() merges the one chosen in state.flowerSet (palette + art + clips) over this layout
    sets:sets, defaultSet:DEFAULT_SET,
    // fallbacks used by code that reads the layout without a state (e.g. looking for any seal picture)
    palette:sets[DEFAULT_SET].palette, clips:sets[DEFAULT_SET].clips, art:sets[DEFAULT_SET].art
  };

  window.WIB_LAYOUTS.l5 = LAYOUT;
  // starting design used by the "ឈុតកំណត់ជាស្រេច" button (colours, fonts, gallery, texts …). The flower type is NOT in it,
  // so choosing the layout again keeps the flower type the customer already picked.
  INVITATION_PRESETS.l5 = {
    label:LAYOUT.label, desc:LAYOUT.desc, swatch:LAYOUT.swatch, tpl:1, timeline:1, startTime:"06:30",
    design:Object.assign({}, PRESET_DESIGN_BASE, {
      layout:"l5", theme:"blush", fontKm:"suwannaphum", fontEn:"parisienne", galleryStyle:"square",
      galleryArts:["gallery1","gallery2","gallery3","gallery4"], coverArt:"none",
      textAnim:"blur", openStyle:"seal", coverAlways:true })
  };
})();
