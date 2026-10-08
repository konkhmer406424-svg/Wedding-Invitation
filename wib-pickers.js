/* ==========================================================================
   wib-pickers.js — icon pickers + form-section builders (timeline, contacts, photos, cover)
   Load order in index.html:  wib-data.js → wib-render.js → wib-pickers.js → wib-ui.js
   (they share one global scope, so keep this order)
   ========================================================================== */
// ---------- Builder UI wiring ----------
// ---------------------------------------------------------------------
// Bakong KHQR payment gate — set APPS_SCRIPT_URL to your deployed
// wedding-code.gs Web App (/exec) URL.
// ---------------------------------------------------------------------
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcaIg0U0p2kg1zdoq6TjPsD5so18-45qVpw9e4H4PEJlbcGtvDBO8rKGTpVWJ5JOKdWQ/exec";
// Display-only default. The REAL price is fixed on the server (PRICE in
// wedding-code.gs); the modal updates to the server's amount once the QR is made.
const DOWNLOAD_PRICE_USD = 20;

const $ = id => document.getElementById(id);

// ---- Icon pickers: every style choice is shown as a tile (no drop-downs, no words) ----
const PK = {
  frame: '<rect x="5" y="4" width="30" height="48" rx="3" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".4"/>',
  svg: (vb, inner) => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
};
const NONE_ICON = PK.svg("0 0 40 40", '<circle cx="20" cy="20" r="12" opacity=".6"/><path d="M11.5 28.5 28.5 11.5" opacity=".6"/>');
const KBACH_ICONS = {   // only the "custom image" tile is an icon; preset tiles show their PNG as a thumbnail (kbachThumb)
  custom: PK.svg("0 0 40 56", PK.frame + '<rect x="11" y="18" width="18" height="14" rx="2"/><circle cx="16" cy="23" r="1.6" fill="currentColor"/><path d="M11 29l5-4 4 3 4-4 5 5"/><path d="M20 38v8M16 42h8"/>')
};
const GALLERY_ICONS = {
  grid: PK.svg("0 0 40 40", '<rect x="4" y="5" width="32" height="10" rx="1.5"/><rect x="4" y="18" width="15" height="8" rx="1.5"/><rect x="21" y="18" width="15" height="8" rx="1.5"/><rect x="4" y="29" width="32" height="7" rx="1.5"/>'),
  classic: PK.svg("0 0 40 40", '<rect x="4" y="5" width="15" height="13" rx="1.5"/><rect x="21" y="5" width="15" height="13" rx="1.5"/><rect x="4" y="22" width="15" height="13" rx="1.5"/><rect x="21" y="22" width="15" height="13" rx="1.5"/>'),
  polaroid: PK.svg("0 0 40 40", '<g transform="rotate(-8 12 20)"><rect x="4" y="9" width="14" height="18" rx="1"/><path d="M6.5 11.5h9v9h-9z"/></g><g transform="rotate(7 28 20)"><rect x="21" y="11" width="14" height="18" rx="1"/><path d="M23.5 13.5h9v9h-9z"/></g>'),
  square: PK.svg("0 0 40 40", [4,15,26].map(x=>[5,16,27].map(y=>`<rect x="${x}" y="${y}" width="10" height="9" rx=".8"/>`).join("")).join("")),
  mosaic: PK.svg("0 0 40 40", '<rect x="4" y="4" width="15" height="20" rx="2"/><rect x="4" y="27" width="15" height="9" rx="2"/><rect x="21" y="4" width="15" height="10" rx="2"/><rect x="21" y="17" width="15" height="19" rx="2"/>')
};
const ANIM_ICONS = {
  fadeup: PK.svg("0 0 40 40", '<path d="M20 6v14M14 12l6-6 6 6" /><path d="M8 26h24" opacity=".9"/><path d="M11 31h18" opacity=".55"/><path d="M14 36h12" opacity=".3"/>'),
  words: PK.svg("0 0 40 40", '<rect x="4" y="10" width="9" height="5" rx="1.5"/><rect x="16" y="10" width="8" height="5" rx="1.5" opacity=".65"/><rect x="27" y="10" width="9" height="5" rx="1.5" opacity=".35"/><rect x="4" y="22" width="12" height="5" rx="1.5" opacity=".9"/><rect x="19" y="22" width="9" height="5" rx="1.5" opacity=".55"/><rect x="4" y="33" width="8" height="4" rx="1.5" opacity=".3"/>'),
  blur: PK.svg("0 0 40 40", '<circle cx="20" cy="20" r="4" fill="currentColor" stroke="none"/><circle cx="20" cy="20" r="9" opacity=".55"/><circle cx="20" cy="20" r="14" opacity=".28" stroke-dasharray="2 3"/>'),
  none: NONE_ICON
};
const LOTUS_ICON = PK.svg("0 0 40 40", '<path d="M20 30C14 27 12 19 20 8c8 11 6 19 0 22z"/><path d="M20 30c-6 1-12-3-13-11 6 0 11 3 13 11zM20 30c6 1 12-3 13-11-6 0-11 3-13 11z" opacity=".75"/><path d="M8 33h24" opacity=".5"/>');
const COVER_ICONS = { door:"🚪", curtain:"🎭", lock:"🔒", rings:"💍", lotus:LOTUS_ICON, heart:"💗" };

// Each picker is laid out in full-width rows: tiles in a row share the width equally, and the tiles are split
// as evenly as possible over the rows (e.g. 7 -> 4 + 3), so every group spans the same width and lines up.
const PICK_MIN_TILE = 48, PICK_GAP = 8;
function pickerRowSizes(n, width){
  const perRow = Math.max(3, Math.floor((width + PICK_GAP) / (PICK_MIN_TILE + PICK_GAP)));
  const rows = Math.max(1, Math.ceil(n / perRow));
  const base = Math.floor(n / rows), extra = n % rows;
  return Array.from({ length: rows }, (_, i) => base + (i < extra ? 1 : 0));   // bigger rows first
}
let pickerRO = null;
function renderPicker(id, items, current, onPick){
  const el = $(id);
  if(!el) return;
  el._pk = { items, current, onPick };
  const draw = () => {
    const p = el._pk;
    const w = el.clientWidth || 288;
    const sizes = pickerRowSizes(p.items.length, w);
    const sig = sizes.join("-") + "|" + p.current + "|" + p.items.length;
    if(el._pkSig === sig) return;
    el._pkSig = sig;
    let idx = 0;
    el.innerHTML = sizes.map(cnt => {
      const row = p.items.slice(idx, idx + cnt).map(it => {
        const t = escapeHtml(it.title || "");
        const on = it.key === p.current;
        return `<button type="button" class="pick-tile${on ? " active" : ""}" data-k="${it.key}" title="${t}" aria-label="${t}" aria-pressed="${on}">${it.inner}</button>`;
      }).join("");
      idx += cnt;
      return `<div class="pick-row">${row}</div>`;
    }).join("");
    el.querySelectorAll(".pick-tile").forEach(btn => btn.addEventListener("click", () => p.onPick(btn.dataset.k)));
  };
  el._pkDraw = draw;
  el._pkSig = "";
  draw();
  if(typeof ResizeObserver !== "undefined"){
    if(!pickerRO) pickerRO = new ResizeObserver(entries => entries.forEach(en => { if(en.target._pkDraw) en.target._pkDraw(); }));
    if(!el._pkObserved){ pickerRO.observe(el); el._pkObserved = true; }
  }
}

function buildThemeSelect(){
  if(!hasOwn(THEMES, state.theme)) state.theme = "gold";
  renderPicker("pickTheme", Object.keys(THEMES).map(k => ({ key:k, title:THEMES[k].label, inner:`<span class="pick-swatch" style="background:${THEMES[k].swatch}"></span>` })),
    state.theme, k => { state.theme = k; buildThemeSelect(); update(); });
}
function buildFontSelects(){
  if(!hasOwn(FONT_KM, state.fontKm)) state.fontKm = Object.keys(FONT_KM)[0];
  if(!hasOwn(FONT_EN, state.fontEn)) state.fontEn = Object.keys(FONT_EN)[0];
  renderPicker("pickFontKm", Object.keys(FONT_KM).map(k => ({ key:k, title:FONT_KM[k].name, inner:`<span class="pick-sample" style="font-family:${FONT_KM[k].display}">កខ</span>` })),
    state.fontKm, k => { state.fontKm = k; buildFontSelects(); update(); });
  renderPicker("pickFontEn", Object.keys(FONT_EN).map(k => ({ key:k, title:FONT_EN[k].name, inner:`<span class="pick-sample" style="font-family:${FONT_EN[k].display}">Aa</span>` })),
    state.fontEn, k => { state.fontEn = k; buildFontSelects(); update(); });
}
function buildGalleryStyleSelect(){
  if(!hasOwn(GALLERY_STYLES, state.galleryStyle)) state.galleryStyle = "grid";
  renderPicker("pickGallery", Object.keys(GALLERY_STYLES).map(k => ({ key:k, title:GALLERY_STYLES[k].label, inner:GALLERY_ICONS[k] })),
    state.galleryStyle, k => { state.galleryStyle = k; buildGalleryStyleSelect(); update(); });
}
function artThumb(file, kind){
  return `<img class="art-thumb" src="${artUrl(file, kind)}" alt="" loading="lazy" onerror="this.style.opacity=.25">`;
}
function buildGalleryArtSelect(){
  if(!hasOwn(GALLERY_ART, state.galleryArt)) state.galleryArt = "none";
  renderPicker("pickGalleryArt", Object.keys(GALLERY_ART).map(k => ({ key:k, title:GALLERY_ART[k].label, inner: (k === "none" || !GALLERY_ART[k].files) ? NONE_ICON : artThumb(GALLERY_ART[k].files[0], "gallery") })),
    state.galleryArt, k => { state.galleryArt = k; buildGalleryArtSelect(); update(); });
  const hint = $("galleryArtHint");
  if(hint){
    hint.textContent = state.photos.length
      ? "ℹ️ អ្នកបានបញ្ចូលរូបភាពពិតហើយ ដូច្នេះរូបភាពពិតនឹងបង្ហាញជំនួសរូបតំណាង។ (ប្រសិនបើលុបរូបទាំងអស់ រូបតំណាងដែលបានជ្រើសនឹងបង្ហាញវិញ។)"
      : (state.galleryArt === "none"
          ? "បើមិនមានរូប Pre-wedding សូមជ្រើសរូបតំណាងមួយ ដើម្បីបង្ហាញជំនួសផ្នែករូបភាព។"
          : "✓ កំពុងប្រើ «" + GALLERY_ART[state.galleryArt].label + "» ជំនួសរូបភាព Pre-wedding។");
  }
}
function buildCoverArtSelect(){
  if(!hasOwn(COVER_ART, state.coverArt)) state.coverArt = "none";
  renderPicker("pickCoverArt", Object.keys(COVER_ART).map(k => ({ key:k, title:COVER_ART[k].label, inner: (k === "none" || !COVER_ART[k].file) ? NONE_ICON : artThumb(COVER_ART[k].file, "cover") })),
    state.coverArt, k => { state.coverArt = k; buildCoverArtSelect(); update(); });
  const hint = $("coverArtHint");
  if(hint){
    hint.textContent = state.coverPhoto
      ? "ℹ️ អ្នកបានបញ្ចូលរូបគម្របហើយ ដូច្នេះរូបគម្របពិតនឹងបង្ហាញជំនួសរូបតំណាង។ (ប្រសិនបើលុបរូបគម្រប រូបតំណាងនឹងបង្ហាញវិញ។)"
      : (state.coverArt === "none"
          ? "បើមិនមានរូបគម្រប សូមជ្រើសរូបតំណាងមួយ ដើម្បីបង្ហាញជាផ្ទៃរូបគម្របនៃធៀប។"
          : "✓ កំពុងប្រើ «" + COVER_ART[state.coverArt].label + "» ជំនួសរូបគម្រប។");
  }
}
function kbachThumb(layer, k){
  if(k === "custom") return KBACH_ICONS.custom;
  const u = kbachPresetUrl(layer, k);
  if(!u) return NONE_ICON;
  return `<img class="kbach-thumb" src="${u}" alt="" loading="lazy" onerror="this.style.opacity=.25">`;
}
function buildKbachFrameSelect(){
  if(!hasOwn(KBACH_FRAME_STYLES, state.kbachFrame)) state.kbachFrame = "none";
  renderPicker("pickKbach", Object.keys(KBACH_FRAME_STYLES).map(k => ({ key:k, title:KBACH_FRAME_STYLES[k].label, inner:kbachThumb("frame", k) })),
    state.kbachFrame, k => { state.kbachFrame = k; buildKbachFrameSelect(); update(); });
  buildKbachBgSelect();
  buildFrameFxSelect();
  if(typeof refreshFrameUI === "function") refreshFrameUI();
}
// Frame transition while scrolling (only for the full-screen overlay frames frame1–5).
const FRAME_FX_ICONS = {
  none: NONE_ICON,
  fade: PK.svg("0 0 40 40", '<rect x="7" y="9" width="26" height="5" rx="2" fill="currentColor" stroke="none"/><rect x="7" y="18" width="26" height="5" rx="2" fill="currentColor" stroke="none" opacity=".55"/><rect x="7" y="27" width="26" height="5" rx="2" fill="currentColor" stroke="none" opacity=".22"/>'),
  slide: PK.svg("0 0 40 40", '<path d="M20 15V5M15 10l5-5 5 5"/><path d="M20 25v10M15 30l5 5 5-5"/><path d="M8 20h24" opacity=".4" stroke-dasharray="2 3"/>'),
  zoom: PK.svg("0 0 40 40", '<rect x="14" y="14" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/><rect x="8" y="8" width="24" height="24" rx="2" opacity=".5"/><rect x="3.5" y="3.5" width="33" height="33" rx="3" opacity=".25" stroke-dasharray="3 3"/>'),
  blur: PK.svg("0 0 40 40", '<circle cx="20" cy="20" r="4.5" fill="currentColor" stroke="none"/><circle cx="20" cy="20" r="9.5" opacity=".55"/><circle cx="20" cy="20" r="15" opacity=".28" stroke-dasharray="2 3"/>'),
  drift: PK.svg("0 0 40 40", '<path d="M14 15L6 7M6 14V7h7"/><path d="M26 25l8 8M34 26v7h-7"/><path d="M20 20h.1" stroke-width="3" opacity=".6"/>')
};
function buildFrameFxSelect(){
  if(!hasOwn(FRAME_FX, state.frameFx)) state.frameFx = "fade";
  const g = $("frameFxGroup"); if(!g) return;
  const id = state.kbachFrame, st = hasOwn(KBACH_FRAME_STYLES, id) ? KBACH_FRAME_STYLES[id] : null;
  g.style.display = (id && id !== "none" && id !== "custom" && st && st.mode !== "slice") ? "" : "none";
  renderPicker("pickFrameFx", Object.keys(FRAME_FX).map(k => ({ key:k, title:FRAME_FX[k].label, inner:FRAME_FX_ICONS[k] })),
    state.frameFx, k => { state.frameFx = k; buildFrameFxSelect(); update(); });
  const h = $("frameFxHint");
  if(h) h.textContent = "«" + FRAME_FX[state.frameFx].label + "» — " + (state.frameFx === "none" ? "ស៊ុមនៅជាប់អេក្រង់ជានិច្ច ពេលរមូរ។" : "រមូរចុះក្រោមក្នុងផ្ទាំង Preview ដើម្បីមើលចលនា។");
}
function buildKbachBgSelect(){
  if(!hasOwn(KBACH_BG_STYLES, state.kbachBg)) state.kbachBg = "none";
  renderPicker("pickKbachBg", Object.keys(KBACH_BG_STYLES).map(k => ({ key:k, title:KBACH_BG_STYLES[k].label, inner:kbachThumb("bg", k) })),
    state.kbachBg, k => { state.kbachBg = k; buildKbachBgSelect(); if(typeof refreshFrameUI === "function") refreshFrameUI(); update(); });
}
function buildTextAnimSelect(){
  if(!hasOwn(TEXT_ANIM_STYLES, state.textAnim)) state.textAnim = "fadeup";
  renderPicker("pickAnim", Object.keys(TEXT_ANIM_STYLES).map(k => ({ key:k, title:TEXT_ANIM_STYLES[k].label, inner:ANIM_ICONS[k] })),
    state.textAnim, k => {
      state.textAnim = k; buildTextAnimSelect();
      try{ sessionStorage.removeItem("wib-anim-seen"); }catch(e){}   // replay the animation in the preview straight away
      update();
    });
}
function buildCoverStyleSelect(){
  if(!hasOwn(COVER_STYLES, state.openStyle)) state.openStyle = "door";
  renderPicker("pickCover", COVER_STYLE_KEYS.map(k => ({ key:k, title:COVER_STYLES[k].label, inner:COVER_ICONS[k] })),
    state.openStyle, k => {
      state.openStyle = k; buildCoverStyleSelect();
      try{ sessionStorage.removeItem("wib-cover-seen"); }catch(e){}   // show the new style in the preview straight away
      update();
    });
  $("coverAlways").checked = !!state.coverAlways;
  refreshMusicUI();
}
$("coverAlways").addEventListener("change", e => {
  state.coverAlways = e.target.checked;
  try{ sessionStorage.removeItem("wib-cover-seen"); }catch(err){}
  refreshMusicUI();
  update();
});

function buildTimeline(){
  const list = $("timelineList");
  list.innerHTML = state.timeline.map((item,i) => `
    <div class="item-card" data-i="${i}">
      <div class="tl-head"><button class="icon-btn tl-remove" type="button" title="លុប">×</button></div>
      <div class="row2">
        <div class="tl-col">
          <input type="text" class="tl-time-in" value="${(item.time||"").replace(/"/g,"&quot;")}" placeholder="ម៉ោង (ខ្មែរ)">
          <input type="text" class="tl-name-in" value="${(item.name||"").replace(/"/g,"&quot;")}" placeholder="ឈ្មោះកម្មវិធី (ខ្មែរ)">
        </div>
        <div class="tl-col">
          <input type="text" class="tl-time-en-in" value="${(item.timeEn||"").replace(/"/g,"&quot;")}" placeholder="Time (English)">
          <input type="text" class="tl-name-en-in" value="${(item.nameEn||"").replace(/"/g,"&quot;")}" placeholder="Program Name (English)">
        </div>
      </div>
    </div>`).join("");
  list.querySelectorAll(".item-card").forEach(row => {
    const i = +row.dataset.i;
    row.querySelector(".tl-time-in").addEventListener("input", e => { state.timeline[i].time = e.target.value; scheduleUpdate(); });
    row.querySelector(".tl-name-in").addEventListener("input", e => { state.timeline[i].name = e.target.value; scheduleUpdate(); });
    row.querySelector(".tl-time-en-in").addEventListener("input", e => { state.timeline[i].timeEn = e.target.value; scheduleUpdate(); });
    row.querySelector(".tl-name-en-in").addEventListener("input", e => { state.timeline[i].nameEn = e.target.value; scheduleUpdate(); });
    row.querySelector(".tl-remove").addEventListener("click", () => { state.timeline.splice(i,1); buildTimeline(); update(); });
  });
}

function buildCoverPhoto(){
  if(typeof buildCoverArtSelect === "function") buildCoverArtSelect();
  const grid = $("coverGrid");
  if(state.coverPhoto){
    grid.innerHTML = ""; grid.style.display = "none";      // the picture itself is shown below (with its × button)
  } else {
    grid.style.display = "";
    grid.innerHTML = `<div class="photo-add-row">
      <span>+ បញ្ចូលរូបភាពគម្រប</span>
      <input type="file" accept="image/*" id="coverInput">
    </div>`;
    $("coverInput").addEventListener("change", async e => {
      const file = e.target.files[0];
      if(!file) return;
      setImgStatus("coverStatus", "កំពុងបង្រួមរូបភាព...");
      try{
        const data = await compressImage(file, IMG_COVER);
        state.coverPhoto = data; state.coverPhotoName = file.name;
        buildCoverPhoto(); update();
        setImgStatus("coverStatus", "បានបង្រួម៖ " + fmtSize(file.size) + " → " + fmtSize(dataUrlBytes(data)));
      }catch(err){
        setImgStatus("coverStatus", "មិនអាចបើករូបភាពនេះបានទេ សូមជ្រើសរើសរូបភាព JPG/PNG ផ្សេង");
      }
    });
  }
  buildCoverFocus();
}
(function bindCoverClear(){
  const x = $("coverClear");
  if(!x) return;
  x.addEventListener("pointerdown", e => e.stopPropagation());     // do not move the focus point when tapping ×
  x.addEventListener("click", e => {
    e.stopPropagation();
    state.coverPhoto = null; state.coverPhotoName = "";
    setImgStatus("coverStatus", ""); buildCoverPhoto(); update();
  });
})();

function buildCoverFocus(){
  const box = $("coverFocusBox");
  if(!box) return;
  const has = !!state.coverPhoto;
  box.style.display = has ? "block" : "none";
  if(!has) return;
  if($("focusImg").getAttribute("src") !== state.coverPhoto) $("focusImg").src = state.coverPhoto;
  $("focusDot").style.left = state.coverFocusX + "%";
  $("focusDot").style.top = state.coverFocusY + "%";
  $("coverBlur").value = state.coverBlur;   $("coverBlurVal").textContent = state.coverBlur ? state.coverBlur + " px" : "បិទ";
  $("coverSharp").value = state.coverSharp; $("coverSharpVal").textContent = state.coverSharp + "%";
  $("coverVeil").value = state.coverVeil;   $("coverVeilVal").textContent = state.coverVeil ? state.coverVeil + "%" : "បិទ";
}
(function bindCoverFocus(){
  const pick = $("focusPick");
  if(!pick) return;
  let dragging = false;
  function setFromEvent(e){
    const r = pick.getBoundingClientRect();
    if(!r.width || !r.height) return;
    state.coverFocusX = Math.max(0, Math.min(100, Math.round((e.clientX - r.left) / r.width * 100)));
    state.coverFocusY = Math.max(0, Math.min(100, Math.round((e.clientY - r.top) / r.height * 100)));
    $("focusDot").style.left = state.coverFocusX + "%";
    $("focusDot").style.top = state.coverFocusY + "%";
    scheduleUpdate();
  }
  pick.addEventListener("pointerdown", e => { dragging = true; try{ pick.setPointerCapture(e.pointerId); }catch(err){} setFromEvent(e); e.preventDefault(); });
  pick.addEventListener("pointermove", e => { if(dragging) setFromEvent(e); });
  const stop = () => { dragging = false; };
  pick.addEventListener("pointerup", stop);
  pick.addEventListener("pointercancel", stop);
  $("coverBlur").addEventListener("input", e => { state.coverBlur = +e.target.value; $("coverBlurVal").textContent = state.coverBlur ? state.coverBlur + " px" : "បិទ"; scheduleUpdate(); });
  $("coverSharp").addEventListener("input", e => { state.coverSharp = +e.target.value; $("coverSharpVal").textContent = state.coverSharp + "%"; scheduleUpdate(); });
  $("coverVeil").addEventListener("input", e => { state.coverVeil = +e.target.value; $("coverVeilVal").textContent = state.coverVeil ? state.coverVeil + "%" : "បិទ"; scheduleUpdate(); });
  $("coverFocusReset").addEventListener("click", () => {
    state.coverBlur = defaultState.coverBlur; state.coverFocusX = defaultState.coverFocusX;
    state.coverFocusY = defaultState.coverFocusY; state.coverSharp = defaultState.coverSharp; state.coverVeil = defaultState.coverVeil;
    buildCoverFocus(); update();
  });
})();

function buildContacts(){
  const list = $("contactList");
  list.innerHTML = state.contacts.map((c,i) => `
    <div class="item-card" data-i="${i}">
      <div class="tl-row" style="grid-template-columns:1fr 110px 30px;">
        <input type="text" class="ct-name-in" value="${(c.name||"").replace(/"/g,"&quot;")}" placeholder="ឈ្មោះ (ខ្មែរ)">
        <input type="text" class="ct-phone-in" value="${(c.phone||"").replace(/"/g,"&quot;")}" placeholder="លេខទូរស័ព្ទ">
        <button class="icon-btn ct-remove" type="button" title="លុប">×</button>
      </div>
      <div class="lang-tag">English name</div>
      <div class="tl-row en-row">
        <input type="text" class="ct-name-en-in" style="grid-column:1/-1;" value="${(c.nameEn||"").replace(/"/g,"&quot;")}" placeholder="Name (English)">
      </div>
    </div>`).join("");
  list.querySelectorAll(".item-card").forEach(row => {
    const i = +row.dataset.i;
    row.querySelector(".ct-name-in").addEventListener("input", e => { state.contacts[i].name = e.target.value; scheduleUpdate(); });
    row.querySelector(".ct-phone-in").addEventListener("input", e => { state.contacts[i].phone = e.target.value; scheduleUpdate(); });
    row.querySelector(".ct-name-en-in").addEventListener("input", e => { state.contacts[i].nameEn = e.target.value; scheduleUpdate(); });
    row.querySelector(".ct-remove").addEventListener("click", () => { state.contacts.splice(i,1); buildContacts(); update(); });
  });
}

function buildPhotos(){
  if(typeof buildGalleryArtSelect === "function") buildGalleryArtSelect();
  if(state.photos.length !== state.photoNames.length){
    state.photoNames = state.photos.map((_,i) => state.photoNames[i] || `រូបភាព ${i+1}`);
  }
  const paired = state.photos.map((src,i) => ({src, name: state.photoNames[i]})).filter(p => p.src);
  state.photos = paired.map(p => p.src);
  state.photoNames = paired.map(p => p.name);
  const grid = $("photoGrid");
  const existing = paired.length ? paired.map((p,i) => `
    <div class="photo-tile" data-i="${i}">
      <img src="${p.src}" alt="" draggable="false">
      <button class="photo-drag" type="button" title="អូសដើម្បីប្តូរលំដាប់" aria-label="អូសដើម្បីប្តូរលំដាប់ (ឬប្រើព្រួញ)"><svg viewBox="0 0 10 14" width="10" height="14" aria-hidden="true" fill="currentColor"><circle cx="2.5" cy="2.5" r="1.4"/><circle cx="7.5" cy="2.5" r="1.4"/><circle cx="2.5" cy="7" r="1.4"/><circle cx="7.5" cy="7" r="1.4"/><circle cx="2.5" cy="11.5" r="1.4"/><circle cx="7.5" cy="11.5" r="1.4"/></svg></button>
      <button class="photo-clear" type="button" data-i="${i}" aria-label="លុបរូបភាព">×</button>
    </div>`).join("") : "";
  const addTile = state.photos.length < MAX_PHOTOS
    ? `<div class="photo-add-row">
        <span>+ បញ្ចូលរូបភាព (${state.photos.length}/${MAX_PHOTOS})</span>
        <input type="file" accept="image/*" id="addPhotoInput" multiple>
      </div>`
    : "";
  grid.innerHTML = existing + addTile;

  const addInput = $("addPhotoInput");
  if(addInput){
    addInput.addEventListener("change", async e => {
      const files = Array.from(e.target.files || []);
      const remaining = MAX_PHOTOS - state.photos.length;
      const toAdd = files.slice(0, remaining);
      if(!toAdd.length) return;
      setImgStatus("photoStatus", "កំពុងបង្រួមរូបភាព...");
      let before = 0, after = 0, ok = 0, failed = 0;
      for(const file of toAdd){
        try{
          const data = await compressImage(file, IMG_GALLERY);
          state.photos.push(data);
          state.photoNames.push(file.name);
          before += file.size; after += dataUrlBytes(data); ok++;
        }catch(err){ failed++; }
      }
      buildPhotos(); update();
      let msg = ok ? "បានបង្រួម " + ok + " សន្លឹក៖ " + fmtSize(before) + " → " + fmtSize(after) : "";
      if(failed) msg += (msg ? " · " : "") + "មិនអាចបើករូបភាព " + failed + " សន្លឹក";
      if(files.length > remaining) msg += (msg ? " · " : "") + "បន្ថែមបានត្រឹម " + MAX_PHOTOS + " សន្លឹក";
      setImgStatus("photoStatus", msg);
    });
  }
  grid.querySelectorAll(".photo-clear").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const i = +e.target.dataset.i;
      state.photos.splice(i,1);
      state.photoNames.splice(i,1);
      buildPhotos(); update();
    });
  });
  // Reorder: drag the handle (mouse or touch) onto another photo, or focus the handle and press an arrow key.
  const movePhoto = (from, to) => {
    if(to < 0 || to >= state.photos.length || to === from) return;
    const [ph] = state.photos.splice(from, 1); state.photos.splice(to, 0, ph);
    const [nm] = state.photoNames.splice(from, 1); state.photoNames.splice(to, 0, nm);
    buildPhotos(); update();
    const again = grid.querySelector(`.photo-tile[data-i="${to}"] .photo-drag`);
    if(again && document.activeElement === document.body) again.focus();
  };
  grid.querySelectorAll(".photo-drag").forEach(h => {
    const tile = h.closest(".photo-tile");
    const from = +tile.dataset.i;
    h.addEventListener("keydown", e => {
      const d = (e.key === "ArrowLeft" || e.key === "ArrowUp") ? -1 : (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : 0;
      if(!d) return;
      e.preventDefault();
      movePhoto(from, from + d);
      const again = grid.querySelector(`.photo-tile[data-i="${from + d}"] .photo-drag`);
      if(again) again.focus();
    });
    h.addEventListener("pointerdown", e => {
      if(e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY;
      let over = -1;
      try{ h.setPointerCapture(e.pointerId); }catch(err){}
      tile.classList.add("dragging");
      const tiles = Array.from(grid.querySelectorAll(".photo-tile"));
      const onMove = ev => {
        tile.style.transform = `translate(${ev.clientX - sx}px, ${ev.clientY - sy}px) scale(1.04)`;
        over = -1;
        tiles.forEach((t, k) => {
          t.classList.remove("drop-target");
          if(k === from) return;
          const r = t.getBoundingClientRect();
          if(ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom){ over = k; t.classList.add("drop-target"); }
        });
      };
      const end = ev => {
        h.removeEventListener("pointermove", onMove);
        h.removeEventListener("pointerup", end);
        h.removeEventListener("pointercancel", end);
        if(ev.type === "pointerup" && over >= 0){ movePhoto(from, over); }
        else{
          tile.classList.remove("dragging"); tile.style.transform = "";
          tiles.forEach(t => t.classList.remove("drop-target"));
        }
      };
      h.addEventListener("pointermove", onMove);
      h.addEventListener("pointerup", end);
      h.addEventListener("pointercancel", end);
    });
  });
}

