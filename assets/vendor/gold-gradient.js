/* Gradient-gold variant: every solid gold colour on the page becomes a metallic gold gradient —
   text, backgrounds, borders, SVG icons, ::before/::after parts, and hover states.
   Loaded only on the *-gold.html copies, so the main site stays untouched. */
(function () {
  if (window.__sjGG) return; window.__sjGG = true;
  // periodic gold: dark → light → dark → light → dark over 200% width, so shifting by one width loops seamlessly
  const P = '#b0843a 0%,#e3c47c 12%,#f8e8b2 25%,#e3c47c 38%,#b0843a 50%,#e3c47c 62%,#f8e8b2 75%,#e3c47c 88%,#b0843a 100%';
  const TEXT = 'linear-gradient(90deg,' + P + ')';
  const FILL = 'linear-gradient(90deg,' + P + ')';
  const RUN = 'background-size:200% 100%!important;animation:ggRun 5s linear infinite';
  const css = `
    @keyframes ggRun{from{background-position:0% 0}to{background-position:-200% 0}}
    @media (prefers-reduced-motion:reduce){.gg-t,.gg-b,.gg-bd,.gg-bdr,.gg-ring{animation:none!important}}
    .gg-t{${RUN};background-image:${TEXT}!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important}
    .gg-t{filter:drop-shadow(0 0 .5px rgba(255,236,180,.45)) drop-shadow(0 0 4px rgba(236,198,118,.22))}
    h1.gg-t,h2.gg-t,.work-title.gg-t,.lx-title .gg-t,h2 .gg-t,.phil-line .gg-t{filter:drop-shadow(0 0 .6px rgba(255,236,180,.5)) drop-shadow(0 0 7px rgba(236,198,118,.2))}
    .gg-t.gg-glow{text-shadow:none!important;filter:drop-shadow(0 0 .6px rgba(255,236,180,.5)) drop-shadow(0 0 8px rgba(236,198,118,.24))}
    .gg-eye{color:#f4efe8!important;-webkit-text-fill-color:#f4efe8!important;background-image:none!important;filter:none!important;animation:none!important}
    .gg-b{${RUN};background-image:${FILL}!important}
    .gb{border-color:transparent!important}
    .gb>.gb-ring{background:conic-gradient(from var(--gba),transparent 0 62%,rgba(255,240,205,.95) 74%,transparent 84%),linear-gradient(135deg,rgba(243,223,162,.5),rgba(169,131,54,.38) 55%,rgba(241,217,149,.5))!important}
    .gg-bd{border-image:${FILL} 1!important}
    .gg-bdr{background:linear-gradient(var(--gg-bg),var(--gg-bg)) padding-box,${FILL} border-box!important;border-color:transparent!important}
    .gg-ring{${RUN};background:${FILL} border-box!important;border-color:transparent!important;-webkit-mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) padding-box exclude,linear-gradient(#000 0 0)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const pst = document.createElement('style'); document.head.appendChild(pst);          // generated ::before/::after rules
  // shared SVG gradient for icon fills / strokes
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', 0); defs.setAttribute('height', 0); defs.style.position = 'absolute'; defs.setAttribute('aria-hidden', 'true');
  const reduceM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  defs.innerHTML = '<defs><linearGradient id="ggGrad" x1="0" y1="0" x2="1" y2="0" spreadMethod="repeat">' +
    '<stop offset="0" stop-color="#b0843a"/><stop offset=".25" stop-color="#e3c47c"/><stop offset=".5" stop-color="#f8e8b2"/><stop offset=".75" stop-color="#e3c47c"/><stop offset="1" stop-color="#b0843a"/>' +
    (reduceM ? '' : '<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="-1 0" dur="2.5s" repeatCount="indefinite"/>') +
    '</linearGradient></defs>';
  const mountDefs = () => document.body.prepend(defs);

  function isGold(c) {
    const m = c && c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); if (!m) return false;
    if (m[4] !== undefined && +m[4] < .35) return false;
    const r = m[1] / 255, g = m[2] / 255, b = m[3] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (d < .12) return false;
    const s = d / (1 - Math.abs(2 * l - 1)); let h;
    if (mx === r) h = 60 * (((g - b) / d) % 6); else if (mx === g) h = 60 * ((b - r) / d + 2); else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
    return h >= 28 && h <= 56 && s >= .3 && l >= .32 && l <= .78;      // the light cream text colour is not gold
  }
  window.__ggIsGold = isGold;

  // eyebrow = small, widely tracked, all-caps gold label → white
  function isEyebrow(el, cs) {
    if (el.classList.contains('gg-eye')) return true;
    if (el.closest('.gb,button,.lx-doc,.frame,.phone')) return false;
    const fs = parseFloat(cs.fontSize), ls = parseFloat(cs.letterSpacing) || 0, txt = el.textContent.trim();
    const caps = cs.textTransform === 'uppercase' || (/[A-Z]/.test(txt) && txt === txt.toUpperCase());
    return fs <= 14.5 && ls >= fs * .08 && caps && isGold(cs.color);
  }
  // all-caps headings → title case (small words lower, acronyms kept)
  const SMALL = /^(a|an|and|the|of|in|on|at|to|for|by|with|or|from)$/, ACR = /^(AI|UI|UX|UAE|LLC|FZ|PD|ST|3D)$/;
  function smartCaps(h) {
    if (h.dataset.ggcase || h.closest('.lx-doc,.frame,.phone,.wordmark')) return;
    const cs = getComputedStyle(h), nodes = [], w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) nodes.push(n);
    const full = nodes.map(x => x.textContent).join('');
    const letters = full.replace(/[^A-Za-z]/g, '');
    const allCaps = cs.textTransform === 'uppercase' || (letters.length > 2 && letters === letters.toUpperCase());
    h.dataset.ggcase = '1'; if (!allCaps) return;
    let i = 0; const out = full.replace(/[A-Za-z0-9&'’]+/g, word => {
      const first = i++ === 0, up = word.toUpperCase();
      if (ACR.test(up)) return up;
      const lw = word.toLowerCase();
      return (!first && SMALL.test(lw)) ? lw : lw.charAt(0).toUpperCase() + lw.slice(1);
    });
    let k = 0; nodes.forEach(x => { const len = x.textContent.length; x.textContent = out.slice(k, k + len); k += len; });
    h.style.setProperty('text-transform', 'none', 'important');
    h.querySelectorAll('*').forEach(c => c.style.setProperty('text-transform', 'none', 'important'));
  }
  const HEADS = 'h1,h2,h3,h4,.lx-title,.work-title,.ps-name,.phil-title';
  // headings split into one span per letter (reveal animations): once the letters have landed,
  // the heading itself carries one continuous gradient instead of a separate gradient per letter
  function splitSettled(h) {
    if (!h) return false;
    const kids = [...h.children];
    if (kids.length < 4 || !kids.every(k => k.tagName === 'SPAN' && k.textContent.length <= 1)) return false;
    return kids.every(k => { const c = getComputedStyle(k); return c.transform === 'none' && c.filter === 'none' && c.opacity === '1'; });
  }

  const hasOwnText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  // things that are already gradients or must keep their own colours
  const SKIP = 'script,style,canvas,img,video,iframe,.gb-fill,.gb-halo,.gb-ring,.wordmark,.lg-mark,.lx-chip,#ggGrad';
  const opaque = c => { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); return m && (m[4] === undefined || +m[4] > .9); };
  let pid = 0; const prules = new Map();
  function pseudo(el, which) {
    const ps = getComputedStyle(el, which); if (!ps.content || ps.content === 'none' || ps.content === 'normal') return;
    const key = which + (el.dataset.gg || ''), had = prules.has(key);
    const gBg = (ps.backgroundImage === 'none' || had) && isGold(ps.backgroundColor);   // our rule only adds the image, colour stays
    const gTx = ps.content.length > 2 && isGold(ps.color);
    const bdGold = parseFloat(ps.borderTopWidth) > 0 && (isGold(ps.borderTopColor) || (had && prules.get(key).includes('padding-box')));
    const pRound = parseFloat(ps.borderTopLeftRadius) > 6;
    const gBd = bdGold && !pRound;
    const gRing = bdGold && pRound && opaque(ps.backgroundColor) ? ps.backgroundColor : null;
    if (!gBg && !gTx && !gBd && !gRing) { if (had) { prules.delete(key); flush(); } return; }
    if (!el.dataset.gg) el.dataset.gg = 'g' + (++pid);
    const sel = `[data-gg="${el.dataset.gg}"]${which}`;
    prules.set(which + el.dataset.gg, sel + '{' + (gBg ? `${RUN};background-image:${FILL}!important;` : '') +
      (gTx ? `${RUN};background-image:${TEXT}!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;` : '') +
      (gBd ? `border-image:${FILL} 1!important;` : '') +
      (gRing ? `background:linear-gradient(${gRing},${gRing}) padding-box,${FILL} border-box!important;border-color:transparent!important;` : '') + '}');
    flush();
  }
  let fl = 0; const flush = () => { cancelAnimationFrame(fl); fl = requestAnimationFrame(() => { pst.textContent = [...prules.values()].join('\n'); }); };
  function one(el) {
    if (el.closest(SKIP)) return;
    const cs = getComputedStyle(el), tag = el.tagName.toLowerCase();
    if (el instanceof SVGElement) {                                     // icons: gradient fill / stroke
      if (tag === 'svg' || tag === 'defs' || tag === 'stop' || tag === 'lineargradient') return;
      ['fill', 'stroke'].forEach(pr => {
        const mark = 'gg' + pr;
        if (el.dataset[mark]) el.style.removeProperty(pr);              // re-read the real colour (hover may have changed it)
        const v = getComputedStyle(el)[pr];
        if (v && v !== 'none' && !/url\(/.test(v) && isGold(v)) { el.style.setProperty(pr, 'url(#ggGrad)', 'important'); el.dataset[mark] = '1'; }
        else delete el.dataset[mark];
      });
      return;
    }
    // text
    const hEl = el.closest(HEADS), head = hEl && !el.closest('.lx-doc,.frame,.phone,.screen,.pc-mock,.lb');
    if (hEl && head) smartCaps(hEl);
    const eye = hasOwnText(el) && !head && isEyebrow(el, cs);
    el.classList.toggle('gg-eye', eye);
    let gt = !eye && hasOwnText(el) && (isGold(cs.color) || !!head);
    if (head && hEl !== el && el.parentElement === hEl && splitSettled(hEl)) gt = false;      // letter inside a settled split heading
    if (head && hEl === el && splitSettled(el)) gt = true;                                     // the split heading itself
    el.classList.toggle('gg-t', gt);
    if (cs.textShadow && cs.textShadow !== 'none' && !el.classList.contains('gg-glow')) el.dataset.ggglow = '1';
    el.classList.toggle('gg-glow', gt && el.dataset.ggglow === '1');
    // background
    const bgImg = cs.backgroundImage;
    const gb = (bgImg === 'none' || el.classList.contains('gg-b')) && isGold(cs.backgroundColor);
    el.classList.toggle('gg-b', gb);
    // borders
    const sides = ['Top', 'Right', 'Bottom', 'Left'].filter(sd => parseFloat(cs['border' + sd + 'Width']) > 0 && isGold(cs['border' + sd + 'Color']));
    const round = parseFloat(cs.borderTopLeftRadius) > 6 || parseFloat(cs.borderBottomRightRadius) > 6;   // tiny radii take border-image
    if (sides.length && !round) el.classList.add('gg-bd');
    else if (sides.length && round && bgImg === 'none' && opaque(cs.backgroundColor)) { el.style.setProperty('--gg-bg', cs.backgroundColor); el.classList.add('gg-bdr'); }
    else if (sides.length && round && !el.children.length && !hasOwnText(el) && (bgImg === 'none' || el.classList.contains('gg-ring'))) el.classList.add('gg-ring');
    else if (!sides.length && !el.classList.contains('gg-bdr') && !el.classList.contains('gg-ring')) el.classList.remove('gg-bd');
    pseudo(el, '::before'); pseudo(el, '::after');
  }
  function scan(root) { const r = root || document.body; if (r.nodeType === 1) { one(r); r.querySelectorAll('*').forEach(one); } }
  let t = null, pending = new Set();
  const later = (node) => { if (node) pending.add(node); clearTimeout(t); t = setTimeout(() => {
    if (pending.size && pending.size < 40) pending.forEach(n => n.isConnected && scan(n)); else scan();
    pending.clear(); }, 180); };
  const go = () => { mountDefs(); scan(); setTimeout(() => scan(), 1500); setTimeout(() => scan(), 4000); };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', go) : go();
  addEventListener('sj:loaded', () => later());
  new MutationObserver(ms => ms.forEach(m => later(m.target.nodeType === 1 ? m.target : m.target.parentElement)))
    .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
  // hover-only gold: check the hovered element (and its parent) after its colour transition settles
  addEventListener('transitionend', e => { if (e.target.nodeType === 1) later(e.target.parentElement || e.target); }, true);
  addEventListener('mouseover', e => { const el = e.target.closest && (e.target.closest('a,button,li,[class]') || e.target); later(el); setTimeout(() => later(el), 700); }, true);
  addEventListener('mouseout', e => { const el = e.target.closest && (e.target.closest('a,button,li,[class]') || e.target); setTimeout(() => later(el), 700); }, true);
})();
