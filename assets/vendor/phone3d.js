// Zofeur portfolio — real-time 3D phone (Three.js). Reads window.__pose each frame.
import * as THREE from 'three';
import { RoomEnvironment } from './RoomEnvironment.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './jsm/loaders/DRACOLoader.js';

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

  // ---------- real iPhone 15 Pro Max model (CC BY 4.0, polyman) ----------
  const phone = new THREE.Group(); scene.add(phone);
  let H = 1.47;                                   // model height in world units after normalising
  const loader = new THREE.TextureLoader();
  const tex = SCREENS.map(src => { const t = loader.load(src); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; });
  const WALLI = SCREENS.length - 1, wallTex = tex[WALLI]; wallTex.repeat.set(1, .5);
  const tpTex = new THREE.CanvasTexture(window.__tpCanvas || document.createElement('canvas'));
  tpTex.colorSpace = THREE.SRGBColorSpace; tpTex.anisotropy = 8; tex.push(tpTex);
  let tpSeen = -1, scr = null;
  const K = window.__fitK = 1.04;
  const scrMatA = new THREE.MeshBasicMaterial({ map: tex[0], toneMapped: false });
  const scrMatB = new THREE.MeshBasicMaterial({ map: tex[0], toneMapped: false, transparent: true, opacity: 0, depthFunc: THREE.LessEqualDepth });
  const scrA = { material: scrMatA }, scrB = { material: scrMatB };
  const draco = new DRACOLoader(); draco.setDecoderPath(new URL('./jsm/libs/draco/gltf/', import.meta.url).href);
  const gl = new GLTFLoader(); gl.setDRACOLoader(draco);
  gl.load(new URL('./models/iphone15promax.glb', import.meta.url).href, g => {
    const m = g.scene; let disp = null;
    m.traverse(o => {
      if (!o.isMesh) return;
      if (o.material && o.material.name === 'pIJKfZsazmcpEiU') {          // the display
        o.material = scrMatA; disp = o;
        const over = new THREE.Mesh(o.geometry, scrMatB); over.renderOrder = 2;
        over.position.copy(o.position); over.quaternion.copy(o.quaternion); over.scale.copy(o.scale); o.parent.add(over);
      } else if (o.material) { o.material.envMapIntensity = 1.2; }
    });
    // normalise: centre it, height = H
    const box = new THREE.Box3().setFromObject(m), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    m.position.sub(c);
    const holder = new THREE.Group(); holder.add(m); holder.rotation.y = Math.PI; // model ships back-first
    const sc = 1.47 / size.y; holder.scale.setScalar(sc); H = 1.47;
    holder.updateMatrixWorld(true);
    if (disp) { const b = new THREE.Box3().setFromObject(disp), bs = b.getSize(new THREE.Vector3()), bc = b.getCenter(new THREE.Vector3());
      scr = { w: bs.x, h: bs.y, cx: bc.x, cy: bc.y, z: b.max.z }; window.__scrR = bs.y / bs.x; window.__redrawTP && window.__redrawTP(); }
    phone.add(holder);
    document.documentElement.classList.add('gl-ready');
  });

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
      const visible = P.op > 0.005 && P.y + P.h > -40 && P.y - P.h < vh + 40;
      canvas.style.visibility = visible ? 'visible' : 'hidden';
      canvas.style.opacity = P.op;
      wallTex.offset.y = .5 * (1 - (P.pan || 0));
      if (visible) {
        phone.position.set((P.x - vw / 2) * k, -(P.y - vh / 2) * k, 0);
        let sc = (P.h * k) / H;
        phone.rotation.set(d2r(P.rx), d2r(P.ry), d2r(-P.rz), 'XYZ');
        if (window.__tpVer !== tpSeen && window.__tpCanvas) { tpTex.image = window.__tpCanvas; tpTex.needsUpdate = true; tpSeen = window.__tpVer; }
        const f = P.fit || 0;
        if (f > 0 && scr) {                         // zoom until the screen exactly fills the viewport
          const visW = visH * camera.aspect;
          const sc1 = K * (P.ls ? Math.max(visH / scr.w, visW / scr.h) : Math.max(visW / scr.w, visH / scr.h));
          sc = sc * Math.pow(sc1 / sc, f);
          const v = new THREE.Vector3(scr.cx, scr.cy, scr.z).multiplyScalar(sc).applyEuler(phone.rotation);
          phone.position.multiplyScalar(1 - f).addScaledVector(v, -f);
        }
        phone.scale.setScalar(sc);
        shadow.visible = f < .02;
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
          fadeT = Math.min(1, fadeT + dt / .55); scrB.material.opacity = fadeT;
          if (fadeT >= 1) { scrA.material.map = tex[fading]; scrA.material.needsUpdate = true; scrB.material.opacity = 0; cur = fading; fading = -1; }
        }
        renderer.render(scene, camera);
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
