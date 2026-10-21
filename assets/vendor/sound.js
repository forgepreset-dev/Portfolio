/* Stephen J — sound system: Home Menu background music + synthesized boot chime and UI ticks.
   Glass toggle: live waveform while playing, flat line when muted. */
(function () {
  if (window.__sjSound) return; window.__sjSound = true;
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  let wantOn = store.get('sj-sound') !== 'off';   // default on (starts after first interaction)
  let ctx = null, master, amb, fx, analyser, data, started = false, booted = false;

  /* ---------- toggle UI ---------- */
  const css = `.sj-snd{position:fixed;left:clamp(14px,2vw,28px);bottom:clamp(14px,2vw,28px);z-index:120;width:58px;height:58px;border-radius:50%;
    display:grid;place-items:center;cursor:pointer;border:1px solid rgba(255,255,255,.28);
    background:radial-gradient(120% 120% at 30% 20%,rgba(255,255,255,.28),rgba(255,255,255,.06) 60%,rgba(255,255,255,.02));
    -webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);
    box-shadow:inset 0 1px 1px rgba(255,255,255,.35),inset 0 -8px 16px rgba(0,0,0,.12),0 10px 30px -10px rgba(0,0,0,.6);
    transition:transform .5s cubic-bezier(.16,1,.3,1),background .4s}
  .sj-snd:hover{transform:scale(1.07)}.sj-snd:active{transform:scale(.95)}
  .sj-snd svg{width:30px;height:20px;overflow:visible}.sj-snd path{fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
  .sj-snd:focus-visible{outline:2px solid #d6bb7d;outline-offset:3px}
  @media (max-width:700px){.sj-snd{width:48px;height:48px}.sj-snd svg{width:24px;height:16px}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const btn = document.createElement('button');
  btn.className = 'sj-snd'; btn.type = 'button';
  btn.innerHTML = '<svg viewBox="0 0 30 20" aria-hidden="true"><path d="M1 10 L29 10"/></svg>';
  const path = btn.querySelector('path');
  const label = () => { btn.setAttribute('aria-label', wantOn ? 'Mute sound' : 'Play sound'); btn.setAttribute('aria-pressed', wantOn); };
  label();
  const mount = () => document.body.appendChild(btn);
  document.body ? mount() : addEventListener('DOMContentLoaded', mount);

  /* ---------- music ---------- */
  const here = (document.currentScript && document.currentScript.src) || location.href;
  const music = new Audio(new URL('../audio/home.mp3', here).href);
  window.__sjMusic = music; music.loop = true; music.preload = 'auto'; music.crossOrigin = 'anonymous';
  try { const t = parseFloat(sessionStorage.getItem('sj-music-t')); if (t > 0) music.currentTime = t; } catch (e) {}
  addEventListener('pagehide', () => { try { sessionStorage.setItem('sj-music-t', String(music.currentTime || 0)); } catch (e) {} });
  // the main page has a preloader: music begins once it completes
  let loaded = !document.getElementById('loader') || window.__sjLoaded;
  addEventListener('sj:loaded', () => { loaded = true; playMusic(); });
  function playMusic() {
    if (!ctx || !wantOn || !loaded || ctx.state !== 'running') return;
    if (music.paused) music.play().catch(() => {});
    amb.gain.cancelScheduledValues(now()); amb.gain.setTargetAtTime(.8, now(), 1.2);   // slow fade in
  }

  /* ---------- audio graph ---------- */
  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0;
    analyser = ctx.createAnalyser(); analyser.fftSize = 256; data = new Uint8Array(analyser.frequencyBinCount);
    const verb = ctx.createConvolver(); verb.buffer = impulse(4.5, 2.6);
    const wet = ctx.createGain(); wet.gain.value = .55;
    master.connect(analyser); analyser.connect(ctx.destination);
    verb.connect(wet); wet.connect(master);
    amb = ctx.createGain(); amb.gain.value = .0; amb.connect(master);
    fx = ctx.createGain(); fx.gain.value = .9; fx.connect(master); fx.connect(verb);
    // background music (Home Menu track), routed through the analyser for the waveform
    const src = ctx.createMediaElementSource(music); src.connect(amb);
  }
  const now = () => ctx.currentTime;
  function bell(freq, t, dur, vol) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq; o2.type = 'sine'; o2.frequency.value = freq * 2.01;
    const g2 = ctx.createGain(); g2.gain.value = .25;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(fx); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
  }
  function whoosh(t, dur) {
    const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(5000, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.06, t + dur * .6); g.gain.linearRampToValueAtTime(0, t + dur);
    s.connect(f); f.connect(g); g.connect(fx); s.start(t);
  }
  function boot() {                       // opening chime: rising shimmer + airy sweep
    const t = now() + .05; whoosh(t, 1.6);
    [523.25, 659.25, 783.99, 987.77, 1318.5].forEach((f, i) => bell(f, t + .35 + i * .11, 2.8, .11 - i * .012));
    bell(261.63, t + .3, 3.5, .08);
  }
  let lastTick = 0;
  function tick(kind) {                   // UI click / hover tick
    if (!ctx || !wantOn) return; const t = now();
    if (kind === 'hover') { if (t - lastTick < .07) return; lastTick = t; }
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    const f0 = kind === 'hover' ? 2600 : 1900, f1 = kind === 'hover' ? 2200 : 1250, v = kind === 'hover' ? .035 : .09, d = kind === 'hover' ? .045 : .09;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(fx); o.start(t); o.stop(t + d + .02);
    if (kind !== 'hover') bell(kind === 'open' ? 1174.66 : 880, t + .01, .35, .03);
  }
  function setOn(on, withBoot) {
    wantOn = on; store.set('sj-sound', on ? 'on' : 'off'); label();
    if (on) { init(); if (!ctx) return; ctx.resume();
      master.gain.cancelScheduledValues(now()); master.gain.setTargetAtTime(.9, now(), .3);
      const go = () => { if (ctx.state !== 'running') return; if (withBoot && !booted) { booted = true; boot(); } playMusic(); };
      ctx.resume().then(go); go();
    } else if (ctx) { master.gain.cancelScheduledValues(now()); master.gain.setTargetAtTime(0, now(), .25); setTimeout(() => { if (!wantOn) music.pause(); }, 900); }
  }
  btn.addEventListener('click', e => { e.stopPropagation(); setOn(!wantOn, true); if (wantOn) tick('click'); });

  // Try to play immediately. If the browser blocks autoplay, show a console-style
  // "press to start" screen (once per visit) so the first click boots the sound.
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const GESTURES = ['pointerdown', 'pointerup', 'keydown', 'touchend', 'click'];
  let gate = null;
  function startNow() {
    if (started) return; if (!wantOn) return;
    setOn(true, true); hideGate();
    const ok = () => { if (ctx && ctx.state === 'running' && !started) { started = true; GESTURES.forEach(t => removeEventListener(t, first, true)); } };
    if (ctx) ctx.resume().then(ok); ok();
  }
  const first = e => { if (btn.contains(e.target)) return; startNow(); };
  GESTURES.forEach(t => addEventListener(t, first, { capture: true, passive: true }));
  function release() { if (window.__sjRelease) window.__sjRelease(); }
  function hideGate() { release(); if (!gate) return; gate.classList.add('out'); const g = gate; gate = null; setTimeout(() => g.remove(), 1400); }
  function showGate() {
    if (gate || started || !wantOn || ss.get('sj-gate')) { release(); return; } ss.set('sj-gate', '1');
    const gs = document.createElement('style');
    gs.textContent = `.sj-gate{position:fixed;inset:0;z-index:200;background:#000;display:grid;place-items:center;cursor:pointer;transition:opacity 1.2s cubic-bezier(.16,1,.3,1),visibility 1.2s}
    .sj-gate.out{opacity:0;visibility:hidden}.sj-gate .in{display:grid;justify-items:center;gap:26px;transition:transform 1.2s cubic-bezier(.16,1,.3,1)}.sj-gate.out .in{transform:scale(1.06)}
    .sj-gate .ring{width:64px;height:64px;border-radius:50%;border:1px solid rgba(255,255,255,.35);display:grid;place-items:center;animation:sjp 2.4s ease-in-out infinite}
    .sj-gate .ring i{width:10px;height:10px;border-radius:50%;background:#fff;box-shadow:0 0 18px #fff}
    .sj-gate p{margin:0;font:500 12px/1 'JetBrains Mono',ui-monospace,monospace;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.7);animation:sjf 2.4s ease-in-out infinite}
    @keyframes sjp{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(255,255,255,.18)}50%{transform:scale(1.06);box-shadow:0 0 0 16px rgba(255,255,255,0)}}
    @keyframes sjf{0%,100%{opacity:.45}50%{opacity:1}}`;
    document.head.appendChild(gs);
    gate = document.createElement('div'); gate.className = 'sj-gate'; gate.setAttribute('role', 'button'); gate.tabIndex = 0;
    gate.innerHTML = '<div class="in"><div class="ring"><i></i></div><p>Press anywhere to start</p></div>';
    document.body.appendChild(gate); gate.focus({ preventScroll: true });
  }
  function tryAutoplay() {
    if (!wantOn) { release(); return; }
    setOn(true, true);
    const check = () => { if (gate) return; if (ctx && ctx.state === 'running') { release(); started = true; GESTURES.forEach(t => removeEventListener(t, first, true)); } else showGate(); };
    if (ctx) { ctx.resume().then(check, check); setTimeout(check, 350); } else check();
  }
  document.body ? tryAutoplay() : addEventListener('DOMContentLoaded', tryAutoplay);

  // UI sounds
  const hit = 'a,button,.tile,.dcard,.tab,[role=tab],.pcard,.live,.say-hi,.cta,input[type=submit]';
  addEventListener('click', e => { const el = e.target.closest(hit); if (el && el !== btn) tick(el.matches('.dcard,.live,.tile') ? 'open' : 'click'); }, true);
  addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const el = e.target.closest(hit); if (el && el !== btn && !el.contains(e.relatedTarget)) tick('hover'); }, true);
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) { music.pause(); ctx.suspend(); } else if (wantOn) ctx.resume().then(playMusic); });

  /* ---------- waveform: live while playing, flat when muted ---------- */
  let amp = 0, ph = 0;
  (function draw() {
    let level = 0;
    if (ctx && wantOn && analyser) { analyser.getByteTimeDomainData(data); let s = 0; for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; s += v * v; } level = Math.sqrt(s / data.length); }
    const target = wantOn && ctx ? Math.min(1, .35 + level * 9) : 0;
    amp += (target - amp) * .08; ph += .09 + amp * .08;
    const A = amp * 7, pts = [];
    for (let i = 0; i <= 28; i++) { const x = 1 + i, env = Math.sin(Math.PI * i / 28); pts.push(x + ' ' + (10 + Math.sin(i * .5 + ph) * A * env).toFixed(2)); }
    path.setAttribute('d', 'M' + pts.join(' L'));
    requestAnimationFrame(draw);
  })();
})();
