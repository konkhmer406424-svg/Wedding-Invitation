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
      frame:{ file:IMG+"frames/frame.webp", mode:"plain", layout:"corners", width:"min(36vw,180px)", offset:"0px", offsetX:"-8px" },   // width = ទំហំ · offset = ចន្លោះពីគែមលើ/ក្រោម · offsetX = ចន្លោះពីគែមឆ្វេង/ស្តាំ (អវិជ្ជមាន = ជាប់ចុងបំផុត)
      orn:  { file:IMG+"cover/orn.webp",           mode:"plain", width:"min(62%,260px)" },
      name: { file:IMG+"nameframes/name.webp",    mode:"plain", width:"min(82%,330px)", inset:"21% 10%" },
      photo:{ file:IMG+"frames/photo.png",        mode:"keyG", clip:"l2-hole", width:"min(68vw,330px)", big:true, photoPos:"center 30%" },
      corners:{ file:IMG+"frames/corner.webp", mode:"plain", width:"min(34vw,170px)", offset:"6px" },
      seal: { file:IMG+"open/seal.webp", size:108 }   // LT Media
    }
  };

  window.WIB_LAYOUTS.l2 = LAYOUT;
  // starting design used by the "ឈុតកំណត់ជាស្រេច" button (colours, fonts, gallery, texts …)
  INVITATION_PRESETS.l2 = {
    label:LAYOUT.label, desc:LAYOUT.desc, swatch:LAYOUT.swatch, tpl:2, timeline:2, startTime:"06:30",
    design:Object.assign({}, PRESET_DESIGN_BASE, {
      layout:"l2", theme:"emerald", fontKm:"moul", fontEn:"playfair", galleryStyle:"grid",
      galleryArts:["gallery1","gallery2","gallery3","gallery4"], coverArt:"cover1",
      textAnim:"fadeup", openStyle:"tap", coverAlways:true })
  };
})();