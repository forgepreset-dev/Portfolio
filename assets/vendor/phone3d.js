// Zofeur portfolio — real-time 3D phone (Three.js). Reads window.__pose each frame.
import * as THREE from 'three';
import { RoomEnvironment } from './RoomEnvironment.js';

const SCREENS = window.__screens || [];
const canvas = document.getElementById('phone3d');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) { console.warn('WebGL unavailable', e); }

if (renderer) {
  document.documentElement.classList.add('gl');
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const FOV = 22, DIST = 10;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, DIST);
  const visH = 2 * DIST * Math.tan(THREE.MathUtils.degToRad(FOV / 2));

  // lights — warm key + gold rim so the titanium edge catches the brand colour
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2); key.position.set(3, 4, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xd6bb7d, 4.5); rim.position.set(-5, 2, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, .6); fill.position.set(-4, -3, 5); scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, .15));

  // ---------- geometry helpers ----------
  const rrShape = (w, h, r) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  };
  const planeRR = (w, h, r) => { // rounded plane with 0..1 UVs
    const g = new THREE.ShapeGeometry(rrShape(w, h, r), 24), p = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + .5, p.getY(i) / h + .5);
    return g;
  };

  // ---------- dimensions (≈ iPhone Pro proportions) ----------
  const SW = 0.664, SH = SW * 3376 / 1560;          // screen matches the real screenshots
  const W = SW + 0.036, H = SH + 0.036, D = 0.082, R = 0.108, BEV = 0.014;

  // ---------- materials ----------
  const titanium = new THREE.MeshPhysicalMaterial({ color: 0x5a5550, metalness: 1, roughness: .26, clearcoat: .4, clearcoatRoughness: .2 });
  const blackGlass = new THREE.MeshPhysicalMaterial({ color: 0x050505, metalness: 0, roughness: .06, clearcoat: 1 });
  const backGlass = new THREE.MeshPhysicalMaterial({ color: 0x1b1916, metalness: .15, roughness: .5, clearcoat: .25, clearcoatRoughness: .6 });
  const bumpGlass = new THREE.MeshPhysicalMaterial({ color: 0x2c2926, metalness: .2, roughness: .25, clearcoat: 1 });
  const lensGlass = new THREE.MeshPhysicalMaterial({ color: 0x0a0d14, metalness: .3, roughness: .05, clearcoat: 1, iridescence: .6, iridescenceIOR: 1.6 });

  const phone = new THREE.Group(); scene.add(phone);

  // body: extruded rounded rect — caps get black glass, sides get titanium
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(rrShape(W - 2 * BEV, H - 2 * BEV, R - BEV), {
    depth: D - 2 * BEV, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 8, curveSegments: 32 }), [blackGlass, titanium]);
  body.geometry.translate(0, 0, -(D - 2 * BEV) / 2); phone.add(body);

  // screen (base + crossfade overlay) + glass sheen + dynamic island
  const loader = new THREE.TextureLoader();
  const tex = SCREENS.map(src => { const t = loader.load(src); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; });
  const sGeo = planeRR(SW, SH, R - 0.02);
  const scrA = new THREE.Mesh(sGeo, new THREE.MeshBasicMaterial({ map: tex[0], toneMapped: false }));
  const scrB = new THREE.Mesh(sGeo, new THREE.MeshBasicMaterial({ map: tex[0], toneMapped: false, transparent: true, opacity: 0, depthWrite: false }));
  scrA.position.z = D / 2 + .0006; scrB.position.z = D / 2 + .0009; phone.add(scrA, scrB);
  const sheen = new THREE.Mesh(planeRR(W - .01, H - .01, R - .005), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: .03, metalness: 0, clearcoat: 1, transparent: true, opacity: .08, depthWrite: false }));
  sheen.position.z = D / 2 + .0014; phone.add(sheen);
  const island = new THREE.Mesh(planeRR(.19, .056, .028), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  island.position.set(0, SH / 2 - .045, D / 2 + .0012); phone.add(island);

  // back: frosted glass + camera plateau + three lenses + flash + logo
  const back = new THREE.Mesh(planeRR(W - .006, H - .006, R - .003), backGlass);
  back.rotation.y = Math.PI; back.position.z = -D / 2 - .0006; phone.add(back);
  const BW = .31, bx = -W / 2 + .03 + BW / 2, by = H / 2 - .03 - BW / 2;
  const bump = new THREE.Mesh(new THREE.ExtrudeGeometry(rrShape(BW, BW, .075), { depth: .006, bevelEnabled: true, bevelThickness: .004, bevelSize: .004, bevelSegments: 4, curveSegments: 24 }), bumpGlass);
  bump.position.set(bx, by, -D / 2 - .006); phone.add(bump);
  const lensAt = [[-.07, .07], [-.07, -.07], [.075, 0]];
  lensAt.forEach(([lx, ly]) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(.056, .058, .022, 40), titanium);
    ring.rotation.x = Math.PI / 2; ring.position.set(bx + lx, by + ly, -D / 2 - .021); phone.add(ring);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(.044, 40), lensGlass);
    glass.rotation.y = Math.PI; glass.position.set(bx + lx, by + ly, -D / 2 - .0325); phone.add(glass);
  });
  const flash = new THREE.Mesh(new THREE.CircleGeometry(.018, 24), new THREE.MeshStandardMaterial({ color: 0xf3ead7, roughness: .4 }));
  flash.rotation.y = Math.PI; flash.position.set(bx + .085, by + .095, -D / 2 - .0125); phone.add(flash);
  // logo (canvas texture)
  const lc = document.createElement('canvas'); lc.width = lc.height = 256; const g = lc.getContext('2d');
  g.fillStyle = '#d6bb7d'; g.beginPath(); g.arc(128, 70, 46, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(28, 236); g.bezierCurveTo(28, 160, 76, 128, 128, 128); g.bezierCurveTo(180, 128, 228, 160, 228, 236); g.closePath(); g.fill();
  const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(.13, .13), new THREE.MeshStandardMaterial({ map: lt, transparent: true, metalness: .9, roughness: .25 }));
  logo.rotation.y = Math.PI; logo.position.set(0, .02, -D / 2 - .0012); phone.add(logo);

  // side buttons
  const btn = (len, x, y) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(.0065, len, 4, 12), titanium); m.position.set(x, y, 0); phone.add(m); };
  btn(.14, W / 2 + .002, .2); btn(.075, -W / 2 - .002, .33); btn(.075, -W / 2 - .002, .21); btn(.035, -W / 2 - .002, .45);

  // soft contact shadow (blob under the phone)
  const shC = document.createElement('canvas'); shC.width = shC.height = 128; const sg = shC.getContext('2d');
  const grd = sg.createRadialGradient(64, 64, 0, 64, 64, 64); grd.addColorStop(0, 'rgba(0,0,0,.55)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = grd; sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .26), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shC), transparent: true, depthWrite: false }));
  scene.add(shadow);

  // ---------- render loop ----------
  let cur = 0, fading = -1, fadeT = 0, lastT = performance.now();
  function size() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  addEventListener('resize', size); size();
  const d2r = THREE.MathUtils.degToRad;

  function loop(now) {
    const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
    const P = window.__pose;
    if (P) {
      const vw = innerWidth, vh = innerHeight, k = visH / vh;
      const visible = P.y + P.h > -40 && P.y - P.h < vh + 40;
      canvas.style.visibility = visible ? 'visible' : 'hidden';
      if (visible) {
        phone.position.set((P.x - vw / 2) * k, -(P.y - vh / 2) * k, 0);
        const sc = (P.h * k) / H; phone.scale.setScalar(sc);
        phone.rotation.set(d2r(P.rx), d2r(P.ry), d2r(-P.rz), 'XYZ');
        shadow.position.set(phone.position.x, phone.position.y - (H / 2 + .07) * sc, -0.6);
        shadow.scale.setScalar(sc);
        // screen crossfade
        const want = tex[P.si] ? P.si : cur;
        if (fading >= 0 && want !== fading) { // target changed mid-fade: commit what's showing, retarget
          if (fadeT > .5) { scrA.material.map = tex[fading]; scrA.material.needsUpdate = true; cur = fading; }
          scrB.material.opacity = 0; fading = -1;
        }
        if (want !== cur && fading < 0) { scrB.material.map = tex[want]; scrB.material.needsUpdate = true; fading = want; fadeT = 0; }
        if (fading >= 0) {
          fadeT = Math.min(1, fadeT + dt / .32); scrB.material.opacity = fadeT;
          if (fadeT >= 1) { scrA.material.map = tex[fading]; scrA.material.needsUpdate = true; scrB.material.opacity = 0; cur = fading; fading = -1; }
        }
        renderer.render(scene, camera);
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
