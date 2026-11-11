/* ==========================================================================
   layouts/l2/wib-layout-l2.js — LAYOUT l2: រូបមួយក្នុងស៊ុម (បៃតង-មាស)
   This FOLDER is the whole layout:
     layouts/l2/wib-layout-l2.js            ← this file (pictures + palette + starting design)
     layouts/l2/images/background|cover|frames|nameframes|open/…   ← its pictures
   Delete the folder (and its <script> line) and the layout is gone — no other layout is touched.
   Load order in index.html:  wib-data.js → layouts/l1/… → layouts/lN/… → wib-layouts.js → wib-render.js → …
   ========================================================================== */
window.WIB_LAYOUTS = window.WIB_LAYOUTS || {};
(function(){
  const IMG = "layouts/l2/images/";   // this layout's own picture folder
  const LAYOUT = {
    label:"រូបមួយក្នុងស៊ុម (បៃតង-មាស)",
    desc:"ទំនើបថ្លៃថ្នូរ · ស៊ុមរូបដំណក់ទឹកមាស លើផ្ទៃបៃតងចាស់ · Tap to Open",
    kind:"single", openStyle:"tap", theme:"emerald", dark:true, nameFx:true,  // nameFx = gold-gradient embossed names
    swatch:"linear-gradient(135deg,#0E3B2C,#1F5C45 55%,#E3C46C)",
    palette:{ bg:"#082A1E", ink:"#FBF3D5", accent1:"#EBCB75", accent2:"#C9A227", card:"#04180F", border:"rgba(235,203,117,.55)" },
    hint:"ក្នុងឈុតនេះ រូបគម្រប (Cover) ជារូបក្នុងស៊ុម។",
    clips:{ "l2-hole":"M0.254 0.068H0.749Q0.879 0.068 0.879 0.141V0.856Q0.879 0.929 0.749 0.929H0.254Q0.124 0.929 0.124 0.856V0.141Q0.124 0.068 0.254 0.068Z" },
    // CSS of this layout only (the hero section has class ly-l2)
    css:`
.ly-l2 .names,.ly-l2 .hero-date{position:relative;z-index:1;}
`,
    // photo area of the hero: one big photo inside the gold frame
    mid:(s, lang, ctx, A) => lyPhotoFrame_(A.photo, ctx.rawCover || "", ""),
    art:{
      bg:   { file:IMG+"background/bg.webp",       mode:"plain", opacity:1 },
      // ស៊ុមតែមួយ frames/corner.webp (ក្បាច់ស្តើងជុំវិញ ៤ ជ្រុង) — ប្រើទាំងទំព័រធៀប (frame) និងទំព័រគម្រប Tap to Open (coverFrame)
      //   layout:"border" = កាត់ជា ៩ ផ្នែក៖ ជ្រុងទាំង ៤ មិនខូចទ្រង់ទ្រាយ គែមលាតតាមអេក្រង់ · slice = ទំហំជ្រុងក្នុងរូប 1620×2880 (px) · width:"100%" = ពេញអេក្រង់ឆ្វេង-ស្តាំ
      //   border = កម្រាស់ក្បាច់លើអេក្រង់ = ១០៥ × (១០០vw÷១៦២០ ឬ ១០០vh÷២៨៨០ តូចជាង) — ប្តូរលេខ ១០៥ (ធំជាង = ក្បាច់ក្រាស់ជាង)
      frame:     { file:IMG+"frames/corner.webp", mode:"tint", color:"accent1", layout:"border", slice:105, border:"calc(min(100vw / 1620, 100vh / 2880) * 105)", width:"100%" },
      coverFrame:{ file:IMG+"frames/corner.webp", mode:"tint", color:"accent1", layout:"border", slice:105, border:"calc(min(100vw / 1620, 100vh / 2880) * 105)", width:"100%" },
      orn:  { file:IMG+"cover/orn.webp",           mode:"plain", width:"min(62%,260px)" },
      name: { file:IMG+"nameframes/name.webp", mode:"plain", width:"min(90%,400px)", inset:"32% 20% 30% 20%" },   // ស៊ុមឈ្មោះមាសរាងវែង · width = ទំហំស៊ុម · inset = ផ្ទៃអក្សរក្នុងរន្ធ [លើ ស្តាំ ក្រោម ឆ្វេង] (បង្កើន = អក្សរតូចចូលជ្រៅ)
      photo:{ file:IMG+"frames/photo.png",        mode:"keyG", clip:"l2-hole", width:"min(68vw,330px)", big:true, photoPos:"center 30%" },
      // ត្រាមាស (seal) មិនកំណត់ក្នុងឈុតទេ — ជ្រើសក្នុង Style tab (images/seals/ · SEAL_BUTTONS ក្នុង wib-data.js)។
    }
  };

  window.WIB_LAYOUTS.l2 = LAYOUT;
  // starting design used by the "ឈុតកំណត់ជាស្រេច" button (colours, fonts, gallery, texts …)
  INVITATION_PRESETS.l2 = {
    label:LAYOUT.label, desc:LAYOUT.desc, swatch:LAYOUT.swatch, tpl:2, timeline:2, startTime:"06:30",
    design:Object.assign({}, PRESET_DESIGN_BASE, {
      layout:"l2", theme:"emerald", fontKm:"moul", fontEn:"playfair", galleryStyle:"grid",
      galleryArts:["gallery1","gallery2","gallery3","gallery4"], coverArt:"cover1",
      textAnim:"fadeup", openStyle:"tap", coverAlways:true, sealBtn:"seal2" })
  };
})();