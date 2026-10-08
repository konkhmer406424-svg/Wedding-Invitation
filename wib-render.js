/* ==========================================================================
   wib-render.js — builds the invitation HTML/CSS (cover, sections, gallery, music, animations, calendar)
   Load order in index.html:  wib-data.js → wib-render.js → wib-pickers.js → wib-ui.js
   (they share one global scope, so keep this order)
   ========================================================================== */
// ---------- Build the cover-opening + background-music markup for one rendered invitation ----------
function buildMusicParts(s){
  const music = (musicAsset && musicAsset.dataUrl) ? musicAsset : null;
  if(!music && !s.coverAlways) return { css:"", html:"", js:"" };

  const key = hasOwn(COVER_STYLES, s.openStyle) ? s.openStyle : "door";
  const cfg = COVER_STYLES[key];
  const names = [s.groomName || s.groomNameEn, s.brideName || s.brideNameEn].filter(Boolean).map(escapeHtml).join(" & ");
  const g = s.__guestName ? escapeHtml(s.__guestName) : "";
  const previewAttr = s.__preview ? ' data-preview="1"' : "";
  const p = cfg.parts({ names });

  const namesHtml = (names && p.names !== false) ? `<p class="oc-names display oc-fade">${names}</p>` : "";
  const btnHtml = g
    ? `<button class="oc-btn oc-fade" id="openBtn" type="button"><span class="oc-km">ជូនចំពោះ ${g}</span><span class="oc-en">Dear ${g}</span></button>`
    : `<button class="oc-btn oc-fade" id="openBtn" type="button"><span class="oc-km">ចុចដើម្បីបើកធៀបអញ្ជើញ</span><span class="oc-en">Tap to open your invitation</span></button>`;
  const hintHtml = (g ? `<p class="oc-hint oc-fade">ចុចដើម្បីបើកធៀបអញ្ជើញ<span>Tap to open your invitation</span></p>` : "")
    + (music ? `<p class="oc-hint oc-fade">សូមបើកសំឡេងដើម្បីស្តាប់ចម្រៀង<span>Turn your sound on for the music</span></p>` : "");

  const css = (music ? MUSIC_BTN_CSS : "") + OC_BASE_CSS + cfg.css;

  const musicHtml = music ? `
<audio id="bgm" src="${music.dataUrl}" loop preload="metadata"></audio>
<button class="music-btn" id="musicBtn" type="button" aria-pressed="false" aria-label="Music" title="ចម្រៀង / Music">
  <svg class="ico-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
  <svg class="ico-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
</button>` : "";
  const html = musicHtml + `
<div class="open-cover oc-s-${key}" id="openCover" role="dialog" aria-modal="true" aria-label="Open invitation"${previewAttr}>${p.behind || ""}<div class="oc-inner">${p.top || ""}${namesHtml}${p.mid || ""}${btnHtml}${hintHtml}</div></div>`;

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
        if(typeof waStart==='function'){ try{ waStart(); }catch(e){} }
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
  const cBlur = cnum(s.coverBlur, 0, 40, 22), cFx = cnum(s.coverFocusX, 0, 100, 50), cFy = cnum(s.coverFocusY, 0, 100, 35), cSharp = cnum(s.coverSharp, 30, 95, 60);
  const coverSrc = s.coverPhoto || coverArtUrl(s);   // uploaded cover photo, otherwise the chosen stand-in picture from GitHub
  const heroStyle = coverSrc ? ` style="--cover:url('${coverSrc}');--fx:${cFx}%;--fy:${cFy}%;--blur:${cBlur}px;--rx:${cSharp}%;--ry:${Math.round(cSharp * 0.93)}%;"` : "";
  const heroLayers = coverSrc ? `<span class="hb hb-blur"></span><span class="hb hb-sharp"></span><span class="hb hb-tint"></span>` : "";
  const heroClass = coverSrc ? "hero has-cover" : "hero";
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
  const bodySections = [secWelcome, secCountdown, secProgram, secGallery, secVideo, secVenue, secContacts].filter(Boolean).join(divider);

  return `<section id="section${suf}" class="lang-section lang-${lang}" style="display:${isKm ? "block" : "none"}">
<p class="guest-line" id="guestLine${suf}"${guestLineAttrs}>${escapeHtml(guestLineText)}</p>
<section class="${heroClass}"${heroStyle}>${heroLayers}
<p class="eyebrow">${escapeHtml(eyebrow)}</p>
<h1 class="names display">${escapeHtml(groom)}<span class="amp">${escapeHtml(L.and)}</span>${escapeHtml(bride)}</h1>
<p class="hero-date">${displayDate}</p>
</section>
${bodySections}
<footer><div class="thanks display">${L.thanks}</div><div>${escapeHtml(groom)} ${L.and} ${escapeHtml(bride)}</div></footer>
</section>`;
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
      // The hero block paints its own solid colour; keep its soft glow but let the background image show through.
      return `<style>.hero{background:radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent-1) 12%, transparent) 0%, transparent 60%) !important;}</style><div class="kbach-custom-bg" style="background-image:url('${asset.dataUrl}');background-size:${fitB};opacity:${opB};" aria-hidden="true"></div>`;
    }
    const fit = (s && s.frameFit === "cover") ? "cover" : "100% 100%";
    const op = cl(s && s.frameOpacity, 10, 100, 100) / 100;
    return `<div class="kbach-custom-frame" style="background-image:url('${asset.dataUrl}');background-size:${fit};opacity:${op};" aria-hidden="true"></div>`;
  }
  // រូបភាពរៀបចំស្រាប់ពី GitHub (assets/frames/… និង assets/backgrounds/…)
  const pu = kbachPresetUrl(layer, styleId);
  if(!pu) return "";
  if(layer === "bg"){
    return `<style>.hero{background:radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent-1) 12%, transparent) 0%, transparent 60%) !important;}</style><div class="kbach-custom-bg kb-bg-anim${(s && s.kbachFrame && s.kbachFrame !== "none") ? " kb-bg-framed" : ""}" style="background-image:url('${pu}');background-size:contain;" aria-hidden="true"></div>`;
  }
  return `<div class="kb-frame" style="--kb-img:url('${pu}');" aria-hidden="true"><div class="kb-shine"></div></div>`;
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
`;
}
function buildTextAnimJs(mode, isPreview){
  if(mode === "none") return { defs:"", init:"" };
  const defs = `
var waMode=${JSON.stringify(mode)};
var waPrev=${isPreview ? "true" : "false"};
var waEls=[], waStarted=false;
var WA_TEXT='.eyebrow,.names,.hero-date,.section-title,.section-sub,.welcome p,.hosts,.tl-time,.tl-name,.venue-name,.venue-addr,.contact-name,.thanks,footer > div:last-child';
var WA_BLOCK='.countdown,.map-btn,.contact-phone,.map-embed,.video-card';
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
function waStart(){
  if(waStarted||!waEls.length){ return; }
  waStarted=true;
  var first=true, instant=false;
  if(waPrev){ try{ instant=sessionStorage.getItem('wib-anim-seen')==='1'; sessionStorage.setItem('wib-anim-seen','1'); }catch(e){} }
  var io=new IntersectionObserver(function(entries){
    var vis=entries.filter(function(e){ return e.isIntersecting; }).sort(function(a,b){ return a.boundingClientRect.top-b.boundingClientRect.top; });
    vis.forEach(function(e,i){
      var el=e.target;
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
  const t = THEMES[s.theme];
  const fk = FONT_KM[hasOwn(FONT_KM, s.fontKm) ? s.fontKm : (THEME_FONT_DEFAULTS[s.theme] || THEME_FONT_DEFAULTS.gold)[0]];
  const fe = FONT_EN[hasOwn(FONT_EN, s.fontEn) ? s.fontEn : (THEME_FONT_DEFAULTS[s.theme] || THEME_FONT_DEFAULTS.gold)[1]];
  const targetIso = (s.eventDate && s.startTime) ? `${s.eventDate}T${s.startTime}:00+07:00` : "";
  const kmSection = buildSection(s, t, "km");
  const enSection = buildSection(s, t, "en");
  const LKM = LABELS.km, LEN = LABELS.en;
  const bodyClass = s.__guestName ? " class=\"guest-mode\"" : "";
  const mp = buildMusicParts(s);
  const ta = hasOwn(TEXT_ANIM_STYLES, s.textAnim) ? s.textAnim : "fadeup";
  const taJs = buildTextAnimJs(ta, !!s.__preview);
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
.hero.has-cover .eyebrow{color:#fff;opacity:.92;text-shadow:0 2px 10px rgba(0,0,0,.55);}
.hero.has-cover .names{color:#fff;text-shadow:0 4px 18px rgba(0,0,0,.55), 0 1px 4px rgba(0,0,0,.85);}
.hero.has-cover .names .amp{color:var(--accent-2);}
.hero.has-cover .hero-date{color:#fff;opacity:.95;text-shadow:0 2px 10px rgba(0,0,0,.55);}
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
.cd-num{font-size:26px;font-weight:700;color:var(--accent-1);font-variant-numeric:tabular-nums;font-style:normal;}
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
.cal-wrap{text-align:center;margin-top:22px;}
.cal-btn{display:inline-block;padding:11px 26px;border-radius:999px;border:1.5px solid var(--accent-1);background:transparent;color:var(--accent-1);font-family:inherit;font-size:14px;font-style:normal;cursor:pointer;transition:background .2s,color .2s;}
.cal-btn:hover,.cal-btn:focus-visible{background:var(--accent-1);color:#fff;outline:none;}
.contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;}
.contact-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:22px;text-align:center;}
.contact-name{font-size:17px;margin:0 0 6px;}
.contact-phone{display:inline-block;color:var(--accent-1);font-weight:600;text-decoration:none;font-size:16.5px;font-style:normal;}
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
${mp.css}${buildTextAnimCss(ta)}${lbx.css}</style></head><body${bodyClass}>
${buildKbachFrameOverlay(s.kbachBg, t, s, "bg")}${buildKbachFrameOverlay(s.kbachFrame, t, s, "frame")}
<div class="lang-toggle">
  <button id="btn-km" class="active" type="button">${LKM.toggleKm}</button>
  <button id="btn-en" type="button">${LEN.toggleEn}</button>
</div>
<div class="fx-toggle" id="fxToggle">${Object.keys(EFFECTS).map(key => `<button data-fx="${key}" type="button" title="${escapeHtml(EFFECTS[key].label)}">${EFFECTS[key].icon}</button>`).join("")}</div>
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
try{ var savedFx=localStorage.getItem("wib-guest-fx"); if(savedFx) fxType=savedFx; }catch(e){}

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
${lbx.js}
})();<\/script>
</body></html>`;
}

