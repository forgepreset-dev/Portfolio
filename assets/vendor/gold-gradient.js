/* Gradient-gold variant: every solid gold colour on the page becomes a metallic gold gradient.
   Loaded only on the *-gold.html copies, so the main site stays untouched. */
(function () {
  if (window.__sjGG) return; window.__sjGG = true;
  const TEXT = 'linear-gradient(180deg,#f7e6ae 0%,#e2c277 38%,#b88c3c 70%,#ecd28f 100%)';
  const FILL = 'linear-gradient(135deg,#f3dfa2 0%,#d6b56a 32%,#a98336 62%,#f1d995 100%)';
  const css = `.gg-t{background-image:${TEXT}!important;-webkit-background-clip:text!important;background-clip:text!important;
      -webkit-text-fill-color:transparent!important;color:transparent!important}
    .gg-t.gg-glow{text-shadow:none!important;filter:drop-shadow(0 0 18px rgba(214,187,125,.38))}
    .gg-b{background-image:${FILL}!important}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // is this colour gold? (warm hue, enough saturation, mid lightness)
  function isGold(c) {
    const m = c && c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); if (!m) return false;
    if (m[4] !== undefined && +m[4] < .35) return false;
    const r = m[1] / 255, g = m[2] / 255, b = m[3] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    if (d < .12) return false;
    const s = d / (1 - Math.abs(2 * l - 1)); let h;
    if (mx === r) h = 60 * (((g - b) / d) % 6); else if (mx === g) h = 60 * ((b - r) / d + 2); else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
    return h >= 28 && h <= 56 && s >= .3 && l >= .32 && l <= .78;   // excludes the light cream text colour
  }
  const hasOwnText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const SKIP = 'script,style,svg,canvas,img,video,.gb,.say-hi,.sj-snd,.gb-fill,.gb-halo,.gb-ring,.wordmark,.lg-mark,.lx-chip,.ps-tile';
  function scan(root) {
    (root || document.body).querySelectorAll('*').forEach(el => {
      if (el.closest(SKIP) || el.classList.contains('gg-t') || el.classList.contains('gg-b')) return;
      const cs = getComputedStyle(el);
      if (hasOwnText(el) && isGold(cs.color)) {
        el.classList.add('gg-t');
        if (cs.textShadow && cs.textShadow !== 'none') el.classList.add('gg-glow');
      }
      if (cs.backgroundImage === 'none' && isGold(cs.backgroundColor)) el.classList.add('gg-b');
    });
  }
  let t = null; const later = () => { clearTimeout(t); t = setTimeout(() => scan(), 250); };
  const go = () => { scan(); setTimeout(scan, 1500); setTimeout(scan, 4000); };
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', go) : go();
  addEventListener('sj:loaded', later);
  // classes toggled later (scroll reveals, '.on' states) can turn things gold — rescan, throttled
  new MutationObserver(later).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
})();
