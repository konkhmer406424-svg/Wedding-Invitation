/* ==========================================================================
   layouts/l4/wib-layout-l4.js — LAYOUT l4: រូបពីរ កូនកម្លោះ-ក្រមុំ
   This FOLDER is the whole layout:
     layouts/l4/wib-layout-l4.js            ← this file (pictures + palette + starting design)
     layouts/l4/images/background|cover|frames|nameframes|open/…   ← its pictures
   Delete the folder (and its <script> line) and the layout is gone — no other layout is touched.
   Load order in index.html:  wib-data.js → layouts/l1/… → layouts/lN/… → wib-layouts.js → wib-render.js → …
   ========================================================================== */
window.WIB_LAYOUTS = window.WIB_LAYOUTS || {};
(function(){
  const IMG = "layouts/l4/images/";   // this layout's own picture folder
  const LAYOUT = {
    label:"រូបពីរ កូនកម្លោះ-ក្រមុំ",
    desc:"ស្នេហ៍ទន់ភ្លន់ · ស៊ុមរង្វង់មាសពីរ (កូនកម្លោះ · កូនក្រមុំ) · បើកស្រោមសំបុត្រ",
    kind:"pair", openStyle:"seal", theme:"blush",
    swatch:"linear-gradient(135deg,#FFF9F6,#A9567A 55%,#C9A227)",
    palette:{ bg:"#FFF9F6", ink:"#4A3340", accent1:"#A9567A", accent2:"#C9A227", card:"#FFFFFF", border:"rgba(169,86,122,.25)" },
    hint:"ក្នុងឈុតនេះ រូបទី១ = កូនកម្លោះ រូបទី២ = កូនក្រមុំ (ពីបញ្ជីរូប Pre-wedding)។",
    // teardrop openings of the two gold frames (measured from the pictures, drawn 2% larger so the gold edge covers the seam)
    clips:{
      "l4-tearL":"M0.5097 0.1475 L0.5292 0.1607 L0.5488 0.1739 L0.5634 0.1872 L0.5829 0.2004 L0.5976 0.2136 L0.6171 0.2268 L0.6317 0.24 L0.6512 0.2532 L0.6659 0.2664 L0.6805 0.2796 L0.6952 0.2928 L0.7098 0.306 L0.7245 0.3192 L0.7391 0.3324 L0.7489 0.3456 L0.7635 0.3588 L0.7733 0.372 L0.7879 0.3852 L0.7977 0.3984 L0.8074 0.4116 L0.8221 0.4248 L0.8318 0.438 L0.8416 0.4512 L0.8465 0.4644 L0.8562 0.4776 L0.866 0.4908 L0.8709 0.504 L0.8758 0.5172 L0.8855 0.5305 L0.8904 0.5437 L0.8953 0.5569 L0.9002 0.5701 L0.9051 0.5833 L0.9099 0.5965 L0.9099 0.6097 L0.9148 0.6229 L0.9148 0.6361 L0.9148 0.6493 L0.9148 0.6625 L0.9148 0.6757 L0.9148 0.6889 L0.9148 0.7021 L0.9099 0.7153 L0.9051 0.7285 L0.9002 0.7417 L0.8953 0.7549 L0.8904 0.7681 L0.8807 0.7813 L0.8709 0.7945 L0.8611 0.8077 L0.8514 0.8209 L0.8367 0.8341 L0.8221 0.8473 L0.8026 0.8606 L0.783 0.8738 L0.7586 0.887 L0.7293 0.9002 L0.6952 0.9134 L0.6464 0.9266 L0.5732 0.9398 L0.5146 0.9431 L0.4951 0.9431 L0.4316 0.9398 L0.3584 0.9266 L0.3096 0.9134 L0.2754 0.9002 L0.2461 0.887 L0.2217 0.8738 L0.2022 0.8606 L0.1827 0.8473 L0.168 0.8341 L0.1534 0.8209 L0.1436 0.8077 L0.1339 0.7945 L0.1241 0.7813 L0.1143 0.7681 L0.1095 0.7549 L0.1046 0.7417 L0.0997 0.7285 L0.0948 0.7153 L0.0899 0.7021 L0.0899 0.6889 L0.0899 0.6757 L0.0899 0.6625 L0.0899 0.6493 L0.0899 0.6361 L0.0899 0.6229 L0.0948 0.6097 L0.0948 0.5965 L0.0997 0.5833 L0.1046 0.5701 L0.1095 0.5569 L0.1143 0.5437 L0.1192 0.5305 L0.1241 0.5172 L0.1339 0.504 L0.1388 0.4908 L0.1485 0.4776 L0.1583 0.4644 L0.1632 0.4512 L0.1729 0.438 L0.1827 0.4248 L0.1973 0.4116 L0.2071 0.3984 L0.2168 0.3852 L0.2315 0.372 L0.2412 0.3588 L0.2559 0.3456 L0.2657 0.3324 L0.2803 0.3192 L0.2949 0.306 L0.3096 0.2928 L0.3242 0.2796 L0.3389 0.2664 L0.3535 0.2532 L0.373 0.24 L0.3877 0.2268 L0.4072 0.2136 L0.4218 0.2004 L0.4414 0.1872 L0.456 0.1739 L0.4755 0.1607 L0.4951 0.1475Z",
      "l4-tearR":"M0.5048 0.2371 L0.5194 0.251 L0.534 0.265 L0.5536 0.279 L0.5682 0.2929 L0.578 0.3069 L0.5926 0.3209 L0.6073 0.3349 L0.6219 0.3488 L0.6365 0.3628 L0.6512 0.3768 L0.6658 0.3908 L0.6805 0.4047 L0.6902 0.4187 L0.7049 0.4327 L0.7195 0.4466 L0.7342 0.4606 L0.7439 0.4746 L0.7586 0.4886 L0.7683 0.5025 L0.7781 0.5165 L0.7879 0.5305 L0.7976 0.5445 L0.8025 0.5584 L0.8074 0.5724 L0.8123 0.5864 L0.8171 0.6003 L0.8171 0.6143 L0.822 0.6283 L0.822 0.6423 L0.8171 0.6562 L0.8171 0.6702 L0.8123 0.6842 L0.8074 0.6982 L0.8171 0.7121 L0.8123 0.7261 L0.8025 0.7401 L0.7732 0.754 L0.7635 0.768 L0.7439 0.782 L0.7342 0.796 L0.7049 0.8099 L0.6756 0.8239 L0.6365 0.8379 L0.5829 0.8518 L0.5048 0.8588 L0.4999 0.8588 L0.4218 0.8518 L0.3681 0.8379 L0.329 0.8239 L0.2998 0.8099 L0.2802 0.796 L0.2607 0.782 L0.2412 0.768 L0.2314 0.754 L0.2217 0.7401 L0.2119 0.7261 L0.2021 0.7121 L0.1973 0.6982 L0.1924 0.6842 L0.1875 0.6702 L0.1875 0.6562 L0.1875 0.6423 L0.1875 0.6283 L0.1875 0.6143 L0.1875 0.6003 L0.1924 0.5864 L0.1973 0.5724 L0.2021 0.5584 L0.2119 0.5445 L0.2168 0.5305 L0.2265 0.5165 L0.2363 0.5025 L0.2461 0.4886 L0.2607 0.4746 L0.2705 0.4606 L0.2851 0.4466 L0.2949 0.4327 L0.3095 0.4187 L0.3242 0.4047 L0.3388 0.3908 L0.3535 0.3768 L0.3681 0.3628 L0.3827 0.3488 L0.3974 0.3349 L0.412 0.3209 L0.4267 0.3069 L0.4413 0.2929 L0.456 0.279 L0.4706 0.265 L0.4852 0.251 L0.4999 0.2371Z"
    },
    // photo area of the hero: two photos (groom · bride) from the Pre-wedding list
    mid:(s, lang, ctx, A) => {
      const T = LAYOUT_TEXT[lang === "en" ? "en" : "km"];
      const real = (s.photos || []).filter(Boolean), art = ctx.artUrls || [];
      const g = real[0] || art[0] || "", b = real[1] || art[1] || "";
      return `<div class="ly-pair"><div class="ly-col">${lyPhotoFrame_(A.photo, g, "")}<p class="ly-cap">${T.groom}</p></div><div class="ly-col">${lyPhotoFrame_(A.photo2, b, "")}<p class="ly-cap">${T.bride}</p></div></div>`;
    },
    art:{
      bg:    { file:IMG+"background/bg.webp",      mode:"tint", color:"accent1", opacity:0.20 },
      corners:{ file:IMG+"frames/corner.webp", mode:"plain", width:"min(34vw,170px)", offset:"6px" },   // ក្បាច់ជ្រុងមាសទាំង៤ លើទំព័រគម្រប (មុនចុចបើក) · ត្រូវមានរូប frames/corner.webp ក្នុង folder នេះ
      orn:   { file:IMG+"cover/orn.webp",          mode:"plain", width:"min(54%,230px)" },
      name:  { file:IMG+"nameframes/name.webp",    mode:"plain", width:"min(92%,400px)", inset:"34% 24% 36% 24%" },   // already painted gold (pre-coloured PNG, transparent background) — shown as it is
       frame:{ file:IMG+"frames/frame.webp",    mode:"tint", color:"accent2", layout:"slice", slice:{x:22,y:22}, margin:{x:0,y:0}, aspect:0.9967, scale:0.68, pad:6 },  // ស៊ុមស្តើង · border = កម្រាស់ (តូចជាង = ស្តើងជាង) · slice = [លើ,ស្តាំ,ក្រោម,ឆ្វេង] ជា px ក្នុងរូប
      photo: { file:IMG+"frames/photo.webp",       mode:"plain", clip:"l4-tearL", width:"100%", photoPos:"center 20%" },   // the photo fills the whole teardrop opening
      photo2:{ file:IMG+"frames/photo2.webp",      mode:"plain", clip:"l4-tearR", width:"100%", photoPos:"center 20%" },
      seal:  { file:IMG+"open/seal.webp", size:86 }   // ចិញ្ចៀនរៀបការ
    }
  };

  window.WIB_LAYOUTS.l4 = LAYOUT;
  // starting design used by the "ឈុតកំណត់ជាស្រេច" button (colours, fonts, gallery, texts …)
  INVITATION_PRESETS.l4 = {
    label:LAYOUT.label, desc:LAYOUT.desc, swatch:LAYOUT.swatch, tpl:1, timeline:1, startTime:"06:30",
    design:Object.assign({}, PRESET_DESIGN_BASE, {
      layout:"l4", theme:"blush", fontKm:"suwannaphum", fontEn:"parisienne", galleryStyle:"square",
      galleryArts:["gallery1","gallery2","gallery3","gallery4"], coverArt:"none",
      textAnim:"blur", openStyle:"seal", coverAlways:true })
  };
})();