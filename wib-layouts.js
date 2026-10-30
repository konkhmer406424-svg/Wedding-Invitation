/* ==========================================================================
   wib-layouts.js — drawing code for the ready-made LAYOUTS (ឈុតកំណត់ជាស្រេច) + 2 cover openings (seal, tap). The layouts themselves: wib-layout-l1.js, l2 …
   Load order in index.html:  wib-data.js → wib-layout-l1.js … wib-layout-lN.js → wib-layouts.js → wib-render.js → wib-pickers.js → wib-ui.js

   A layout is a fixed bundle: opening cover + page background + page frame + top ornament + guest-name frame
   (+ photo frame(s)) + colour palette. Names, dates, texts, fonts, photos, music … stay freely editable.

   ── រូបភាពរបស់ឈុត (ដាក់ក្នុង images/layouts/ ដែលមានថតរង៖ background/ cover/ frames/ nameframes/ open/ — ឈ្មោះក្នុង file:"..." ត្រូវមានឈ្មោះថតនៅមុខ ឧ. "frames/frame4.png") ──
   Each picture entry below has:  file  +  mode
     mode:"tint"  = black line-art on WHITE (.jpg is fine). White becomes see-through and the lines are painted with the
                    layout colour (color:"accent1" | "accent2" | "ink").
     mode:"key"   = coloured art (gold …) on a WHITE background. White becomes see-through, colours stay as they are.
     mode:"keyG"  = like "key", and the pure GREEN area (photo hole) also becomes see-through.
     mode:"plain" = shown as it is (no changes).
   seal:{ file:"open/goal_tamp3.png", size:84 } = ត្រាក្រមួន (wax seal) របស់ឈុតនោះ — ជាប៊ូតុងចុចបើកធៀប (px)។ រូបដាក់ក្នុង images/layouts/open/ ហើយជា PNG ថ្លា។
                     បើគម្របជាបែប ស្រោមសំបុត្រ → ត្រាបិទលើស្រោម · បើជាបែប Tap to Open → ត្រាជំនួសប៊ូតុងមូល។ បើគ្មានរូប → ត្រឡប់ទៅរូបរាងដើម។
   Later, if you turn a picture into a transparent PNG, just change its file name here (e.g. "frame6.png") and set
   mode:"plain". A picture that is missing on GitHub is skipped — nothing breaks.
   ========================================================================== */

// ---------- the layouts ----------
// Each layout lives in its own file (wib-layout-l1.js, wib-layout-l2.js …) and registers itself in window.WIB_LAYOUTS
// (and in INVITATION_PRESETS). This file only holds the drawing code shared by all layouts.
const LAYOUTS = (window.WIB_LAYOUTS = window.WIB_LAYOUTS || {});
const LAYOUT_TEXT = {
  km:{ invite:"សូមគោរពអញ្ជើញ", guestPh:"ឈ្មោះភ្ញៀវ", groom:"កូនកម្លោះ", bride:"កូនក្រមុំ", open:"បើកធៀបអញ្ជើញ" },
  en:{ invite:"Cordially invited", guestPh:"Guest name", groom:"The Groom", bride:"The Bride", open:"Open invitation" }
};

function layoutOf_(s){
  const id = s && s.layout;
  if(typeof id !== "string" || !Object.prototype.hasOwnProperty.call(LAYOUTS, id)) return null;
  const ly = LAYOUTS[id]; ly.id = id;
  // A layout with  sets:{ key:{ label, thumb, palette, art, clips } }  (e.g. l5 = 3 flower types) gives back the set chosen in s.flowerSet
  // (its own art / palette / clips merged over the layout). Everything else about the layout stays the same.
  if(ly.sets){
    const has = k => typeof k === "string" && Object.prototype.hasOwnProperty.call(ly.sets, k);
    const key = has(s.flowerSet) ? s.flowerSet : (has(ly.defaultSet) ? ly.defaultSet : Object.keys(ly.sets)[0]);
    ly.__v = ly.__v || {};
    if(!ly.__v[key]) ly.__v[key] = Object.assign({}, ly, ly.sets[key], { id:id, setKey:key });
    return ly.__v[key];
  }
  return ly;
}
// Theme object actually used while rendering: the layout's own palette wins over the colour theme.
function layoutTheme_(s){
  const base = THEMES[hasOwn(THEMES, s.theme) ? s.theme : "gold"];
  const ly = layoutOf_(s);
  return ly ? Object.assign({}, base, ly.palette, { ornate:true }) : base;
}

// ---------- pictures + colour filters ----------
// A folder name with an apostrophe (e.g. "Client's side") would break url('...') in CSS and drop the whole picture, so ' becomes %27.
// file:"layouts/l5/images/frames/frame.png" (own layout folder, relative to the site root) is used as it is;
// any other path is still looked up inside images/layouts/ like before.
function lyUrl_(file){ return (assetBase() + (/^layouts\//.test(file) ? "" : (ASSET_DIRS.layout || "images/layouts/")) + file + "?v=" + ASSET_VERSION).replace(/'/g, "%27"); }
// Background picture(s): the exact path first, then a few fallback places (a missing picture is simply skipped by CSS,
// so a wrong folder never breaks anything). spec.tile = repeat the picture at that width in px (for seamless patterns).
function lyBgImages_(file, spec){
  const base = String(file).split("/").pop(), v = "?v=" + ASSET_VERSION, list = [lyUrl_(file)];
  [lyUrl_(base), assetBase() + (ASSET_DIRS.bg || "images/backgrounds/") + base + v, assetBase() + "images/" + base + v]
    .forEach(u => { u = u.replace(/'/g, "%27"); if(list.indexOf(u) < 0) list.push(u); });
  return list.map(u => "url('" + u + "')").join(",");
}
function lyBgSize_(spec){
  return spec && spec.tile ? "background-size:" + spec.tile + "px auto;background-repeat:repeat;background-position:center top;" : "";
}
function lyRgb_(hex){
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
  const n = m ? parseInt(m[1], 16) : 0x888888;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => (v / 255).toFixed(3));
}
function lyFilter_(spec){
  if(!spec) return "";
  if(spec.mode === "tint") return "url(#wibTint-" + (spec.color === "accent2" ? "a2" : (spec.color === "ink" ? "ink" : "a1")) + ")";
  // duo = engraving look: white = see-through, black lines = dark shade of the colour, grey/hatching = lighter shades (keeps the 3-D shading of fine line-art)
  if(spec.mode === "duo") return "url(#wibDuo-" + (spec.color === "accent2" ? "a2" : (spec.color === "ink" ? "ink" : "a1")) + ")";
  // tintK = like "key" (anything that is not white stays fully visible, so thin / grey / dotted line-art does not fade away) but painted in one colour
  if(spec.mode === "tintK") return "url(#wibTintK-" + (spec.color === "accent2" ? "a2" : (spec.color === "ink" ? "ink" : "a1")) + ")";
  if(spec.mode === "key")  return "url(#wibKey)";
  if(spec.mode === "keyG") return "url(#wibKeyG)";
  return "";
}
// Hidden SVG: colour filters (white → see-through) and the photo-hole clip shapes.
function lyDefs_(t, ly){
  const tint = (id, hex) => { const c = lyRgb_(hex); return `<filter id="${id}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  -0.245 -0.822 -0.083 4 -2.95"/></filter>`; };
  const tintK = (id, hex) => { const c = lyRgb_(hex); return `<filter id="${id}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}  -2.126 -7.152 -0.722 10 -0.35"/></filter>`; };
  const duo = (id, hex) => {   // dark = 72% of the colour, light = colour mixed 55% with white; alpha as in "key"
    const c = lyRgb_(hex).map(Number), d = c.map(v => v * 0.72), l = c.map(v => v * 0.45 + 0.55);
    const row = i => { const k = l[i] - d[i]; return `${(k * 0.2126).toFixed(4)} ${(k * 0.7152).toFixed(4)} ${(k * 0.0722).toFixed(4)} 0 ${d[i].toFixed(4)}`; };
    return `<filter id="${id}" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${row(0)}  ${row(1)}  ${row(2)}  -2.126 -7.152 -0.722 10 -0.35"/></filter>`;
  };
  const WHITE = "-2.126 -7.152 -0.722 10 -0.35";   // alpha = 10·(1−luminance) − 0.35 → white (and JPG noise near white) = see-through; the "10" keeps empty (alpha 0) edges see-through
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>`
    + tint("wibTint-a1", t.accent1) + tint("wibTint-a2", t.accent2) + tint("wibTint-ink", t.ink)
    + duo("wibDuo-a1", t.accent1) + duo("wibDuo-a2", t.accent2) + duo("wibDuo-ink", t.ink)
    + tintK("wibTintK-a1", t.accent1) + tintK("wibTintK-a2", t.accent2) + tintK("wibTintK-ink", t.ink)
    + `<filter id="wibKey" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  ${WHITE}"/></filter>`
    + `<filter id="wibKeyG" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  ${WHITE}" result="w"/><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  6 -6 6 0 0.9" result="g"/><feComposite in="w" in2="g" operator="in"/></filter>`
    + `<clipPath id="wibClip-tear" clipPathUnits="objectBoundingBox"><path d="M0.5 0.06C0.60 0.22 0.89 0.38 0.89 0.62C0.89 0.84 0.72 0.95 0.5 0.95C0.28 0.95 0.11 0.84 0.11 0.62C0.11 0.38 0.40 0.22 0.5 0.06Z"/></clipPath>`
    + `<clipPath id="wibClip-arch" clipPathUnits="objectBoundingBox"><path d="M0.205 0.975L0.205 0.47C0.205 0.34 0.34 0.25 0.5 0.19C0.66 0.25 0.795 0.34 0.795 0.47L0.795 0.975Z"/></clipPath>`
    + `<clipPath id="wibClip-circle" clipPathUnits="objectBoundingBox"><circle cx="0.5" cy="0.5" r="0.43"/></clipPath>`
    // shapes that belong to one layout only (layout file: clips:{ "l4-tearL":"M0.5 0.1 L…Z" } → use clip:"l4-tearL")
    + Object.keys((ly && ly.clips) || {}).map(k => `<clipPath id="wibClip-${k}" clipPathUnits="objectBoundingBox"><path d="${ly.clips[k]}"/></clipPath>`).join("")
    + `</defs></svg>`;
}
// <img> that tells its parent when the picture is missing (the parent then gets class ly-missing and shows a plain fallback)
function lyImg_(spec, cls){
  if(!spec || !spec.file) return "";
  const f = lyFilter_(spec);
  return `<img class="${cls}" src="${lyUrl_(spec.file)}" alt="" decoding="async"${f ? ` style="filter:${f}"` : ""} onerror="this.parentNode.classList.add('ly-missing')">`;
}

// ---------- page layers (fixed background + fixed frame) ----------
// frame layout:"full": normally one picture stretched over the 680px page column.
//   fit:"screen"      → stretch it over the WHOLE screen instead
//   stretch:{x:1.6,y:1.5} → (also screen-wide) enlarge by this % of the screen on each side, so the picture's transparent margin goes off-screen
function lyFullFit_(fr){
  if(!fr || (fr.fit !== "screen" && !fr.stretch)) return "";
  const sx = (fr.stretch && Number(fr.stretch.x)) || 0, sy = (fr.stretch && Number(fr.stretch.y)) || 0;
  return `left:${-sx}%;right:${-sx}%;top:${-sy}%;bottom:${-sy}%;width:auto;transform:none;`;
}
// one frame picture -> html  (F = art.frame = the page frame  |  art.coverFrame = the frame of the tap-to-open cover)
// noTrim = do not measure the picture's transparent margin at run time (use the margin:{x,y} written in the layout file)
function lyFrameHtml_(F, noTrim){
  let html = "";
  if(F && F.file){
    const f = lyFilter_(F);
    // bleed:{x,y} (% of frame width) = transparent margin of the frame picture that is pushed off-screen, so the lines reach the screen edge
    const bl = F.bleed, bpos = bl ? `background-position:calc(var(--lyw) * -1 * var(--lybx, ${((bl.x || 0) / 100).toFixed(4)})) calc(var(--lyw) * -1 * var(--lyby, ${((bl.y || 0) / 100).toFixed(4)}));` : "";
    const st = `background-image:url('${lyUrl_(F.file)}');${bpos}`;
    if(F.layout === "slice"){
      // The frame picture only has its ornament in the TOP-LEFT corner (the other corners are mirrored copies, exactly like "quad").
      // So: 4 mirrored corner pieces (ornament, fixed smaller size) + 4 mirrored edge strips (a thin straight piece of the top / left side,
      // stretched), spread over the WHOLE screen -> the lines reach the screen edge on all four sides.
      // scale = ornament size (1 = as big as the 680px frame) · slice = ornament size inside the picture (% of width / height)
      // margin = transparent margin of the picture (fraction of picture width; measured again at run time) · pad = gap kept from the screen edge (px)
      const sl = F.slice || { x:37, y:27 }, mg = F.margin || { x:0.099, y:0.065 };
      const asp = F.aspect || 1.25, sc = F.scale || 0.7, pad = F.pad == null ? 5 : F.pad;
      const img = lyUrl_(F.file), sx = sl.x / 100, sy = sl.y / 100;
      const lineEdge = F.edge === "line";
      const cs = `background-image:url('${img}');background-size:var(--lyw) auto;background-repeat:no-repeat;background-position:0 0;${lineEdge && f ? "filter:" + f + ";" : ""}`;
      const strip = (vb, cls) => `<svg class="e ${cls}" viewBox="${vb}" preserveAspectRatio="none" aria-hidden="true"><image href="${img}" x="0" y="0" width="1" height="${asp}" preserveAspectRatio="none"/></svg>`;
      html += `<div class="ly-slice"${noTrim ? "" : ' data-trim="1"'} style="--lyw:calc(min(100vw,680px) * ${sc});--bw:calc(var(--lyw) * ${sx.toFixed(4)});--bh:calc(var(--lyw) * ${(asp * sy).toFixed(4)});inset:calc(var(--lyw) * -1 * var(--lymy, ${mg.y}) + ${pad}px) calc(var(--lyw) * -1 * var(--lymx, ${mg.x}) + ${pad}px);${!lineEdge && f ? "filter:" + f + ";" : ""}" aria-hidden="true">`
        + `<i style="${cs}left:0;top:0"></i><i style="${cs}right:0;top:0;transform:scaleX(-1)"></i><i style="${cs}left:0;bottom:0;transform:scaleY(-1)"></i><i style="${cs}right:0;bottom:0;transform:scale(-1,-1)"></i>`
        + (lineEdge ? `<b class="ln ln-t"></b><b class="ln ln-b"></b><b class="ln ln-l"></b><b class="ln ln-r"></b>` : (strip(`${(sx + 0.02).toFixed(3)} 0 0.08 ${(asp * sy).toFixed(4)}`, "t") + strip(`${(sx + 0.02).toFixed(3)} 0 0.08 ${(asp * sy).toFixed(4)}`, "b")         + strip(`0 ${(asp * (sy + 0.02)).toFixed(4)} ${sx.toFixed(4)} ${(asp * 0.08).toFixed(4)}`, "l") + strip(`0 ${(asp * (sy + 0.02)).toFixed(4)} ${sx.toFixed(4)} ${(asp * 0.08).toFixed(4)}`, "r")))
        + `</div>`;
      return html;
    }
    if(F.layout === "diag"){
      // 2 corner pieces only — TOP-LEFT (file) and BOTTOM-RIGHT (file2), each its own picture, NOT mirrored (diagonal flower composition)
      // width = size of one piece · offset = gap from the screen edge · z = layer (default 60) · opacity
      const dg = (k, file) => file ? `<img class="dg-${k}" src="${lyUrl_(file)}" alt="" decoding="async" onerror="this.style.display='none'">` : "";
      html += `<div class="ly-frame ly-dg" style="--dg-w:${F.width || "min(28vw,135px)"};--dg-off:${F.offset || "0px"};${F.z != null ? "z-index:" + F.z + ";" : ""}${F.opacity != null ? "opacity:" + F.opacity + ";" : ""}" aria-hidden="true">${dg("tl", F.file)}${dg("br", F.file2)}</div>`;
      return html;
    }
    if(F.layout === "corners"){
      // 4 small corner pieces at the screen corners (the picture has its ornament at the BOTTOM-LEFT, the others are mirrored copies, same as the cover corners)
      // width = size of one corner · offset = gap from the screen edge · z = layer (default 60) · opacity
      html += `<div class="ly-frame ly-cn" style="--cn-w:${F.width || "min(24vw,120px)"};--cn-off:${F.offset || "6px"};--cn-x:${F.offsetX || F.offset || "6px"};${F.z != null ? "z-index:" + F.z + ";" : ""}${F.opacity != null ? "opacity:" + F.opacity + ";" : ""}${f ? "filter:" + f + ";" : ""}" aria-hidden="true">${["bl","tl","br","tr"].map(k => `<img class="cn-${k}" src="${lyUrl_(F.file)}" alt="">`).join("")}</div>`;
      return html;
    }
    if(F.layout === "border"){
      // 9-slice: the 4 corner pieces keep their shape, the 4 edges are TILED (not stretched) -> thin frame that reaches the screen edges on all sides, no distortion
      // border = thickness of the frame (smaller = thinner) | slice = corner size in the picture (px): one number, or [top,right,bottom,left] when the 4 sides differ
      // width = how wide the frame is (default: the whole screen, max 680px)
      const bw = F.border || "min(12vw,60px)", S = Array.isArray(F.slice) ? F.slice : [F.slice || 155, F.slice || 155, F.slice || 155, F.slice || 155];
      const ws = S.map(v => `calc(${bw} * ${(v / S[3]).toFixed(4)})`).join(" ");
      html += `<div class="ly-frame ly-bdr" style="width:${F.width || "min(100vw,680px)"};box-sizing:border-box;border-style:solid;border-color:transparent;border-width:${ws};border-image:url('${lyUrl_(F.file)}') ${S.join(" ")} / ${ws} / 0 round;${f ? "filter:" + f + ";" : ""}" aria-hidden="true"></div>`;
      return html;
    }
    html += (F.layout === "quad")
      ? `<div class="ly-frame ly-quad"${F.bleed && !noTrim ? ' data-trim="1"' : ""} style="--lyw:min(100vw,680px);${f ? "filter:" + f + ";" : ""}" aria-hidden="true"><i style="${st}"></i><i style="${st}"></i><i style="${st}"></i><i style="${st}"></i></div>`
      : `<div class="ly-frame ly-full" style="${st}${lyFullFit_(F)}${F.z != null ? "z-index:" + F.z + ";" : ""}${F.opacity != null ? "opacity:" + F.opacity + ";" : ""}${f ? "filter:" + f + ";" : ""}" aria-hidden="true"></div>`;
  }
  return html;
}
function buildLayoutLayers_(ly, t){
  const A = ly.art;
  let html = lyDefs_(t, ly);
  if(A.bg && A.bg.file){
    const f = lyFilter_(A.bg);
    html += `<div class="ly-bg" style="background-image:${lyBgImages_(A.bg.file, A.bg)};${lyBgSize_(A.bg)}opacity:${A.bg.opacity == null ? 1 : A.bg.opacity};${f ? "filter:" + f + ";" : ""}" aria-hidden="true"></div>`;
  }
  if(A.frame && A.frame.file) html += lyFrameHtml_(A.frame, false);
  return html;
}
function buildLayoutCss_(ly){
  return `
.hero{background:none !important;}
.guest-line{display:none !important;}
body.guest-mode .lang-toggle,body.guest-mode .fx-toggle{top:16px !important;}
@media(max-width:480px){body.guest-mode .lang-toggle,body.guest-mode .fx-toggle{top:10px !important;}}
.ly-bg{position:fixed;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center;background-repeat:no-repeat;}
/* countdown: each unit (days / hours / minutes / seconds) gets its own outline, no fill (same line style as the Save-to-Calendar button) */
.countdown .cd-unit{border:1.5px solid var(--accent-1);border-radius:18px;background:none;padding:12px 0 10px;}
.ly-frame{position:fixed;top:0;bottom:0;left:50%;width:min(100%,680px);transform:translateX(-50%);z-index:60;pointer-events:none;}
.ly-cn{left:0;right:0;width:auto;transform:none;}
.ly-cn img{position:absolute;display:block;width:var(--cn-w);height:auto;filter:drop-shadow(0 4px 6px rgba(0,0,0,.45));}
.ly-cn .cn-bl{left:var(--cn-x);bottom:var(--cn-off);}
.ly-cn .cn-tl{left:var(--cn-x);top:var(--cn-off);transform:scaleY(-1);}
.ly-cn .cn-br{right:var(--cn-x);bottom:var(--cn-off);transform:scaleX(-1);}
.ly-cn .cn-tr{right:var(--cn-x);top:var(--cn-off);transform:scale(-1,-1);}
.ly-dg{left:0;right:0;width:auto;transform:none;}
.ly-dg img{position:absolute;display:block;width:var(--dg-w);height:auto;}
.ly-dg .dg-tl{left:var(--dg-off);top:var(--dg-off);}
.ly-dg .dg-br{right:var(--dg-off);bottom:var(--dg-off);}
.ly-slice{position:fixed;z-index:60;pointer-events:none;}
.ly-slice i{position:absolute;width:var(--bw);height:var(--bh);}
.ly-slice svg.e{position:absolute;overflow:hidden;}
.ly-slice .t,.ly-slice .b{left:var(--bw);width:calc(100% - var(--bw) * 2);height:var(--bh);}
.ly-slice .l,.ly-slice .r{top:var(--bh);height:calc(100% - var(--bh) * 2);width:var(--bw);}
.ly-slice .t{top:0;}.ly-slice .b{bottom:0;transform:scaleY(-1);}
.ly-slice .l{left:0;}.ly-slice .r{right:0;transform:scaleX(-1);}
.ly-slice b.ln{position:absolute;box-sizing:border-box;border:0 solid var(--accent-2);opacity:.95;}
.ly-slice b.ln-t,.ly-slice b.ln-b{left:calc(var(--bw) * .55);right:calc(var(--bw) * .55);height:7px;border-top-width:2px;border-bottom-width:1px;}
.ly-slice b.ln-t{top:calc(var(--bh) * .085);}.ly-slice b.ln-b{bottom:calc(var(--bh) * .085);}
.ly-slice b.ln-l,.ly-slice b.ln-r{top:calc(var(--bh) * .55);bottom:calc(var(--bh) * .55);width:7px;border-left-width:2px;border-right-width:1px;}
.ly-slice b.ln-l{left:calc(var(--bw) * .085);}.ly-slice b.ln-r{right:calc(var(--bw) * .085);}
.ly-full{background-size:100% 100%;background-repeat:no-repeat;background-position:center;}
.ly-quad i{position:absolute;width:50%;height:50%;background-size:200% auto;background-repeat:no-repeat;background-position:0 0;}
.ly-quad i:nth-child(1){left:0;top:0;}
.ly-quad i:nth-child(2){right:0;top:0;transform:scaleX(-1);}
.ly-quad i:nth-child(3){left:0;bottom:0;transform:scaleY(-1);}
.ly-quad i:nth-child(4){right:0;bottom:0;transform:scale(-1,-1);}
.ly-orn-wrap{display:block;text-align:center;margin:0 auto 10px;position:relative;z-index:1;}
.ly-orn-wrap.ly-missing{display:none;}
.ly-orn{display:block;width:100%;height:auto;margin:0 auto;}
.ly-invite{margin:26px auto 0;position:relative;z-index:1;text-align:center;}
.ly-invite-t{margin:0 0 4px;font-size:16px;color:var(--accent-1);letter-spacing:.02em;}
.ly-nf{position:relative;margin:4px auto;}
.ly-nf-img{display:block;width:100%;height:auto;}
.ly-nf-txt{position:absolute;inset:var(--nf-in,20% 15%);display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(15px,4.4vw,21px);font-weight:700;line-height:1.3;color:var(--accent-1);overflow:hidden;font-style:normal;word-break:break-word;}
.ly-nf.ly-fill .ly-nf-txt{background:var(--nf-fill);color:#3B2A1C;border-radius:6px;}
.ly-nf.ly-ph .ly-nf-txt{opacity:.45;font-weight:500;}
.ly-nf.ly-missing{min-height:58px;}
.ly-nf.ly-missing .ly-nf-img{display:none;}
.ly-nf.ly-missing .ly-nf-txt{position:static;border:1px solid var(--accent-2);border-radius:14px;padding:12px 16px;}
.ly-pf{position:relative;margin:14px auto;}
.ly-pf-fr{display:block;width:100%;height:auto;position:relative;z-index:2;pointer-events:none;}
.ly-pf-ph{position:absolute;inset:0;z-index:1;background-color:color-mix(in srgb,var(--accent-1) 14%,transparent);background-size:cover;background-position:center 25%;background-repeat:no-repeat;}
.ly-pf-big{margin-left:50%;margin-right:0;transform:translateX(calc(-50% + var(--dx,0%)));max-width:none;}
.ly-pf.ly-missing{aspect-ratio:4/5;}
.ly-pf.ly-missing .ly-pf-fr{display:none;}
.ly-pf.ly-missing .ly-pf-ph{inset:0 !important;width:auto !important;height:auto !important;border-radius:0 !important;clip-path:inset(0 round 26px) !important;}
.ly-pair{display:flex;justify-content:center;align-items:flex-start;gap:10px;max-width:520px;margin:10px auto 6px;position:relative;z-index:1;}
.ly-pair .ly-col{flex:1 1 0;min-width:0;text-align:center;}
.ly-pair .ly-col:nth-child(2){margin-top:34px;}
.ly-pair .ly-pf{margin:0 auto 4px;}
.ly-cap{font-size:14px;color:var(--accent-1);margin:0;opacity:.95;}
.ly-hero .eyebrow{position:relative;z-index:1;}
.ly-l3.hero.has-cover{padding-top:120px;padding-bottom:130px;}
.ly-l3 .ly-invite-t{color:#fff;text-shadow:0 1px 8px rgba(0,0,0,.65);}
.ly-l2 .names,.ly-l2 .hero-date{position:relative;z-index:1;}
${ly.nameFx ? `
.oc-names,.oc-names *,.ly-nf-txt{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cg fill='none' stroke='%235E3E08' stroke-opacity='.5' stroke-width='.9'%3E%3Cpath d='M0 14L14 0L28 14L14 28Z'/%3E%3Cpath d='M14 5C17 8 17 11 14 14C11 11 11 8 14 5Z'/%3E%3Cpath d='M14 14C18 13 21 11 21 7M14 14C10 13 7 11 7 7' /%3E%3Cpath d='M14 14C18 15 21 17 21 21M14 14C10 15 7 17 7 21'/%3E%3C/g%3E%3Cg fill='%235E3E08' fill-opacity='.45'%3E%3Ccircle cx='14' cy='14' r='1.6'/%3E%3Ccircle cx='0' cy='0' r='1.4'/%3E%3Ccircle cx='28' cy='0' r='1.4'/%3E%3Ccircle cx='0' cy='28' r='1.4'/%3E%3Ccircle cx='28' cy='28' r='1.4'/%3E%3C/g%3E%3Cg fill='none' stroke='%23FFF3C2' stroke-opacity='.45' stroke-width='.6'%3E%3Cpath d='M14.6 5.6C17.4 8.4 17.4 11 14.8 13.4'/%3E%3Cpath d='M1 14.6L14.6 1'/%3E%3C/g%3E%3C/svg%3E"),linear-gradient(100deg,#FFF6CF 0%,#F1D77F 14%,#C8962E 30%,#8E5F12 42%,#E9C566 56%,#FFF1B8 68%,#D4A53C 82%,#FFF6CF 100%) !important;background-size:20px 20px,220% 100% !important;background-clip:text !important;-webkit-background-clip:text !important;-webkit-text-fill-color:transparent !important;color:transparent !important;text-shadow:none !important;letter-spacing:.03em;filter:drop-shadow(0 -1px 0 rgba(255,246,200,.55)) drop-shadow(0 1px 0 #5E3E08) drop-shadow(0 2px 0 #4A3006) drop-shadow(0 4px 3px rgba(0,0,0,.65));animation:lyNameShine 6s ease-in-out infinite alternate;}
@keyframes lyNameShine{from{background-position:0 0,0% 50%;}to{background-position:0 0,100% 50%;}}
@media(prefers-reduced-motion:reduce){.oc-names,.oc-names *,.ly-nf-txt{animation:none !important;}}
` : ""}
${typeof ly.css === "function" ? ly.css(ly) : (ly.css || "")}
${ly.dark ? ".eyebrow,.section-sub,.cd-label,.venue-addr,.gift-hint,footer{opacity:.95 !important;text-shadow:0 1px 4px rgba(0,0,0,.7);}" : ""}
${ly.dark ? ".ly-orn-wrap::before{content:'';position:absolute;inset:-12% -18%;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at center,rgba(3,18,11,.28) 0%,rgba(3,18,11,.12) 45%,rgba(3,18,11,0) 70%);}.ly-orn{filter:drop-shadow(0 1px 3px rgba(0,0,0,.45));}" : ""}
`;
}

// ---------- hero pieces (inside the first screen of the invitation) ----------
function lyPhotoFrame_(spec, src, extraCls){
  // spec.hole = the round opening of the frame, in % of the frame picture (cx,cy = centre, rx,ry = radius).
  // When given, the photo is fitted INSIDE that opening (centred in it). Otherwise the old clip shape is used.
  let clip = "";
  if(spec && spec.hole){
    const h = spec.hole, cx = h.cx == null ? 50 : h.cx, cy = h.cy == null ? 50 : h.cy;
    clip = `inset:auto;left:${(cx - h.rx).toFixed(2)}%;top:${(cy - h.ry).toFixed(2)}%;width:${(h.rx * 2).toFixed(2)}%;height:${(h.ry * 2).toFixed(2)}%;border-radius:50%;`;
  }else if(spec && spec.clip){
    clip = `clip-path:url(#wibClip-${spec.clip});`;
  }
  if(spec && spec.photoPos) clip += `background-position:${spec.photoPos};`;
  const ph = (src ? `background-image:url('${src}');` : "") + (spec && spec.photoDx ? `left:${spec.photoDx}%;right:${-spec.photoDx}%;` : "");
  return `<div class="ly-pf${spec && spec.big ? " ly-pf-big" : ""}${extraCls || ""}" style="width:${spec && spec.width ? spec.width : "60%"}${spec && spec.frameDx ? `;--dx:${spec.frameDx}%` : ""}"><div class="ly-pf-ph" style="${ph}${clip}"></div>${lyImg_(spec, "ly-pf-fr")}</div>`;
}
function lyNameFrame_(spec, text, isPlaceholder){
  const fill = spec && spec.fill ? ` ly-fill" style="--nf-fill:${spec.fill};` : `" style="`;
  return `<div class="ly-nf${isPlaceholder ? " ly-ph" : ""}${(spec && spec.file) ? "" : " ly-missing"}${fill}width:${spec && spec.width ? spec.width : "80%"};--nf-in:${spec && spec.inset ? spec.inset : "20% 15%"};">${lyImg_(spec, "ly-nf-img")}<span class="ly-nf-txt">${text}</span></div>`;
}
function lyGuestBlock_(s, ly, lang){
  const T = LAYOUT_TEXT[lang === "en" ? "en" : "km"];
  const guest = s.__guestName ? escapeHtml(s.__guestName) : "";
  const show = !!(guest || s.__preview);
  const txt = guest || (s.__preview ? T.guestPh : "");
  return `<div class="ly-invite"${show ? "" : ' style="display:none"'}><p class="ly-invite-t">${T.invite}</p>${lyNameFrame_(ly.art.name, txt, !guest)}</div>`;
}
// returns { pre, mid, post } to place around the eyebrow / names of the hero
function lyHeroParts_(s, lang, ctx){
  const ly = layoutOf_(s);
  if(!ly) return { pre:"", mid:"", post:"" };
  const A = ly.art, T = LAYOUT_TEXT[lang === "en" ? "en" : "km"];
  const pre = A.orn ? `<div class="ly-orn-wrap" style="width:${A.orn.width || "60%"}">${lyImg_(A.orn, "ly-orn")}</div>` : "";
  let mid = "";
  if(ly.kind === "single"){
    mid = lyPhotoFrame_(A.photo, ctx.rawCover || "", "");
  }else if(ly.kind === "pair"){
    const real = (s.photos || []).filter(Boolean), art = ctx.artUrls || [];
    const g = real[0] || art[0] || "", b = real[1] || art[1] || "";
    mid = `<div class="ly-pair"><div class="ly-col">${lyPhotoFrame_(A.photo, g, "")}<p class="ly-cap">${T.groom}</p></div><div class="ly-col">${lyPhotoFrame_(A.photo2, b, "")}<p class="ly-cap">${T.bride}</p></div></div>`;
  }
  return { pre, mid, post: lyGuestBlock_(s, ly, lang) };
}
// runtime (guest pages): fill the guest-name frames from ?to=
function lyGuestJs_(){
  return `try{
  var lyTo=new URLSearchParams(window.location.search).get('to');
  if(lyTo){
    document.querySelectorAll('.ly-invite').forEach(function(b){ b.style.display=''; });
    document.querySelectorAll('.ly-nf-txt').forEach(function(x){ x.textContent=lyTo; if(x.parentNode) x.parentNode.classList.remove('ly-ph'); });
  }
}catch(e){}
try{
  var q=document.querySelector('.ly-quad[data-trim="1"],.ly-slice[data-trim="1"]');
  var bi=q&&q.querySelector('i'), mm=bi&&/url\\(["']?([^"')]+)["']?\\)/.exec(bi.style.backgroundImage||'');
  if(mm){
    var im=new Image();
    im.onload=function(){ try{
      var w=Math.min(300,im.naturalWidth), h=Math.max(1,Math.round(im.naturalHeight*w/im.naturalWidth));
      var c=document.createElement('canvas'); c.width=w; c.height=h;
      var x=c.getContext('2d'); x.drawImage(im,0,0,w,h);
      var d=x.getImageData(0,0,w,h).data, mx=w, my=h, X, Y;
      for(Y=0;Y<h/2;Y++){ for(X=0;X<w/2;X++){ if(d[(Y*w+X)*4+3]>40){ if(X<mx) mx=X; if(Y<my) my=Y; } } }
      if(mx<w/4 && my<h/4){ q.style.setProperty('--lybx',(mx/w).toFixed(4)); q.style.setProperty('--lyby',(my/w).toFixed(4)); q.style.setProperty('--lymx',(mx/w).toFixed(4)); q.style.setProperty('--lymy',(my/w).toFixed(4)); }
    }catch(e){} };
    im.src=mm[1];
  }
}catch(e){}`;
}

// ---------- cover helpers (used by the 2 new openings) ----------
// the wax seal picture of the current layout (null = none → old look)
function lySealSpec_(s){
  const ly = layoutOf_(s);
  return (ly && ly.art && ly.art.seal && ly.art.seal.file) ? ly.art.seal : null;
}
// Seal picture addresses: the exact path first, then a few other places (a seal put in the wrong folder still shows).
// NOTE: GitHub Pages is case-sensitive — "goal_tamp4.png" ≠ "Goal_tamp4.PNG".
function lySealUrls_(file){
  const base = String(file).split("/").pop(), v = "?v=" + ASSET_VERSION, root = assetBase(), list = [lyUrl_(file)];
  const add = u => { u = (u + v).replace(/'/g, "%27"); if(list.indexOf(u) < 0) list.push(u); };
  [root + "images/layouts/" + base, root + "images/layouts/open/" + base, root + "images/open/" + base, root + "images/" + base].forEach(add);
  // last resort: another layout's seal (so a seal still shows; tells you this layout's own file is not found)
  Object.keys(LAYOUTS).forEach(k => { const a = LAYOUTS[k].art && LAYOUTS[k].art.seal; if(a && a.file) add(lyUrl_(a.file).split("?")[0]); });
  return list;
}
function lySealImg_(sp, cls){
  const u = lySealUrls_(sp.file);
  return `<img class="${cls}" src="${u[0]}" data-fb="${u.slice(1).join("|")}" alt="" decoding="async" onerror="var a=(this.getAttribute('data-fb')||'').split('|').filter(Boolean);if(a.length){this.setAttribute('data-fb',a.slice(1).join('|'));this.src=a[0];}else{this.parentNode.classList.add('ly-missing');}">`;
}
function lyCoverBits_(s){
  const ly = layoutOf_(s);
  const guest = s.__guestName ? escapeHtml(s.__guestName) : "";
  const T = LAYOUT_TEXT.km;
  const showName = !!(guest || s.__preview);
  if(!ly){
    return { bg:"", frame:"", orn:"", corners:"", nf: guest ? `<p class="oc-guest oc-fade">ជូនចំពោះ ${guest}<br><span>Dear ${guest}</span></p>` : "", generic:!!guest };
  }
  const A = ly.art;
  const bg = (A.bg && A.bg.file) ? `<div class="oc-lybg" style="background-image:${lyBgImages_(A.bg.file, A.bg)};${lyBgSize_(A.bg)}opacity:${A.bg.opacity == null ? 1 : A.bg.opacity};${lyFilter_(A.bg) ? "filter:" + lyFilter_(A.bg) + ";" : ""}"></div>` : "";
  const frame = (A.coverFrame && A.coverFrame.file) ? lyFrameHtml_(A.coverFrame, true) : "";   // art.coverFrame = frame of the tap-to-open cover (the opened invitation uses art.frame)
  const orn = A.orn ? `<div class="ly-orn-wrap oc-fade" style="width:${A.orn.width || "60%"}">${lyImg_(A.orn, "ly-orn")}</div>` : "";
  const corners = (A.corners && A.corners.file && A.corners.file2)
    // 2 own pictures (top-left + bottom-right, not mirrored): art.corners = { file:TL, file2:BR, width, offset }
    ? `<div class="oc-corners" style="--cn-w:${A.corners.width || "min(40vw,200px)"};--cn-off:${A.corners.offset || "0px"}" aria-hidden="true"><div class="oc-cp oc-cp-tl">${lyImg_(A.corners, "oc-cn-img")}</div><div class="oc-cp oc-cp-br">${lyImg_(Object.assign({}, A.corners, { file:A.corners.file2 }), "oc-cn-img")}</div></div>`
    : (A.corners && A.corners.file) ? `<div class="oc-corners" style="--cn-w:${A.corners.width || "min(34vw,170px)"};--cn-off:${A.corners.offset || "6px"}" aria-hidden="true">` + ["bl","tl","br","tr"].map(k => `<div class="oc-corner oc-cn-${k}">${lyImg_(A.corners, "oc-cn-img")}</div>`).join("") + `</div>` : "";
  const CN = A.coverName || A.name;   // art.coverName = name tag used on the cover only (no picture = a plain outlined tag)
  const nf = showName ? `<div class="oc-fade ly-invite"><p class="ly-invite-t">${T.invite}</p>${lyNameFrame_(CN, guest || T.guestPh, !guest)}</div>` : "";
  // title (សូមគោរពអញ្ជើញ) and name box separately — the picture envelope puts the title above its top edge
  const title = showName ? `<p class="ly-invite-t">${T.invite}</p>` : "";
  const box = showName ? `<div class="oc-fade ly-invite">${lyNameFrame_(CN, guest || T.guestPh, !guest)}</div>` : "";
  return { bg, frame, orn, nf, title, box, corners, generic: showName };
}
function lyInitials_(s){
  const pick = v => { const m = String(v || "").trim().match(/[A-Za-z\u1780-\u17B3]/); return m ? m[0] : ""; };
  const a = pick(s.groomNameEn || s.groomName), b = pick(s.brideNameEn || s.brideName);
  return (a && b) ? `${escapeHtml(a)}<i>&amp;</i>${escapeHtml(b)}` : "&#9829;";
}

// ---------- the 2 new cover openings ----------
COVER_STYLES.seal = {
  label:"ស្រោមសំបុត្រ", finishMs:1900,
  icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3.5 7.5 12 14l8.5-6.5"/><circle cx="12" cy="14" r="1.6" fill="currentColor"/></svg>',
  parts:c => {
    const lb = lyCoverBits_(c.s || {});
    const sp = lySealSpec_(c.s || {});
    const lyE = layoutOf_(c.s || {}), EV = (lyE && lyE.art && lyE.art.envelope && lyE.art.envelope.file) ? lyE.art.envelope : null;   // art.envelope = the whole envelope as ONE picture; its flap opens
    // seal for the PICTURE envelope: sits on the envelope (default = where the teardrop is), grows/shrinks with the envelope width.
    // art.envelope: sealX / sealY = centre in % of the envelope · sealSize = px when the envelope is 350px wide (default: seal.size)
    const envSeal = (EV && sp)
      ? '<b class="oc-seal oc-seal-img oc-ei-seal" style="--seal-size:calc(var(--env-w,270px) * ' + (((Number(EV.sealSize) || Number(sp.size) || 62) / 350)).toFixed(4) + ');left:' + (EV.sealX == null ? 50.3 : Number(EV.sealX)) + '%;top:' + (EV.sealY == null ? 29.6 : Number(EV.sealY)) + '%">' + lySealImg_(sp, "oc-seal-pic") + '<span></span></b>'
      : '';
    const sealHtml = sp
      ? '<b class="oc-seal oc-seal-img" style="--seal-size:' + (Number(sp.size) || 84) + 'px">' + lySealImg_(sp, "oc-seal-pic") + '<span>' + lyInitials_(c.s || {}) + '</span></b>'
      : '<b class="oc-seal"><span>' + lyInitials_(c.s || {}) + '</span></b>';
    // art.envFrame = a flower frame picture drawn around the envelope (the envelope sits in its opening):
    //   { file, width:"min(94vw,560px)", ratio:width÷height of the picture, box:[x0,y0,x1,y1] opening of the frame (0–1), fill:0.9 }
    const EF = (lyE && lyE.art && lyE.art.envFrame && lyE.art.envFrame.file) ? lyE.art.envFrame : null;
    const efBox = (EF && Array.isArray(EF.box) && EF.box.length === 4) ? EF.box.map(Number) : [0.1, 0.12, 0.9, 0.88];
    const efW = EF ? (typeof EF.width === "string" ? EF.width : (Number(EF.width) || 360) + "px") : "";
    const envW = EF ? "calc(" + efW + " * " + ((efBox[2] - efBox[0]) * (Number(EF.fill) || 0.92)).toFixed(4) + ")"
                    : (EV ? (typeof EV.width === "string" ? EV.width : (Number(EV.width) || 270) + "px") : "");
    const evVars = EV ? ["vx", "vy", "ty", "fy", "fvy"].map(k => EV[k] == null ? "" : "--ev-" + k + ":" + Number(EV[k]) + "%;").join("") : "";   // flap shape of the picture (% of the picture)
    const envHtml = EV
      ? '<div class="oc-envi" style="--env-w:' + envW + ';--env-ar:' + (Number(EV.ratio) || 0.973) + ';' + evVars + '--env-img:url(\'' + lyUrl_(EV.file) + '\')"><i class="oc-ei-back"></i><i class="oc-ei-card"></i><i class="oc-ei-front"></i><div class="oc-ei-flap"><i class="oc-ei-ff"></i><i class="oc-ei-fb"></i></div>' + envSeal + '<div class="oc-ei-t oc-fade">' + (lb.title || '') + '</div><div class="oc-ei-nf">' + (lb.box || '') + '</div></div>'
      : '';
    const envWrapped = (EV && EF)
      ? '<div class="oc-ef" style="--ef-w:' + efW + ';--ef-ar:' + (Number(EF.ratio) || 1.25) + ';--ef-img:url(\'' + lyUrl_(EF.file) + '\');--ef-cx:' + ((efBox[0] + efBox[2]) / 2).toFixed(4) + ';--ef-cy:' + (((efBox[1] + efBox[3]) / 2) + (Number(EF.dy) || 0)).toFixed(4) + '">' + envHtml + '</div>'
      : envHtml;
    return {
      behind: lb.bg + lb.frame + lb.corners,
      top: lb.orn,
      mid: (EV
        ? envWrapped
        : '<div class="oc-env"><i class="oc-env-back"></i><i class="oc-env-card"></i><i class="oc-env-front"></i><i class="oc-env-flap"></i>' + sealHtml + '</div>' + lb.nf),
      genericBtn: lb.generic
    };
  },
  css:`.oc-corners{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;}
.oc-corner{position:absolute;width:var(--cn-w);aspect-ratio:724/689;filter:drop-shadow(0 4px 6px rgba(0,0,0,.45));}
.oc-cn-img{display:block;width:100%;height:100%;object-fit:contain;}
.oc-corner.ly-missing{display:none;}
.oc-cp{position:absolute;width:var(--cn-w);}
.oc-cp .oc-cn-img{height:auto;object-fit:initial;}
.oc-cp.ly-missing{display:none;}
.oc-cp-tl{left:var(--cn-off);top:var(--cn-off);}
.oc-cp-br{right:var(--cn-off);bottom:var(--cn-off);}
.oc-cn-bl{left:var(--cn-off);bottom:var(--cn-off);}
.oc-cn-tl{left:var(--cn-off);top:var(--cn-off);transform:scaleY(-1);}
.oc-cn-br{right:var(--cn-off);bottom:var(--cn-off);transform:scaleX(-1);}
.oc-cn-tr{right:var(--cn-off);top:var(--cn-off);transform:scale(-1,-1);}
.oc-s-seal{background:radial-gradient(ellipse at 50% 38%,color-mix(in srgb,var(--accent-2) 20%,var(--bg)) 0%,var(--bg) 72%);}
.oc-lybg{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;pointer-events:none;}
.oc-env{position:relative;width:250px;height:166px;margin:6px auto 22px;perspective:900px;}
.oc-env i{position:absolute;display:block;}
.oc-env-back{inset:0;border-radius:6px;background:linear-gradient(145deg,#f3dfb0,#e2c283);box-shadow:0 12px 28px rgba(0,0,0,.28);}
.oc-env-card{left:7%;right:7%;top:7%;height:82%;border-radius:4px;background:#fffaf0;box-shadow:0 1px 6px rgba(0,0,0,.18);transition:transform .95s cubic-bezier(.3,.9,.3,1) .5s;}
.oc-env-front{inset:0;border-radius:6px;background:linear-gradient(160deg,#f7e6bd,#e8cb8f);clip-path:polygon(0 0,50% 56%,100% 0,100% 100%,0 100%);filter:drop-shadow(0 -1px 0 rgba(120,80,20,.25));}
.oc-env-flap{left:0;right:0;top:0;height:58%;background:linear-gradient(180deg,#f9ecc9,#ecd098);clip-path:polygon(0 0,100% 0,50% 100%);transform-origin:50% 0;transition:transform .75s ease .1s;z-index:3;}
.oc-seal{position:absolute;left:50%;top:56%;width:62px;height:62px;margin:-31px 0 0 -31px;z-index:4;border-radius:49% 51% 50% 50%/52% 48% 52% 48%;background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--accent-1) 62%,#fff),var(--accent-1) 55%,color-mix(in srgb,var(--accent-1) 65%,#000));box-shadow:0 4px 10px rgba(0,0,0,.4),inset 0 0 0 3px color-mix(in srgb,var(--accent-2) 55%,transparent);display:grid;place-items:center;color:#fff;font-size:17px;font-weight:700;font-family:var(--body-font-en);transition:transform .5s ease,opacity .4s ease;}
.oc-seal span{display:block;line-height:1;text-shadow:0 1px 1px rgba(0,0,0,.35);}
.oc-seal i{display:inline;position:static;font-style:normal;font-size:.66em;margin:0 1px;opacity:.9;}
.oc-seal-img{width:var(--seal-size,84px);height:var(--seal-size,84px);margin:calc(var(--seal-size,84px) / -2) 0 0 calc(var(--seal-size,84px) / -2);}
.oc-seal-pic{display:block;width:100%;height:100%;object-fit:contain;}
.oc-seal-img:not(.ly-missing){background:none;box-shadow:none;border-radius:0;filter:drop-shadow(0 5px 7px rgba(0,0,0,.4));}
.oc-seal-img:not(.ly-missing) span{display:none;}
.oc-seal-img:not(.ly-missing){animation:oc-sealpop 3.2s ease-in-out infinite;}
.oc-seal-img:not(.ly-missing)::before,.oc-seal-img:not(.ly-missing)::after{content:"";position:absolute;inset:6%;border:2px solid color-mix(in srgb,var(--accent-2) 85%,transparent);border-radius:50%;pointer-events:none;opacity:0;animation:oc-sealring 4.2s ease-out infinite;}
.oc-seal-img:not(.ly-missing)::after{animation-delay:2.1s;}
@keyframes oc-sealpop{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}
@keyframes oc-sealring{0%{transform:scale(.8);opacity:.9;}100%{transform:scale(1.7);opacity:0;}}
.open-cover.opening .oc-seal-img{animation:none;}
.open-cover.opening .oc-seal-img::before,.open-cover.opening .oc-seal-img::after{animation:none;opacity:0;}
@media(prefers-reduced-motion:reduce){.oc-seal-img,.oc-seal-img::before,.oc-seal-img::after{animation:none !important;}}
.oc-seal-img.ly-missing .oc-seal-pic{display:none;}
.open-cover.opening .oc-seal{transform:scale(1.45) rotate(18deg);opacity:0;}
.open-cover.opening .oc-env-flap{transform:rotateX(180deg);}
.open-cover.opening .oc-env-card{transform:translateY(-58%);}
.open-cover.opening .oc-env{transform:scale(1.35);opacity:0;transition:transform .8s ease 1.15s,opacity .6s ease 1.25s;}
/* ---- envelope made from ONE picture (layout art.envelope): the same picture is cut into body + flap ---- */
.oc-envi{position:relative;width:var(--env-w,270px);aspect-ratio:var(--env-ar,.973);height:auto;margin:6px calc(50% - var(--env-w,270px) / 2) 22px;perspective:1100px;}   /* --env-ar = width ÷ height of the picture */
.oc-envi i,.oc-envi b{position:absolute;display:block;}
.oc-ei-back{inset:0;z-index:0;background:linear-gradient(180deg,#bdb698,#d6cfb2 55%,#e6e0c9);box-shadow:0 14px 28px rgba(60,45,15,.36);}
.oc-ei-card{left:8%;right:8%;top:9%;height:72%;z-index:2;background:linear-gradient(180deg,#fffef9,#fbf6e8);border:1px solid rgba(186,146,60,.6);box-shadow:0 1px 7px rgba(0,0,0,.2),inset 0 0 0 4px #fffef9,inset 0 0 0 5px rgba(186,146,60,.35);transition:transform .95s cubic-bezier(.3,.9,.3,1) .5s;}
.oc-ei-front{inset:0;z-index:3;background:var(--env-img) 0 0/100% 100% no-repeat;clip-path:polygon(0 var(--ev-ty,.85%),var(--ev-vx,50.3%) var(--ev-vy,54.2%),100% var(--ev-ty,.85%),100% 100%,0 100%);}
.oc-ei-flap{position:absolute;inset:0;z-index:4;transform-origin:50% 0;transform-style:preserve-3d;transition:transform .8s ease .1s;}
.oc-ei-ff,.oc-ei-fb{inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;clip-path:polygon(0 0,100% 0,100% var(--ev-fy,1.2%),var(--ev-vx,50.3%) var(--ev-fvy,54.6%),0 var(--ev-fy,1.2%));}
.oc-ei-ff{background:var(--env-img) 0 0/100% 100% no-repeat;}
.oc-ei-fb{transform:rotateY(180deg);background:linear-gradient(0deg,#cfc7a8,#e9e3cd 70%,#f1ecda);}
.open-cover.opening .oc-ei-flap{transform:rotateX(180deg);z-index:1;}
.open-cover.opening .oc-ei-card{transform:translateY(-52%);}
.open-cover.opening .oc-envi{transform:scale(1.3);opacity:0;transition:transform .8s ease 1.15s,opacity .6s ease 1.25s;}
@media(max-height:640px){.oc-envi{transform:scale(.8);margin-bottom:10px;}}
.oc-ei-nf{position:absolute;left:5%;right:5%;top:57%;bottom:3%;z-index:5;display:flex;align-items:center;justify-content:center;transition:opacity .35s ease;}
.oc-ei-t{position:absolute;left:0;right:0;bottom:100%;margin-bottom:6px;text-align:center;z-index:5;pointer-events:none;}   /* sits right on the top edge of the envelope */
.oc-ei-t .ly-invite-t{margin:0;font-size:max(14px,calc(var(--env-w,270px) * .045));color:#7c5316;}
.oc-ei-nf .ly-invite{margin:0;width:100%;}
.oc-ef{position:relative;width:var(--ef-w);aspect-ratio:var(--ef-ar,1.25);margin:0 calc(50% - var(--ef-w) / 2) 18px;flex:none;background:var(--ef-img) center/100% 100% no-repeat;transition:opacity .6s ease 1.25s;}
.oc-ef .oc-envi{position:absolute;margin:0;left:calc(var(--ef-cx,.5) * 100% - var(--env-w) / 2);top:calc(var(--ef-cy,.5) * 100% - var(--env-w) / var(--env-ar) / 2);}
.open-cover.opening .oc-ef{opacity:0;}
.oc-ei-nf .ly-nf{width:60% !important;}   /* keep the name frame inside the lower part of the envelope */
.oc-ei-nf .ly-invite-t{margin:0 0 2px;font-size:calc(var(--env-w,270px) * .042);color:#7c5316;}
.open-cover.opening .oc-ei-nf{opacity:0;}
@media(max-height:640px){.oc-env{transform:scale(.8);margin-bottom:10px;}}`
};
COVER_STYLES.tap = {
  label:"ចុចដើម្បីបើក", finishMs:1500,
  icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/></svg>',
  parts:c => {
    const lb = lyCoverBits_(c.s || {});
    const sp = lySealSpec_(c.s || {});
    let sealCss = "";
    if(sp){
      const S = Number(sp.size) || 108;
      const fb = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23C9A227'/%3E%3Cpath d='M40 30v40l32-20z' fill='%23fff'/%3E%3C/svg%3E\")";
      sealCss = '<style>'
        + '.oc-s-tap .oc-btn{width:' + S + 'px;height:' + S + 'px;border-radius:50%;box-shadow:none;'
        + 'background:var(--seal-img,none) center/contain no-repeat,' + fb + ' center/58% no-repeat;'
        +   'filter:drop-shadow(0 5px 7px rgba(0,0,0,.38));transition:transform .55s ease,opacity .45s ease;}'
        + '.oc-s-tap .oc-btn{animation:oc-sealpop 3.2s ease-in-out infinite;}'
        + '.oc-s-tap .oc-btn::before,.oc-s-tap .oc-btn::after{content:"";position:absolute;inset:6%;margin:0;border:2px solid color-mix(in srgb,var(--accent-2) 85%,transparent);border-radius:50%;background:none;pointer-events:none;opacity:0;animation:oc-sealring 4.2s ease-out infinite;}'
        + '.oc-s-tap .oc-btn::after{animation-delay:2.1s;}'
        + '@keyframes oc-sealpop{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}'
        + '@keyframes oc-sealring{0%{transform:scale(.8);opacity:.9;}100%{transform:scale(1.7);opacity:0;}}'
        + '.open-cover.opening .oc-s-tap .oc-btn::before,.open-cover.opening.oc-s-tap .oc-btn::before,.open-cover.opening.oc-s-tap .oc-btn::after{animation:none;opacity:0;}'
        + '.open-cover.opening.oc-s-tap .oc-btn{animation:none;}'
        + '@media(prefers-reduced-motion:reduce){.oc-s-tap .oc-btn,.oc-s-tap .oc-btn::before,.oc-s-tap .oc-btn::after{animation:none !important;}}'
        + '.open-cover.opening.oc-s-tap .oc-btn{transform:scale(1.4) rotate(14deg);opacity:0;}'
        + (sp.under ? '.oc-s-tap .oc-inner>*{order:0;}.oc-s-tap .oc-names{order:1;margin-bottom:8px;}.oc-s-tap .oc-btn{order:2;margin-top:4px;}.oc-s-tap .oc-tap-label{order:3;margin:6px 0 18px;}.oc-s-tap .ly-invite{order:4;}.oc-s-tap .oc-hint{order:5;}' : '')
        + '</style><script>(function(){var u=' + JSON.stringify(lySealUrls_(sp.file)).replace(/</g, "\\u003c") + ',i=0;function t(){if(i>=u.length)return;var m=new Image();m.onload=function(){document.documentElement.style.setProperty("--seal-img","url(\\""+u[i]+"\\")");};m.onerror=function(){i++;t();};m.src=u[i];}t();})();</script>';
    }
    return {
      behind: lb.bg + lb.frame + lb.corners + sealCss,
      top: lb.orn,
      mid: lb.nf,
      after: '<p class="oc-tap-label oc-fade">ចុចដើម្បីបើក<span>Tap to Open</span></p>',
      genericBtn: true
    };
  },
  css:`.oc-s-tap{background:radial-gradient(ellipse at 50% 30%,color-mix(in srgb,var(--accent-2) 24%,var(--bg)) 0%,var(--bg) 74%);clip-path:circle(150% at 50% 80%);transition:clip-path 1.25s cubic-bezier(.7,0,.3,1);}
.open-cover.opening.oc-s-tap{clip-path:circle(0% at 50% 80%);}
.oc-corners{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;}
.oc-corner{position:absolute;width:var(--cn-w);aspect-ratio:724/689;filter:drop-shadow(0 4px 6px rgba(0,0,0,.45));}
.oc-cn-img{display:block;width:100%;height:100%;object-fit:contain;}
.oc-corner.ly-missing{display:none;}
.oc-cp{position:absolute;width:var(--cn-w);}
.oc-cp .oc-cn-img{height:auto;object-fit:initial;}
.oc-cp.ly-missing{display:none;}
.oc-cp-tl{left:var(--cn-off);top:var(--cn-off);}
.oc-cp-br{right:var(--cn-off);bottom:var(--cn-off);}
.oc-cn-bl{left:var(--cn-off);bottom:var(--cn-off);}
.oc-cn-tl{left:var(--cn-off);top:var(--cn-off);transform:scaleY(-1);}
.oc-cn-br{right:var(--cn-off);bottom:var(--cn-off);transform:scaleX(-1);}
.oc-cn-tr{right:var(--cn-off);top:var(--cn-off);transform:scale(-1,-1);}
.oc-lybg{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;pointer-events:none;}
.oc-s-tap .oc-names{margin-bottom:18px;}
.oc-s-tap .oc-btn{position:relative;width:86px;height:86px;padding:0;margin-top:10px;border-radius:50%;justify-content:center;align-items:center;}
.oc-s-tap .oc-btn span{display:none;}
.oc-s-tap .oc-btn::before{content:"";border-left:25px solid #fff;border-top:16px solid transparent;border-bottom:16px solid transparent;margin-left:8px;}
.oc-s-tap .oc-btn::after{content:"";position:absolute;inset:-11px;border-radius:50%;border:2px solid color-mix(in srgb,var(--accent-1) 65%,transparent);animation:oc-tapring 2.2s ease-out infinite;}
@keyframes oc-tapring{0%{transform:scale(.85);opacity:.95;}100%{transform:scale(1.55);opacity:0;}}
.open-cover.opening .oc-btn::after{animation:none;opacity:0;}
.oc-tap-label{margin:16px 0 0;font-size:14px;color:var(--ink);opacity:.8;line-height:1.6;}
.oc-tap-label span{display:block;font-family:var(--body-font-en);font-style:italic;font-size:13px;}
@media(prefers-reduced-motion:reduce){.oc-s-tap .oc-btn::after{animation:none;}}`
};