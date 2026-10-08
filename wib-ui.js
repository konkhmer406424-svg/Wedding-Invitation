/* ==========================================================================
   wib-ui.js — image/music processing, guest files, publish, payment, backup, tabs, startup
   Load order in index.html:  wib-data.js → wib-render.js → wib-pickers.js → wib-ui.js
   (they share one global scope, so keep this order)
   ========================================================================== */
const MAX_GUESTS_PER_DOWNLOAD = 30;           // guests per ZIP download
const IMG_COVER   = { maxDim:1600, quality:0.78 }; // cover photo compression
const IMG_GALLERY = { maxDim:1200, quality:0.72 }; // pre-wedding photos compression

function setImgStatus(id, text){ const el = $(id); if(el) el.textContent = text || ""; }
function fmtSize(bytes){
  if(bytes >= 1048576) return (bytes/1048576).toFixed(1) + " MB";
  return Math.max(1, Math.round(bytes/1024)) + " KB";
}
function dataUrlBytes(s){ return Math.round((s.length - s.indexOf(",") - 1) * 0.75); }

// Resize (longest side <= maxDim) and re-encode as JPEG. PNG transparency
// becomes a white background. Falls back to the original file on any error.
function compressImage(file, opts){
  return new Promise((resolve, reject) => {
    if(!file.type || file.type.indexOf("image/") !== 0){ reject(new Error("not_image")); return; }
    const fallback = () => {
      const r = new FileReader();
      r.onload = ev => resolve(ev.target.result);
      r.onerror = () => reject(new Error("read_failed"));
      r.readAsDataURL(file);
    };
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try{
        const scale = Math.min(1, opts.maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const out = canvas.toDataURL("image/jpeg", opts.quality);
        URL.revokeObjectURL(url);
        resolve(out);
      }catch(err){ URL.revokeObjectURL(url); fallback(); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); fallback(); };
    img.src = url;
  });
}

// ---------- Background music: MP3 trim (no re-encode) + IndexedDB storage ----------
const MAX_MUSIC_INPUT_BYTES = 50 * 1024 * 1024; // largest song file staff may pick (it gets trimmed)
const MAX_MUSIC_OUT_BYTES = 2 * 1024 * 1024;    // size cap of the trimmed song embedded in every guest file

function fmtTime(sec){
  sec = Math.max(0, Math.round(sec));
  return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
}
function parseTime(str){
  const parts = String(str).trim().split(":").map(x => Number(x));
  if(!parts.length || parts.length > 3 || parts.some(x => !isFinite(x) || x < 0)) return null;
  return parts.reduce((acc, x) => acc * 60 + x, 0);
}
function musicMaxSeconds(){
  const v = Number($("musicMaxSel").value);
  return v > 0 ? v : Infinity;
}

// MP3 frames borrow bits from earlier frames (bit reservoir). Keeps whole frames from `startSeconds`,
// dropping ID3 tags / album art; returns { data, seconds, totalSeconds } or null on non-MP3 bytes.
function trimMp3(u8, maxSeconds, maxBytes, startSeconds){
  startSeconds = startSeconds > 0 ? startSeconds : 0;
  const len = u8.length;
  const BR1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320];
  const BR2 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160];
  const SR = { 3:[44100,48000,32000], 2:[22050,24000,16000], 0:[11025,12000,8000] };

  function header(p){
    if(p + 4 > len || u8[p] !== 0xFF || (u8[p+1] & 0xE0) !== 0xE0) return null;
    const ver = (u8[p+1] >> 3) & 3, layer = (u8[p+1] >> 1) & 3;
    if(ver === 1 || layer !== 1) return null;
    const bi = u8[p+2] >> 4, si = (u8[p+2] >> 2) & 3;
    if(bi === 0 || bi === 15 || si === 3) return null;
    const rate = SR[ver][si], kbps = (ver === 3 ? BR1 : BR2)[bi], pad = (u8[p+2] >> 1) & 1;
    const size = Math.floor((ver === 3 ? 144000 : 72000) * kbps / rate) + pad;
    return { ver, rate, kbps, size, samples: ver === 3 ? 1152 : 576,
             mono: (u8[p+3] >> 6) === 3, crc: (u8[p+1] & 1) === 0 };
  }
  function isFrame(p){
    const h = header(p);
    if(!h || p + h.size > len) return null;
    const q = p + h.size;
    if(q === len || len - q <= 300 || header(q)) return h;
    return null;
  }
  function isInfoFrame(p, h){
    const at = p + 4 + (h.crc ? 2 : 0) + (h.ver === 3 ? (h.mono ? 17 : 32) : (h.mono ? 9 : 17));
    const tag = String.fromCharCode(u8[at] || 0, u8[at+1] || 0, u8[at+2] || 0, u8[at+3] || 0);
    const v = String.fromCharCode(u8[p+36] || 0, u8[p+37] || 0, u8[p+38] || 0, u8[p+39] || 0);
    return tag === "Xing" || tag === "Info" || v === "VBRI";
  }

  let pos = 0;
  if(len > 10 && u8[0] === 0x49 && u8[1] === 0x44 && u8[2] === 0x33){
    pos = 10 + (((u8[6] & 0x7F) << 21) | ((u8[7] & 0x7F) << 14) | ((u8[8] & 0x7F) << 7) | (u8[9] & 0x7F));
    if(u8[5] & 0x10) pos += 10;
  }

  const PREROLL = 4;
  let recent = [];
  let start = -1, cut = -1, kept = 0, total = 0, end = 0, frames = 0, elapsed = 0, seenFirst = false;
  while(pos + 4 <= len){
    const h = isFrame(pos);
    if(!h){ pos++; continue; }
    if(!seenFirst){
      seenFirst = true;
      if(isInfoFrame(pos, h)){ pos += h.size; continue; }
    }
    const sec = h.samples / h.rate;
    if(start < 0){
      if(elapsed >= startSeconds){ start = recent.length ? recent[0] : pos; }
      else{
        recent.push(pos); if(recent.length > PREROLL) recent.shift();
        elapsed += sec; total += sec; pos += h.size; end = pos; frames++;
        continue;
      }
    }
    if(cut < 0 && (kept + sec > maxSeconds || (pos + h.size - start) > maxBytes)) cut = pos;
    if(cut < 0) kept += sec;
    total += sec;
    pos += h.size;
    end = pos;
    frames++;
  }
  if(frames === 0 || start < 0) return null;
  if(cut < 0) cut = end;
  if(cut <= start) return null;
  return { data: u8.subarray(start, cut), seconds: kept, totalSeconds: total };
}

function readAsArrayBuffer(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(file);
  });
}
function blobToDataUrl(blob){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
function guessAudioMime(name, type){
  if(type && type.indexOf("audio/") === 0) return type;
  const ext = (name.split(".").pop() || "").toLowerCase();
  return ({ mp3:"audio/mpeg", m4a:"audio/mp4", aac:"audio/aac", wav:"audio/wav", ogg:"audio/ogg", oga:"audio/ogg", opus:"audio/ogg" })[ext] || "audio/mpeg";
}

// ---- IndexedDB storage for the song (too big for localStorage) — single project per device ----
const MUSIC_DB = "wib-music-static", MUSIC_STORE = "tracks", MUSIC_KEY = "main";
function musicDb(){
  return new Promise((resolve, reject) => {
    if(!window.indexedDB){ reject(new Error("IndexedDB unavailable")); return; }
    const req = indexedDB.open(MUSIC_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(MUSIC_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function musicStoreOp(mode, fn){
  const db = await musicDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MUSIC_STORE, mode);
    const req = fn(tx.objectStore(MUSIC_STORE));
    tx.oncomplete = () => { db.close(); resolve(req ? req.result : undefined); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
async function persistMusic(){
  try{
    if(musicAsset) await musicStoreOp("readwrite", st => st.put(musicAsset, MUSIC_KEY));
    else await musicStoreOp("readwrite", st => st.delete(MUSIC_KEY));
  }catch(e){
    const st = $("musicStatus");
    if(st && musicAsset) st.textContent += " (មិនអាចរក្សាទុកចម្រៀងក្នុង browser នេះបានទេ — ត្រូវជ្រើសរើសម្តងទៀតពេលបើកថ្មី)";
  }
}
// ---------- Custom frame image (JPG / PNG / GIF): processing + IndexedDB storage + Builder UI ----------
const FRAME_KEY = "frame";
const MAX_FRAME_INPUT_BYTES = 15 * 1024 * 1024;   // biggest file staff may pick (JPG/PNG get shrunk)
const MAX_FRAME_OUT_BYTES = 1.5 * 1024 * 1024;     // cap of a JPG/PNG after shrinking, embedded in every guest file
const MAX_FRAME_GIF_BYTES = 3 * 1024 * 1024;       // GIFs are not re-encoded (would stop the animation), so just capped
function frameFileKind(file){
  const ext = ((file.name || "").split(".").pop() || "").toLowerCase();
  if(file.type === "image/gif" || ext === "gif") return "gif";
  if(file.type === "image/png" || ext === "png") return "png";
  if(file.type === "image/jpeg" || file.type === "image/jpg" || ext === "jpg" || ext === "jpeg") return "jpg";
  return "";
}
function readAsDataUrl_(file){
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = ev => resolve(ev.target.result);
    r.onerror = () => reject(new Error("read_failed"));
    r.readAsDataURL(file);
  });
}
function loadImgEl_(file){
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode_failed")); };
    img.src = url;
  });
}
// PNG keeps its transparency: shrink to a smaller PNG until it fits the size cap.
async function shrinkPng_(file){
  const img = await loadImgEl_(file);
  const longest = Math.max(img.naturalWidth, img.naturalHeight);
  for(const maxDim of [1600, 1200, 900, 700]){
    const scale = Math.min(1, maxDim / longest);
    const w = Math.max(1, Math.round(img.naturalWidth * scale)), h = Math.max(1, Math.round(img.naturalHeight * scale));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h);
    const out = c.toDataURL("image/png");
    if(dataUrlBytes(out) <= MAX_FRAME_OUT_BYTES) return out;
  }
  return null;
}
async function buildFrameAsset(file){
  const kind = frameFileKind(file);
  if(!kind) throw new Error("type");
  if(file.size > MAX_FRAME_INPUT_BYTES) throw new Error("input_big");
  let dataUrl;
  if(kind === "gif"){
    if(file.size > MAX_FRAME_GIF_BYTES) throw new Error("gif_big");
    dataUrl = await readAsDataUrl_(file);
    if(!/^data:image\/gif;base64,/i.test(dataUrl)) dataUrl = dataUrl.replace(/^data:[^;,]*/i, "data:image/gif");
  }else if(kind === "png"){
    if(file.size <= MAX_FRAME_OUT_BYTES){
      dataUrl = await readAsDataUrl_(file);                     // already small: keep the original untouched
      const img = await loadImgEl_(file);
      if(Math.max(img.naturalWidth, img.naturalHeight) > 2400) dataUrl = await shrinkPng_(file);
    }else{
      dataUrl = await shrinkPng_(file);
    }
    if(!dataUrl) throw new Error("png_big");
    if(!/^data:image\/png;base64,/i.test(dataUrl)) dataUrl = dataUrl.replace(/^data:[^;,]*/i, "data:image/png");
  }else{
    dataUrl = await compressImage(new File([file], file.name, { type: "image/jpeg" }), { maxDim: 1600, quality: 0.85 });
    if(dataUrlBytes(dataUrl) > MAX_FRAME_OUT_BYTES) dataUrl = await compressImage(new File([file], file.name, { type: "image/jpeg" }), { maxDim: 1100, quality: 0.78 });
  }
  if(!BK_IMG_RE.test(dataUrl)) throw new Error("bad_data");
  return { name: String(file.name || "frame").slice(0, 200), size: dataUrlBytes(dataUrl), type: dataUrl.slice(5, dataUrl.indexOf(";")), dataUrl };
}
const BG_KEY = "bg";
function sanitizeFrameAsset_(rec){
  if(!rec || typeof rec !== "object" || typeof rec.dataUrl !== "string" || !BK_IMG_RE.test(rec.dataUrl)) return null;
  return { name: String(rec.name || "image").slice(0, 200), size: (typeof rec.size === "number" && isFinite(rec.size)) ? rec.size : dataUrlBytes(rec.dataUrl),
           type: rec.dataUrl.slice(5, rec.dataUrl.indexOf(";")), dataUrl: rec.dataUrl };
}
// One upload box per slot: the FRAME image (on top) and the BACKGROUND image (behind). Same behaviour, own storage key.
const IMG_SLOTS = [];
function makeImageSlot(c){
  const S = { c };
  IMG_SLOTS.push(S);
  const id = n => c.prefix + n, el = n => $(id(n));
  const box = $(c.prefix + "CustomBox");
  if(!box) return S;
  box.className = "frame-custom-box"; box.style.display = "none";
  box.innerHTML = `<p class="photo-hint" style="margin:0 0 10px;">${c.hint}</p>
<input type="file" id="${id("File")}" accept="image/png,image/jpeg,image/gif,.png,.jpg,.jpeg,.gif" style="display:none;">
<button class="add-btn" id="${id("AddBtn")}" type="button"></button>
<div class="frame-prev" id="${id("Prev")}" style="display:none;"><img id="${id("PrevImg")}" alt=""><button class="photo-clear cover-x" type="button" id="${id("Clear")}" title="លុបរូបភាព" aria-label="លុបរូបភាព">×</button></div>
<p class="guest-empty-hint" id="${id("Status")}" style="padding-top:8px;white-space:pre-line;"></p>
<div id="${id("Opts")}" style="display:none;">
${c.fits.map(f => `<label class="chk-row"><input type="radio" name="${c.prefix}Fit" value="${f[0]}"><span>${f[1]}</span></label>`).join("")}
<label style="margin-top:10px;">ភាពច្បាស់ <b id="${id("OpacityVal")}"></b></label>
<input type="range" id="${id("Opacity")}" min="10" max="100" step="1" style="width:100%;">
</div>`;
  S.refresh = () => {
    const on = state[c.styleKey] === "custom";
    box.style.display = on ? "" : "none";
    if(!on) return;
    const a = c.get(), has = !!(a && a.dataUrl);
    el("Prev").style.display = has ? "" : "none";
    el("Opts").style.display = has ? "" : "none";
    el("AddBtn").textContent = has ? c.changeText : c.addText;
    if(has){
      el("PrevImg").src = a.dataUrl;
      const kind = (a.type || "").replace("image/", "").toUpperCase();
      el("Status").textContent = `${a.name} — ${kind} · ${fmtSize(a.size)}\nឯកសារភ្ញៀវនីមួយៗនឹងធំបន្ថែមប្រហែល ${fmtSize(a.dataUrl.length)}`;
    }else{
      el("Status").textContent = "មិនទាន់មានរូបភាពទេ";
    }
    box.querySelectorAll('input[type=radio]').forEach(r => { r.checked = (r.value === state[c.fitKey]); });
    el("Opacity").value = String(state[c.opKey]);
    el("OpacityVal").textContent = state[c.opKey] + "%";
  };
  S.persist = async () => {
    try{
      const a = c.get();
      if(a) await musicStoreOp("readwrite", st => st.put(a, c.key));
      else await musicStoreOp("readwrite", st => st.delete(c.key));
      return true;
    }catch(e){ return false; }
  };
  S.picked = async (file) => {
    if(!file) return;
    el("Status").textContent = "កំពុងរៀបចំរូបភាព...";
    try{
      c.set(await buildFrameAsset(file));
      state[c.styleKey] = "custom";
      const saved = await S.persist();
      S.refresh();
      if(!saved) el("Status").textContent += "\n(មិនអាចរក្សាទុកក្នុង browser នេះបានទេ — ត្រូវជ្រើសរើសម្តងទៀតពេលបើកថ្មី)";
      update();
    }catch(e){
      const msg = ({
        type: "សូមជ្រើសរើសឯកសារ JPG, PNG ឬ GIF ប៉ុណ្ណោះ",
        input_big: `ឯកសារធំពេក (${fmtSize(file.size)}) — សូមជ្រើសរើសឯកសារតូចជាង ${fmtSize(MAX_FRAME_INPUT_BYTES)}`,
        gif_big: `GIF ធំពេក (${fmtSize(file.size)}) — សូមប្រើ GIF តូចជាង ${fmtSize(MAX_FRAME_GIF_BYTES)} (បង្រួមវាតាម ezgif.com ជាដើម)`,
        png_big: "PNG នេះធំពេក សូមប្រើរូបភាពតូចជាងនេះ"
      })[e && e.message] || "មិនអាចអានរូបភាពនេះបានទេ";
      S.refresh();
      el("Status").textContent = msg;
    }
  };
  el("AddBtn").addEventListener("click", () => el("File").click());
  el("File").addEventListener("change", ev => { const f = ev.target.files && ev.target.files[0]; ev.target.value = ""; S.picked(f); });
  el("Clear").addEventListener("click", async () => { c.set(null); await S.persist(); S.refresh(); update(); });
  box.querySelectorAll('input[type=radio]').forEach(r => r.addEventListener("change", () => {
    if(!r.checked) return;
    state[c.fitKey] = r.value; scheduleUpdate();
  }));
  el("Opacity").addEventListener("input", ev => {
    state[c.opKey] = Number(ev.target.value) || 100;
    el("OpacityVal").textContent = state[c.opKey] + "%";
    scheduleUpdate();
  });
  return S;
}
makeImageSlot({ prefix:"frame", key:FRAME_KEY, styleKey:"kbachFrame", fitKey:"frameFit", opKey:"frameOpacity",
  get:() => frameAsset, set:v => { frameAsset = v; },
  hint:"ស៊ុមនៅ <b>ពីលើ</b> ខ្លឹមសារ។ ល្អបំផុតគឺ <b>PNG ឬ GIF</b> ដែលចំកណ្ដាលថ្លា (transparent)។ GIF នឹងមានចលនា។ ទំហំណែនាំ ៩០០ × ១៦០០ px (បញ្ឈរ)។",
  addText:"＋ បញ្ចូលរូបភាពស៊ុម (JPG / PNG / GIF)", changeText:"🔄 ប្តូររូបភាពស៊ុម",
  fits:[["stretch","ទាញពេញអេក្រង់ (ស័ក្តិសមស៊ុម PNG/GIF)"],["cover","រក្សាសមាមាត្រ (អាចកាត់គែមខ្លះ)"]] });
makeImageSlot({ prefix:"bg", key:BG_KEY, styleKey:"kbachBg", fitKey:"bgFit", opKey:"bgOpacity",
  get:() => bgAsset, set:v => { bgAsset = v; },
  hint:"ផ្ទៃខាងក្រោយនៅ <b>ពីក្រោយ</b> ខ្លឹមសារ ហើយនៅជាប់អេក្រង់ខណៈ scroll។ ប្រើ JPG, PNG ឬ GIF ក៏បាន។ ទំហំណែនាំ ៩០០ × ១៦០០ px។ បើអក្សរពិបាកអាន សូមបន្ថយ «ភាពច្បាស់»។",
  addText:"＋ បញ្ចូលរូបភាពផ្ទៃខាងក្រោយ (JPG / PNG / GIF)", changeText:"🔄 ប្តូររូបភាពផ្ទៃខាងក្រោយ",
  fits:[["cover","រក្សាសមាមាត្រ (ពេញអេក្រង់ កាត់គែមបន្តិច)"],["stretch","ទាញពេញអេក្រង់"]] });
function refreshFrameUI(){ IMG_SLOTS.forEach(S => { if(S.refresh) S.refresh(); }); }
async function loadFrameOnStartup(){
  for(const S of IMG_SLOTS){
    try{ S.c.set(sanitizeFrameAsset_(await musicStoreOp("readonly", st => st.get(S.c.key)))); }
    catch(e){ S.c.set(null); }
  }
  refreshFrameUI();
  if(state.kbachFrame === "custom" || state.kbachBg === "custom") update();
}

async function loadMusicOnStartup(){
  try{
    const rec = await musicStoreOp("readonly", st => st.get(MUSIC_KEY));
    const num = v => (typeof v === "number" && isFinite(v) && v >= 0) ? v : null;
    musicAsset = (rec && typeof rec.dataUrl === "string" && /^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+\/=]+$/i.test(rec.dataUrl))
      ? { name: String(rec.name || "song"), size: num(rec.size) || 0, origSize: num(rec.origSize) || 0, seconds: num(rec.seconds), origSeconds: num(rec.origSeconds), startSeconds: num(rec.startSeconds) || 0, dataUrl: rec.dataUrl }
      : null;
  }catch(e){ musicAsset = null; }
  refreshMusicUI();
  update();
}

function refreshMusicUI(autoplay){
  const prev = $("musicPreview"), st = $("musicStatus");
  if(!prev) return;
  const rm = $("musicRemoveBtn"), startField = $("musicStartField");
  try{ prev.pause(); }catch(e){}
  if(musicAsset){
    prev.src = musicAsset.dataUrl;
    prev.style.display = "block";
    rm.style.display = "";
    let line = musicAsset.name;
    const from = musicAsset.startSeconds > 0 ? `ចាប់ពី ${fmtTime(musicAsset.startSeconds)} · ` : "";
    if(musicAsset.seconds) line += ` — ${from}រយៈពេល ${fmtTime(musicAsset.seconds)} (${fmtSize(musicAsset.size)})`;
    else line += ` — ${fmtSize(musicAsset.size)}`;
    if(musicAsset.origSeconds && musicAsset.seconds && musicAsset.origSeconds - musicAsset.seconds > 1){
      line += ` · កាត់ពី ${fmtTime(musicAsset.origSeconds)} (${fmtSize(musicAsset.origSize)})`;
    }
    if(musicSource && musicAsset.origSeconds){
      const maxStart = Math.max(0, Math.floor(musicAsset.origSeconds - 5));
      $("musicStartRange").max = String(maxStart);
      $("musicStartRange").value = String(Math.min(maxStart, Math.round(musicAsset.startSeconds || 0)));
      $("musicStartTxt").value = fmtTime(musicAsset.startSeconds || 0);
      startField.style.display = "";
    }else{
      startField.style.display = "none";
    }
    if(autoplay){ try{ const pr = prev.play(); if(pr && pr.catch) pr.catch(() => {}); }catch(e){} }
    st.textContent = line + `\nឯកសារភ្ញៀវនីមួយៗនឹងធំបន្ថែមប្រហែល ${fmtSize(musicAsset.dataUrl.length)}`;
    st.style.whiteSpace = "pre-line";
  }else{
    prev.removeAttribute("src");
    prev.style.display = "none";
    rm.style.display = "none"; startField.style.display = "none";
    st.textContent = "មិនទាន់មានចម្រៀងទេ";
  }
}

async function buildMusicAsset(src, startSeconds, autoplay){
  const st = $("musicStatus");
  st.style.whiteSpace = "";
  const isMp3 = /\.mp3$/i.test(src.name) || src.type === "audio/mpeg";
  let start = startSeconds > 0 ? startSeconds : 0;
  if(src.totalSeconds) start = Math.min(start, Math.max(0, Math.floor(src.totalSeconds - 5)));
  let trimmed = isMp3 ? trimMp3(src.u8, musicMaxSeconds(), MAX_MUSIC_OUT_BYTES, start) : null;
  if(!trimmed && isMp3 && start > 0){ start = 0; trimmed = trimMp3(src.u8, musicMaxSeconds(), MAX_MUSIC_OUT_BYTES, 0); }
  if(trimmed) src.totalSeconds = trimmed.totalSeconds;

  let data, mime, seconds = null, origSeconds = null;
  if(trimmed){
    data = trimmed.data; mime = "audio/mpeg";
    seconds = trimmed.seconds; origSeconds = trimmed.totalSeconds;
  }else{
    if(src.size > MAX_MUSIC_OUT_BYTES){
      st.textContent = `ឯកសារនេះធំពេក (${fmtSize(src.size)}) ហើយមិនអាចកាត់ស្វ័យប្រវត្តិបានទេ — ប្រព័ន្ធកាត់បានតែ MP3។ សូមបម្លែងជា MP3 ជាមុន ឬប្រើឯកសារតូចជាង ${fmtSize(MAX_MUSIC_OUT_BYTES)}`;
      return false;
    }
    data = src.u8; mime = guessAudioMime(src.name, src.type);
  }

  const dataUrl = await blobToDataUrl(new Blob([data], { type: mime }));
  musicAsset = { name: src.name, size: data.length, origSize: src.size, seconds, origSeconds, startSeconds: trimmed ? start : 0, dataUrl };
  musicSource = src;
  try{ sessionStorage.removeItem("wib-cover-seen"); }catch(e){}
  refreshMusicUI(autoplay);
  persistMusic();
  update();
  return true;
}

async function importMusic(file){
  const st = $("musicStatus");
  st.style.whiteSpace = "";
  if(!(file.type.indexOf("audio/") === 0 || /\.(mp3|m4a|aac|wav|ogg|oga|opus)$/i.test(file.name))){
    st.textContent = "សូមជ្រើសរើសឯកសារសំឡេង (MP3, M4A, WAV …)";
    return;
  }
  if(file.size > MAX_MUSIC_INPUT_BYTES){
    st.textContent = `ឯកសារធំពេក (${fmtSize(file.size)}) — សូមជ្រើសរើសឯកសារតូចជាង ${fmtSize(MAX_MUSIC_INPUT_BYTES)}`;
    return;
  }
  st.textContent = "កំពុងកាត់ចម្រៀង...";
  try{
    const buf = await readAsArrayBuffer(file);
    await buildMusicAsset({ name: file.name, type: file.type, size: file.size, u8: new Uint8Array(buf) }, 0, false);
  }catch(e){
    st.textContent = "មិនអាចអានឯកសារនេះបានទេ";
  }
}
try{ const savedMax = localStorage.getItem("wib-music-max"); if(savedMax !== null) $("musicMaxSel").value = savedMax; }catch(e){}
if(!$("musicMaxSel").value) $("musicMaxSel").value = "60";
$("musicMaxSel").addEventListener("change", async () => {
  try{ localStorage.setItem("wib-music-max", $("musicMaxSel").value); }catch(e){}
  if(musicSource){ await buildMusicAsset(musicSource, musicAsset ? musicAsset.startSeconds : 0, false); }
  else if(musicAsset){ $("musicStatus").textContent += "\n(ជ្រើសរើសឯកសារម្តងទៀត ដើម្បីកាត់តាមរយៈពេលថ្មី)"; }
});

async function setMusicStart(seconds){
  if(!musicSource || !musicAsset) return;
  await buildMusicAsset(musicSource, Math.max(0, Math.round(seconds)), true);
}
$("musicStartRange").addEventListener("input", () => { $("musicStartTxt").value = fmtTime(Number($("musicStartRange").value)); });
$("musicStartRange").addEventListener("change", () => setMusicStart(Number($("musicStartRange").value)));
$("musicStartTxt").addEventListener("change", () => {
  const t = parseTime($("musicStartTxt").value);
  if(t === null){ $("musicStartTxt").value = fmtTime(musicAsset ? musicAsset.startSeconds || 0 : 0); return; }
  setMusicStart(t);
});
$("musicStartBeginBtn").addEventListener("click", () => setMusicStart(0));
$("musicStartEndBtn").addEventListener("click", () => {
  if(!musicAsset || !musicAsset.origSeconds) return;
  const bytesPerSec = musicAsset.size / Math.max(1, musicAsset.seconds);
  const longest = Math.min(musicMaxSeconds(), MAX_MUSIC_OUT_BYTES / bytesPerSec * 0.98, musicAsset.origSeconds);
  setMusicStart(Math.ceil(musicAsset.origSeconds - longest));
});
$("musicPickBtn").addEventListener("click", () => $("musicFile").click());
$("musicFile").addEventListener("change", e => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if(file) importMusic(file);
});
$("musicRemoveBtn").addEventListener("click", () => {
  musicAsset = null; musicSource = null;
  refreshMusicUI();
  persistMusic();
  update();
});

function guestNameList(){
  return $("guestNamesFile").value.split("\n").map(n => n.trim()).filter(Boolean);
}
function updateGuestCount(){
  const el = $("guestCount");
  if(!el) return;
  const n = guestNameList().length;
  el.textContent = n + " នាក់";
  el.style.color = "";
  el.style.fontWeight = "";
}
function checkGuestLimit(names){
  if(names.length > MAX_GUESTS_PER_DOWNLOAD){
    $("genFilesStatus").textContent =
      "ទាញយកបានតែ " + MAX_GUESTS_PER_DOWNLOAD + " នាក់ក្នុងមួយដងប៉ុណ្ណោះ (អ្នកបានបញ្ចូល " + names.length +
      " នាក់)។ សូមកាត់ឈ្មោះលើស " + (names.length - MAX_GUESTS_PER_DOWNLOAD) +
      " ចេញ ទាញយកក្រុមនេះសិន រួចបិទភ្ជាប់ឈ្មោះក្រុមបន្ទាប់ដើម្បីទាញយកម្តងទៀត";
    return false;
  }
  return true;
}

function safeFileName(name){
  return (name || "guest").trim().replace(/[^\w\u1780-\u17FF]+/g, "_").replace(/^_+|_+$/g, "") || "guest";
}

// ---- Personalized guest files: baked-in, zipped, no hosting needed ----
async function generateGuestFiles(){
  const statusEl = $("genFilesStatus");
  const names = $("guestNamesFile").value.split("\n").map(n => n.trim()).filter(Boolean);
  state.guestNamesFileRaw = $("guestNamesFile").value;
  saveDraft();

  if(!names.length){
    statusEl.textContent = "សូមបញ្ចូលឈ្មោះភ្ញៀវយ៉ាងហោចណាស់ម្នាក់ម្នាក់ក្នុងមួយបន្ទាត់";
    return;
  }
  if(!checkGuestLimit(names)) return;
  if(typeof JSZip === "undefined"){
    statusEl.textContent = "មិនអាចផ្ទុកម៉ូឌុល ZIP បាន សូមព្យាយាមម្តងទៀត ឬពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត";
    return;
  }
  statusEl.textContent = "កំពុងបង្កើតឯកសារ...";

  const zip = new JSZip();
  const usedNames = {};
  names.forEach(name => {
    const guestState = Object.assign({}, state, { __guestName: name });
    const html = renderInvitation(guestState);
    let base = safeFileName(name);
    let finalName = base;
    let n = 2;
    while(usedNames[finalName]){ finalName = base + "-" + n; n++; }
    usedNames[finalName] = true;
    zip.file(finalName + ".html", html);
  });

  try{
    const blob = await zip.generateAsync({ type:"blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "guest-invitations.zip";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    statusEl.textContent = `បានទាញយក ${names.length} ឯកសារ ក្នុង ZIP មួយ — ស្រាយ (unzip) រួចផ្ញើឯកសារនីមួយៗទៅភ្ញៀវផ្ទាល់`;
  }catch(e){
    statusEl.textContent = "មានបញ្ហាកើតឡើងពេលបង្កើត ZIP សូមព្យាយាមម្តងទៀត";
  }
}
// ---------------------------------------------------------------------
// Publish once (via a Cloudflare Worker that writes to GitHub Pages),
// then generate unlimited personalized guest links instantly and for
// free — the template already reads ?to=NAME at runtime (see the
// guestParams/guestName code above), so we never need a file per guest.
// ---------------------------------------------------------------------

// ==== REPLACE with your deployed Cloudflare Worker URL ====
const PUBLISH_ENDPOINT = "https://wib-publish-github.konkhmer406424.workers.dev/";

function asciiSafe(str){
  return (str || "")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]+/g, "")
    .replace(/[^\w-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function hashString(str){
  let hash = 0;
  const s = String(str || "");
  for(let i = 0; i < s.length; i++){
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function slugifyProject(){
  let g = asciiSafe(state.groomNameEn || state.groomName);
  let b = asciiSafe(state.brideNameEn || state.brideName);
  if(!g) g = "groom";
  if(!b) b = "bride";
  const d = (state.eventDate || "").trim().replace(/[^\w-]+/g, "");
  const slug = [g, b, d].filter(Boolean).join("-").toLowerCase();
  return slug || "wedding";
}

function getSiteSlug(){
  if(!state.siteSlug){
    state.siteSlug = slugifyProject() + "-" + hashString(Date.now() + "-" + Math.random());
    saveDraft();
  }
  return state.siteSlug;
}

function publishConfigured(){
  return PUBLISH_ENDPOINT && PUBLISH_ENDPOINT.indexOf("YOUR_") !== 0;
}

// See publishWebsite(): recovers a missing state.publishToken by silently
// re-verifying the cached unlock code against the server, when the client is
// still genuinely unlocked (paid-flag valid) but this draft/session never
// received (or lost) its token. Returns true if state.publishToken is now set.
async function ensurePublishToken_(){
  if(state.publishToken) return true;
  if(!isUnlocked()) return false;
  let saved = null;
  try{ saved = JSON.parse(localStorage.getItem(paidFlagKey_()) || "null"); }catch(e){}
  if(!saved || !saved.code) return false;
  if(!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf("REPLACE_WITH") === 0) return false;
  try{
    const params = weddingFingerprintParams_();
    params.set("code", saved.code);
    const resp = await fetch(`${APPS_SCRIPT_URL}?action=verifyCode&${params.toString()}`);
    const data = await resp.json();
    if(data.success && data.publishToken){
      state.publishToken = data.publishToken;
      state.publishTokenKey = unlockKey();
      saveDraft();
      return true;
    }
  }catch(e){ /* network error — treat as not recovered */ }
  return false;
}

// Opens the payment modal straight to the code-entry panel (skips the QR
// step and the choice screen), optionally pre-filling a cached code — used
// when recovery needs the client to confirm/re-submit a code themselves,
// and by the "🔑 មានលេខកូដរួចហើយ" choice button.
function openCodeEntry_(prefillCode){
  $("payOverlay").classList.add("show");
  $("payTitle").textContent = "វាយលេខកូដ";
  $("payAmount").textContent = "";
  $("payChoice").style.display = "none";
  $("payQrSection").style.display = "none";
  $("codeSuccess").classList.remove("show");
  $("codeEntry").classList.add("show");
  $("haveCodeLink").style.display = "none";
  $("codeStatus").textContent = "";
  if(prefillCode) $("unlockCodeInput").value = prefillCode;
}

// Opens the payment modal to the first choice screen: generate a fresh KHQR
// to pay, or enter a code already obtained — instead of jumping straight
// into KHQR generation the way the button used to.
function openPaymentChoice_(){
  $("payOverlay").classList.add("show");
  $("payTitle").textContent = "ចង់បន្តយ៉ាងណា?";
  $("payAmount").textContent = "ជ្រើសរើសមួយខាងក្រោម";
  $("payChoice").style.display = "block";
  $("payQrSection").style.display = "none";
  $("codeEntry").classList.remove("show");
  $("codeSuccess").classList.remove("show");
  $("haveCodeLink").style.display = "none";
}

async function publishWebsite(){
  const statusEl = $("genFilesStatus");

  if(!publishConfigured()){
    statusEl.textContent = "⚠️ មិនទាន់បានកំណត់ PUBLISH_ENDPOINT ទេ — សូមដាក់ Cloudflare Worker URL ចូល code (ស្វែងរក \"PUBLISH_ENDPOINT\")";
    return;
  }
  if(state.publishToken && state.publishTokenKey && state.publishTokenKey !== unlockKey()){
    state.publishToken = "";   // names/date changed since this token was issued -> it is stale; re-verify below
  }
  if(!state.publishToken){
    // isUnlocked() (name+date, 30 days) and state.publishToken (this session
    // only) can get out of sync — e.g. the draft was reloaded on another
    // device, or cleared and the same names/date retyped. The paid-flag record
    // also keeps the original unlock code, so try a silent re-verify against
    // the server before bothering the client with anything.
    statusEl.textContent = "កំពុងផ្ទៀងផ្ទាត់សិទ្ធិ Publish ឡើងវិញ...";
    const recovered = await ensurePublishToken_();
    if(!recovered){
      // Silent recovery failed. The main button won't reopen this panel on
      // its own (isUnlocked() is still true, so it just calls publishWebsite()
      // again) — so open the code-entry panel directly instead of pointing at
      // a control the client can't actually reach.
      let saved = null;
      try{ saved = JSON.parse(localStorage.getItem(paidFlagKey_()) || "null"); }catch(e){}
      statusEl.textContent = "⚠️ មិនអាច Publish បានទេ — សូមផ្ទៀងផ្ទាត់លេខកូដម្តងទៀតខាងក្រោម";
      openCodeEntry_(saved && saved.code);
      return;
    }
  }

  statusEl.textContent = "កំពុងបោះពុម្ពគេហទំព័រ...";
  const fp = Object.fromEntries(weddingFingerprintParams_().entries());   // normalized, same as unlock/verifyCode
  const slug = getSiteSlug();
  const html = renderInvitation(state); // no __guestName — page reads ?to= itself at view time

  try{
    const resp = await fetch(PUBLISH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: `sites/${slug}/index.html`, content: html,
        token: state.publishToken || "",
        groomName: fp.groomName, brideName: fp.brideName,
        groomNameEn: fp.groomNameEn, brideNameEn: fp.brideNameEn,
        eventDate: fp.eventDate
      })
    });
    const data = await resp.json().catch(() => ({}));
    if(!resp.ok || !data.url){ throw new Error(data.error || ("HTTP " + resp.status)); }

    state.publishedUrl = data.url;
    state.publishTokenKey = unlockKey();
    saveDraft();
    statusEl.textContent = "✅ បោះពុម្ពជោគជ័យ! Link គោល: " + data.url;
    renderPublishedUrl();
    generateGuestLinks();
    try{ showExportReminder_(); }catch(remErr){}   // ask the client to back up the project (does not affect publishing)
  }catch(e){
    console.error("Publish failed:", e);
    if(/fingerprint_mismatch/i.test(String(e && e.message || e))){
      state.publishToken = "";   // force a fresh verification next time
      saveDraft();
      // BUGFIX: this branch used to only show a message telling the customer to
      // "re-enter the code", but never actually opened the code-entry panel —
      // there was nowhere for them to do that. Open it directly, the same way
      // the silent-recovery-failed branch above already does.
      let saved = null;
      try{ saved = JSON.parse(localStorage.getItem(paidFlagKey_()) || "null"); }catch(err){}
      statusEl.textContent = "⚠️ ឈ្មោះកូនកម្លោះ/កូនក្រមុំ ឬថ្ងៃពិធី មិនត្រូវនឹងអ្វីដែលបានទូទាត់ទេ។ សូមកែឱ្យដូចពេលទូទាត់ (ទាំងខ្មែរ និង English) ឬវាយលេខកូដម្តងទៀតខាងក្រោម រួចចុច Publish ម្តងទៀត។";
      openCodeEntry_(saved && saved.code);
      return;
    }
    statusEl.textContent = "❌ បោះពុម្ពបរាជ័យ៖ " + (e.message || e);
  }
}

function renderPublishedUrl(){
  const el = $("publishedUrlBox");
  if(!el) return;
  if(!state.publishedUrl){ el.innerHTML = ""; return; }
  el.innerHTML = `<div style="margin-top:8px;font-size:13px;">Link គោល: <a href="${escapeHtml(state.publishedUrl)}" target="_blank" rel="noopener">${escapeHtml(state.publishedUrl)}</a> &nbsp;•&nbsp; <button type="button" id="republishBtn" style="border:none;background:none;color:#1565C0;text-decoration:underline;cursor:pointer;font-size:13px;padding:0;">បោះពុម្ពម្តងទៀត (បើកែខ្លឹមសារ)</button></div>`;
  const rb = $("republishBtn");
  if(rb) rb.addEventListener("click", publishWebsite);
}

function generateGuestLinks(){
  const statusEl = $("genFilesStatus");
  const names = guestNameList();
  state.guestNamesFileRaw = $("guestNamesFile").value;
  saveDraft();

  if(!state.publishedUrl){
    statusEl.textContent = "សូម Publish គេហទំព័រជាមុនសិន (ចុចប៊ូតុងខាងលើ)";
    return;
  }
  if(!names.length){
    statusEl.textContent = "សូមបញ្ចូលឈ្មោះភ្ញៀវយ៉ាងហោចណាស់ម្នាក់ម្នាក់ក្នុងមួយបន្ទាត់";
    return;
  }

  const results = names.map(name => ({
    name,
    url: state.publishedUrl + (state.publishedUrl.indexOf("?") === -1 ? "?" : "&") + "to=" + encodeURIComponent(name),
    ok: true
  }));

  renderGuestLinksResult(results);
  statusEl.textContent = `✅ បានបង្កើត Link សម្រាប់ភ្ញៀវទាំង ${names.length} នាក់! ចម្លងផ្ញើទៅភ្ញៀវម្នាក់ៗបានតែម្តង`;
}

function renderGuestLinksResult(results){
  const el = $("guestLinksResult");
  if(!el) return;
  const rows = results.map((r, i) => `
    <tr>
      <td style="padding:6px 8px;border-top:1px solid var(--b-line);">ជូនចំពោះ ${escapeHtml(r.name)}</td>
      <td style="padding:6px 8px;border-top:1px solid var(--b-line);word-break:break-all;">${r.ok ? `<a href="${r.url}" target="_blank" rel="noopener">${r.url}</a>` : '<span style="color:#C0392B;">បរាជ័យ</span>'}</td>
      <td style="padding:6px 8px;border-top:1px solid var(--b-line);">${r.ok ? `<button type="button" class="copy-link-btn" data-idx="${i}" style="font-size:12px;padding:4px 8px;">ចម្លង</button>` : ""}</td>
    </tr>`).join("");

  el.innerHTML = `
    <div style="margin-top:14px;">
      <div style="display:flex;gap:8px;margin-bottom:8px;">
        <button type="button" id="copyAllLinksBtn" class="add-btn" style="flex:1;">ចម្លងទាំងអស់ (ឈ្មោះ + Link)</button>
        <button type="button" id="downloadCsvBtn" class="add-btn" style="flex:1;">ទាញយក CSV(excel)</button>
      </div>
      <div style="max-height:280px;overflow:auto;border:1px solid var(--b-line);border-radius:8px;">
        <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
          <thead><tr style="background:var(--b-bg);"><th style="text-align:left;padding:6px 8px;">ឈ្មោះ</th><th style="text-align:left;padding:6px 8px;">Link</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;

  // Per-row copy now copies BOTH the name and the link together (one click),
  // same "ជូនចំពោះ <name>: <url>" format used by "ចម្លងទាំងអស់" below — looked
  // up by index into `results` instead of a data-url attribute, so it isn't
  // just the bare link anymore.
  el.querySelectorAll(".copy-link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const r = results[Number(btn.dataset.idx)];
      if(!r || !r.ok) return;
      const text = `ជូនចំពោះ ${r.name}: ${r.url}`;
      navigator.clipboard.writeText(text).then(() => {
        const old = btn.textContent;
        btn.textContent = "បានចម្លង!";
        setTimeout(() => { btn.textContent = old; }, 1500);
      });
    });
  });

  const copyAllBtn = $("copyAllLinksBtn");
  if(copyAllBtn){
    copyAllBtn.addEventListener("click", () => {
      const text = results.filter(r => r.ok).map(r => `ជូនចំពោះ ${r.name}: ${r.url}`).join("\n");
      navigator.clipboard.writeText(text).then(() => {
        const old = copyAllBtn.textContent;
        copyAllBtn.textContent = "បានចម្លងទាំងអស់!";
        setTimeout(() => { copyAllBtn.textContent = old; }, 1500);
      });
    });
  }

  const csvBtn = $("downloadCsvBtn");
  if(csvBtn){
    csvBtn.addEventListener("click", () => {
      const csv = "ឈ្មោះ,Link\n" + results.filter(r => r.ok)
        .map(r => `"${String(r.name).replace(/"/g, '""')}","${r.url}"`).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "guest-links.csv";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });
  }
}

// After unlock (payment or code) and from the main button: publish the site once, then only make links.
function continueAfterUnlock_(){
  if(!state.publishedUrl) publishWebsite();
  else generateGuestLinks();
}
$("uploadFilesBtn").addEventListener("click", () => {
  if(isUnlocked()) continueAfterUnlock_();
  else openPaymentChoice_();
});

// ---------------------------------------------------------------------
// Bakong KHQR payment gate + Unlock Code + Export/Import
// ---------------------------------------------------------------------
const PAID_FLAG_PREFIX = "wib-paid-unlock:";
let payPollTimer = null;
let payCurrentMd5 = null;
let payIsChecking = false; // guards against overlapping poll requests (slow network)

// The payment is tied to THIS wedding (names + date) and lasts 30 days.
// Changing the names or the date requires a new payment (or the matching
// unlock code). Names are trimmed + lowercased before comparing so small
// typing differences (spacing, capitalization) don't cause a mismatch;
// the date is compared as-is.
function normName_(v){
  // NFC-normalize and strip zero-width characters first: some mobile Khmer
  // keyboards insert zero-width spaces between syllable clusters, and the
  // same visible text can be stored as different Unicode byte sequences
  // (NFC vs NFD). Without this, two logically-identical names could compare
  // as different and cause a false "fingerprint mismatch" at publish time.
  return String(v || "")
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}
function unlockKey(){
  return [normName_(state.groomName), normName_(state.brideName), normName_(state.groomNameEn), normName_(state.brideNameEn), (state.eventDate||"").trim()].join("|");
}
// The storage key itself is namespaced per-wedding (not just the stored value),
// so multiple couples/projects built in the same browser don't overwrite
// each other's paid status.
function paidFlagKey_(){ return PAID_FLAG_PREFIX + unlockKey(); }
function isUnlocked(){
  try{
    const d = JSON.parse(localStorage.getItem(paidFlagKey_()) || "null");
    return !!d && d.key === unlockKey() && (Date.now() - d.t) < 30*24*3600*1000;
  }catch(e){ return false; }
}
function setUnlocked(code){
  try{ localStorage.setItem(paidFlagKey_(), JSON.stringify({ key: unlockKey(), t: Date.now(), code: code || null })); }catch(e){}
}
function stopPaymentPolling(){
  if(payPollTimer){ clearInterval(payPollTimer); payPollTimer = null; }
  payIsChecking = false;
}
function closePaymentModal(){
  stopPaymentPolling();
  $("payOverlay").classList.remove("show");
  $("payChoice").style.display = "block";
  $("payQrSection").style.display = "none";
  $("codeEntry").classList.remove("show");
  $("codeSuccess").classList.remove("show");
  $("codeStatus").textContent = "";
  $("unlockCodeInput").value = "";
}

function weddingFingerprintParams_(){
  // Send the SAME normalized values used by unlockKey()/isUnlocked() (trimmed,
  // lowercased, extra spaces collapsed). Previously this sent the raw text,
  // so a trivial difference invisible to the eye — a trailing space, a
  // capital vs lowercase letter in an English name — made the client think
  // it was still "unlocked" while the server received different text and
  // rejected it as a mismatch. Keeping both sides normalized the same way
  // fixes that class of false mismatch.
  return new URLSearchParams({
    groomName: normName_(state.groomName), brideName: normName_(state.brideName),
    groomNameEn: normName_(state.groomNameEn), brideNameEn: normName_(state.brideNameEn),
    eventDate: (state.eventDate || "").trim()
  });
}

async function startPayment(){
  if(!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf("REPLACE_WITH") === 0){
    $("genFilesStatus").textContent = "កំហុសការកំណត់៖ សូមដាក់ APPS_SCRIPT_URL ក្នុងកូដសិន (មើលកំណត់ចំណាំក្នុងឯកសារ .gs)";
    return;
  }
  $("payOverlay").classList.add("show");
  $("payTitle").textContent = "ស្កេនដើម្បីទូទាត់ប្រាក់";
  $("payChoice").style.display = "none";
  $("payQrSection").style.display = "block";
  $("codeEntry").classList.remove("show");
  $("codeSuccess").classList.remove("show");
  $("haveCodeLink").style.display = "";
  $("payAmount").textContent = "កំពុងផ្ទុកតម្លៃ... / Loading price...";
  $("payRetryBtn").style.display = "none";
  $("payQrWrap").innerHTML = '<span class="pay-status"><span class="pay-spinner"></span>កំពុងបង្កើត QR...</span>';
  $("payStatus").textContent = "សូមរង់ចាំ...";

  try{
    const params = weddingFingerprintParams_();
    const resp = await fetch(`${APPS_SCRIPT_URL}?action=createPayment&${params.toString()}`);
    const data = await resp.json();
    if(!data.success){
      $("payQrWrap").innerHTML = '<span class="pay-status">មិនអាចបង្កើត QR បានទេ</span>';
      $("payStatus").textContent = data.reason || "សូមព្យាយាមម្តងទៀត";
      $("payRetryBtn").style.display = "block";
      return;
    }
    payCurrentMd5 = data.md5;
    $("payAmount").textContent = data.amount
      ? `${data.amount} ${data.currency || "USD"} / រយៈពេល ៣០ ថ្ងៃ`
      : "រយៈពេល ៣០ ថ្ងៃ / Period 30 days";
    const cleanImage = (data.image || "").replace(/[\r\n\s]/g, "");
    const imgSrc = cleanImage.indexOf("data:image") === 0
      ? cleanImage
      : `data:image/png;base64,${cleanImage}`;
    // Build the <img> via the DOM instead of innerHTML string interpolation,
    // so the src is assigned as data rather than parsed as markup.
    $("payQrWrap").innerHTML = "";
    const qrImg = document.createElement("img");
    qrImg.alt = "KHQR";
    qrImg.src = imgSrc;
    $("payQrWrap").appendChild(qrImg);
    $("payStatus").textContent = "សូមស្កេនដោយកម្មវិធីធនាគារ ឬ Bakong";
    startPaymentPolling();
  }catch(e){
    $("payQrWrap").innerHTML = '<span class="pay-status">មានបញ្ហាតភ្ជាប់</span>';
    $("payStatus").textContent = "សូមពិនិត្យអ៊ីនធឺណិត ហើយព្យាយាមម្តងទៀត";
    $("payRetryBtn").style.display = "block";
  }
}

function showCodeSuccess_(code, publishToken){
  stopPaymentPolling();
  setUnlocked(code);
  state.publishToken = publishToken || "";
  state.publishTokenKey = unlockKey();
  saveDraft();
  $("payQrSection").style.display = "none";
  $("codeEntry").classList.remove("show");
  $("codeSuccess").classList.add("show");
  $("codeText").textContent = code || "--------";
}

function startPaymentPolling(){
  stopPaymentPolling();
  payIsChecking = false;
  payPollTimer = setInterval(async () => {
    if(!payCurrentMd5) return;
    if(payIsChecking) return; // previous check still in flight (slow network) — skip this tick
    payIsChecking = true;
    try{
      const resp = await fetch(`${APPS_SCRIPT_URL}?action=checkStatus&md5=${encodeURIComponent(payCurrentMd5)}`);
      const data = await resp.json();
      if(data.success){
        showCodeSuccess_(data.code, data.publishToken);
      } else if(data.status === "expired"){
        stopPaymentPolling();
        $("payQrWrap").innerHTML = '<span class="pay-status">QR ផុតកំណត់ហើយ</span>';
        $("payStatus").textContent = "សូមបង្កើត QR ថ្មី";
        $("payRetryBtn").style.display = "block";
      } else if(data.status === "scanned"){
        $("payStatus").textContent = "បានស្កេនហើយ កំពុងរង់ចាំបញ្ជាក់ការទូទាត់...";
      }
    }catch(e){ /* transient network error — keep polling */ }
    finally{ payIsChecking = false; }
  }, 3000);
}

$("payCancelBtn").addEventListener("click", closePaymentModal);
$("payRetryBtn").addEventListener("click", startPayment);
$("choiceGenerateQrBtn").addEventListener("click", startPayment);
$("choiceHaveCodeBtn").addEventListener("click", () => openCodeEntry_());

$("codeContinueBtn").addEventListener("click", () => {
  closePaymentModal();
  continueAfterUnlock_();
});

// ---- "Already have a code?" — verify against server, works on any device ----
$("haveCodeLink").addEventListener("click", () => {
  const showing = $("codeEntry").classList.toggle("show");
  $("payQrSection").style.display = showing ? "none" : "block";
  $("codeSuccess").classList.remove("show");
  stopPaymentPolling();
});

$("codeSubmitBtn").addEventListener("click", async () => {
  const code = $("unlockCodeInput").value.trim().toUpperCase();
  if(!code){ $("codeStatus").textContent = "សូមវាយលេខកូដ"; return; }
  if(!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf("REPLACE_WITH") === 0){
    $("codeStatus").textContent = "កំហុសការកំណត់៖ សូមដាក់ APPS_SCRIPT_URL ក្នុងកូដសិន";
    return;
  }
  $("codeStatus").textContent = "កំពុងផ្ទៀងផ្ទាត់...";
  try{
    const params = weddingFingerprintParams_();
    params.set("code", code);
    const resp = await fetch(`${APPS_SCRIPT_URL}?action=verifyCode&${params.toString()}`);
    const data = await resp.json();
    if(data.success){
      $("codeStatus").textContent = "";
      setUnlocked(code);
      state.publishToken = data.publishToken || "";
      state.publishTokenKey = unlockKey();
      saveDraft();
      closePaymentModal();
      continueAfterUnlock_();
    } else {
      const knownReasons = {
        mismatch: "លេខកូដត្រឹមត្រូវ ប៉ុន្តែឈ្មោះ/ថ្ងៃមិនត្រូវគ្នា — សូមបំពេញឈ្មោះកូនកម្លោះ/ក្រមុំ និងថ្ងៃពិធីឲ្យដូចដើមឲ្យបានត្រឹមត្រូវ",
        expired: "លេខកូដនេះផុតសុពលភាពហើយ (លើសពី ៣០ ថ្ងៃ)",
        invalid: "លេខកូដមិនត្រឹមត្រូវ"
      };
      // Fall back to whatever the server actually said, instead of always
      // showing "invalid code" for errors we don't recognize (e.g. a
      // server-side problem unrelated to the code itself).
      $("codeStatus").textContent = knownReasons[data.reason] || data.reason || "លេខកូដមិនត្រឹមត្រូវ";
    }
  }catch(e){
    $("codeStatus").textContent = "មានបញ្ហាតភ្ជាប់ សូមព្យាយាមម្តងទៀត";
  }
});

$("codeCopyBtn").addEventListener("click", () => {
  const text = $("codeText").textContent;
  if(navigator.clipboard){ navigator.clipboard.writeText(text).catch(()=>{}); }
  $("codeCopyBtn").textContent = "✓";
  setTimeout(() => { $("codeCopyBtn").textContent = "⧉"; }, 1200);
});

function restoreGuestFilesUI(){
  $("guestNamesFile").value = state.guestNamesFileRaw || "";
  renderPublishedUrl();
  $("guestNamesFile").addEventListener("input", updateGuestCount);
  updateGuestCount();
}

function buildTemplateChips(){
  const specs = [
    { id:"tpl-eyebrow-km", items:TEMPLATES.eyebrow.km, target:"eyebrow", toggleLabel:"មើលគំរូ", hideLabel:"លាក់គំរូ" },
    { id:"tpl-eyebrow-en", items:TEMPLATES.eyebrow.en, target:"eyebrowEn", toggleLabel:"Show templates", hideLabel:"Hide templates" },
    { id:"tpl-welcome-km", items:TEMPLATES.welcomeText.km, target:"welcomeText", toggleLabel:"មើលគំរូ", hideLabel:"លាក់គំរូ" },
    { id:"tpl-welcome-en", items:TEMPLATES.welcomeText.en, target:"welcomeTextEn", toggleLabel:"Show templates", hideLabel:"Hide templates" }
  ];
  function truncate(text, max){
    return text.length > max ? text.slice(0, max).trim() + "…" : text;
  }
  specs.forEach(spec => {
    const row = $(spec.id);
    if(!row) return;
    row.className = "template-preview-wrap";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "tpl-toggle-btn";
    toggleBtn.textContent = spec.toggleLabel + " (" + spec.items.length + ")";

    const list = document.createElement("div");
    list.className = "template-preview-list";
    list.style.display = "none";
    list.innerHTML = spec.items.map((text,i) =>
      `<button type="button" class="template-chip-lg" data-i="${i}" title="${text.replace(/"/g,"&quot;")}">
         <span class="tpl-num">គំរូ ${i+1}</span>
         <span class="tpl-text">${truncate(text, 90).replace(/</g,"&lt;")}</span>
       </button>`
    ).join("");

    toggleBtn.addEventListener("click", () => {
      const expanded = list.style.display !== "none";
      list.style.display = expanded ? "none" : "flex";
      toggleBtn.textContent = (expanded ? spec.toggleLabel : spec.hideLabel) + " (" + spec.items.length + ")";
      toggleBtn.classList.toggle("expanded", !expanded);
    });

    row.innerHTML = "";
    row.appendChild(toggleBtn);
    row.appendChild(list);

    list.querySelectorAll(".template-chip-lg").forEach(chip => {
      chip.addEventListener("click", () => {
        const text = spec.items[+chip.dataset.i];
        state[spec.target] = text;
        const el = $(spec.target);
        if(el) el.value = text;
        list.querySelectorAll(".template-chip-lg").forEach(c => c.classList.remove("chosen"));
        chip.classList.add("chosen");
        list.style.display = "none";   // choice made: fold the list away again
        toggleBtn.textContent = spec.toggleLabel + " (" + spec.items.length + ")";
        toggleBtn.classList.remove("expanded");
        update();
      });
    });
  });
}

function buildTimelineTemplates(){
  const row = $("tpl-timeline");
  if(!row) return;
  row.className = "template-preview-wrap";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "tpl-toggle-btn";
  toggleBtn.textContent = "ជ្រើសរើសគំរូកម្មវិធីពិធី (" + TIMELINE_PRESETS.length + ")";

  const list = document.createElement("div");
  list.className = "template-preview-list";
  list.style.display = "none";
  list.innerHTML = TIMELINE_PRESETS.map((preset,i) => {
    const previewKm = preset.items.map(it => it.name).join(" → ");
    return `<button type="button" class="template-chip-lg" data-i="${i}" title="${previewKm.replace(/"/g,"&quot;")}">
       <span class="tpl-num">${(preset.label+" · "+preset.labelEn).replace(/</g,"&lt;")}</span>
       <span class="tpl-text">${previewKm.replace(/</g,"&lt;")} — (${preset.items.length} ចំណុច)</span>
     </button>`;
  }).join("");

  toggleBtn.addEventListener("click", () => {
    const expanded = list.style.display !== "none";
    list.style.display = expanded ? "none" : "flex";
    toggleBtn.textContent = (expanded ? "ជ្រើសរើសគំរូកម្មវិធីពិធី" : "លាក់គំរូកម្មវិធីពិធី") + " (" + TIMELINE_PRESETS.length + ")";
    toggleBtn.classList.toggle("expanded", !expanded);
  });

  row.innerHTML = "";
  row.appendChild(toggleBtn);
  row.appendChild(list);

  list.querySelectorAll(".template-chip-lg").forEach(chip => {
    chip.addEventListener("click", () => {
      const preset = TIMELINE_PRESETS[+chip.dataset.i];
      state.timeline = JSON.parse(JSON.stringify(preset.items));
      list.querySelectorAll(".template-chip-lg").forEach(c => c.classList.remove("chosen"));
      chip.classList.add("chosen");
      list.style.display = "none";   // choice made: fold the list away again
      toggleBtn.textContent = "ជ្រើសរើសគំរូកម្មវិធីពិធី (" + TIMELINE_PRESETS.length + ")";
      toggleBtn.classList.remove("expanded");
      buildTimeline();
      update();
    });
  });
}

function bindSimpleFields(){
  const map = {
    groomName:"groomName", brideName:"brideName", eyebrow:"eyebrow",
    groomNameEn:"groomNameEn", brideNameEn:"brideNameEn", eyebrowEn:"eyebrowEn",
    eventDate:"eventDate", startTime:"startTime",
    welcomeText:"welcomeText", host1:"host1", host2:"host2",
    welcomeTextEn:"welcomeTextEn", host1En:"host1En", host2En:"host2En",
    venueName:"venueName", venueAddr:"venueAddr",
    venueNameEn:"venueNameEn", venueAddrEn:"venueAddrEn",
    venueMapLink:"venueMapLink",
    venueCoords:"venueCoords",
    videoUrl:"videoUrl"
  };
  Object.entries(map).forEach(([id,key]) => {
    const el = $(id);
    el.value = state[key] || "";
    el.oninput = () => {
      state[key] = el.value;
      if(id === "eventDate") updateEventDateReadback_();
      scheduleUpdate();
    };
  });
  updateEventDateReadback_();
}
// Shows the date spelled out in Khmer (e.g. "ថ្ងៃអាទិត្យ ទី២២ ខែវិច្ឆិកា ឆ្នាំ2026") next to
// the date field, so staff/customers can confirm the day and month regardless of whether
// their browser's native date picker happens to display MM/DD/YYYY, DD/MM/YYYY, etc.
function updateEventDateReadback_(){
  const el = $("eventDateReadback");
  if(!el) return;
  el.textContent = state.eventDate ? kmDate(state.eventDate) : "";
}

function update(){
  saveDraft();
  $("frame").srcdoc = renderInvitation(Object.assign({}, state, { __preview:true }));
}

let updateTimer = null;
function scheduleUpdate(){
  saveDraft();
  if(updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    $("frame").srcdoc = renderInvitation(Object.assign({}, state, { __preview:true }));
  }, 450);
}

$("addTimeline").addEventListener("click", () => {
  state.timeline.push({time:"", name:"", timeEn:"", nameEn:""});
  buildTimeline();
  update();
});

$("addContact").addEventListener("click", () => {
  state.contacts.push({name:"", phone:"", nameEn:""});
  buildContacts();
  update();
});

// Mobile tabs
const tabEdit = $("tabEdit"), tabPreview = $("tabPreview"), panel = $("panel");
tabEdit.addEventListener("click", () => { panel.classList.remove("hide"); tabEdit.classList.add("active"); tabPreview.classList.remove("active"); });
tabPreview.addEventListener("click", () => { panel.classList.add("hide"); tabPreview.classList.add("active"); tabEdit.classList.remove("active"); });

// Resizable panel
const resizer = $("resizer"), appEl = document.querySelector(".app");
let resizing = false;
function setPanelWidth(px){
  const clamped = Math.max(280, Math.min(720, px));
  appEl.style.gridTemplateColumns = clamped + "px 6px 1fr";
  try{ localStorage.setItem("wib-panelw", clamped); }catch(e){}
}
try{
  const savedW = localStorage.getItem("wib-panelw");
  if(savedW) setPanelWidth(+savedW);
}catch(e){}
resizer.addEventListener("mousedown", () => {
  resizing = true;
  resizer.classList.add("active");
  document.body.style.userSelect = "none";
});
window.addEventListener("mousemove", e => {
  if(!resizing) return;
  setPanelWidth(e.clientX);
});
window.addEventListener("mouseup", () => {
  if(!resizing) return;
  resizing = false;
  resizer.classList.remove("active");
  document.body.style.userSelect = "";
});
resizer.addEventListener("touchstart", () => { resizing = true; }, {passive:true});
window.addEventListener("touchmove", e => {
  if(!resizing) return;
  setPanelWidth(e.touches[0].clientX);
}, {passive:true});
window.addEventListener("touchend", () => { resizing = false; });

buildThemeSelect();
buildFontSelects();
buildCoverStyleSelect();
buildGalleryStyleSelect();
buildGalleryArtSelect();
buildCoverArtSelect();
buildKbachFrameSelect();
buildTextAnimSelect();
buildTimeline();
buildTimelineTemplates();
buildContacts();
buildPhotos();
buildCoverPhoto();
buildTemplateChips();
bindSimpleFields();
restoreGuestFilesUI();
update();
refreshMusicUI();
// ---------------------------------------------------------------------
// Ready-made templates: apply a whole look in one click; only EMPTY text fields are filled with samples.
// Photos, cover photo, song, map/video links, guest names and publish info are never touched.
// ---------------------------------------------------------------------
function refreshAllBuildersFromState_(){
  buildThemeSelect(); buildFontSelects(); buildCoverStyleSelect(); buildGalleryStyleSelect(); buildGalleryArtSelect(); buildCoverArtSelect();
  buildKbachFrameSelect(); buildTextAnimSelect(); buildTimeline(); buildTimelineTemplates(); buildContacts();
  buildPhotos(); buildCoverPhoto(); buildTemplateChips(); bindSimpleFields(); update();
}
function buildPresetCards(){
  const box = $("presetList");
  if(!box) return;
  box.innerHTML = Object.keys(INVITATION_PRESETS).map(id => {
    const p = INVITATION_PRESETS[id];
    return `<button type="button" class="preset-card" data-id="${id}" title="${p.desc}"><span class="preset-swatch" style="background:${p.swatch}"></span><span class="preset-txt"><b>${p.label}</b><small>${p.desc}</small></span></button>`;
  }).join("");
  box.querySelectorAll(".preset-card").forEach(b => b.addEventListener("click", () => applyPreset(b.dataset.id)));
}
function applyPreset(id){
  const p = INVITATION_PRESETS[id];
  if(!p) return;
  Object.assign(state, p.design);
  const fill = (k, v) => { if(!String(state[k] || "").trim()) state[k] = v; };
  fill("groomName", SAMPLE_NAMES.km[0]); fill("brideName", SAMPLE_NAMES.km[1]);
  fill("groomNameEn", SAMPLE_NAMES.en[0]); fill("brideNameEn", SAMPLE_NAMES.en[1]);
  fill("eyebrow", TEMPLATES.eyebrow.km[p.tpl]); fill("eyebrowEn", TEMPLATES.eyebrow.en[p.tpl]);
  fill("welcomeText", TEMPLATES.welcomeText.km[p.tpl]); fill("welcomeTextEn", TEMPLATES.welcomeText.en[p.tpl]);
  fill("host1", "ឪពុកម្តាយកូនកម្លោះ"); fill("host2", "ឪពុកម្តាយកូនក្រមុំ");
  fill("host1En", "Parents of the Groom"); fill("host2En", "Parents of the Bride");
  fill("eventDate", "2026-12-12"); fill("startTime", p.startTime);
  fill("venueName", "សាលមង្គលការ (ឈ្មោះគំរូ)"); fill("venueNameEn", "Sample Wedding Hall");
  fill("venueAddr", "ភ្នំពេញ ព្រះរាជាណាចក្រកម្ពុជា"); fill("venueAddrEn", "Phnom Penh, Cambodia");
  if(state.timeline.every(r => !r.time && !r.name && !r.timeEn && !r.nameEn)){
    state.timeline = JSON.parse(JSON.stringify(TIMELINE_PRESETS[p.timeline].items));
  }
  if(state.contacts.every(c => !c.name && !c.phone && !c.nameEn)){
    state.contacts = [
      { name:"គ្រួសារកូនកម្លោះ", phone:"012 345 678", nameEn:"Groom's family" },
      { name:"គ្រួសារកូនក្រមុំ", phone:"098 765 432", nameEn:"Bride's family" }
    ];
  }
  state = migrateStyle_(state);
  saveDraft();
  refreshAllBuildersFromState_();
  const st = $("presetStatus");
  if(st) st.textContent = `✅ បានប្រើគំរូ «${p.label}» — ឥឡូវបញ្ចូលរូបភាព ចម្រៀង Link ផែនទី និង Link វិឌីអូ។ ត្រូវប្តូរឈ្មោះ ថ្ងៃ និងទីតាំងគំរូ មុនផ្ញើឲ្យភ្ញៀវ។`;
}
buildPresetCards();

// ---------------------------------------------------------------------
// Backup / restore the whole project as a .json file.
//  - The song (kept in IndexedDB) is included only if the customer agrees when exporting.
//  - publishToken (the secret that allows publishing) is NEVER written to the file, and never read from one.
//  - Everything read from a file goes through normalizeImported(): unknown fields are dropped, values are
//    checked, so a broken or hand-edited file cannot break the app or inject code into the guest pages.
// ---------------------------------------------------------------------
const BACKUP_APP_ID = "wedding-invitation-builder-profile";
const BK_IMG_RE = /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+$/;
const BK_AUDIO_RE = /^data:audio\/[a-z0-9.+-]+;base64,[A-Za-z0-9+\/=]+$/i;
function bkStr(v, max){ return (typeof v === "string") ? (max ? v.slice(0, max) : v) : ""; }
function bkImg(v){ return (typeof v === "string" && BK_IMG_RE.test(v)) ? v : null; }
function normalizeImported(raw){
  const s = JSON.parse(JSON.stringify(defaultState));
  const r = (raw && typeof raw === "object" && !Array.isArray(raw)) ? raw : {};
  legacyFill_(r);
  ["groomName","brideName","eyebrow","groomNameEn","brideNameEn","eyebrowEn","welcomeText","host1","host2",
   "welcomeTextEn","host1En","host2En","venueName","venueAddr","venueNameEn","venueAddrEn","coverPhotoName"
  ].forEach(k => { s[k] = bkStr(r[k], 20000); });
  s.venueMapLink = /^https?:\/\/\S+$/i.test(bkStr(r.venueMapLink, 2000).trim()) ? bkStr(r.venueMapLink, 2000).trim() : "";
  s.guestNamesFileRaw = bkStr(r.guestNamesFileRaw, 500000);
  s.theme = (typeof r.theme === "string" && hasOwn(THEMES, r.theme)) ? r.theme : defaultState.theme;
  ["kbachFrame","kbachBg","frameFit","frameOpacity","frameFx","bgFit","bgOpacity","fontKm","fontEn","galleryStyle","galleryArt","coverArt","textAnim","venueCoords","videoUrl","coverBlur","coverFocusX","coverFocusY","coverSharp","coverVeil"]
    .forEach(k => { if(r[k] !== undefined) s[k] = r[k]; });
  if(!hasOwn(GALLERY_ART, s.galleryArt)) s.galleryArt = "none";
  if(!hasOwn(COVER_ART, s.coverArt)) s.coverArt = "none";
  if(r.kbachFrame === undefined && typeof r.frameStyle === "string") s.kbachFrame = r.frameStyle;
  s.openStyle = r.openStyle === "envelope" ? "rings" : (r.openStyle === "book" ? "heart" : r.openStyle);
  s.coverAlways = !!r.coverAlways;
  s.eventDate = /^\d{4}-\d{2}-\d{2}$/.test(r.eventDate || "") ? r.eventDate : "";
  s.startTime = /^\d{2}:\d{2}$/.test(r.startTime || "") ? r.startTime : "";
  const list = (v, keys) => (Array.isArray(v) ? v : []).filter(x => x && typeof x === "object").slice(0, 200)
    .map(x => { const o = {}; keys.forEach(k => { o[k] = bkStr(x[k], 500); }); return o; });
  s.timeline = Array.isArray(r.timeline) ? list(r.timeline, ["time","name","timeEn","nameEn"]) : s.timeline;
  s.contacts = Array.isArray(r.contacts) ? list(r.contacts, ["name","phone","nameEn"]) : s.contacts;
  const names = Array.isArray(r.photoNames) ? r.photoNames : [];
  s.photos = []; s.photoNames = [];
  (Array.isArray(r.photos) ? r.photos : []).forEach((p, i) => {
    const ok = bkImg(p);
    if(ok && s.photos.length < MAX_PHOTOS){ s.photos.push(ok); s.photoNames.push(bkStr(names[i], 200) || ("រូបភាព " + s.photos.length)); }
  });
  s.coverPhoto = bkImg(r.coverPhoto);
  if(!s.coverPhoto) s.coverPhotoName = "";
  s.siteSlug = /^[A-Za-z0-9_-]{1,120}$/.test(r.siteSlug || "") ? r.siteSlug : "";
  s.publishedUrl = /^https:\/\/[^\s"'<>]+$/.test(r.publishedUrl || "") ? r.publishedUrl : "";
  s.publishToken = "";   // never taken from a file
  return migrateStyle_(s);
}
function exportProject(){
  const statusEl = $("backupStatus");
  const name = [state.groomNameEn || state.groomName, state.brideNameEn || state.brideName].filter(Boolean).join(" & ") || "invitation";
  let includeMusic = false;
  if(musicAsset && typeof musicAsset.dataUrl === "string"){
    includeMusic = window.confirm(`រួមបញ្ចូលចម្រៀង "${musicAsset.name}" ក្នុងឯកសារ .json ផងដែរឬទេ?\nOK = រួមបញ្ចូល (ឯកសារធំបន្ថែមប្រហែល ${fmtSize(musicAsset.dataUrl.length)})\nCancel = មិនរួមបញ្ចូល`);
  }
  const copy = JSON.parse(JSON.stringify(state));
  delete copy.publishToken;                       // secret: must not end up in a file that gets shared
  delete copy.publishTokenKey;
  const payload = { app: BACKUP_APP_ID, version: 1, name, exportedAt: Date.now(), state: copy };
  if(includeMusic) payload.music = JSON.parse(JSON.stringify(musicAsset));
  if(frameAsset && state.kbachFrame === "custom") payload.frame = JSON.parse(JSON.stringify(frameAsset));
  if(bgAsset && state.kbachBg === "custom") payload.bg = JSON.parse(JSON.stringify(bgAsset));
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = safeFileName(name) + "-profile.json";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  let note = "";
  if(musicAsset && !includeMusic) note = " (ចម្រៀងមិនរួមជាមួយឯកសារនេះទេ ត្រូវជ្រើសរើសម្តងទៀតលើ device ថ្មី)";
  else if(includeMusic) note = " (រួមទាំងចម្រៀង)";
  statusEl.textContent = `បាននាំចេញ "${name}" ជាឯកសារ .json — រក្សាទុកក្នុងទីកន្លែងសុវត្ថិភាព${note}`;
}
function importProject(file){
  const statusEl = $("backupStatus");
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try{
      const payload = JSON.parse(ev.target.result);
      if(!payload || payload.app !== BACKUP_APP_ID || !payload.state){
        statusEl.textContent = "ឯកសារនេះមិនត្រឹមត្រូវទេ (ត្រូវជាឯកសារ .json ដែលបាននាំចេញពីកម្មវិធីនេះ)";
        return;
      }
      if(!window.confirm("ការនាំចូលនឹងជំនួសព័ត៌មាន រូបភាព និងការកំណត់ទាំងអស់ដែលកំពុងកែក្នុង browser នេះ។\nបើចង់រក្សាកំណែបច្ចុប្បន្ន សូមចុច Cancel រួច Export ទុកសិន។\nបន្តនាំចូល?")) return;
      const next = normalizeImported(payload.state);
      // Same project as the one being edited: keep its publish permission so re-publishing still works.
      if(next.siteSlug && next.siteSlug === state.siteSlug && state.publishToken){ next.publishToken = state.publishToken; next.publishTokenKey = state.publishTokenKey; }
      try{ localStorage.setItem("wib-draft-v2", JSON.stringify(next)); }
      catch(e){ statusEl.textContent = "ទំហំ browser ពេញ — មិនអាចនាំចូលបានទេ (ឯកសារធំពេក)"; return; }
      let musicNote = " · ឯកសារនេះគ្មានចម្រៀងទេ (ចម្រៀងដែលមានស្រាប់ក្នុង browser នេះនៅដដែល)";
      const m = payload.music;
      if(m && typeof m === "object"){
        if(typeof m.dataUrl === "string" && BK_AUDIO_RE.test(m.dataUrl)){
          const num = v => (typeof v === "number" && isFinite(v) && v >= 0) ? v : null;
          const asset = { name: bkStr(m.name, 200) || "song", size: num(m.size) || 0, origSize: num(m.origSize) || 0, seconds: num(m.seconds), origSeconds: num(m.origSeconds), startSeconds: num(m.startSeconds) || 0, dataUrl: m.dataUrl };
          try{ await musicStoreOp("readwrite", st => st.put(asset, MUSIC_KEY)); musicNote = " · រួមទាំងចម្រៀង"; }
          catch(e){ musicNote = " · មិនអាចរក្សាទុកចម្រៀងក្នុង browser នេះបានទេ"; }
        }else{
          musicNote = " · ចម្រៀងក្នុងឯកសារមិនត្រឹមត្រូវ (មិនបាននាំចូល)";
        }
      }
      for(const [pk, dbKey, lbl] of [["frame", FRAME_KEY, "ស៊ុមរូបភាព"], ["bg", BG_KEY, "ផ្ទៃខាងក្រោយ"]]){
        const im = sanitizeFrameAsset_(payload[pk]);
        if(!im) continue;
        try{ await musicStoreOp("readwrite", st => st.put(im, dbKey)); musicNote += " · រួមទាំង" + lbl; }
        catch(e){ musicNote += " · មិនអាចរក្សាទុក" + lbl + "បានទេ"; }
      }
      state = next;                      // so nothing in memory can overwrite the imported draft
      statusEl.textContent = "បាននាំចូលជោគជ័យ" + musicNote + " — កំពុងផ្ទុកទំព័រឡើងវិញ...";
      setTimeout(() => location.reload(), 900);
    }catch(err){
      statusEl.textContent = "មិនអាចអានឯកសារនេះបានទេ";
    }
  };
  reader.readAsText(file);
}
$("backupExportBtn").addEventListener("click", exportProject);

// ---------------------------------------------------------------------
// After a successful Publish: remind the client to back up the project (.json).
// The backup keeps the Link គោល (siteSlug/publishedUrl) and every name/date exactly as paid for, so on a new
// device or browser they can Import it and re-enter the unlock code. Shown after every successful publish
// (the content may have changed); it disappears once they export or dismiss it.
// ---------------------------------------------------------------------
function hideExportReminder_(){
  const el = $("exportReminder");
  if(el) el.innerHTML = "";
}
function showExportReminder_(){
  const el = $("exportReminder");
  if(!el) return;
  el.innerHTML = `<div class="export-reminder" role="status">
    <div>💾 <b>កុំភ្លេច Export ទុក!</b> ឯកសារ .json រក្សា <b>Link គោល</b> ឈ្មោះ និងថ្ងៃពិធីដូចដែលបានទូទាត់។
    ពេលប្តូរ device ឬ browser គ្រាន់តែ Import ឯកសារនេះ រួចវាយលេខកូដ (Unlock code) ម្តងទៀត។ សូមរក្សាទុកក្នុងទីកន្លែងសុវត្ថិភាព ជាមួយលេខកូដ។</div>
    <div class="er-actions">
      <button type="button" class="er-btn" id="erExportBtn">⬇ Export (.json) ឥឡូវនេះ</button>
      <button type="button" class="er-dismiss" id="erDismissBtn">ទុកសិន</button>
    </div>
  </div>`;
  $("erExportBtn").addEventListener("click", () => { exportProject(); markExported_(); });
  $("erDismissBtn").addEventListener("click", hideExportReminder_);
}
function markExported_(){
  const el = $("exportReminder");
  if(!el || !el.firstElementChild) return;
  el.innerHTML = `<div class="export-reminder done" role="status">✅ បាន Export រួចហើយ — សូមរក្សាឯកសារ .json នោះទុកជាមួយលេខកូដ។</div>`;
  setTimeout(hideExportReminder_, 8000);
}
// exporting from the normal backup button also counts (only if the reminder is currently showing)
$("backupExportBtn").addEventListener("click", () => { if($("exportReminder") && $("exportReminder").querySelector(".er-btn")) markExported_(); });
$("backupImportBtn").addEventListener("click", () => $("backupImportFile").click());
$("backupImportFile").addEventListener("change", e => {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if(file) importProject(file);
});

loadMusicOnStartup();
loadFrameOnStartup();

// ===== Panel tabs (Style / Info / Features) =====
(function(){
  const panelEl = document.getElementById("panel");
  const headEl = document.getElementById("panelHead");
  const tabsEl = document.getElementById("panelTabs");
  if(!panelEl || !tabsEl) return;
  const btns = Array.from(tabsEl.querySelectorAll(".ptab"));
  const panes = Array.from(panelEl.querySelectorAll(".tab-pane"));
  function syncHeadH(){
    if(headEl) panelEl.style.setProperty("--head-h", headEl.offsetHeight + "px");
  }
  syncHeadH();
  window.addEventListener("resize", syncHeadH);
  if(typeof ResizeObserver !== "undefined" && headEl) new ResizeObserver(syncHeadH).observe(headEl);
  function openTab(name, keepScroll){
    btns.forEach(b => {
      const on = b.dataset.tab === name;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    panes.forEach(p => p.classList.toggle("active", p.dataset.pane === name));
    try{ localStorage.setItem("wib-tab", name); }catch(e){}
    if(!keepScroll){
      // if the user has scrolled past Backup/Templates, return to the top of the tab content
      const limit = tabsEl.offsetTop - (headEl ? headEl.offsetHeight : 0);
      if(panelEl.scrollTop > limit) panelEl.scrollTop = Math.max(0, limit);
    }
    window.dispatchEvent(new Event("resize")); // let pickers redraw after becoming visible
  }
  btns.forEach(b => b.addEventListener("click", () => openTab(b.dataset.tab)));
  let saved = "style";
  try{ saved = localStorage.getItem("wib-tab") || "style"; }catch(e){}
  if(!panes.some(p => p.dataset.pane === saved)) saved = "style";
  openTab(saved, true);
})();

// ===== PWA: register the service worker (only works on https:// or localhost) =====
if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){
  window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
}
