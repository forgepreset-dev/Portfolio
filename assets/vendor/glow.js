/* Stephen J — animated glow buttons.
   Main buttons: dark glass pill with a light running around the border, twinkling sparkle icon;
   on hover the pill blooms into a glowing gold fill with an inner light and halo.
   Secondary buttons: the running border light + animated arrows. */
(function () {
  if (window.__sjGlow) return; window.__sjGlow = true;
  const MAIN = '.cta-primary,.live,.send,.btn-gold';
  const SUB = '.cta-ghost,.say-hi,.pill,.btn-ghost';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = `
@property --gba{syntax:'<angle>';initial-value:0deg;inherits:false}
.gb{position:relative!important;isolation:isolate;overflow:visible!important;
  transition:color .7s cubic-bezier(.16,1,.3,1),box-shadow .9s cubic-bezier(.16,1,.3,1),background .7s,transform .5s cubic-bezier(.16,1,.3,1)!important}
.gb>.gb-ring,.gb>.gb-fill,.gb>.gb-halo{position:absolute;border-radius:inherit;pointer-events:none}
/* light running around the border */
.gb>.gb-ring{inset:0;z-index:2;padding:1.3px;
  background:conic-gradient(from var(--gba),transparent 0 62%,rgba(255,240,205,.0) 64%,rgba(255,240,205,.95) 74%,rgba(255,240,205,0) 84%,transparent 100%),
             linear-gradient(rgba(214,187,125,.32),rgba(214,187,125,.32));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
  animation:gbSpin 4.2s linear infinite}
@keyframes gbSpin{to{--gba:360deg}}
/* main: dark glass at rest */
.gb-main{background:rgba(20,17,12,.78)!important;color:#f1e4c2!important;border-color:transparent!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 0 0 rgba(214,187,125,0)!important;
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
/* gold fill with an inner light rising from the bottom */
.gb-main>.gb-fill{inset:0;z-index:-1;opacity:0;transform:scale(.96);
  background:radial-gradient(70% 90% at 50% 125%,rgba(255,246,222,.95),rgba(255,236,190,.0) 70%),
             radial-gradient(60% 120% at 50% -30%,rgba(255,255,255,.35),transparent 60%),
             linear-gradient(135deg,#e9d08f 0%,#cfa955 55%,#b58e3c 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.55),inset 0 -6px 14px rgba(120,84,20,.35);
  transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
/* soft halo that blooms around the pill */
.gb-main>.gb-halo{inset:-10px;z-index:-2;opacity:0;filter:blur(18px);
  background:radial-gradient(closest-side,rgba(226,195,120,.75),rgba(214,187,125,0));
  transition:opacity 1s cubic-bezier(.16,1,.3,1)}
.gb-main:hover,.gb-main:focus-visible{color:#17120a!important;
  box-shadow:0 14px 44px -10px rgba(214,187,125,.75),0 0 0 4px rgba(214,187,125,.10)!important}
.gb-main:hover>.gb-fill,.gb-main:focus-visible>.gb-fill{opacity:1;transform:none}
.gb-main:hover>.gb-halo,.gb-main:focus-visible>.gb-halo{opacity:.9;animation:gbBreath 3.2s ease-in-out infinite}
.gb-main:hover>.gb-ring,.gb-main:focus-visible>.gb-ring{animation-duration:2.2s;
  background:conic-gradient(from var(--gba),transparent 0 60%,rgba(255,255,255,1) 74%,transparent 88%),linear-gradient(rgba(255,240,205,.55),rgba(255,240,205,.55))}
.gb-main:active>.gb-fill{transform:scale(.98)}
@keyframes gbBreath{0%,100%{opacity:.65;transform:scale(.97)}50%{opacity:1;transform:scale(1.04)}}
.gb>*:not(.gb-ring):not(.gb-fill):not(.gb-halo){position:relative;z-index:3}
.gb-main .ico{background:transparent!important}
/* secondary: running light on the border, brighter on hover */
.gb-sub>.gb-ring{opacity:.55;transition:opacity .6s}
.gb-sub:hover>.gb-ring{opacity:1;animation-duration:2.4s}
.gb-sub:hover{box-shadow:0 10px 34px -12px rgba(214,187,125,.45)!important}


/* arrows: slide out and a fresh one slides in */
.gb-arr{display:inline-grid!important;overflow:hidden;vertical-align:middle;transform:none!important}
.gb-arr>*{grid-area:1/1;transition:transform .7s cubic-bezier(.7,0,.2,1)}
.gb-arr>*:nth-child(2){transform:translate(-130%,0)}
.gb-arr.down>*:nth-child(2){transform:translate(0,-130%)}
.gb-arr.back>*:nth-child(2){transform:translate(130%,0)}
.gb:hover .gb-arr>*:nth-child(1){transform:translate(130%,0)}
.gb:hover .gb-arr.down>*:nth-child(1){transform:translate(0,130%)}
.gb:hover .gb-arr.back>*:nth-child(1){transform:translate(-130%,0)}
.gb:hover .gb-arr>*:nth-child(2){transform:none}
/* Lottie icons */
.gb .gb-lot{width:32px;height:32px;flex:none;display:inline-block;vertical-align:middle;margin:-10px 3px -10px -7px;
  transition:transform .7s cubic-bezier(.34,1.56,.64,1)}
.gb:hover .gb-lot{transform:scale(1.12)}
.gb-lot svg{display:block;width:100%!important;height:100%!important}
/* icon colours: black → button text colour, any accent colour → gold (cream on the gold hover) */
.gb{--gb-acc:#d6bb7d}.gb-main:hover,.gb-main:focus-visible{--gb-acc:#fff4d4}
.gb-lot [stroke]:not([stroke="none"]){stroke:var(--gb-acc)}
.gb-lot [fill]:not([fill="none"]){fill:var(--gb-acc)}
.gb-lot [stroke][stroke="rgb(0,0,0)"]{stroke:currentColor}
.gb-lot [fill][fill="rgb(0,0,0)"]{fill:currentColor}
.gb-main .ico{width:auto!important;height:auto!important;border:0!important;background:none!important}
@media (prefers-reduced-motion:reduce){.gb>.gb-ring,.gb-main>.gb-halo{animation:none!important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- Lottie icons (lottie-web player + MIT useAnimations icon set) ---------- */
  const here = (document.currentScript && document.currentScript.src) || location.href;
  const ICON_DIR = new URL('../icons/', here).href;
  let lottieP = null;
  const loadLottie = () => lottieP || (lottieP = window.lottie ? Promise.resolve(window.lottie) : new Promise((res, rej) => {
    const sc = document.createElement('script'); sc.src = new URL('lottie_light.min.js', here).href;
    sc.onload = () => res(window.lottie); sc.onerror = rej; document.head.appendChild(sc);
  }));
  const jsonCache = {};
  const getJSON = n => jsonCache[n] || (jsonCache[n] = fetch(ICON_DIR + n + '.json').then(r => r.json()));
  function pick(b) {
    const t = ((b.getAttribute('aria-label') || '') + ' ' + b.textContent).toLowerCase();
    if (/talk|contact|say hi/.test(t)) return 'messageCircle';
    if (/explore work|view work/.test(t)) return 'fi-explore-work';
    if (/see the work/.test(t)) return 'grid';
    if (/brand/.test(t)) return 'penTool';
    if (/app|interface/.test(t)) return 'smartphone';
    if (/motion|video/.test(t)) return 'film';
    if (/campaign|awareness/.test(t)) return 'radio';
    if (/\bai\b/.test(t)) return 'aperture';
    return null;
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    const a = e.target.__anim; e.target.__vis = e.isIntersecting; if (a && e.isIntersecting && !e.target.__played) { e.target.__played = 1; a.goToAndPlay(0, true); }
  }), { threshold: .6 }) : null;
  function mountIcon(b, name) {
    const span = document.createElement('span'); span.className = 'gb-lot'; span.setAttribute('aria-hidden', 'true');
    const ico = b.querySelector(':scope > .ico'), tri = b.querySelector(':scope > svg[fill="currentColor"]');
    if (ico) { ico.textContent = ''; ico.appendChild(span); } else if (tri) tri.replaceWith(span); else { const ring = b.querySelector(':scope > .gb-ring'); b.insertBefore(span, ring ? ring.nextSibling : b.firstChild); }
    Promise.all([loadLottie(), getJSON(name)]).then(([L, data]) => {
      const a = L.loadAnimation({ container: span, renderer: 'svg', loop: false, autoplay: false, animationData: data });
      span.__anim = a; a.goToAndStop(0, true);
      if (reduce) return;
      let hover = false;
      a.addEventListener('complete', () => { if (hover) a.goToAndPlay(0, true); });
      b.addEventListener('mouseenter', () => { hover = true; a.setSpeed(1.1); a.goToAndPlay(0, true); });
      b.addEventListener('mouseleave', () => { hover = false; a.setSpeed(1); });
      b.addEventListener('focus', () => a.goToAndPlay(0, true));
      // gentle idle replay so the icons stay alive
      const idle = () => { if (!hover && span.__vis !== false && !document.hidden) a.goToAndPlay(0, true); setTimeout(idle, 4200 + Math.random() * 2600); };
      setTimeout(idle, 2500 + Math.random() * 2500);
      if (io) io.observe(span); else a.goToAndPlay(0, true);
    }).catch(() => span.remove());
  }

  function wrapArrow(el, dir) {
    if (!el || el.closest('.gb-arr')) return;
    const w = document.createElement('span'); w.className = 'gb-arr' + (dir ? ' ' + dir : ''); w.setAttribute('aria-hidden', 'true');
    el.replaceWith(w); w.appendChild(el); w.appendChild(el.cloneNode(true));
  }
  function arrowDir(svg) {
    const d = [...svg.querySelectorAll('path')].map(p => p.getAttribute('d')).join(' ');
    if (/M12 5v14|7-7-7/.test(d)) return 'down';
    if (/M19 12H5|-7-7 7-7/.test(d)) return 'back';
    return '';
  }
  function enhance(b, main) {
    if (b.classList.contains('gb')) return;
    b.classList.add('gb', main ? 'gb-main' : 'gb-sub');
    const ring = document.createElement('span'); ring.className = 'gb-ring';
    const frag = [ring];
    if (main) { const f = document.createElement('span'); f.className = 'gb-fill'; const h = document.createElement('span'); h.className = 'gb-halo'; frag.unshift(h, f); }
    frag.forEach(n => n.setAttribute('aria-hidden', 'true'));
    b.prepend(...frag);
    if (b.classList.contains('send') || b.classList.contains('say-hi')) return;   // these keep their own icon animations
    // leading icon → animated sparkle (main buttons)
    const key = pick(b); if (key) mountIcon(b, key);
    // arrows: removed — the icon carries the motion now (Back pills keep theirs)
    const isBack = b.classList.contains('pill');
    b.querySelectorAll(':scope > .arr').forEach(a => a.remove());
    b.querySelectorAll(':scope > svg[stroke]').forEach(s => { if (isBack) wrapArrow(s, arrowDir(s)); else s.remove(); });
  }
  function run(root) {
    (root || document).querySelectorAll(MAIN).forEach(b => enhance(b, true));
    (root || document).querySelectorAll(SUB).forEach(b => enhance(b, false));
  }
  if (reduce) { /* still styled, just without motion (handled in CSS) */ }
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', () => run()) : run();
  // catch buttons added later (e.g. archive overlay)
  new MutationObserver(ms => { for (const m of ms) m.addedNodes.forEach(n => { if (n.nodeType === 1 && !n.closest('.gb')) { if (n.matches(MAIN + ',' + SUB)) enhance(n, n.matches(MAIN)); run(n); } }); })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
