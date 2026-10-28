/* ==========================================================================
   wib-render.js — builds the invitation HTML/CSS (cover, sections, gallery, music, animations, calendar)
   Load order in index.html:  wib-data.js → wib-render.js → wib-pickers.js → wib-ui.js
   (they share one global scope, so keep this order)
   ========================================================================== */
// ---------- Seal button (ប៊ូតុងត្រា) for the 6 classic opening screens: the seal picture replaces the plain button ----------
const SEAL_BTN_CSS = `
.open-cover .oc-btn.oc-sealbtn{background:none !important;box-shadow:none !important;padding:0;border-radius:0;gap:8px;animation:none;color:var(--ink);}
.open-cover.oc-s-door .oc-sealbtn,.open-cover.oc-s-curtain .oc-sealbtn,.open-cover.oc-s-lock .oc-sealbtn{color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.6);}
.oc-sealwrap{position:relative;display:block;width:128px;height:128px;animation:oc-sealpop 3.2s ease-in-out infinite;filter:drop-shadow(0 5px 7px rgba(0,0,0,.38));transition:transform .55s ease,opacity .45s ease;}
.oc-sealwrap::before,.oc-sealwrap::after{content:"";position:absolute;inset:6%;border:2px solid color-mix(in srgb,var(--accent-2) 85%,transparent);border-radius:50%;pointer-events:none;opacity:0;animation:oc-sealring 4.2s ease-out infinite;}
.oc-sealwrap::after{animation-delay:2.1s;}
.oc-sealbtn-pic{display:block;width:100%;height:100%;object-fit:contain;}
.oc-sealwrap.ly-missing{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23C9A227'/%3E%3Cpath d='M40 30v40l32-20z' fill='%23fff'/%3E%3C/svg%3E") center/62% no-repeat;}
.oc-sealwrap.ly-missing .oc-sealbtn-pic{display:none;}
.oc-sealbtn .oc-km{font-size:15px;font-weight:600;line-height:1.6;}
.oc-sealbtn .oc-en{font-size:12.5px;opacity:.9;}
@keyframes oc-sealpop{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}
@keyframes oc-sealring{0%{transform:scale(.8);opacity:.9;}100%{transform:scale(1.7);opacity:0;}}
.open-cover.opening .oc-sealwrap{animation:none;transform:scale(1.4) rotate(14deg);opacity:0;}
.open-cover.opening .oc-sealwrap::before,.open-cover.opening .oc-sealwrap::after{animation:none;opacity:0;}
@media(prefers-reduced-motion:reduce){.oc-sealwrap,.oc-sealwrap::before,.oc-sealwrap::after{animation:none !important;}}`;

// ---------- Build the cover-opening + background-music markup for one rendered invitation ----------
function buildMusicParts(s){
  const music = (musicAsset && musicAsset.dataUrl) ? musicAsset : null;
  if(!music && !s.coverAlways) return { css:"", html:"", js:"" };

  const key = hasOwn(COVER_STYLES, s.openStyle) ? s.openStyle : "door";
  const cfg = COVER_STYLES[key];
  const names = [s.groomName || s.groomNameEn, s.brideName || s.brideNameEn].filter(Boolean).map(escapeHtml).join(" & ");
  const g = s.__guestName ? escapeHtml(s.__guestName) : "";
  const previewAttr = s.__preview ? ' data-preview="1"' : "";
  const p = cfg.parts({ names, s });
  // seal button: only for the 6 classic screens, and never when a layout is on (a layout brings its own seal)
  const sealKey = (!layoutOf_(s) && SEAL_BTN_STYLES.indexOf(key) >= 0 && hasOwn(SEAL_BUTTONS, s.sealBtn) && s.sealBtn !== "none") ? s.sealBtn : "";

  const namesHtml = (names && p.names !== false) ? `<p class="oc-names display oc-fade">${names}</p>` : "";
  const capHtml = (g && !p.genericBtn)
    ? `<span class="oc-km">ជូនចំពោះ ${g}</span><span class="oc-en">Dear ${g}</span>`
    : `<span class="oc-km">ចុចដើម្បីបើកធៀបអញ្ជើញ</span><span class="oc-en">Tap to open your invitation</span>`;
  const btnHtml = sealKey
    ? `<button class="oc-btn oc-sealbtn oc-fade" id="openBtn" type="button"><span class="oc-sealwrap">${lySealImg_({ file: SEAL_BUTTONS[sealKey].file }, "oc-sealbtn-pic")}</span>${capHtml}</button>`
    : `<button class="oc-btn oc-fade" id="openBtn" type="button">${capHtml}</button>`;
  const hintHtml = ((g && !p.genericBtn) ? `<p class="oc-hint oc-fade">ចុចដើម្បីបើកធៀបអញ្ជើញ<span>Tap to open your invitation</span></p>` : "")
    + (music ? `<p class="oc-hint oc-fade">សូមបើកសំឡេងដើម្បីស្តាប់ចម្រៀង<span>Turn your sound on for the music</span></p>` : "");

  const css = (music ? MUSIC_BTN_CSS : "") + OC_BASE_CSS + cfg.css + (sealKey ? SEAL_BTN_CSS : "");

  const musicHtml = music ? `
<audio id="bgm" src="${music.dataUrl}" loop preload="metadata"></audio>
<button class="music-btn" id="musicBtn" type="button" aria-pressed="false" aria-label="Music" title="ចម្រៀង / Music">
  <svg class="ico-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
  <svg class="ico-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
</button>` : "";
  const html = musicHtml + `
<div class="open-cover oc-s-${key}" id="openCover" role="dialog" aria-modal="true" aria-label="Open invitation"${previewAttr}>${p.behind || ""}<div class="oc-inner">${p.top || ""}${namesHtml}${p.mid || ""}${btnHtml}${p.after || ""}${hintHtml}</div></div>`;

  const js = `
var ocEl=document.getElementById('openCover');
var bgm=document.getElementById('bgm');
var playMusic=function(){};
if(bgm){
  var mBtn=document.getElementById('musicBtn');
  var baseVol=0.7;
  var fadeVol=function(){
    var d=bgm.duration, ct=bgm.currentTime, v=baseVol;
    if(d && isFinite(d) && d>8){
      var tail=d-ct;
      if(tail>=0 && tail<3){ v=baseVol*(tail/3); }
      else if(ct<2){ v=baseVol*Math.min(1,0.15+0.85*ct/2); }
    }
    try{ bgm.volume=Math.max(0,Math.min(1,v)); }catch(e){}
  };
  fadeVol();
  bgm.addEventListener('timeupdate',fadeVol);
  var wasPlaying=false;
  var syncMusic=function(){
    if(!mBtn) return;
    var on=!bgm.paused;
    mBtn.classList.toggle('on',on);
    mBtn.setAttribute('aria-pressed',on?'true':'false');
  };
  playMusic=function(){
    try{ var pr=bgm.play(); if(pr&&pr.catch){ pr.catch(function(){ syncMusic(); }); } }catch(e){}
  };
  bgm.addEventListener('play',syncMusic);
  bgm.addEventListener('pause',syncMusic);
  syncMusic();
  if(mBtn){ mBtn.addEventListener('click',function(){ if(bgm.paused){ playMusic(); } else { bgm.pause(); } }); }
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){ wasPlaying=!bgm.paused; bgm.pause(); }
    else if(wasPlaying){ wasPlaying=false; playMusic(); }
  });
}
if(ocEl){
  var seenKey='wib-cover-seen';
  var isPreview=ocEl.getAttribute('data-preview')==='1';
  var alreadySeen=false;
  if(isPreview){ try{ alreadySeen=sessionStorage.getItem(seenKey)==='1'; }catch(e){} }
  if(alreadySeen){
    ocEl.parentNode.removeChild(ocEl);
  }else{
    document.body.classList.add('oc-noscroll');
    var opened=false, reduce=false;
    try{ reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}
    ocEl.addEventListener('click',function(){
      if(opened) return;
      opened=true;
      playMusic();
      if(isPreview){ try{ sessionStorage.setItem(seenKey,'1'); }catch(e){} }
      ocEl.classList.add('opening');
      setTimeout(function(){
        ocEl.classList.add('finish');
        document.body.classList.remove('oc-noscroll');
        if(typeof waStart==='function'){ try{ waStart(true); }catch(e){} }
        setTimeout(function(){ if(ocEl.parentNode){ ocEl.parentNode.removeChild(ocEl); } },650);
      },reduce?0:${cfg.finishMs});
    });
  }
}
`;
  return { css, html, js };
}

function buildGalleryHtml(s, theme){
  const placeholderIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3" y="5" width="18" height="14" rx="1.5"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5.5-5-4 4-2-2L3 18"/></svg>`;
  const photosForGallery = s.photos.filter(Boolean).length ? s.photos.filter(Boolean) : [null,null,null,null];
  return photosForGallery.map((photo,i) => {
    let extraClass = "";
    if(s.galleryStyle==="grid") extraClass = (i%4===0 || i%4===3) ? " wide" : "";
    if(s.galleryStyle==="polaroid") extraClass = " rot-"+(i%3);
    const inner = photo
      ? `<img src="${photo}" alt="photo ${i+1}">`
      : `${placeholderIcon}<span>រូបភាព ${i+1}</span>`;
    return `<div class="gallery-item${extraClass}"><div class="frame${photo?" photo":""}">${inner}</div></div>`;
  }).join("");
}

// ---------- Video (link embed) ----------
// Turns a pasted link into a safe embed. Only http(s) links are accepted. YouTube / Facebook / TikTok / Vimeo become
// players; a direct .mp4/.webm/.mov file becomes a <video>; any other https link becomes a "watch" button.
function parseVideo(raw){
  const u0 = (raw || "").trim();
  if(!/^https?:\/\//i.test(u0)) return null;
  let u; try{ u = new URL(u0); }catch(e){ return null; }
  const host = u.hostname.replace(/^(www|m|web|mobile)\./, "").toLowerCase();
  const path = u.pathname;
  const okId = x => /^[\w-]{5,30}$/.test(x || "");
  if(host === "youtube.com" || host === "youtube-nocookie.com" || host === "youtu.be"){
    let id = "", vertical = false, m;
    if(host === "youtu.be") id = path.split("/")[1];
    else if((m = path.match(/^\/(shorts|embed|live|v)\/([\w-]+)/))){ id = m[2]; vertical = m[1] === "shorts"; }
    else id = u.searchParams.get("v");
    if(okId(id)) return { kind:"iframe", provider:"youtube", src:"https://www.youtube-nocookie.com/embed/" + id + "?rel=0&playsinline=1", ratio: vertical ? "9/16" : "16/9", vertical, url:u0 };
  }
  if(host === "vimeo.com" || host === "player.vimeo.com"){
    const m = path.match(/(\d{6,12})/);
    if(m){
      // unlisted / private Vimeo videos need their hash (vimeo.com/ID/HASH or ?h=HASH), otherwise the player stays black
      const hm = path.match(/\/\d{6,12}\/([0-9a-f]{8,16})/i);
      const h = u.searchParams.get("h") || (hm ? hm[1] : "");
      return { kind:"iframe", provider:"vimeo", src:"https://player.vimeo.com/video/" + m[1] + (/^[\w]{6,20}$/.test(h) ? "?h=" + h : ""), ratio:"16/9", vertical:false, url:u0 };
    }
  }
  if(host === "tiktok.com"){
    const m = path.match(/\/video\/(\d{8,25})/);
    if(m) return { kind:"iframe", provider:"tiktok", src:"https://www.tiktok.com/embed/v2/" + m[1], ratio:"9/16", vertical:true, url:u0 };
    // short links (vm.tiktok.com, tiktok.com/t/…) hide the video id and cannot be resolved in the browser -> button to open it
  }
  if(host === "facebook.com" || host === "fb.com"){
    // Facebook's video player only embeds PUBLIC videos given by their full address; "share" links redirect and show a black box
    if(!/^\/share\//.test(path) && /\/(videos?|watch|reel|reels)\b|[?&]v=/.test(path + u.search)){
      const vertical = /\/reels?\//.test(path);
      return { kind:"iframe", provider:"facebook", src:"https://www.facebook.com/plugins/video.php?href=" + encodeURIComponent(u0) + "&show_text=false&width=" + (vertical ? 340 : 560), ratio: vertical ? "9/16" : "16/9", vertical, url:u0 };
    }
  }
  if(/\.(mp4|webm|mov|m4v)$/i.test(path)) return { kind:"video", provider:"file", src:u0, ratio:"16/9", vertical:false, url:u0 };
  return { kind:"link", provider:"link", src:u0, url:u0 };
}
// A small map preview for the venue card. Uses the coordinates inside the pasted Google Maps link when there are any,
// otherwise searches by venue name + address. No API key needed. The embed itself is not touchable (so it never
// traps page scrolling on a phone); tapping it opens the full map in a new tab.
function buildMapPreview(s, lang, mapsUrl, venueName, venueAddr){
  let q = "", pin = false;
  const cm = (s.venueCoords || "").trim().match(/^(-?\d{1,3}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  const m = (cm && Math.abs(+cm[1]) <= 90 && Math.abs(+cm[2]) <= 180) ? cm : mapsUrl && (mapsUrl.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/) || mapsUrl.match(/!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/) || mapsUrl.match(/[?&](?:q|ll|query)=(-?\d{1,3}\.\d+)(?:,|%2C)(-?\d{1,3}\.\d+)/i));
  if(m){ q = m[1] + "," + m[2]; pin = true; }
  else q = [venueName, venueAddr].map(x => (x || "").trim()).filter(Boolean).join(" ").slice(0, 200);
  if(!q) return { html:"", openUrl:mapsUrl || "" };
  const openUrl = mapsUrl || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q));
  // With coordinates: plain map centred on the spot (no Google marker) + our own pin in the theme colour.
  // Without them: Google's search embed (it draws its own red marker).
  const src = "https://www.google.com/maps?" + (pin ? "ll=" : "q=") + encodeURIComponent(q) + "&z=16&output=embed&hl=" + (lang === "km" ? "km" : "en");
  const pinHtml = pin ? `<span class="map-pin-ring"></span><svg class="map-pin" viewBox="0 0 40 52" aria-hidden="true"><path d="M20 1.5C9.4 1.5 1.5 9.6 1.5 19.5 1.5 32.6 20 50.5 20 50.5S38.5 32.6 38.5 19.5C38.5 9.6 30.6 1.5 20 1.5z" fill="var(--accent-1)" stroke="#fff" stroke-width="2.5"/><circle cx="20" cy="19.5" r="7.5" fill="#fff"/><circle cx="20" cy="19.5" r="3.4" fill="var(--accent-2)"/></svg>` : "";
  const label = lang === "km" ? "បើកផែនទី" : "Open map";
  const html = `<div class="map-embed"><iframe src="${escapeHtml(src)}" loading="lazy" tabindex="-1" aria-hidden="true" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe>${pinHtml}<a class="map-embed-hit" href="${escapeHtml(openUrl)}" target="_blank" rel="noopener" aria-label="${label}"></a><span class="map-embed-tag">&#128205; ${label}</span></div>`;
  return { html, openUrl };
}

function buildVideoHtml(v, lang){
  if(!v) return "";
  if(v.kind === "link"){
    const t = lang === "km" ? "មើលវិឌីអូ" : "Watch video";
    let host = ""; try{ host = new URL(v.src).hostname.replace(/^www\./, ""); }catch(e){}
    return `<a class="video-card" href="${escapeHtml(v.src)}" target="_blank" rel="noopener"><span class="vc-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></span><span class="vc-host">${escapeHtml(host)}</span><span class="vc-cta">${t}</span></a>`;
  }
  const style = `--vr:${v.ratio};${v.vertical ? "max-width:340px;" : ""}`;
  if(v.kind === "video"){
    // If the file cannot be played (blocked, wrong format, not a direct link) swap the black box for a "watch video" button.
    const card = buildVideoHtml({ kind:"link", src:v.url, url:v.url }, lang).replace('class="video-card"', 'class="video-card vid-hide"');
    const src = escapeHtml(v.src) + (v.src.indexOf("#") < 0 ? "#t=0.1" : "");   // #t=0.1 makes iOS show the first frame instead of black
    return `<div class="video-wrap" style="${style}"><video src="${src}" controls playsinline preload="metadata" onerror="var w=this.parentNode;w.classList.add('vid-hide');var c=w.nextElementSibling;if(c)c.classList.remove('vid-hide');"></video></div>${card}`;
  }
  const iframe = `<div class="video-wrap" style="${style}"><iframe src="${escapeHtml(v.src)}" loading="lazy" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" title="Video"></iframe></div>`;
  if(v.provider === "youtube") return iframe;
  // Facebook / TikTok / Vimeo only play if the video is public and embedding is allowed (and not in every in-app browser).
  // The page cannot detect a failed embed, so always offer a plain link underneath.
  const cap = lang === "km" ? "បើមិនឃើញវិឌីអូ សូមចុចទីនេះដើម្បីមើល" : "Video not showing? Tap here to watch";
  return iframe + `<a class="video-open" href="${escapeHtml(v.url)}" target="_blank" rel="noopener">▶ ${cap}</a>`;
}

function buildSection(s, t, lang){
  const L = LABELS[lang];
  const isKm = lang === "km";
  const groom = isKm ? s.groomName : (s.groomNameEn || s.groomName);
  const bride = isKm ? s.brideName : (s.brideNameEn || s.brideName);
  const eyebrow = isKm ? s.eyebrow : (s.eyebrowEn || s.eyebrow);
  const welcome = isKm ? s.welcomeText : (s.welcomeTextEn || s.welcomeText);
  const thanksNote = isKm ? s.thanksText : (s.thanksTextEn || s.thanksText);
  const host1 = isKm ? s.host1 : (s.host1En || s.host1);
  const host2 = isKm ? s.host2 : (s.host2En || s.host2);
  const venueName = isKm ? s.venueName : (s.venueNameEn || s.venueName);
  const venueAddr = isKm ? s.venueAddr : (s.venueAddrEn || s.venueAddr);
  const displayDate = isKm ? kmDate(s.eventDate) : enDate(s.eventDate);

  const ornamentSvg = t.ornate
    ? `<svg width="18" height="18" viewBox="0 0 20 20"><path d="M10 2 C10 8 4 8 4 12 C4 16 10 16 10 18 C10 16 16 16 16 12 C16 8 10 8 10 2 Z" fill="none" stroke="var(--accent-2)" stroke-width="1.2"/></svg>`
    : ``;
  const divider = `<div class="divider"><span class="rule"></span>${ornamentSvg}<span class="rule"></span></div>`;

  const timelineRows = s.timeline.map(item => ({
    time: isKm ? item.time : (item.timeEn || item.time),
    name: isKm ? item.name : (item.nameEn || item.name)
  })).filter(r => (r.time || "").trim() || (r.name || "").trim());          // rows left blank are skipped
  const timelineHtml = timelineRows.map(r =>
    `<div class="tl-item"><div class="tl-time">${escapeHtml(r.time)}</div><p class="tl-name">${escapeHtml(r.name)}</p></div>`
  ).join("");

  const galleryHtml = buildGalleryHtml(s, t);
  const galleryClass = "gallery gallery-style-" + (hasOwn(GALLERY_STYLES, s.galleryStyle) ? s.galleryStyle : "grid");

  const mapsUrl = (s.venueMapLink && /^https?:\/\//i.test(s.venueMapLink.trim())) ? s.venueMapLink.trim() : "";   // http(s) only (blocks javascript: links)

  const contactsHtml = (s.contacts||[]).filter(c => c.name || c.phone).map(c => {
    const cname = isKm ? c.name : (c.nameEn || c.name);
    return `<div class="contact-card"><p class="contact-name">${escapeHtml(cname)}</p>${c.phone ? `<a class="contact-phone" href="tel:${escapeHtml(c.phone.replace(/\s+/g,""))}">${escapeHtml(c.phone)}</a>` : ""}</div>`;
  }).join("");

  // Cover photo: sharp in the middle, softly blurred toward the edges and tinted with the theme colour, so the
  // couple stands out. The photo is passed once as a CSS variable and painted by three stacked layers.
  const cnum = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
  const cBlur = cnum(s.coverBlur, 0, 40, 22), cFx = cnum(s.coverFocusX, 0, 100, 50), cFy = cnum(s.coverFocusY, 0, 100, 35), cSharp = cnum(s.coverSharp, 30, 95, 60), cVeil = cnum(s.coverVeil, 0, 100, 35);
  const lyOn = layoutOf_(s);   // ready-made layout (wib-layouts.js) or null
  const rawCover = s.coverPhoto || coverArtUrl(s);
  const coverSrc = (lyOn && lyOn.kind !== "behind") ? "" : rawCover;   // uploaded cover photo, otherwise the chosen stand-in picture from GitHub
  const heroStyle = coverSrc ? ` style="--cover:url('${coverSrc}');--fx:${cFx}%;--fy:${cFy}%;--blur:${cBlur}px;--rx:${cSharp}%;--ry:${Math.round(cSharp * 0.93)}%;--veil:${(cVeil / 100).toFixed(2)};"` : "";
  const heroLayers = coverSrc ? `<span class="hb hb-blur"></span><span class="hb hb-sharp"></span><span class="hb hb-tint"></span>` : "";
  // stand-in picture (from GitHub) = shown clean: no blur, no colour veil. Uploaded photo: blur 0 = no blur at all.
  const heroClass = coverSrc ? ("hero has-cover" + (!s.coverPhoto ? " cover-art" : "") + (cBlur === 0 ? " no-blur" : "")) : "hero";
  const suf = "-" + lang;

  const guestLineText = s.__guestName ? (isKm ? `ជូនចំពោះ ${s.__guestName}` : `Dear ${s.__guestName},`) : "";
  const guestLineAttrs = guestLineText ? "" : ` style="display:none"`;


  // Which sections have something to show? (In the live preview every section stays visible.)
  const isPrev = !!s.__preview;
  const hasWelcome = !!((welcome || "").trim() || (host1 || "").trim() || (host2 || "").trim());
  const hasCountdown = !!(s.eventDate && s.startTime) && !isNaN(Date.parse(`${s.eventDate}T${s.startTime}:00+07:00`));
  const hasProgram = timelineRows.length > 0;
  const hasRealPhotos = s.photos.filter(Boolean).length > 0;
  const artUrls = hasRealPhotos ? [] : galleryArtUrls(s);   // stand-in pictures (from GitHub), only when there are no real photos
  const hasArt = artUrls.length > 0;
  const hasGallery = hasRealPhotos || hasArt;
  const galleryOut = hasArt ? buildGalleryHtml(Object.assign({}, s, { photos: artUrls }), t) : galleryHtml;
  const galleryCls = (hasArt && artUrls.length === 1) ? "gallery gallery-style-single" : galleryClass;
  const videoInfo = parseVideo(s.videoUrl);
  const mapPrev = buildMapPreview(s, lang, mapsUrl, venueName, venueAddr);
  const hasVenue = !!((venueName || "").trim() || (venueAddr || "").trim() || mapsUrl);
  const secWelcome   = (isPrev || hasWelcome)   ? `<section><div class="wrap"><div class="welcome">
<p>${escapeHtml(welcome)}</p>
<div class="hosts">${escapeHtml(host1)}<br>${escapeHtml(host2)}</div>
</div></div></section>` : "";
  const secCountdown = (isPrev || hasCountdown) ? `<section><div class="wrap">
<h2 class="section-title display">${L.countdownTitle}</h2>
<p class="section-sub">${L.countdownSub}</p>
<div class="countdown" id="countdown${suf}">
<div class="cd-unit"><div class="cd-num" id="cd-d${suf}">00</div><div class="cd-label">${L.days}</div></div>
<div class="cd-unit"><div class="cd-num" id="cd-h${suf}">00</div><div class="cd-label">${L.hours}</div></div>
<div class="cd-unit"><div class="cd-num" id="cd-m${suf}">00</div><div class="cd-label">${L.minutes}</div></div>
<div class="cd-unit"><div class="cd-num" id="cd-s${suf}">00</div><div class="cd-label">${L.seconds}</div></div>
</div>${hasCountdown ? `<div class="cal-wrap"><button class="cal-btn" type="button" data-lang="${lang}">${L.calBtn}</button></div>` : ""}</div></section>` : "";
  const secProgram   = (isPrev || hasProgram)   ? `<section><div class="wrap">
<h2 class="section-title display">${L.programTitle}</h2>
<p class="section-sub">${displayDate}</p>
<div class="timeline">${timelineHtml}</div>
</div></section>` : "";
  const secGallery   = (isPrev || hasGallery)   ? `<section><div class="wrap">
<h2 class="section-title display">${L.galleryTitle}</h2>
<p class="section-sub">${L.gallerySub}</p>
<div class="${galleryCls}">${galleryOut}</div>
</div></section>` : "";
  const secVideo     = videoInfo ? `<section><div class="wrap">
<h2 class="section-title display">${L.videoTitle}</h2>
<p class="section-sub">${L.videoSub}</p>
${buildVideoHtml(videoInfo, lang)}
</div></section>` : "";
  const secVenue     = (isPrev || hasVenue)     ? `<section><div class="wrap">
<h2 class="section-title display">${L.venueTitle}</h2>
<div class="venue-card">
<p class="venue-name display">${escapeHtml(venueName)}</p>
<p class="venue-addr">${escapeHtml(venueAddr)}</p>
${mapPrev.html}
${mapPrev.openUrl ? `<a class="map-btn" href="${escapeHtml(mapPrev.openUrl)}" target="_blank" rel="noopener">${L.mapBtn}</a>` : ""}
</div>
</div></section>` : "";
  const secContacts  = contactsHtml ? `<section><div class="wrap">
<h2 class="section-title display">${L.contactsTitle}</h2>
<p class="section-sub">${L.contactsSub}</p>
<div class="contact-grid">${contactsHtml}</div>
</div></section>` : "";
  // Owner's KHQR (wedding gift): groom's side / bride's side, each shown only when an image was uploaded
  const imgOk = v => typeof v === "string" && /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(v);
  const gifts = [["khqrGroom", L.giftGroom, "groom"], ["khqrBride", L.giftBride, "bride"]].filter(g => imgOk(s[g[0]]));
  const secGift      = gifts.length ? `<section><div class="wrap">
<h2 class="section-title display">${L.giftTitle}</h2>
<p class="section-sub">${L.giftSub}</p>
<div class="gift-grid">${gifts.map(g => `<div class="gift-card"><p class="gift-who">${g[1]}</p><img class="gift-qr" src="${s[g[0]]}" alt="KHQR">
<a class="gift-save" href="${s[g[0]]}" download="KHQR-${g[2]}.${/^data:image\/png/.test(s[g[0]]) ? "png" : "jpg"}">${L.giftSave}</a></div>`).join("")}</div>
<p class="gift-hint">${L.giftHint}</p>
</div></section>` : "";
  // Colour guide for guests: each part (procession / evening / tent) lists its own colours; empty parts are skipped
  const dressRows = DRESS_CATS.map(cat => {
    const cols = ((s.dressColors && Array.isArray(s.dressColors[cat.key])) ? s.dressColors[cat.key] : []).filter(x => /^#[0-9a-fA-F]{6}$/.test(x)).slice(0, DRESS_MAX);
    if(!cols.length) return "";
    return `<div class="dress-row"><p class="dress-label">${escapeHtml(cat[lang])}</p><div class="dress-dots">${cols.map(x => `<div class="dress-dot"><span style="background:${x}"></span><small>${escapeHtml(dressColorName(x, lang))}</small></div>`).join("")}</div></div>`;
  }).join("");
  const secDress     = dressRows ? `<section><div class="wrap">
<h2 class="section-title display">${L.dressTitle}</h2>
<p class="section-sub">${L.dressSub}</p>
<div class="dress-card">${dressRows}</div>
</div></section>` : "";
  // Gratitude & humble apology: optional, shown only when the owner wrote something (last block before the footer)
  const secThanks    = (thanksNote || "").trim() ? `<section><div class="wrap">
<h2 class="section-title display">${L.thanksTitle}</h2>
<div class="welcome thanks-note"><p>${escapeHtml(thanksNote)}</p></div>
</div></section>` : "";
  const bodySections = [secWelcome, secCountdown, secProgram, secDress, secGallery, secVideo, secVenue, secContacts, secGift, secThanks].filter(Boolean).join(divider);

  const lyp = lyHeroParts_(s, lang, { rawCover, artUrls: galleryArtUrls(s) });
  return `<section id="section${suf}" class="lang-section lang-${lang}" style="display:${isKm ? "block" : "none"}">
<p class="guest-line" id="guestLine${suf}"${guestLineAttrs}>${escapeHtml(guestLineText)}</p>
<section class="${heroClass}${lyOn ? " ly-hero ly-" + lyOn.id : ""}"${heroStyle}>${heroLayers}${lyp.pre}
<p class="eyebrow">${escapeHtml(eyebrow)}</p>${lyp.mid}
<h1 class="names display">${escapeHtml(groom)}<span class="amp">${escapeHtml(L.and)}</span>${escapeHtml(bride)}</h1>
<p class="hero-date">${displayDate}</p>${lyp.post}
</section>
${bodySections}
<footer><div class="thanks display">${L.thanks}</div><div>${escapeHtml(groom)} ${L.and} ${escapeHtml(bride)}</div></footer>
</section>`;
}

// Transition of the full-screen overlay frames while scrolling down: progress p (0 at the top -> 1 after ~60% of a screen) drives the effect,
// so the frame disappears little by little and comes back when you scroll up. Effects: fade / slide / zoom / blur / drift.
// Auto-snap (frameSnap): find how much empty space the uploaded frame picture has on its left/right sides (transparent columns) and push the
// picture outward by exactly that much, so the outermost pillar/border touches the screen edge from the very first view. Only for "stretch" fit.
function buildFrameSnapJs(s){
  const isFull = s && (s.kbachFrame === "custom" || (hasOwn(KBACH_FRAME_STYLES, s.kbachFrame) && KBACH_FRAME_STYLES[s.kbachFrame].full));
  if(!s || !isFull || s.frameSnap === false || s.frameFit === "cover") return "";
  return `
(function(){
  var el=document.querySelector('.kbach-custom-frame'); if(!el||el.getAttribute('data-snap')!=='1') return;
  var m=/url\\(["']?([^"')]+)["']?\\)/.exec(el.style.backgroundImage||''); if(!m) return;
  var im=new Image();
  im.onload=function(){ try{
    var w=Math.min(240,im.naturalWidth), h=Math.max(1,Math.round(im.naturalHeight*w/im.naturalWidth));
    var c=document.createElement('canvas'); c.width=w; c.height=h;
    var x=c.getContext('2d'); x.drawImage(im,0,0,w,h);
    var d=x.getImageData(0,0,w,h).data, need=Math.max(2,Math.round(h*0.03)), first=-1, last=-1;
    for(var i=0;i<w;i++){ var n=0; for(var j=0;j<h;j++){ if(d[(j*w+i)*4+3]>60) n++; } if(n>=need){ if(first<0) first=i; last=i; } }
    if(first<0) return;
    var a=Math.min(first/w,0.3), b=Math.min((w-1-last)/w,0.3);
    if(a+b>=0.6||(a<0.004&&b<0.004)) return;
    var T=100/(1-a-b), bl=a*T, br=b*T, sp=+el.getAttribute('data-sp0')||0;
    el.setAttribute('data-bl',bl); el.setAttribute('data-br',br);
    el.style.left='-'+(bl+sp)+'%'; el.style.right='-'+(br+sp)+'%';
    if(window.__kbFrameApply) window.__kbFrameApply();
  }catch(e){} };
  if(!/^data:/.test(m[1])) im.crossOrigin='anonymous';
  im.src=m[1];
})();`;
}
function buildFrameFxJs(s){
  const id = s && s.kbachFrame;
  if(!id || id === "none" || !hasOwn(KBACH_FRAME_STYLES, id) || (id !== "custom" && KBACH_FRAME_STYLES[id].mode === "slice")) return "";
  const fx = hasOwn(FRAME_FX, s.frameFx) ? s.frameFx : "fade";
  if(fx === "none") return "";
  return `
(function(){
  var els=[].slice.call(document.querySelectorAll('.kb-ov, .kbach-custom-frame'));
  if(!els.length) return;
  var fx=${JSON.stringify(fx)}, ticking=false;
  try{ if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) fx='fade'; }catch(e){}
  els.forEach(function(el){ var b=parseFloat(el.style.opacity); el._b=isNaN(b)?1:b; el.style.transformOrigin=el.classList.contains('kbach-custom-frame')?'50% 50%':(el.classList.contains('kb-ov-top')?'50% 0':'50% 100%'); });
  function ease(p){ return p*p*(3-2*p); }
  function apply(){
    ticking=false;
    var y=window.pageYOffset||document.documentElement.scrollTop||0;
    var p=ease(Math.min(1,Math.max(0,y/Math.max(180,window.innerHeight*0.6))));
    els.forEach(function(el){
      var cu=el.classList.contains('kbach-custom-frame'), d=(cu||el.classList.contains('kb-ov-top'))?-1:1, tr=cu?'':'translateX(-50%)', fl='';
      var keep=(cu&&fx!=='open'), q=keep?p*0.4:p, op=1-q;   /* full-screen frame: every effect is only partial and the outer sides always stay visible */
      if(fx==='open'){ if(cu){ var s0=+el.getAttribute('data-sp0')||0, s1=+el.getAttribute('data-sp1')||0, bb=s0+(Math.max(s1,s0)-s0)*p, bl=+el.getAttribute('data-bl')||0, br=+el.getAttribute('data-br')||0; el.style.left='-'+(bl+bb)+'%'; el.style.right='-'+(br+bb)+'%'; op=1; } else { tr+=' scale('+(1+p*0.45)+')'; } }
      else if(fx==='slide'){ if(keep){ op=1-q; } else { tr+=' translateY('+(d*q*105)+'%)'; op=1-q*q; } }   /* full frame: no vertical move, so nothing slides over the content */
      else if(fx==='zoom'){ tr+=' scale('+(1+q*0.45)+')'; }
      else if(fx==='blur'){ fl='blur('+(q*14)+'px)'; }
      else if(fx==='drift'){ if(keep){ tr+=' scale('+(1+q*0.12)+')'; } else { tr+=' translate('+(d*q*16)+'%,'+(d*q*45)+'%) rotate('+(d*q*7)+'deg)'; } }   /* full frame: only a gentle outward drift (no up/sideways-inward move) */
      if(keep){ var k0=+el.getAttribute('data-sp0')||0, k1=+el.getAttribute('data-sp1')||0, kb=k0+(Math.max(k1,k0)-k0)*p, kl=+el.getAttribute('data-bl')||0, kr=+el.getAttribute('data-br')||0; el.style.left='-'+(kl+kb)+'%'; el.style.right='-'+(kr+kb)+'%'; }   /* push the pillars toward the screen edges: only the outer sides stay */
      el.style.transform=tr; el.style.filter=fl; el.style.opacity=op*el._b;
      el.style.visibility=(p>=0.999&&!cu)?'hidden':'visible';
    });
  }
  window.addEventListener('scroll',function(){ if(!ticking){ ticking=true; (window.requestAnimationFrame||setTimeout)(apply); } },{passive:true});
  window.addEventListener('resize',apply);
  window.__kbFrameApply=apply;
  apply();
})();`;
}
// Does this frame leave only a border free (9-slice / uploaded), so the background must be inset? Full-screen overlay frames: no.
function kbachFrameNeedsInset(id){
  if(!id || id === "none") return false;
  if(id === "custom" || !hasOwn(KBACH_FRAME_STYLES, id)) return true;
  return KBACH_FRAME_STYLES[id].mode === "slice";
}
// Frame (on top) / background (behind) overlay. Preset styles are PNG files from GitHub (see KBACH_FRAME_STYLES / KBACH_BG_STYLES);
// "custom" is an image uploaded by staff, embedded in the invitation.
function buildKbachFrameOverlay(styleId, t, s, layer){
  layer = (layer === "bg") ? "bg" : "frame";
  if(!styleId || styleId === "none") return "";
  if(!hasOwn(layer === "bg" ? KBACH_BG_STYLES : KBACH_FRAME_STYLES, styleId)) return "";
  const cl = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };
  if(styleId === "custom"){
    // Staff-uploaded image (JPG / PNG / GIF). FRAME = on top (PNG/GIF with a transparent centre works best);
    // BACKGROUND = behind the content.
    const asset = (layer === "bg") ? bgAsset : frameAsset;
    if(!asset || typeof asset.dataUrl !== "string" || !BK_IMG_RE.test(asset.dataUrl)) return "";
    if(layer === "bg"){
      const fitB = (s && s.bgFit === "stretch") ? "100% 100%" : "cover";
      const opB = cl(s && s.bgOpacity, 10, 100, 100) / 100;
      const blB = Math.round(cl(s && s.bgBlur, 0, 40, 0));   // blur in px; the layer grows past the screen so blurred edges never show
      const blCss = blB > 0 ? `filter:blur(${blB}px);inset:${-blB * 2}px;` : "";
      // The hero block paints its own solid colour; keep its soft glow but let the background image show through.
      return `<style>.hero{background:radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent-1) 12%, transparent) 0%, transparent 60%) !important;}</style><div class="kbach-custom-bg" style="background-image:url('${asset.dataUrl}');background-size:${fitB};opacity:${opB};${blCss}" aria-hidden="true"></div>`;
    }
    const fit = (s && s.frameFit === "cover") ? "cover" : "100% 100%";
    const op = cl(s && s.frameOpacity, 10, 100, 100) / 100;
    // frameSpread (% of screen width): the picture is made wider than the screen on BOTH sides, so pillars/borders that sit inside the
    // picture slide outward and are only half visible at the edge of the screen (0 = exactly the screen, as before)
    const spr = Math.round(cl(s && s.frameSpread, 0, 40, 0));
    const spr1 = spr + Math.round(cl(s && s.frameSpreadMore, 0, 30, 6));   // spread reached after scrolling (frameFx "open") = start + a small extra, so part of the pillar always stays visible
    const sprCss = spr > 0 ? `left:-${spr}%;right:-${spr}%;` : "";
    return `<div class="kbach-custom-frame" data-snap="${(s && s.frameSnap === false) ? 0 : 1}" data-sp0="${spr}" data-sp1="${spr1}" style="background-image:url('${asset.dataUrl}');background-size:${fit};opacity:${op};${sprCss}" aria-hidden="true"></div>`;
  }
  // រូបភាពរៀបចំស្រាប់ពី GitHub (assets/frames/… និង assets/backgrounds/…)
  const pu = kbachPresetUrl(layer, styleId);
  if(!pu) return "";
  if(layer === "bg"){
    const blP = Math.round(cl(s && s.bgBlur, 0, 40, 0));   // same blur slider as the uploaded background
    const blPCss = blP > 0 ? `filter:blur(${blP}px);inset:${-blP * 2}px;` : "";
    return `<style>.hero{background:radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent-1) 12%, transparent) 0%, transparent 60%) !important;}</style><div class="kbach-custom-bg kb-bg-anim${kbachFrameNeedsInset(s && s.kbachFrame) ? " kb-bg-framed" : ""}" style="background-image:url('${pu}');background-size:cover;background-position:center;${blPCss}" aria-hidden="true"></div>`;
  }
  if(KBACH_FRAME_STYLES[styleId].full){
    // Preset picture that is ONE full-screen overlay (e.g. two pillars, portrait 1080x1920): same rendering as the uploaded frame
    const fitF = (s && s.frameFit === "cover") ? "cover" : "100% 100%";
    const opF = cl(s && s.frameOpacity, 10, 100, 100) / 100;
    const sprF = Math.round(cl(s && s.frameSpread, 0, 40, 0));
    const sprF1 = sprF + Math.round(cl(s && s.frameSpreadMore, 0, 30, 6));
    const sprFCss = sprF > 0 ? `left:-${sprF}%;right:-${sprF}%;` : "";
    return `<div class="kbach-custom-frame" data-snap="${(s && s.frameSnap === false) ? 0 : 1}" data-sp0="${sprF}" data-sp1="${sprF1}" style="background-image:url('${pu}');background-size:${fitF};opacity:${opF};${sprFCss}" aria-hidden="true"></div>`;
  }
  // "slice" = old 9-slice border frame (square picture, corners 3/8). Default = full-screen overlay picture (portrait 1024x1280):
  // the top half sticks to the top edge of the screen and the bottom half to the bottom edge (see buildFrameFxJs: they fade away as you scroll),
  // the middle stays transparent, so the flowers keep
  // their real proportions on any phone and are never stretched or cut in the corners.
  if(KBACH_FRAME_STYLES[styleId].mode === "slice"){
    return `<div class="kb-frame" style="--kb-img:url('${pu}');" aria-hidden="true"><div class="kb-shine"></div></div>`;
  }
  return `<div class="kb-ov kb-ov-top" style="--kb-img:url('${pu}');" aria-hidden="true"></div><div class="kb-ov kb-ov-bot" style="--kb-img:url('${pu}');" aria-hidden="true"></div>`;
}
// ---------- Text animation on scroll (guest invitation) ----------
// Text/blocks start hidden and reveal once when they scroll into view. Everything is added by script and scoped
// under body.wa-on, so if anything fails the invitation simply shows normally. Skipped for reduced-motion users.
function buildTextAnimCss(mode){
  if(mode === "none") return "";
  return `body.wa-on .wa{opacity:0;transition:opacity .9s ease var(--wd,0ms),transform .9s cubic-bezier(.22,1,.36,1) var(--wd,0ms),filter .9s ease var(--wd,0ms);}
body.wa-fadeup .wa{transform:translateY(28px);}
body.wa-words .wa{transform:translateY(20px);}
body.wa-blur .wa{filter:blur(12px);transform:scale(.96);}
body.wa-on .wa.wa-in{opacity:1;transform:none;filter:none;}
body.wa-on .wa-sp .wa-w{opacity:0;transform:translateY(.7em);transition:opacity .7s ease calc(var(--wd,0ms) + var(--wi,0ms)),transform .8s cubic-bezier(.22,1,.36,1) calc(var(--wd,0ms) + var(--wi,0ms));}
body.wa-on .wa-sp .wa-w:not(.wa-e){display:inline-block;}
body.wa-on .wa-sp.wa-in .wa-w{opacity:1;transform:none;}
body.wa-on .wa.wa-now,body.wa-on .wa-sp.wa-now .wa-w{transition:none !important;}
body.wa-on .hero .wa{transition:opacity 1.2s ease var(--wd,0ms),transform 1.3s cubic-bezier(.22,1,.36,1) var(--wd,0ms),filter 1.2s ease var(--wd,0ms);}
body.wa-on.wa-fadeup .hero .wa:not(.wa-in){transform:translateY(46px);}
body.wa-on.wa-blur .hero .wa:not(.wa-in){filter:blur(18px);transform:scale(.9);}
`;
}
// ---------- Text effect (ឥទ្ធិពលអក្សរ): gradient / bevel / glow / shadow + reflection on section titles and the groom-bride names ----------
// Colours come from the theme (--accent-1 / --accent-2), so it matches every theme and layout. Drop-shadow filters are skipped
// while the "blur" scroll animation is on (that animation also uses `filter`).
function buildTextFxCss(fx, ta){
  if(!fx || fx === "none") return "";
  const TS = ".section-title,.hero:not(.has-cover) .names";                // titles + names without a photo
  const TC = ".hero.has-cover .names";                                     // names over a photo
  const WS = ".section-title .wa-w,.hero:not(.has-cover) .names .wa-w";    // words created by the scroll animation
  const WC = ".hero.has-cover .names .wa-w";
  const A = ".hero .names .amp,.hero.has-cover .names .amp";
  const filt = v => (ta === "blur" ? "" : "filter:" + v + " !important;");
  const CLIP = "-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;text-shadow:none;";
  const GRAD  = "background:linear-gradient(180deg,color-mix(in srgb,var(--accent-2) 62%,#fff) 0%,var(--accent-2) 36%,var(--accent-1) 74%,color-mix(in srgb,var(--accent-1) 72%,#000) 100%);" + CLIP;
  const GRADC = "background:linear-gradient(180deg,#fffbe8 0%,color-mix(in srgb,var(--accent-2) 50%,#fff) 42%,color-mix(in srgb,var(--accent-2) 88%,#fff) 100%);" + CLIP;   // lighter, for names over a photo
  const RIM = "-webkit-text-stroke:.5px color-mix(in srgb,var(--accent-2) 50%,#000);paint-order:stroke fill;";
  const DOME  = "background:linear-gradient(180deg,color-mix(in srgb,var(--accent-2) 42%,#fff) 0%,var(--accent-2) 46%,color-mix(in srgb,var(--accent-2) 70%,#000) 100%);" + CLIP + RIM;
  const DOMEC = "background:linear-gradient(180deg,#fffbe8 0%,color-mix(in srgb,var(--accent-2) 48%,#fff) 46%,color-mix(in srgb,var(--accent-2) 82%,#fff) 100%);" + CLIP + "-webkit-text-stroke:.4px color-mix(in srgb,var(--accent-2) 60%,#000);";   // lighter, for names over a photo
  const REFLECT = "-webkit-box-reflect:below -.05em linear-gradient(transparent 78%,rgba(255,255,255,.4));margin-bottom:.2em;";
  const REFLECT_N = "-webkit-box-reflect:below -.05em linear-gradient(transparent 86%,rgba(255,255,255,.4));margin-bottom:.35em;";   // names are taller, so more room below
  const grad = (fS, fC, rf, G = GRAD, GC = GRADC) => `${TS}{${G}${fS}${rf ? REFLECT : ""}}${rf ? ".hero:not(.has-cover) .names{margin-bottom:.35em;}" : ""}${TC}{${GC}${fC}${rf ? REFLECT_N : ""}}.hero.has-cover .names::before{display:none;}${WS}{${G}}${WC}{${GC}}${A}{color:transparent;-webkit-text-fill-color:transparent;text-shadow:none;}`;   // the dark blob behind photo names would paint OVER the gradient (filter makes a stacking context), so it is hidden and a stronger shadow is used instead
  // ---- 5 looks, ALL built on the same "3-D gold" base (metal gradient + thickness + bevel edge) so they match each other;
  //      each one then pushes ONE ingredient to the front: gradient = metal shine · bevel = thickness · glow = light · shadow = long shadow · luxury = everything + Khmer pattern
  const M = (c, p, w) => `color-mix(in srgb,${c} ${p}%,${w})`;
  const A1 = "var(--accent-1)", A2 = "var(--accent-2)";
  const DK = M(A2, 45, "#000"), DK2 = M(A2, 28, "#000");
  // o: hl = top edge highlight · depth = thickness layers · dx,dy = direction of the thickness · glow = [r1,c1,r2,c2] · sb,sa = soft shadow blur/alpha
  const STACK = o => `drop-shadow(-.5px -.5px 0 rgba(255,255,255,${o.hl})) ` + Array(o.depth).fill(`drop-shadow(${o.dx || 0}px ${o.dy || 1}px 0 ${o.dk || DK})`).join(" ")
    + (o.glow ? ` drop-shadow(0 0 ${o.glow[0]}px ${o.glow[1]}) drop-shadow(0 0 ${o.glow[2]}px ${o.glow[3]})` : "")
    + ` drop-shadow(0 ${o.sb}px ${o.sb}px rgba(0,0,0,${o.sa}))`;
  const FX = (o, oc) => [filt(STACK(o)), filt(STACK(Object.assign({}, o, oc || {}, { sa:.6, sb:(o.sb || 4) + 5 })))];   // [titles / names on plain page, names over a photo (stronger shadow)]
  // fills
  const FOIL  = `background:linear-gradient(180deg,${M(A1,42,"#fff")} 0%,${A1} 30%,${A2} 49%,${M(A2,58,"#000")} 52%,${M(A2,88,"#000")} 70%,${A1} 100%);` + CLIP;   // sharp "horizon" = reflection in polished metal
  const FOILC = `background:linear-gradient(180deg,#fffbe8 0%,${M(A1,62,"#fff")} 38%,${A1} 52%,${M(A2,80,"#fff")} 100%);` + CLIP;
  const SATIN  = `background:linear-gradient(100deg,${M(A1,45,"#fff")} 0%,${A1} 24%,${A2} 46%,${M(A2,66,"#000")} 60%,${A2} 76%,${M(A1,50,"#fff")} 100%);` + CLIP;
  const SATINC = `background:linear-gradient(100deg,#fffbe8 0%,${M(A1,70,"#fff")} 32%,${A1} 58%,${M(A2,72,"#fff")} 100%);` + CLIP;
  const PALE  = `background:linear-gradient(180deg,#fffef4 0%,${M(A1,35,"#fff")} 45%,${A1} 100%);` + CLIP;     // light fill so the halo shows
  const SOLID = `background:linear-gradient(180deg,${M(A1,70,"#fff")} 0%,${A1} 55%,${A2} 100%);` + CLIP;       // calm fill so the thickness shows
  // ---- 5 extra looks from the reference table (fixed colours on purpose, they do NOT follow the theme). Keys: gold3d · neon · glass · popart · chrome ----
  if(fx === "gold3d") fx = "gradient";   // 1 modern shiny gold = the gradient look above
  const HALOS = (c1, c2) => `0 0 3px #fff,0 0 8px ${c1},0 0 18px ${c1},0 0 34px ${c2},0 0 58px ${c2}`;
  if(fx === "neon"){   // 2 neon glow: white-hot core, pink halo, cyan outer glow
    const N = x => `color:#fff !important;-webkit-text-fill-color:#fff !important;text-shadow:${HALOS("#ff2bd6", "#22e6ff")}${x};`;
    return `${TS}{${N("")}}${TC}{${N(",0 2px 8px rgba(0,0,0,.55)")}}`;
  }
  if(fx === "glass"){  // 3 glass: see-through letters, thin white edge, soft light from the top
    const GL = `background:linear-gradient(180deg,rgba(255,255,255,.7) 0%,rgba(255,255,255,.22) 55%,rgba(255,255,255,.08) 100%);` + CLIP + `-webkit-text-stroke:1px rgba(255,255,255,.85);`;
    return grad(filt("drop-shadow(0 2px 6px rgba(0,0,0,.28))"), filt("drop-shadow(0 2px 8px rgba(0,0,0,.6))"), false, GL, GL);
  }
  if(fx === "popart"){ // 4 pop art: bright fill, thick black outline, hard long red shadow
    const LS = (c, n) => Array.from({ length:n }, (_, i) => `${i + 1}px ${i + 1}px 0 ${c}`).join(",");
    const PA = `color:#ffd400 !important;-webkit-text-fill-color:#ffd400 !important;-webkit-text-stroke:2px #111;paint-order:stroke fill;text-shadow:${LS("#ff3d5a", 8)};`;
    return `${TS}{${PA}}${TC}{${PA}}`;
  }
  if(fx === "chrome"){ // 5 chrome / liquid silver: sharp reflection bands, cool tones, hard bevel
    const CH = `background:linear-gradient(180deg,#ffffff 0%,#d5dde8 26%,#6f7f95 47%,#f2f7ff 50%,#a5b6cc 66%,#3b4759 100%);` + CLIP;
    const CHF = filt("drop-shadow(0 -.5px 0 rgba(255,255,255,.9)) drop-shadow(0 1px 0 #2c3646) drop-shadow(0 2px 0 #2c3646) drop-shadow(0 3px 0 #1d2531) drop-shadow(0 5px 5px rgba(0,0,0,.4))");
    return grad(CHF, CHF, false, CH, CH);
  }
  // 1 gradient — polished 3-D gold (metal shine is the star; thin thickness + a hint of glow)
  if(fx === "gradient"){ const f = FX({ hl:.7, depth:3, dy:1, glow:[3, M(A1,55,"transparent"), 9, M(A1,30,"transparent")], sb:4, sa:.3 }); return grad(f[0], f[1], false, FOIL, FOILC); }
  // 2 bevel — chunky 3-D block (thickness is the star; calm gold fill + strong top edge)
  if(fx === "bevel"){ const f = FX({ hl:.9, depth:6, dy:1, dx:.6, dk:DK, sb:5, sa:.38 }); return grad(f[0], f[1], false, SOLID, FOILC); }
  // 3 glow — golden light (halo is the star; pale fill, a little thickness)
  if(fx === "glow"){ const f = FX({ hl:.5, depth:1, dy:1, dk:DK2, glow:[5, A1, 16, M(A2,80,"transparent")], sb:2, sa:.12 }, { glow:[4, A1, 12, M(A2,80,"transparent")] }); return grad(f[0], f[1], false, PALE, PALE); }
  // 4 shadow — long diagonal shadow (shadow is the star; satin gold fill)
  if(fx === "shadow"){ const f = FX({ hl:.6, depth:9, dx:1, dy:1, dk:M(A2,50,"#000"), sb:5, sa:.28 }, { dk:"rgba(0,0,0,.8)" }); return grad(f[0], f[1], true, SATIN, SATINC); }
  // 5 luxury — everything together: polished gold + Khmer lattice pattern inside the letters + thickness + glow + mirror reflection
  if(fx !== "luxury") return "";
  const TILE = "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2728%27 height=%2728%27 viewBox=%270 0 28 28%27%3E%3Cg fill=%27none%27 stroke=%27%235E3E08%27 stroke-opacity=%27.5%27 stroke-width=%27.9%27%3E%3Cpath d=%27M0 14L14 0L28 14L14 28Z%27/%3E%3Cpath d=%27M14 5C17 8 17 11 14 14C11 11 11 8 14 5Z%27/%3E%3Cpath d=%27M14 14C18 13 21 11 21 7M14 14C10 13 7 11 7 7%27 /%3E%3Cpath d=%27M14 14C18 15 21 17 21 21M14 14C10 15 7 17 7 21%27/%3E%3C/g%3E%3Cg fill=%27%235E3E08%27 fill-opacity=%27.45%27%3E%3Ccircle cx=%2714%27 cy=%2714%27 r=%271.6%27/%3E%3Ccircle cx=%270%27 cy=%270%27 r=%271.4%27/%3E%3Ccircle cx=%2728%27 cy=%270%27 r=%271.4%27/%3E%3Ccircle cx=%270%27 cy=%2728%27 r=%271.4%27/%3E%3Ccircle cx=%2728%27 cy=%2728%27 r=%271.4%27/%3E%3C/g%3E%3Cg fill=%27none%27 stroke=%27%23FFF3C2%27 stroke-opacity=%27.45%27 stroke-width=%27.6%27%3E%3Cpath d=%27M14.6 5.6C17.4 8.4 17.4 11 14.8 13.4%27/%3E%3Cpath d=%27M1 14.6L14.6 1%27/%3E%3C/g%3E%3C/svg%3E')";
  const LUX  = `background:${TILE} 0 0/18px 18px,linear-gradient(180deg,${M(A1,42,"#fff")} 0%,${A1} 30%,${A2} 49%,${M(A2,58,"#000")} 52%,${M(A2,88,"#000")} 70%,${A1} 100%);` + CLIP;
  const LUXC = `background:${TILE} 0 0/18px 18px,linear-gradient(180deg,#fffbe8 0%,${M(A1,65,"#fff")} 45%,${A1} 100%);` + CLIP;
  const f = FX({ hl:.7, depth:3, dy:1, glow:[4, M(A1,50,"transparent"), 12, M(A1,28,"transparent")], sb:4, sa:.35 });
  return grad(f[0], f[1], true, LUX, LUXC);
}
function buildTextAnimJs(mode, isPreview){
  if(mode === "none") return { defs:"", init:"" };
  const defs = `
var waMode=${JSON.stringify(mode)};
var waPrev=${isPreview ? "true" : "false"};
var waEls=[], waStarted=false;
var WA_TEXT='.eyebrow,.names,.hero-date,.section-title,.section-sub,.welcome p,.hosts,.tl-time,.tl-name,.venue-name,.venue-addr,.contact-name,.gift-hint,.thanks,footer > div:last-child';
var WA_BLOCK='.countdown,.map-btn,.contact-phone,.map-embed,.video-card,.gift-card,.dress-row';
function waReduced(){ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function waSplit(el){
  var lang=el.closest('.lang-en')?'en':'km', seg=null;
  try{ if(window.Intl&&Intl.Segmenter){ seg=new Intl.Segmenter(lang,{granularity:'word'}); } }catch(e){}
  var plan=[], words=0;
  Array.prototype.slice.call(el.childNodes).forEach(function(n){
    if(n.nodeType===3){
      var txt=n.nodeValue, pieces=[];
      if(!txt.trim()){ return; }
      if(seg){ Array.from(seg.segment(txt)).forEach(function(x){ pieces.push(x.segment); }); }
      else{ var ps=txt.split(' '); ps.forEach(function(p,j){ pieces.push(p); if(j<ps.length-1){ pieces.push(' '); } }); }
      if(!pieces.length){ pieces=[txt]; }
      words+=pieces.filter(function(p){ return p.trim()!==''; }).length;
      plan.push({n:n,pieces:pieces});
    }else if(n.nodeType===1&&n.tagName!=='BR'){ words++; plan.push({n:n,isEl:true}); }
  });
  if(!words||words>80){ return false; }
  var idx=0, step=Math.min(60,1500/words);
  plan.forEach(function(p){
    if(p.isEl){ p.n.classList.add('wa-w','wa-e'); p.n.style.setProperty('--wi',(idx++*step)+'ms'); return; }
    var frag=document.createDocumentFragment();
    p.pieces.forEach(function(pc){
      if(pc.trim()===''){ frag.appendChild(document.createTextNode(pc)); return; }
      var sp=document.createElement('span'); sp.className='wa-w'; sp.textContent=pc;
      sp.style.setProperty('--wi',(idx++*step)+'ms'); frag.appendChild(sp);
    });
    p.n.parentNode.replaceChild(frag,p.n);
  });
  return true;
}
function waPrepare(){
  if(waReduced()||!('IntersectionObserver' in window)){ return; }
  document.body.classList.add('wa-on','wa-'+waMode);
  Array.prototype.forEach.call(document.querySelectorAll(WA_TEXT),function(el){
    if(waMode==='words'&&waSplit(el)){ el.classList.add('wa-sp'); }else{ el.classList.add('wa'); }
    waEls.push(el);
  });
  Array.prototype.forEach.call(document.querySelectorAll(WA_BLOCK),function(el){ el.classList.add('wa'); waEls.push(el); });
}
function waStart(fromOpen){
  if(waStarted||!waEls.length){ return; }
  waStarted=true;
  var first=true, instant=false;
  if(waPrev){ try{ instant=sessionStorage.getItem('wib-anim-seen')==='1'; sessionStorage.setItem('wib-anim-seen','1'); }catch(e){} }
  // Cover (hero) text always animates when a guest opens the invitation; in the builder preview it replays only when the cover is opened (not on every edit).
  var heroLive=(fromOpen===true)||!waPrev;
  var io=new IntersectionObserver(function(entries){
    var vis=entries.filter(function(e){ return e.isIntersecting; }).sort(function(a,b){ return a.boundingClientRect.top-b.boundingClientRect.top; });
    vis.forEach(function(e,i){
      var el=e.target;
      if(heroLive&&el.closest&&el.closest('.hero')){
        el.style.setProperty('--wd',(el.classList.contains('names')?600:(el.classList.contains('hero-date')?1100:250))+'ms');
        el.classList.add('wa-in'); io.unobserve(el); return;
      }
      if(instant&&first){ el.classList.add('wa-now'); }
      el.style.setProperty('--wd',(Math.min(i,6)*110)+'ms');
      el.classList.add('wa-in');
      io.unobserve(el);
    });
    first=false;
  },{threshold:0.12,rootMargin:'0px 0px -6% 0px'});
  waEls.forEach(function(el){ io.observe(el); });
}
`;
  const init = `try{ waPrepare(); if(!document.querySelector('.open-cover')){ waStart(); } }catch(e){ document.body.classList.remove('wa-on'); }`;
  return { defs, init };
}

// ---------- Fullscreen photo viewer (tap a gallery photo to enlarge) ----------
function buildLightbox(){
  const css = `.frame.photo{cursor:zoom-in;-webkit-tap-highlight-color:transparent;}
.lb{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;background:rgba(10,8,6,.94);opacity:0;transition:opacity .25s ease;touch-action:pan-y pinch-zoom;font-style:normal;}
.lb.open{display:flex;}
.lb.show{opacity:1;}
body.lb-lock{overflow:hidden;}
.lb-stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:max(56px,env(safe-area-inset-top,0px)) 12px max(48px,env(safe-area-inset-bottom,0px));}
.lb-img{max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 10px 50px rgba(0,0,0,.6);transform:scale(.96);opacity:0;transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .25s ease;user-select:none;-webkit-user-drag:none;}
.lb.show .lb-img{transform:none;opacity:1;}
.lb-btn{position:absolute;z-index:2;border:none;cursor:pointer;color:#fff;background:rgba(255,255,255,.14);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);width:44px;height:44px;border-radius:50%;font-size:22px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .2s;font-family:sans-serif;}
.lb-btn:hover{background:rgba(255,255,255,.28);}
.lb-close{top:max(14px,env(safe-area-inset-top,0px));right:14px;}
.lb-prev{left:12px;top:50%;margin-top:-22px;}
.lb-next{right:12px;top:50%;margin-top:-22px;}
.lb-count{position:absolute;left:0;right:0;bottom:max(16px,env(safe-area-inset-bottom,0px));text-align:center;color:#fff;opacity:.85;font-size:13px;letter-spacing:.06em;font-family:sans-serif;pointer-events:none;}
.lb.single .lb-prev,.lb.single .lb-next,.lb.single .lb-count{display:none;}
@media(max-width:480px){.lb-prev,.lb-next{width:38px;height:38px;margin-top:-19px;font-size:19px;}.lb-prev{left:6px;}.lb-next{right:6px;}}
@media(prefers-reduced-motion:reduce){.lb,.lb-img{transition:none !important;}}
`;
  const html = `<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Photo viewer"><button class="lb-btn lb-close" id="lbClose" type="button" aria-label="Close">&#10005;</button><button class="lb-btn lb-prev" id="lbPrev" type="button" aria-label="Previous">&#10094;</button><button class="lb-btn lb-next" id="lbNext" type="button" aria-label="Next">&#10095;</button><div class="lb-stage" id="lbStage"><img class="lb-img" id="lbImg" alt=""></div><div class="lb-count" id="lbCount"></div></div>`;
  const js = `
(function(){
  var lb=document.getElementById('lb'); if(!lb) return;
  var img=document.getElementById('lbImg'), cnt=document.getElementById('lbCount');
  var list=[], idx=0, sx=0, sy=0, tracking=false, closing=false;
  function show(i){
    idx=(i+list.length)%list.length;
    img.classList.remove('lb-swap');
    img.src=list[idx].src;
    cnt.textContent=(idx+1)+' / '+list.length;
  }
  function openAt(el){
    var sec=el.closest('.lang-section');
    list=Array.prototype.slice.call((sec||document).querySelectorAll('.frame.photo img'));
    var i=list.indexOf(el); if(i<0){ return; }
    lb.classList.toggle('single',list.length<2);
    show(i);
    closing=false; lb.classList.add('open'); document.body.classList.add('lb-lock');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ if(!closing){ lb.classList.add('show'); } }); });
  }
  function closeLb(){
    closing=true; lb.classList.remove('show'); document.body.classList.remove('lb-lock');
    setTimeout(function(){ if(!lb.classList.contains('show')){ lb.classList.remove('open'); img.removeAttribute('src'); } },260);
  }
  document.addEventListener('click',function(e){
    var t=e.target;
    if(t&&t.tagName==='IMG'&&t.closest&&t.closest('.frame.photo')){ openAt(t); }
  });
  document.getElementById('lbClose').addEventListener('click',closeLb);
  document.getElementById('lbPrev').addEventListener('click',function(e){ e.stopPropagation(); show(idx-1); });
  document.getElementById('lbNext').addEventListener('click',function(e){ e.stopPropagation(); show(idx+1); });
  lb.addEventListener('click',function(e){ if(e.target===lb||e.target.id==='lbStage'){ closeLb(); } });
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open')) return;
    if(e.key==='Escape'){ closeLb(); }
    else if(e.key==='ArrowLeft'&&list.length>1){ show(idx-1); }
    else if(e.key==='ArrowRight'&&list.length>1){ show(idx+1); }
  });
  lb.addEventListener('touchstart',function(e){ if(e.touches.length!==1){ tracking=false; return; } tracking=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY; },{passive:true});
  lb.addEventListener('touchend',function(e){
    if(!tracking||list.length<2) return; tracking=false;
    var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4){ show(dx<0?idx+1:idx-1); }
  },{passive:true});
})();`;
  return { css, html, js };
}

// ---------- "Save to Calendar" (.ics) for guests ----------
// Runs inside the guest page: builds a standard iCalendar file (start time in UTC, so every calendar app and
// time zone shows the right local time) with a reminder 3 days before, and downloads it. The guest then taps
// it and their calendar app asks to confirm - browsers cannot write to a calendar silently.
function wibCalendarRuntime(cfg){
  function pad(n){ return String(n).padStart(2, "0"); }
  function utc(d){
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
           pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z";
  }
  function esc(v){
    return String(v || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  }
  function bytesOf(ch){ return encodeURIComponent(ch).replace(/%[0-9A-F]{2}/gi, "x").length; }
  function fold(line){                      // RFC 5545: lines are at most 75 octets; continuation lines start with a space
    var chars = Array.from(line), out = [], cur = "", n = 0;
    for(var i = 0; i < chars.length; i++){
      var b = bytesOf(chars[i]);
      if(n + b > 75){ out.push(cur); cur = " "; n = 1; }
      cur += chars[i]; n += b;
    }
    out.push(cur);
    return out.join("\r\n");
  }
  function hash(str){
    var h = 0;
    for(var i = 0; i < str.length; i++){ h = (h * 31 + str.charCodeAt(i)) | 0; }
    return (h >>> 0).toString(36);
  }
  function build(lang){
    var c = cfg[lang] || cfg.km;
    var start = new Date(cfg.start);
    var end = new Date(start.getTime() + cfg.hours * 3600000);
    var lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation Builder//KM-EN//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:wedding-" + utc(start) + "-" + hash(cfg.seed) + "@invitation",   // same in both languages: saving twice updates, not duplicates
      "DTSTAMP:" + utc(new Date()),
      "DTSTART:" + utc(start),
      "DTEND:" + utc(end),
      "SUMMARY:" + esc(c.title)
    ];
    if(c.loc) lines.push("LOCATION:" + esc(c.loc));
    if(c.desc) lines.push("DESCRIPTION:" + esc(c.desc));
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc(c.alarm), "TRIGGER:-P" + cfg.alarmDays + "D", "END:VALARM");
    lines.push("END:VEVENT", "END:VCALENDAR");
    return lines.map(fold).join("\r\n") + "\r\n";
  }
  function save(lang){
    var blob = new Blob([build(lang)], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "wedding-invitation.ics";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
  }
  var btns = document.querySelectorAll(".cal-btn");
  for(var i = 0; i < btns.length; i++){
    (function(btn){ btn.addEventListener("click", function(){ save(btn.getAttribute("data-lang") || "km"); }); })(btns[i]);
  }
}
function buildCalendarCfg(s, targetIso){
  const mapsUrl = (s.venueMapLink && /^https?:\/\//i.test(s.venueMapLink.trim())) ? s.venueMapLink.trim() : "";
  const one = lang => {
    const isKm = lang === "km", L = LABELS[lang];
    const groom = isKm ? s.groomName : (s.groomNameEn || s.groomName);
    const bride = isKm ? s.brideName : (s.brideNameEn || s.brideName);
    const venueName = isKm ? s.venueName : (s.venueNameEn || s.venueName);
    const venueAddr = isKm ? s.venueAddr : (s.venueAddrEn || s.venueAddr);
    const names = [groom, bride].filter(x => (x || "").trim()).join(" " + L.and + " ");
    return {
      title: (isKm ? "ពិធីមង្គលការ " : "Wedding of ") + names,
      loc: [venueName, venueAddr].filter(x => (x || "").trim()).join(", "),
      desc: mapsUrl ? ((isKm ? "ទីតាំងលើផែនទី: " : "Map: ") + mapsUrl) : "",
      alarm: isKm ? "ពិធីមង្គលការនៅសល់ ៣ ថ្ងៃទៀត" : "Wedding in 3 days"
    };
  };
  return { start: targetIso, hours: 4, alarmDays: 3, seed: (s.groomName || "") + "|" + (s.brideName || "") + "|" + (s.eventDate || ""), km: one("km"), en: one("en") };
}

function renderInvitation(s){
  const t = layoutTheme_(s);   // colour theme, or the layout's own palette
  const ly = layoutOf_(s);
  const fk = FONT_KM[hasOwn(FONT_KM, s.fontKm) ? s.fontKm : (THEME_FONT_DEFAULTS[s.theme] || THEME_FONT_DEFAULTS.gold)[0]];
  const fe = FONT_EN[hasOwn(FONT_EN, s.fontEn) ? s.fontEn : (THEME_FONT_DEFAULTS[s.theme] || THEME_FONT_DEFAULTS.gold)[1]];
  const targetIso = (s.eventDate && s.startTime) ? `${s.eventDate}T${s.startTime}:00+07:00` : "";
  const kmSection = buildSection(s, t, "km");
  const enSection = buildSection(s, t, "en");
  const LKM = LABELS.km, LEN = LABELS.en;
  const bodyClass = s.__guestName ? " class=\"guest-mode\"" : "";
  const mp = buildMusicParts(ly ? Object.assign({}, s, { openStyle: ly.openStyle }) : s);
  const ta = hasOwn(TEXT_ANIM_STYLES, s.textAnim) ? s.textAnim : "fadeup";
  const taJs = buildTextAnimJs(ta, !!s.__preview);
  const sFx = ly ? Object.assign({}, s, { kbachFrame:"none", kbachBg:"none" }) : s;   // a layout draws its own frame/background
  const frameFxJs = buildFrameSnapJs(sFx) + buildFrameFxJs(sFx);
  const lbx = buildLightbox();
  const calJs = (targetIso && !isNaN(Date.parse(targetIso))) ? `try{(${wibCalendarRuntime.toString()})(${JSON.stringify(buildCalendarCfg(s, targetIso)).replace(/</g, "\\u003c")});}catch(e){}` : "";

  return `<!DOCTYPE html><html lang="km"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(s.groomName)} & ${escapeHtml(s.brideName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Moul&family=Moulpali&family=Battambang:wght@400;700&family=Suwannaphum&family=Angkor&family=Koulen&family=Odor+Mean+Chey&family=Kantumruy+Pro:wght@300;400;500;600;700&family=Great+Vibes&family=Parisienne&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600;1,700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Tangerine:wght@400;700&family=Marck+Script&display=swap" rel="stylesheet">
<style>
:root{--bg:${t.bg};--ink:${t.ink};--accent-1:${t.accent1};--accent-2:${t.accent2};--card:${t.card};--ctl-bg:color-mix(in srgb, ${t.card} 26%, transparent);--border:${t.border};--radius:${t.radius};--display-font:${fk.display};--body-font:${fk.body};--display-font-en:${fe.display};--body-font-en:${fe.body};}
*{box-sizing:border-box}
html{background:var(--bg);}
body{margin:0;color:var(--ink);font-family:var(--body-font);line-height:1.8;-webkit-font-smoothing:antialiased;}
.kb-frame{position:fixed;inset:0;z-index:60;pointer-events:none;box-sizing:border-box;border:var(--kb-w) solid transparent;border-image-source:var(--kb-img);border-image-slice:405;border-image-width:var(--kb-w);border-image-repeat:round;animation:kb-glow 6s ease-in-out infinite;}
.kb-ov{position:fixed;left:50%;will-change:transform,opacity;width:min(100%,680px);transform:translateX(-50%);aspect-ratio:1024/640;z-index:60;pointer-events:none;background:var(--kb-img) no-repeat;background-size:100% 200%;}
.kb-ov-top{top:0;background-position:center top;}
.kb-ov-bot{bottom:0;background-position:center bottom;}
.kb-shine{position:absolute;inset:calc(-1 * var(--kb-w));pointer-events:none;-webkit-mask-box-image:var(--kb-img) 405 / var(--kb-w) round;mask-border:var(--kb-img) 405 / var(--kb-w) round;background:linear-gradient(115deg,transparent 38%,rgba(255,246,205,.95) 50%,transparent 62%) 0 0/300% 300%;animation:kb-shine 5.5s ease-in-out infinite;}
.kb-shine{display:none;}   /* shine is a gradient clipped by a border-image mask: browsers without mask-border / -webkit-mask-box-image (e.g. Firefox) would paint it over the whole screen, so keep it hidden there */
@supports ((-webkit-mask-box-image:none) or (mask-border:none)){.kb-shine{display:block;}}
.kb-bg-anim{transform-origin:50% 50%;animation:kb-bgmove 14s ease-in-out infinite alternate;}
.kb-bg-framed{inset:calc(var(--kb-w) * .3);-webkit-mask-image:linear-gradient(to right,transparent 0,#000 14%,#000 86%,transparent 100%),linear-gradient(to bottom,transparent 0,#000 10%,#000 90%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(to right,transparent 0,#000 14%,#000 86%,transparent 100%),linear-gradient(to bottom,transparent 0,#000 10%,#000 90%,transparent 100%);mask-composite:intersect;}
:root{--kb-w:clamp(96px,24vw,170px);}
@keyframes kb-glow{0%,100%{filter:drop-shadow(0 0 2px rgba(255,205,100,.18));}50%{filter:drop-shadow(0 0 9px rgba(255,205,100,.75));}}
@keyframes kb-shine{0%{background-position:100% 100%;}60%,100%{background-position:0% 0%;}}
@keyframes kb-bgmove{0%{opacity:.78;}100%{opacity:1;}}
@media(prefers-reduced-motion:reduce){.kb-frame,.kb-shine,.kb-bg-anim{animation:none !important;}}
.kbach-custom-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background-repeat:no-repeat;background-position:center;}
.kbach-custom-frame{position:fixed;inset:0;z-index:60;pointer-events:none;background-repeat:no-repeat;background-position:center;}
.display{font-family:var(--display-font);color:var(--accent-1);}
.lang-en{font-family:var(--body-font-en);font-style:italic;}
.lang-en .display{font-family:var(--display-font-en);font-style:normal;}
.lang-en .hero-date,.lang-en .tl-time,.lang-en .contact-phone,.lang-en .map-btn,.lang-en .cal-btn,.lang-en .cd-label{font-style:normal;}
.wrap{max-width:680px;margin:0 auto;padding:0 24px;}
.hero{padding:52px 24px 36px;text-align:center;background:radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent-1) 12%, transparent) 0%, transparent 60%), var(--bg);}
.eyebrow{font-size:17px;color:var(--ink);opacity:.75;margin:0 0 16px;}
.guest-line{position:sticky;top:0;z-index:70;display:block;width:100%;margin:0;padding:13px 20px;font-size:15px;font-weight:700;letter-spacing:.03em;text-align:center;color:#fff;background:linear-gradient(90deg, var(--accent-1), var(--accent-2));box-shadow:0 4px 16px rgba(0,0,0,.2);font-style:normal;}
.lang-en .guest-line{font-style:normal;}
.names{font-size:clamp(36px,10vw,64px);line-height:1.4;margin:0;}
.names .amp{display:block;font-family:var(--body-font);font-size:0.4em;color:var(--accent-2);margin:6px 0;}
.lang-en .names .amp{font-family:var(--body-font-en);font-style:italic;}
.hero-date{margin-top:14px;font-size:19px;color:var(--accent-1);}
.hero.has-cover{position:relative;overflow:hidden;isolation:isolate;padding-top:150px;padding-bottom:100px;min-height:clamp(440px,85vh,720px);display:flex;flex-direction:column;justify-content:center;}
.hb{position:absolute;pointer-events:none;background:var(--cover) var(--fx,50%) var(--fy,35%)/cover no-repeat;}
.hb-blur{inset:calc(var(--blur,22px) * -2);z-index:-3;filter:blur(var(--blur,22px)) saturate(1.08);}
.hb-sharp{inset:0;z-index:-2;-webkit-mask-image:radial-gradient(ellipse var(--rx,60%) var(--ry,56%) at var(--fx,50%) var(--fy,35%),#000 42%,rgba(0,0,0,.55) 68%,transparent 100%);mask-image:radial-gradient(ellipse var(--rx,60%) var(--ry,56%) at var(--fx,50%) var(--fy,35%),#000 42%,rgba(0,0,0,.55) 68%,transparent 100%);}
.hb-tint{inset:0;z-index:-1;background:linear-gradient(180deg,transparent 80%,var(--bg) 100%),radial-gradient(ellipse 88% 82% at var(--fx,50%) var(--fy,35%),transparent 38%,color-mix(in srgb,var(--accent-1) 48%,transparent) 76%,color-mix(in srgb,var(--accent-1) 78%,#000) 100%),linear-gradient(180deg,rgba(0,0,0,.30) 0%,rgba(0,0,0,.36) 45%,rgba(0,0,0,.58) 100%);}
.hb-tint{opacity:var(--veil,.35);}
.hero.no-blur .hb-blur,.hero.cover-art .hb-blur,.hero.cover-art .hb-tint{display:none;}
.hero.no-blur .hb-sharp,.hero.cover-art .hb-sharp{-webkit-mask-image:none;mask-image:none;}
.hero.has-cover .eyebrow{color:#fff;opacity:1;text-shadow:0 0 3px rgba(0,0,0,.8), 0 2px 10px rgba(0,0,0,.75), 0 4px 20px rgba(0,0,0,.55);}
.hero.has-cover .names{position:relative;z-index:1;color:#fff;-webkit-text-stroke:0;font-weight:700;text-shadow:0 1px 0 rgba(0,0,0,.75),0 2px 0 rgba(0,0,0,.6),0 3px 0 rgba(0,0,0,.45),0 4px 0 rgba(0,0,0,.3),0 8px 18px rgba(0,0,0,.65);}
.hero.has-cover .names::before{content:"";position:absolute;left:50%;top:50%;width:125%;height:135%;transform:translate(-50%,-50%);background:radial-gradient(ellipse at center, rgba(0,0,0,.50) 0%, rgba(0,0,0,.30) 45%, transparent 72%);filter:blur(10px);z-index:-1;pointer-events:none;}
.hero.has-cover .names .amp{color:color-mix(in srgb,var(--accent-2) 40%,#fff);-webkit-text-stroke:0;text-shadow:0 1px 0 rgba(0,0,0,.7),0 2px 0 rgba(0,0,0,.5),0 5px 12px rgba(0,0,0,.6);}
.hero.has-cover .hero-date{color:#fff;opacity:1;text-shadow:0 0 3px rgba(0,0,0,.8), 0 2px 10px rgba(0,0,0,.75), 0 4px 20px rgba(0,0,0,.55);}
section{padding:30px 0;}
.lang-section{padding:0;}
.section-title{font-size:30px;text-align:center;margin:0 0 4px;}
.section-sub{text-align:center;color:var(--ink);opacity:.7;font-size:15px;margin:0 0 18px;}
.divider{display:flex;align-items:center;justify-content:center;gap:12px;margin:0 auto;max-width:680px;padding:0 24px;}
.divider .rule{height:1px;width:56px;background:linear-gradient(90deg,transparent,var(--accent-2),transparent);}
.welcome{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:26px 32px;text-align:center;}
.welcome p{font-size:18px;margin:0;}
.hosts{margin-top:14px;font-size:18px;color:var(--accent-1);font-weight:600;}
.countdown{display:flex;justify-content:center;gap:14px;flex-wrap:wrap;}
.cd-unit{width:76px;padding:16px 0;text-align:center;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);}
.cd-num{font-size:40px;font-weight:800;line-height:1.1;letter-spacing:.5px;font-variant-numeric:tabular-nums;background:none;-webkit-background-clip:border-box;background-clip:border-box;filter:none;color:#fff;-webkit-text-fill-color:#fff;text-shadow:0 1px 0 color-mix(in srgb,var(--accent-1) 45%,#000),0 2px 0 color-mix(in srgb,var(--accent-1) 38%,#000),0 3px 0 color-mix(in srgb,var(--accent-1) 30%,#000),0 4px 0 color-mix(in srgb,var(--accent-1) 22%,#000),0 8px 12px rgba(0,0,0,.45);}
.cd-label{font-size:12px;color:var(--ink);opacity:.7;margin-top:3px;}
.timeline{position:relative;padding-left:26px;border-left:1px solid var(--border);}
.tl-item{position:relative;padding-bottom:28px;}
.tl-item:last-child{padding-bottom:0;}
.tl-item::before{content:"";position:absolute;left:-31px;top:4px;width:8px;height:8px;border-radius:50%;background:var(--accent-2);box-shadow:0 0 0 4px var(--bg);}
.tl-time{font-size:14.5px;color:var(--accent-2);font-weight:600;margin-bottom:3px;font-style:normal;}
.tl-name{font-size:18px;margin:0;}
.frame{border:1px solid var(--border);background:color-mix(in srgb, var(--accent-1) 8%, var(--bg));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--ink);opacity:.6;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,.09);transition:transform .45s cubic-bezier(.22,1,.36,1), box-shadow .45s ease;}
.frame.photo{opacity:1;}
.frame.photo:hover{transform:translateY(-5px) scale(1.02);box-shadow:0 16px 34px rgba(0,0,0,.18);}
.frame img{width:100%;height:100%;object-fit:cover;object-position:center 25%;display:block;transition:transform .6s cubic-bezier(.22,1,.36,1);}
.frame.photo:hover img{transform:scale(1.07);}
.frame svg{width:28px;height:28px;}
.frame span{font-size:11.5px;font-style:normal;}
.gallery-style-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;}
.gallery-style-grid .gallery-item.wide{grid-column:span 2;}
.gallery-style-grid .frame{aspect-ratio:4/3;border-radius:var(--radius);padding:0;}
.gallery-style-grid .gallery-item.wide .frame{aspect-ratio:16/9;}
.gallery-style-classic{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;}
.gallery-style-classic .frame{aspect-ratio:4/3;border-radius:var(--radius);padding:0;}
.gallery-style-polaroid{display:flex;flex-wrap:wrap;justify-content:center;gap:14px 8px;padding:6px 4px;}
.gallery-style-polaroid .gallery-item{width:calc(33.333% - 8px);}
.gallery-style-polaroid .frame{aspect-ratio:1/1.05;border-radius:2px;padding:10px 10px 24px;background:var(--card);box-shadow:0 8px 18px rgba(0,0,0,.1);}
.gallery-style-polaroid .frame.photo:hover{transform:translateY(-5px) scale(1.03);}
.gallery-style-polaroid .gallery-item.rot-0 .frame{transform:rotate(-3deg);}
.gallery-style-polaroid .gallery-item.rot-1 .frame{transform:rotate(2.5deg);}
.gallery-style-polaroid .gallery-item.rot-2 .frame{transform:rotate(-1.5deg);}
.gallery-style-polaroid .gallery-item.rot-0 .frame.photo:hover{transform:rotate(-3deg) translateY(-5px) scale(1.04);}
.gallery-style-polaroid .gallery-item.rot-1 .frame.photo:hover{transform:rotate(2.5deg) translateY(-5px) scale(1.04);}
.gallery-style-polaroid .gallery-item.rot-2 .frame.photo:hover{transform:rotate(-1.5deg) translateY(-5px) scale(1.04);}
@media(max-width:480px){.gallery-style-polaroid .gallery-item{width:calc(50% - 8px);}}
.gallery-style-square{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;}
.gallery-style-square .frame{aspect-ratio:1/1;border-radius:0;border:none;box-shadow:none;padding:0;}
.gallery-style-square .frame.photo:hover{transform:none;box-shadow:none;}
@media(max-width:480px){.gallery-style-square{grid-template-columns:repeat(2,1fr);}}
.gallery-style-mosaic{column-count:2;column-gap:8px;}
.gallery-style-mosaic .gallery-item{display:inline-block;width:100%;break-inside:avoid;margin-bottom:8px;}
.gallery-style-mosaic .frame{border-radius:calc(var(--radius) + 8px);padding:0;border-width:2px;position:relative;}
.gallery-style-mosaic .frame::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--accent-2) 55%, transparent);pointer-events:none;}
.gallery-style-mosaic .gallery-item:nth-child(3n+1) .frame{aspect-ratio:3/4;}
.gallery-style-mosaic .gallery-item:nth-child(3n+2) .frame{aspect-ratio:1/1;}
.gallery-style-mosaic .gallery-item:nth-child(3n+3) .frame{aspect-ratio:4/5;}
.gallery-style-single{display:block;max-width:420px;margin:0 auto;}
.gallery-style-single .gallery-item{width:100%;}
.gallery-style-single .frame{display:block;padding:0;border-radius:calc(var(--radius) + 6px);overflow:hidden;box-shadow:0 10px 26px rgba(0,0,0,.12);}
.gallery-style-single .frame img{height:auto;object-fit:contain;}
.video-card{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:100%;aspect-ratio:16/9;border-radius:var(--radius);overflow:hidden;text-decoration:none;color:#fff;font-style:normal;background:radial-gradient(ellipse at 50% 40%,color-mix(in srgb,var(--accent-1) 70%,#000) 0%,color-mix(in srgb,var(--accent-1) 35%,#000) 100%);box-shadow:0 8px 20px rgba(0,0,0,.14);}
.vc-play{width:68px;height:68px;border-radius:50%;background:rgba(255,255,255,.95);color:var(--accent-1);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 22px rgba(0,0,0,.35);transition:transform .25s ease;}
.vc-play svg{width:30px;height:30px;margin-left:3px;}
.video-card:hover .vc-play{transform:scale(1.08);}
.vc-host{font-size:13px;opacity:.8;letter-spacing:.04em;}
.vc-cta{font-size:15px;font-weight:600;}
.map-embed{position:relative;width:100%;aspect-ratio:16/10;margin:0 0 18px;border-radius:calc(var(--radius) - 2px);overflow:hidden;border:1px solid var(--border);background:color-mix(in srgb,var(--accent-1) 8%,var(--bg));box-shadow:0 6px 16px rgba(0,0,0,.1);}
.map-embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;}
.map-pin{position:absolute;left:50%;top:50%;z-index:1;width:40px;height:52px;transform:translate(-50%,-100%);pointer-events:none;filter:drop-shadow(0 4px 5px rgba(0,0,0,.4));}
.map-pin-ring{position:absolute;left:50%;top:50%;z-index:1;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:color-mix(in srgb,var(--accent-1) 45%,transparent);pointer-events:none;animation:pin-pulse 2.2s ease-out infinite;}
@keyframes pin-pulse{0%{transform:scale(.6);opacity:.9;}100%{transform:scale(3.4);opacity:0;}}
@media(prefers-reduced-motion:reduce){.map-pin-ring{animation:none;opacity:.4;}}
.map-embed-hit{position:absolute;inset:0;z-index:2;display:block;}
.map-embed-tag{position:absolute;z-index:3;left:10px;bottom:10px;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.94);color:#222;font-size:12.5px;font-style:normal;box-shadow:0 2px 8px rgba(0,0,0,.25);pointer-events:none;}
.vid-hide{display:none!important;}
.video-open{display:block;text-align:center;margin:10px auto 0;font-size:12.5px;color:var(--accent-1);text-decoration:underline;text-underline-offset:3px;opacity:.9;}
.video-open:hover{opacity:1;}
.video-wrap{position:relative;width:100%;margin:0 auto;aspect-ratio:var(--vr,16/9);border-radius:var(--radius);overflow:hidden;border:1px solid var(--border);background:#000;box-shadow:0 8px 20px rgba(0,0,0,.12);}\n.video-wrap iframe,.video-wrap video{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:#000;}\n.venue-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:36px;text-align:center;}
.venue-name{font-size:25px;margin:0 0 8px;}
.venue-addr{color:var(--ink);opacity:.75;font-size:16px;margin:0 0 16px;}
.map-btn{display:inline-block;padding:12px 26px;border-radius:999px;background:var(--accent-1);color:#fff;text-decoration:none;font-size:14px;font-style:normal;}
.gift-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:16px;}
.gift-card{flex:1 1 220px;max-width:320px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px 18px 22px;text-align:center;}
.gift-who{margin:0 0 12px;font-size:16px;color:var(--accent-1);}
.gift-qr{display:block;width:100%;height:auto;border-radius:calc(var(--radius) + 4px);background:#fff;}
.gift-save{display:inline-block;margin-top:16px;padding:11px 26px;border-radius:999px;border:1.5px solid var(--accent-1);background:transparent;color:var(--accent-1);text-decoration:none;font-size:14px;font-style:normal;}
.gift-save:hover,.gift-save:focus-visible{background:var(--accent-1);color:#fff;outline:none;}
.gift-hint{font-size:13px;opacity:.7;margin:14px 0 0;text-align:center;}
.dress-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:8px 22px;}
.dress-row{padding:18px 0;text-align:center;}
.dress-row + .dress-row{border-top:1px solid var(--border);}
.dress-label{margin:0 0 14px;font-size:16px;color:var(--accent-1);}
.dress-dots{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;}
.dress-dot{display:flex;flex-direction:column;align-items:center;gap:7px;width:72px;}
.dress-dot span{display:block;width:46px;height:46px;border-radius:50%;box-shadow:0 0 0 3px var(--card),0 0 0 4px var(--border),0 4px 10px rgba(0,0,0,.12);}
.dress-dot small{font-size:12px;line-height:1.3;opacity:.8;font-style:normal;}
.cal-wrap{text-align:center;margin-top:22px;}
.cal-btn{display:inline-block;padding:11px 26px;border-radius:999px;border:1.5px solid var(--accent-1);background:transparent;color:var(--accent-1);font-family:inherit;font-size:14px;font-style:normal;cursor:pointer;transition:background .2s,color .2s;}
.cal-btn:hover,.cal-btn:focus-visible{background:var(--accent-1);color:#fff;outline:none;}
.contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;}
.contact-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:22px;text-align:center;}
.contact-name{font-size:17px;margin:0 0 6px;}
.contact-phone{display:inline-block;color:var(--accent-1);font-weight:600;text-decoration:none;font-size:16.5px;font-style:normal;}
/* ---- Glass + 3D cards (countdown, short invitation, venue, contacts): see-through so the animated background shows behind. Tune --glass-a1 / --glass-a2 (higher = more solid) ---- */
.welcome,.cd-unit,.venue-card,.contact-card,.dress-card,.gift-card{--glass-a1:58%;--glass-a2:30%;position:relative;background:linear-gradient(160deg,rgba(255,255,255,.34) 0%,rgba(255,255,255,0) 44%),linear-gradient(145deg,color-mix(in srgb,var(--card) var(--glass-a1),transparent),color-mix(in srgb,var(--card) var(--glass-a2),transparent));-webkit-backdrop-filter:blur(3px) saturate(1.25);backdrop-filter:blur(3px) saturate(1.25);border:1px solid rgba(255,255,255,.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.8),inset 1px 0 0 rgba(255,255,255,.3),inset 0 -2px 5px rgba(0,0,0,.06),0 14px 28px -8px rgba(0,0,0,.30),0 4px 10px rgba(0,0,0,.10);}
/* Dress colours: 3D glossy swatches (inset highlight + soft drop shadow) to match the glass cards */
.dress-dot span{box-shadow:0 0 0 3px color-mix(in srgb,var(--card) 80%,transparent),0 0 0 4px var(--border),inset 0 3px 5px rgba(255,255,255,.55),inset 0 -5px 8px rgba(0,0,0,.18),0 8px 14px -3px rgba(0,0,0,.35);}
.dress-row + .dress-row{border-top-color:color-mix(in srgb,var(--border) 70%,rgba(255,255,255,.6));}
/* Countdown: dark-tinted glass tile (theme colour) so the 3D digits stay clear on any background */
.cd-unit{width:80px;padding:6px 0 4px;background:none;border:0;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;}
.cd-label{color:#fff;opacity:1;font-weight:700;margin-top:6px;text-shadow:0 1px 0 rgba(0,0,0,.65),0 2px 7px rgba(0,0,0,.7);}
.cd-num{font-size:40px;font-weight:900;line-height:1.1;letter-spacing:.5px;font-variant-numeric:tabular-nums;background:none;-webkit-background-clip:border-box;background-clip:border-box;filter:none;color:#fff;-webkit-text-fill-color:#fff;text-shadow:0 1px 0 color-mix(in srgb,var(--accent-1) 60%,#000),0 2px 0 color-mix(in srgb,var(--accent-1) 52%,#000),0 3px 0 color-mix(in srgb,var(--accent-1) 44%,#000),0 4px 0 color-mix(in srgb,var(--accent-1) 36%,#000),0 5px 0 color-mix(in srgb,var(--accent-1) 28%,#000),0 11px 14px rgba(0,0,0,.5);}
@media(max-width:420px){.countdown{gap:8px;flex-wrap:nowrap;}.cd-unit{width:auto;flex:1 1 0;min-width:0;}.cd-num{font-size:34px;}}
footer{text-align:center;padding:30px 24px 36px;color:var(--ink);opacity:.75;font-size:15px;}
footer .thanks{font-size:22px;color:var(--accent-1);opacity:1;margin-bottom:6px;}
.lang-toggle{position:fixed;top:16px;right:16px;z-index:100;display:flex;background:var(--ctl-bg);border:1px solid color-mix(in srgb, var(--border) 55%, transparent);border-radius:999px;padding:4px;box-shadow:0 2px 8px rgba(0,0,0,.08);}
.lang-toggle button{border:none;background:none;padding:8px 16px;border-radius:999px;font-size:13px;cursor:pointer;color:var(--ink);font-family:'Kantumruy Pro',sans-serif;font-style:normal;font-weight:600;text-shadow:0 0 3px var(--card),0 0 8px var(--card);}
.lang-toggle button.active{background:var(--accent-1);color:#fff;text-shadow:none;box-shadow:0 1px 4px rgba(0,0,0,.25);}
body.guest-mode .lang-toggle{top:62px;}
.fx-toggle{position:fixed;top:16px;left:16px;z-index:100;display:flex;gap:2px;background:var(--ctl-bg);border:1px solid color-mix(in srgb, var(--border) 55%, transparent);border-radius:999px;padding:4px;box-shadow:0 2px 8px rgba(0,0,0,.08);}
.fx-toggle button{border:none;background:none;width:32px;height:32px;border-radius:50%;font-size:15px;line-height:1;cursor:pointer;color:var(--ink);display:flex;align-items:center;justify-content:center;font-style:normal;}
.fx-toggle button.active{background:var(--accent-1);color:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25);}
body.guest-mode .fx-toggle{top:62px;}
@media(max-width:480px){.hero{padding:40px 18px 30px;}.welcome{padding:22px 20px;}.lang-toggle{top:10px;right:10px;}.lang-toggle button{padding:7px 12px;font-size:12px;}body.guest-mode .lang-toggle{top:56px;}.fx-toggle{top:10px;left:10px;}.fx-toggle button{width:28px;height:28px;font-size:13px;}body.guest-mode .fx-toggle{top:56px;}}
${ly ? buildLayoutCss_(ly) : ""}${mp.css}${buildTextAnimCss(ta)}${buildTextFxCss(s.textFx, ta)}${lbx.css}</style></head><body${bodyClass}>
${ly ? buildLayoutLayers_(ly, t) : buildKbachFrameOverlay(s.kbachBg, t, s, "bg") + buildKbachFrameOverlay(s.kbachFrame, t, s, "frame")}
<div class="lang-toggle">
  <button id="btn-km" class="active" type="button">${LKM.toggleKm}</button>
  <button id="btn-en" type="button">${LEN.toggleEn}</button>
</div>
${FALLING_FX_ENABLED ? `<div class="fx-toggle" id="fxToggle">${Object.keys(EFFECTS).map(key => `<button data-fx="${key}" type="button" title="${escapeHtml(EFFECTS[key].label)}">${EFFECTS[key].icon}</button>`).join("")}</div>` : ""}
${mp.html}
${lbx.html}
${kmSection}
${enSection}
<script>(function(){
var target=${targetIso ? JSON.stringify(targetIso).replace(/</g,"\\u003c") : "null"};
var t=target?new Date(target).getTime():0;
function pad(n){return String(n).padStart(2,"0");}
var messages={km:"${LKM.congrats}",en:"${LEN.congrats}"};
function tick(){
  if(!t){return;}
  var diff=t-Date.now();
  ["km","en"].forEach(function(lang){
    var el=document.getElementById("countdown-"+lang);
    if(!el) return;
    if(diff<=0){
      el.innerHTML='<div class="cd-unit" style="width:auto;padding:16px 26px;"><div class="cd-num" style="font-size:18px;">'+messages[lang]+'</div></div>';
      var cw=document.querySelector('#section-'+lang+' .cal-wrap'); if(cw) cw.style.display='none';
      return;
    }
    document.getElementById("cd-d-"+lang).textContent=pad(Math.floor(diff/86400000));
    document.getElementById("cd-h-"+lang).textContent=pad(Math.floor((diff%86400000)/3600000));
    document.getElementById("cd-m-"+lang).textContent=pad(Math.floor((diff%3600000)/60000));
    document.getElementById("cd-s-"+lang).textContent=pad(Math.floor((diff%60000)/1000));
  });
  if(diff<=0){clearInterval(timer);}
}
tick();var timer=setInterval(tick,1000);

try{
  var guestParams=new URLSearchParams(window.location.search);
  var guestName=guestParams.get('to');
  if(guestName){
    var gk=document.getElementById('guestLine-km');
    var ge=document.getElementById('guestLine-en');
    if(gk){ gk.textContent='ជូនចំពោះ '+guestName; gk.style.display='block'; }
    if(ge){ ge.textContent='Dear '+guestName+','; ge.style.display='block'; }
    document.body.classList.add('guest-mode');
  }
}catch(e){}
${ly ? lyGuestJs_() : ""}

${calJs}

function setLang(lang){
  document.getElementById("section-km").style.display = lang==="km" ? "block" : "none";
  document.getElementById("section-en").style.display = lang==="en" ? "block" : "none";
  document.getElementById("btn-km").classList.toggle("active", lang==="km");
  document.getElementById("btn-en").classList.toggle("active", lang==="en");
}
document.getElementById("btn-km").addEventListener("click", function(){ setLang("km"); });
document.getElementById("btn-en").addEventListener("click", function(){ setLang("en"); });

var fxColor1=${JSON.stringify(t.accent1)};
var fxColor2=${JSON.stringify(t.accent2)};
var fxType="none";   // each guest picks their own effect from the toggle on the invitation
var fxEnabled=${FALLING_FX_ENABLED ? "true" : "false"};
try{ var savedFx=localStorage.getItem("wib-guest-fx"); if(savedFx && fxEnabled) fxType=savedFx; }catch(e){}

var fxCanvas=null, fxCtx=null, fxParticles=[], fxAnimId=null;
function fxResize(){ if(fxCanvas){ fxCanvas.width=window.innerWidth; fxCanvas.height=window.innerHeight; } }
function fxStop(){
  if(fxAnimId){ cancelAnimationFrame(fxAnimId); fxAnimId=null; }
  if(fxCanvas){ fxCanvas.remove(); fxCanvas=null; fxCtx=null; }
  window.removeEventListener("resize", fxResize);
}
function fxDrawPetal(p){
  fxCtx.save();
  fxCtx.translate(p.x,p.y);
  fxCtx.rotate(p.angle);
  fxCtx.globalAlpha=p.opacity;
  var pr=p.r*0.6;
  fxCtx.fillStyle=fxColor1;
  for(var i=0;i<5;i++){
    fxCtx.save();
    fxCtx.rotate((Math.PI*2/5)*i);
    fxCtx.beginPath();
    fxCtx.ellipse(0,-pr*0.85,pr*0.5,pr*0.9,0,0,Math.PI*2);
    fxCtx.fill();
    fxCtx.restore();
  }
  fxCtx.fillStyle=fxColor2;
  fxCtx.beginPath();
  fxCtx.arc(0,0,pr*0.35,0,Math.PI*2);
  fxCtx.fill();
  fxCtx.restore();
}
function fxDrawSnow(p){
  fxCtx.save();
  fxCtx.globalAlpha=p.opacity;
  var grad=fxCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*1.6);
  grad.addColorStop(0,"rgba(255,255,255,1)");
  grad.addColorStop(.55,"rgba(255,255,255,.8)");
  grad.addColorStop(1,"rgba(255,255,255,0)");
  fxCtx.fillStyle=grad;
  fxCtx.beginPath();
  fxCtx.arc(p.x,p.y,p.r*1.6,0,Math.PI*2);
  fxCtx.fill();
  fxCtx.restore();
}
function fxDrawStar(p){
  fxCtx.save();
  fxCtx.translate(p.x,p.y);
  fxCtx.rotate(p.angle);
  var twinkle=0.55+0.45*Math.sin((p.x+p.y)*0.02+p.angle*3);   // ភ្លឺ/ស្រអាប់ឆ្លាស់គ្នាតាមទីតាំង/ពេលវេលា
  fxCtx.globalAlpha=p.opacity*twinkle;
  fxCtx.shadowColor=fxColor2;
  fxCtx.shadowBlur=p.r*2.5;
  fxCtx.fillStyle=fxColor2;
  var spikes=4, outer=p.r*2, inner=p.r*0.7;
  fxCtx.beginPath();
  for(var si=0; si<spikes*2; si++){
    var rad = si%2===0 ? outer : inner;
    var ang = (Math.PI/spikes)*si;
    fxCtx.lineTo(Math.cos(ang)*rad, Math.sin(ang)*rad);
  }
  fxCtx.closePath();
  fxCtx.fill();
  fxCtx.restore();
}
function fxStart(type){
  fxStop();
  fxType=type;
  if(type==="none") return;
  fxCanvas=document.createElement("canvas");
  fxCanvas.id="fx-canvas";
  fxCanvas.style.cssText="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:40;";
  document.body.appendChild(fxCanvas);
  fxCtx=fxCanvas.getContext("2d");
  fxResize();
  window.addEventListener("resize", fxResize);

  var fxCount = type==="snow" ? 70 : (type==="stars" ? 50 : 40);
  function fxSpawn(initial){
    return {
      x: Math.random()*fxCanvas.width,
      y: initial ? Math.random()*fxCanvas.height : -10,
      r: type==="snow" ? (2+Math.random()*3) : (type==="petals" ? (5+Math.random()*5) : (2+Math.random()*2)),
      speed: type==="snow" ? (0.6+Math.random()*1.2) : (type==="petals" ? (0.5+Math.random()*1) : (0.8+Math.random()*1.5)),
      drift: Math.random()*1-0.5,
      angle: Math.random()*Math.PI*2,
      spin: (Math.random()*0.02)-0.01,
      sway: Math.random()*Math.PI*2,
      swaySpeed: 0.01+Math.random()*0.02,
      opacity: type==="stars" ? (0.35+Math.random()*0.65) : (0.6+Math.random()*0.4)
    };
  }
  fxParticles=[];
  for(var fi=0; fi<fxCount; fi++){ fxParticles.push(fxSpawn(true)); }

  function fxLoop(){
    fxCtx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
    fxParticles.forEach(function(p){
      p.y+=p.speed;
      p.sway+=p.swaySpeed;
      p.x+=Math.sin(p.sway)*0.6+p.drift*0.2;
      p.angle+=p.spin;
      if(p.y>fxCanvas.height+20 || p.x<-20 || p.x>fxCanvas.width+20){ Object.assign(p, fxSpawn(false)); }
      if(type==="snow") fxDrawSnow(p);
      else if(type==="stars") fxDrawStar(p);
      else fxDrawPetal(p);
    });
    fxAnimId=requestAnimationFrame(fxLoop);
  }
  fxLoop();
}

var fxButtons=document.querySelectorAll("#fxToggle button");
Array.prototype.forEach.call(fxButtons, function(btn){
  btn.classList.toggle("active", btn.getAttribute("data-fx")===fxType);
  btn.addEventListener("click", function(){
    var type=btn.getAttribute("data-fx");
    fxStart(type);
    try{ localStorage.setItem("wib-guest-fx", type); }catch(e){}
    Array.prototype.forEach.call(fxButtons, function(b){ b.classList.toggle("active", b===btn); });
  });
});
fxStart(fxType);
${taJs.defs}
${mp.js}
${taJs.init}
${frameFxJs}
${lbx.js}
})();<\/script>
</body></html>`;
}