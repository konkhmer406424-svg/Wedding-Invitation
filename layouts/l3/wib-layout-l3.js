/* ==========================================================================
   layouts/l3/wib-layout-l3.js — LAYOUT l3: រូបពីក្រោយស៊ុម (ក្លោងមាស)
   This FOLDER is the whole layout:
     layouts/l3/wib-layout-l3.js            ← this file (pictures + palette + starting design)
     layouts/l3/images/background|cover|frames|nameframes|open/…   ← its pictures
   Delete the folder (and its <script> line) and the layout is gone — no other layout is touched.
   Load order in index.html:  wib-data.js → layouts/l1/… → layouts/lN/… → wib-layouts.js → wib-render.js → …
   ========================================================================== */
window.WIB_LAYOUTS = window.WIB_LAYOUTS || {};
(function(){
  const IMG = "layouts/l3/images/";   // this layout's own picture folder
  const LAYOUT = {
    label:"រូបពីក្រោយស៊ុម (ក្លោងមាស)",
    desc:"រូបពេញអេក្រង់ពីក្រោយក្លោងមាស · ស៊ុមឈ្មោះអ្នកអញ្ជើញ · Tap to Open",
    kind:"behind", openStyle:"tap", theme:"gold", nameFx:true,   // nameFx:true = ឈ្មោះកូនកម្លោះ-ក្រមុំ ពណ៌មាសភ្លឺមានចលនាចាំង (ដូច l2)
    swatch:"linear-gradient(135deg,#6B4A24,#C9A227 60%,#F6EFE3)",
    palette:{ bg:"#F6EFE3", ink:"#3B2A1C", accent1:"#7F5521", accent2:"#C9A227", card:"#FFFFFF", border:"rgba(127,85,33,.30)" },
    hint:"ក្នុងឈុតនេះ រូបគម្រប (Cover) ជារូបក្នុងស៊ុម។",
    art:{
      bg:   { file:IMG+"background/bg.webp",       mode:"plain", opacity:0.5, tile:560 },   // ផ្ទៃក្រណាត់ឆ្លាក់ផ្កាឈូក (ប្រផេះ) លាយជាមួយពណ៌ក្រែមរបស់ឈុត → ប្រផេះកក់ក្តៅ ស៊ីជាមួយមាស
      frame:{ file:IMG+"frames/frame.webp", mode:"plain", layout:"corners", width:"min(36vw,180px)", offset:"0px", offsetX:"-8px" },   // width = ទំហំ · offset = ចន្លោះពីគែមលើ/ក្រោម · offsetX = ចន្លោះពីគែមឆ្វេង/ស្តាំ (អវិជ្ជមាន = ជាប់ចុងបំផុត)
      corners:{ file:IMG+"frames/corner.webp",  mode:"plain", width:"min(34vw,170px)", offset:"6px" },   // ក្បាច់ជ្រុងមាសទាំង៤ លើទំព័រគម្រប (ចុចបើក) · width = ទំហំ · offset = ចន្លោះពីគែម
      orn:  { file:IMG+"cover/orn.webp",           mode:"plain", width:"min(60%,250px)" },
      name: { file:IMG+"nameframes/name.webp",     mode:"plain", width:"min(86%,340px)", inset:"24% 20%", fill:"rgba(255,255,255,.92)" },
      seal: { file:IMG+"open/seal.webp", size:150, under:true }   // បេះដូង (under:true = នៅក្រោមឈ្មោះកូនកម្លោះ-ក្រមុំ)
    }
  };

  window.WIB_LAYOUTS.l3 = LAYOUT;
  // starting design used by the "ឈុតកំណត់ជាស្រេច" button (colours, fonts, gallery, texts …)
  INVITATION_PRESETS.l3 = {
    label:LAYOUT.label, desc:LAYOUT.desc, swatch:LAYOUT.swatch, tpl:0, timeline:0, startTime:"16:00",
    design:Object.assign({}, PRESET_DESIGN_BASE, {
      layout:"l3", theme:"gold", fontKm:"moul", fontEn:"greatVibes", galleryStyle:"classic",
      galleryArts:["gallery1","gallery2","gallery5","gallery6"], coverArt:"cover2",
      textAnim:"fadeup", openStyle:"tap", coverAlways:true,
      coverBlur:0, coverFocusX:50, coverFocusY:40 })
  };
})();