/* Gradient-gold variant: every solid gold colour on the page becomes a metallic gold gradient —
   text, backgrounds, borders, SVG icons, ::before/::after parts, and hover states.
   Loaded only on the *-gold.html copies, so the main site stays untouched. */
(function () {
  if (window.__sjGG) return; window.__sjGG = true;
  const STOPS = [['0%', '#f7e6ae'], ['38%', '#e2c277'], ['70%', '#b88c3c'], ['100%', '#ecd28f']];
  const TEXT = 'linear-gradient(180deg,' + STOPS.map(s => s[1] + ' ' + s[0]).join(',') + ')';
  const FILL = 'linear-gradient(135deg,#f3dfa2 0%,#d6b56a 32%,#a98336 62%,#f1d995 100%)';
  const css = `
    .gg-t{background-image:${TEXT}!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important}
    .gg-t.gg-glow{text-shadow:none!important;filter:drop-shadow(0 0 18px rgba(214,187,125,.38))}
    .gg-b{background-image:${FILL}!important}
    .gb{border-color:transparent!important}
    .gb>.gb-ring{background:conic-gradient(from var(--gba),transparent 0 62%,rgba(255,240,205,.95) 74%,transparent 84%),linear-gradient(135deg,rgba(243,223,162,.5),rgba(169,131,54,.38) 55%,rgba(241,217,149,.5))!important}
    .gg-bd{border-image:${FILL} 1!important}
    .gg-bdr{background:linear-gradient(var(--gg-bg),var(--gg-bg)) padding-box,${FILL} border-box!important;border-color:transparent!important}
    .gg-ring{background:${FILL} border-box!important;border-color:transparent!important;-webkit-mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) padding-box exclude,linear-gradient(#000 0 0)}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const pst = document.createElement('style'); document.head.appendChild(pst);          // generated ::before/::after rules
  // shared SVG gradient for icon fills / strokes
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  defs.setAttribute('width', 0); defs.setAttribute('height', 0); defs.style.position = 'absolute'; defs.setAttribute('aria-hidden', 'true');
  defs.innerHTML = '<defs><linearGradient id="ggGrad" x1="0" y1="0" x2="0" y2="1">' + STOPS.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"/>`).join('') + '</linearGradient></defs>';
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
    prules.set(which + el.dataset.gg, sel + '{' + (gBg ? `background-image:${FILL}!important;` : '') +
      (gTx ? `background-image:${TEXT}!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;` : '') +
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
    const gt = hasOwnText(el) && isGold(cs.color);
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
