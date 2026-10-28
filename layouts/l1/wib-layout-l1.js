/* ==========================================================================
   layouts/l1/wib-layout-l1.js — LAYOUT l1: ធៀបក្រដាស (គ្មានរូប)
   This FOLDER is the whole layout:
     layouts/l1/wib-layout-l1.js            ← this file (pictures + palette + starting design)
     layouts/l1/images/background|cover|frames|nameframes|open/…   ← its pictures
   Delete the folder (and its <script> line) and the layout is gone — no other layout is touched.
   Load order in index.html:  wib-data.js → layouts/l1/… → layouts/lN/… → wib-layouts.js → wib-render.js → …
   ========================================================================== */
window.WIB_LAYOUTS = window.WIB_LAYOUTS || {};
(function(){
  const IMG = "layouts/l1/images/";   // this layout's own picture folder
  const LAYOUT = {
    label:"ធៀបក្រដាស (គ្មានរូប)",
    desc:"ទន់ភ្លន់ · មានតែរចនាប័ទ្មតុបតែង គ្មានរូបលើគម្រប · បើកស្រោមសំបុត្រ",
    kind:"none", openStyle:"seal", theme:"blush",
    swatch:"linear-gradient(135deg,#FFF8F5,#C76B84 60%,#D9A066)",
    palette:{ bg:"#FFF8F5", ink:"#4A2E2A", accent1:"#C76B84", accent2:"#D9A066", card:"#FFFFFF", border:"rgba(199,107,132,.25)" },
    hint:"",
    art:{
      bg:   { file:IMG+"background/bg.webp",       mode:"tint", color:"accent2", opacity:0.20 },
      // ស៊ុមទំព័រអញ្ជើញ (បន្ទាប់ពីចុចបើករួច)
      frame:{ file:IMG+"frames/frame.webp",        mode:"tint", color:"accent2", layout:"slice", slice:{x:22,y:22}, margin:{x:0,y:0}, aspect:0.9967, scale:0.68, pad:6 },
      // ស៊ុមទំព័រគម្រប (ចុចបើក) — ប្តូរ file ទៅរូបស៊ុមផ្សេង (ពេញទំព័រ layout:"full" — គ្មាន filter ដើម្បីរក្សាពណ៌មាស-ខ្មៅដើម)
      coverFrame:{ file:IMG+"frames/frame-cover.webp", layout:"border", border:"min(12vw,60px)", slice:155, width:"100vw" },   // border = កម្រាស់ស៊ុម (តូចជាង = ស្តើងជាង) · width = ទទឹងស៊ុម ("100vw" = ពេញអេក្រង់, "min(100vw,680px)" = កំណត់ត្រឹម 680px)
      corners:{ file:IMG+"frames/corner.webp", mode:"plain", width:"min(34vw,170px)", offset:"6px" },   // ក្បាច់ជ្រុងមាសទាំង៤ លើទំព័រគម្រប (មុនចុចបើក) · ត្រូវមានរូប frames/corner.webp ក្នុង folder នេះ
      orn:  { file:IMG+"cover/orn.webp",           mode:"tint", color:"accent1", width:"min(72%,320px)" },
      name: { file:IMG+"nameframes/name.webp",     mode:"plain", width:"min(80%,320px)", inset:"20% 15%" },
      seal: { file:IMG+"open/seal.webp", size:86 },   // ត្រា seal.png — បង្ហាញលើស្រោមសំបុត្រ (envelope.sealX/sealY/sealSize កំណត់ទីតាំង និងទំហំ)
      envelope:{ file:IMG+"open/envelope.webp", width:"min(100vw,600px)", ratio:1298/646, sealX:50.3, sealY:29.6, sealSize:62 }   // ស្រោមសំបុត្រជារូបតែមួយ — គម្របបើកដោយខ្លួនឯង · ratio = ទទឹង ÷ កម្ពស់ នៃរូប (១២៩៨ ÷ ៦៤៦)
    }
  };

  window.WIB_LAYOUTS.l1 = LAYOUT;
  // starting design used by the "ឈុតកំណត់ជាស្រេច" button (colours, fonts, gallery, texts …)
  INVITATION_PRESETS.l1 = {
    label:LAYOUT.label, desc:LAYOUT.desc, swatch:LAYOUT.swatch, tpl:1, timeline:1, startTime:"06:30",
    design:Object.assign({}, PRESET_DESIGN_BASE, {
      layout:"l1", theme:"blush", fontKm:"suwannaphum", fontEn:"parisienne", galleryStyle:"polaroid",
      galleryArts:["gallery3","gallery4","gallery5","gallery6"], coverArt:"none",
      textAnim:"blur", openStyle:"seal", coverAlways:true })
  };
})();