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
/* content icons — big and lively */
.gb .gb-ic,.gb .gb-spark{width:26px!important;height:26px!important;flex:none;vertical-align:middle;margin:-7px 2px -7px -4px;overflow:visible;display:inline-block;
  transition:transform .7s cubic-bezier(.34,1.56,.64,1)}
.gb:hover .gb-ic,.gb:hover .gb-spark{transform:scale(1.14) rotate(-4deg)}
.gb-main .ico{width:auto!important;height:auto!important;border:0!important;background:none!important}
.gb-ic{fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.gb-ic .f{fill:currentColor;stroke:none}
.gb-ic *{transform-box:fill-box;transform-origin:center}
.gb:hover .gb-ic *{animation-duration:var(--hd)!important}
/* compass — Explore Work: needle spins searching, overshoots, settles */
.gb-ic .ndl{transform-box:view-box;transform-origin:12px 12px;animation:icNeedle 3.2s cubic-bezier(.5,0,.2,1) infinite;--hd:1.5s}
.gb-ic .ring{animation:icPulse 3.2s ease-in-out infinite;--hd:1.5s}
@keyframes icNeedle{0%{transform:rotate(0)}35%{transform:rotate(400deg)}50%{transform:rotate(330deg)}62%{transform:rotate(375deg)}72%,100%{transform:rotate(360deg)}}
@keyframes icPulse{0%,30%,100%{transform:scale(1)}40%{transform:scale(1.08)}}
/* chat — Let's Talk: bubble pops, dots type */
.gb-ic .bub{animation:icBub 2.6s cubic-bezier(.34,1.56,.64,1) infinite;--hd:1.3s;transform-origin:20% 90%}
.gb-ic .dot{animation:icDot 1.2s ease-in-out infinite;--hd:.7s}.gb-ic .dot:nth-of-type(2){animation-delay:.15s}.gb-ic .dot:nth-of-type(3){animation-delay:.3s}
@keyframes icBub{0%,70%,100%{transform:scale(1) rotate(0)}78%{transform:scale(1.1) rotate(-6deg)}88%{transform:scale(.97) rotate(3deg)}}
@keyframes icDot{0%,60%,100%{transform:translateY(0);opacity:.45}30%{transform:translateY(-3.5px);opacity:1}}
/* bezier pen — Brand: curve draws itself, handles swing */
.gb-ic .crv{stroke-dasharray:30;animation:icDraw 2.8s cubic-bezier(.6,0,.2,1) infinite;--hd:1.4s}
.gb-ic .anc{animation:icAnc 2.8s cubic-bezier(.34,1.56,.64,1) infinite;--hd:1.4s}
.gb-ic .hdl{animation:icHdl 2.8s ease-in-out infinite;--hd:1.4s}
@keyframes icDraw{0%{stroke-dashoffset:30}45%,70%{stroke-dashoffset:0}100%{stroke-dashoffset:-30}}
@keyframes icAnc{0%,100%{transform:scale(.5) rotate(0)}45%,70%{transform:scale(1.25) rotate(45deg)}}
@keyframes icHdl{0%,100%{opacity:.2}45%,70%{opacity:.7}}
/* phone — App Interface: phone tilts, screen content scrolls in */
.gb-ic .ph{animation:icTilt 3s ease-in-out infinite;--hd:1.5s}
.gb-ic .bar{transform-origin:left center;animation:icBar 1.8s ease-in-out infinite;--hd:.9s}.gb-ic .bar:nth-of-type(3){animation-delay:.18s}.gb-ic .bar:nth-of-type(4){animation-delay:.36s}
@keyframes icTilt{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
@keyframes icBar{0%,100%{transform:scaleX(.2);opacity:.3}40%,70%{transform:scaleX(1);opacity:1}}
/* clapperboard — Motion & Video: snap! with a jolt */
.gb-ic .clap{transform-box:view-box;transform-origin:3.5px 9.5px;animation:icClap 1.9s cubic-bezier(.7,0,.3,1) infinite;--hd:.85s}
.gb-ic .brd{animation:icJolt 1.9s ease-out infinite;--hd:.85s}
.gb-ic .play{animation:icPlay 1.9s ease-out infinite;--hd:.85s}
@keyframes icClap{0%,50%{transform:rotate(-32deg)}62%{transform:rotate(3deg)}70%,100%{transform:rotate(0)}}
@keyframes icJolt{0%,60%{transform:translateY(0)}64%{transform:translateY(1.4px)}72%,100%{transform:translateY(0)}}
@keyframes icPlay{0%,60%{transform:scale(.6);opacity:.4}72%{transform:scale(1.25);opacity:1}100%{transform:scale(1);opacity:1}}
/* megaphone — Campaigns: shouts, waves ripple out */
.gb-ic .meg{transform-origin:20% 50%;animation:icShout 1.6s ease-in-out infinite;--hd:.8s}
.gb-ic .wv{animation:icWave 1.6s ease-out infinite;--hd:.8s}.gb-ic .wv:nth-of-type(2){animation-delay:.3s}
@keyframes icShout{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-10deg) scale(1.08)}40%{transform:rotate(0) scale(1)}}
@keyframes icWave{0%{opacity:0;transform:translateX(-3px) scale(.6)}35%{opacity:1}100%{opacity:0;transform:translateX(2.5px) scale(1.2)}}
/* sparkle — AI: star spins and breathes, small stars twinkle */
.gb-spark path{fill:currentColor;transform-box:fill-box;transform-origin:center}
.gb-spark .s1{animation:gbStar 2.8s cubic-bezier(.45,0,.2,1) infinite}
.gb-spark .s2{animation:gbTw 1.8s ease-in-out infinite}
.gb-spark .s3{animation:gbTw 1.8s ease-in-out -.9s infinite}
.gb:hover .gb-spark .s1{animation-duration:1.3s}.gb:hover .gb-spark .s2,.gb:hover .gb-spark .s3{animation-duration:.9s}
@keyframes gbStar{0%,100%{transform:scale(1) rotate(0)}40%{transform:scale(.65) rotate(60deg)}58%{transform:scale(1.25) rotate(90deg)}75%{transform:scale(1) rotate(90deg)}}
@keyframes gbTw{0%,100%{transform:scale(0) rotate(0);opacity:0}35%,55%{transform:scale(1.2) rotate(45deg);opacity:1}80%{transform:scale(.2);opacity:0}}
/* eye — See the Work: looks around, blinks */
.gb-ic .lid{animation:icBlink 3.4s ease-in-out infinite;--hd:1.7s}
.gb-ic .pup{animation:icLook 3.4s ease-in-out infinite;--hd:1.7s}
@keyframes icBlink{0%,42%,50%,88%,94%,100%{transform:scaleY(1)}46%,91%{transform:scaleY(.06)}}
@keyframes icLook{0%,15%{transform:translate(0,0)}25%,38%{transform:translate(-3.5px,-.5px)}55%,72%{transform:translate(3.5px,.5px)}82%,100%{transform:translate(0,0)}}
@media (prefers-reduced-motion:reduce){.gb-ic *,.gb-spark *{animation:none!important}}
@media (prefers-reduced-motion:reduce){.gb>.gb-ring,.gb-spark path,.gb-main>.gb-halo{animation:none!important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const SPARK = '<svg class="gb-spark" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path class="s1" d="M10 3c.7 5.2 2.3 6.8 7.5 7.5-5.2.7-6.8 2.3-7.5 7.5-.7-5.2-2.3-6.8-7.5-7.5C7.7 9.8 9.3 8.2 10 3z"/>' +
    '<path class="s2" d="M18.5 1.5c.3 2 .9 2.6 2.9 2.9-2 .3-2.6.9-2.9 2.9-.3-2-.9-2.6-2.9-2.9 2-.3 2.6-.9 2.9-2.9z"/>' +
    '<path class="s3" d="M18 15.5c.25 1.6.75 2.1 2.3 2.3-1.6.25-2.05.75-2.3 2.3-.25-1.6-.75-2.05-2.3-2.3 1.6-.25 2.05-.75 2.3-2.3z"/></svg>';


  const I = (inner, vb) => '<svg class="gb-ic" viewBox="0 0 24 24" aria-hidden="true">' + inner + '</svg>';
  const ICONS = {
    compass: I('<circle class="ring" cx="12" cy="12" r="9.2"/><g class="ndl"><path class="f" d="M12 5.8l2.3 6.2h-4.6z"/><path d="M9.7 12h4.6L12 18.2z"/></g><circle class="f" cx="12" cy="12" r="1"/>'),
    chat: I('<path class="bub" d="M5 4.5h14a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-8.5L6 20.5v-3.5H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z"/><circle class="f dot" cx="8.2" cy="10.8" r="1.25"/><circle class="f dot" cx="12" cy="10.8" r="1.25"/><circle class="f dot" cx="15.8" cy="10.8" r="1.25"/>'),
    pen: I('<path class="crv" d="M4 18C6 6 18 18 20 6"/><rect class="f anc" x="2.2" y="16.2" width="3.6" height="3.6" rx=".6"/><rect class="f anc" x="18.2" y="4.2" width="3.6" height="3.6" rx=".6"/><path class="hdl" d="M4 18L9 13"/><path class="hdl" d="M20 6l-5 5"/>'),
    phone: I('<g class="ph"><rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><rect class="f bar" x="9" y="7" width="6" height="1.8" rx=".9"/><rect class="f bar" x="9" y="10.6" width="6" height="1.8" rx=".9"/><rect class="f bar" x="9" y="14.2" width="4" height="1.8" rx=".9"/><path d="M10.8 18.6h2.4"/></g>'),
    clapper: I('<g class="brd"><rect x="3.5" y="9.5" width="17" height="11" rx="1.6"/><path d="M9.5 13.2v4.6l3.9-2.3z" class="f play"/></g><g class="clap"><path d="M3.5 9.5L4 5.6l16.4-2.2.5 3.8z"/><path d="M8.2 5l1.6 3.4M12.6 4.4l1.6 3.4M17 3.8l1.6 3.4"/></g>'),
    megaphone: I('<g class="meg"><path d="M3.5 10v4.2h3l7 4.3V5.7l-7 4.3z"/><path d="M6.5 14.2l1.2 5"/></g><path class="wv" d="M16.4 9.4a3.6 3.6 0 0 1 0 5.4"/><path class="wv" d="M18.8 7a7 7 0 0 1 0 10.2"/>'),
    eye: I('<g class="lid"><path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><g class="pup"><circle class="f" cx="12" cy="12" r="3"/></g></g>'),
    spark: SPARK
  };
  function pick(b) {
    const t = ((b.getAttribute('aria-label') || '') + ' ' + b.textContent).toLowerCase();
    if (/talk|contact|say hi/.test(t)) return 'chat';
    if (/explore work|view work/.test(t)) return 'compass';
    if (/see the work/.test(t)) return 'eye';
    if (/brand/.test(t)) return 'pen';
    if (/app|interface/.test(t)) return 'phone';
    if (/motion|video/.test(t)) return 'clapper';
    if (/campaign|awareness/.test(t)) return 'megaphone';
    if (/\bai\b/.test(t)) return 'spark';
    return null;
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
    const key = pick(b), icon = key ? ICONS[key] : (main ? SPARK : null);
    if (icon) {
      const ico = b.querySelector(':scope > .ico');
      const tri = b.querySelector(':scope > svg[fill="currentColor"]');
      if (ico) ico.innerHTML = icon;
      else if (tri) tri.outerHTML = icon;
      else b.insertAdjacentHTML('afterbegin', icon);
    }
    // arrows
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
