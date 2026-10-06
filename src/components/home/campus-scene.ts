import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone } from "three/addons/utils/SkeletonUtils.js";

export type CampusRenderer = ReturnType<typeof createCampus>;
type V = [number, number, number];
// One geography, not five images. Front is +Z; every camera uses these same objects.
const poses: { eye: V; at: V; fov: number }[] = [
  { eye: [19, 16, 32], at: [0, 2.5, 0], fov: 40 },
  { eye: [13, 4.8, 19], at: [6, 1.7, 7], fov: 36 },
  { eye: [13, 8.5, 5], at: [6, 4.8, -5], fov: 36 },
  { eye: [0, 8.1, 6], at: [-7, 4.8, -5], fov: 36 },
  { eye: [19, 16, 32], at: [0, 2.5, 0], fov: 40 },
];

export function createCampus(host: HTMLDivElement, labels: HTMLButtonElement[], onSelect: (index: number) => void, onReady: () => void, onError: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, host.clientWidth < 700 ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.17;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#faf9f6");
  scene.fog = new THREE.Fog("#faf9f6", 47, 110);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 160);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const env = pmrem.fromScene(environment, 0.04);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.62;
  environment.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xf3f7ff, 0xc3b8a6, 2.1));
  const sun = new THREE.DirectionalLight(0xfff6e9, 3.2);
  sun.position.set(-13, 24, 15);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 70 });
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.045;
  sun.shadow.radius = 4;
  scene.add(sun);

  const textures: THREE.Texture[] = [];
  let seed = 971;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function texture(kind: "stone" | "wood" | "tile" | "screen" | "chat" | "check") {
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = kind === "wood" ? "#baa17c" : "#eeece6"; ctx.fillRect(0, 0, 512, 512);
    if (kind === "wood") {
      for (let i = 0; i < 600; i++) {
        ctx.strokeStyle = `rgba(${random() > .5 ? "75,49,26" : "255,235,211"},${random() * .14})`;
        const x = random() * 512; ctx.beginPath(); ctx.moveTo(x, 0); ctx.bezierCurveTo(x + 6, 170, x - 8, 330, x + 3, 512); ctx.stroke();
      }
    } else if (kind === "stone" || kind === "tile") {
      for (let i = 0; i < 20000; i++) { ctx.fillStyle = `rgba(${random() > .4 ? "88,80,75" : "255,255,255"},${random() * .11})`; ctx.fillRect(random() * 512, random() * 512, random() * 2 + .4, random() * 2 + .4); }
      if (kind === "tile") { ctx.strokeStyle = "#d5d0c6"; ctx.lineWidth = 2; ctx.strokeRect(0, 0, 512, 512); }
    } else {
      ctx.fillStyle = "#fcfbfe"; ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = "#7900ed"; ctx.fillRect(0, 0, 52, 512);
      ctx.fillStyle = "white"; ctx.font = "bold 32px Arial"; ctx.fillText("a", 14, 46);
      for (let y = 90; y < 450; y += 55) { ctx.strokeStyle = "#ffffff88"; ctx.strokeRect(19, y, 13, 13); }
      ctx.fillStyle = "#251a30"; ctx.font = "bold 26px Arial";
      ctx.fillText(kind === "screen" ? "Staff records" : kind === "chat" ? "Team updates" : "Attendance", 77, 58);
      if (kind === "check") {
        ctx.fillStyle = "#7900ed"; ctx.beginPath(); ctx.arc(280, 220, 57, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(256, 218); ctx.lineTo(274, 239); ctx.lineTo(309, 199); ctx.stroke();
        ctx.fillStyle = "#32233f"; ctx.font = "24px Arial"; ctx.fillText("Checked in", 218, 319); ctx.fillText("08:30", 244, 358);
      } else for (let i = 0; i < 4; i++) {
        const y = 130 + i * 85; ctx.fillStyle = "#ebe2f6"; ctx.beginPath(); ctx.arc(105, y, 21, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#43344f"; ctx.font = "20px Arial"; ctx.fillText(["Sara", "Daniel", "Liya", "Dawit"][i], 145, y + 4);
        ctx.fillStyle = "#dad5e0"; ctx.fillRect(145, y + 17, 220, 6); ctx.fillRect(145, y + 30, 154, 5);
      }
    }
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace;
    if (kind === "stone" || kind === "wood" || kind === "tile") { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    t.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4); textures.push(t); return t;
  }
  const stoneMap = texture("stone"), oakMap = texture("wood"), tileMap = texture("tile"); tileMap.repeat.set(80, 80);
  const mats = {
    stone: new THREE.MeshStandardMaterial({ color: "#f2f0eb", map: stoneMap, bumpMap: stoneMap, bumpScale: .045, roughness: .83 }),
    oak: new THREE.MeshStandardMaterial({ color: "#bfa583", map: oakMap, roughness: .65 }),
    floor: new THREE.MeshStandardMaterial({ color: "#f9f6ef", roughness: .48 }),
    tile: new THREE.MeshStandardMaterial({ color: "#f5f3ed", map: tileMap, roughness: .69 }),
    metal: new THREE.MeshStandardMaterial({ color: "#393b39", roughness: .32, metalness: .6 }),
    cream: new THREE.MeshStandardMaterial({ color: "#e6dfd1", roughness: .85 }),
    chair: new THREE.MeshStandardMaterial({ color: "#48494a", roughness: .83 }),
    paper: new THREE.MeshStandardMaterial({ color: "#f9f7f2", roughness: .9 }),
    green: new THREE.MeshStandardMaterial({ color: "#667954", roughness: .85, side: THREE.DoubleSide }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#fafefe", transmission: .92, roughness: .08, thickness: .025, ior: 1.45, metalness: 0, transparent: true, opacity: .48, side: THREE.DoubleSide, envMapIntensity: .45 }),
    line: new THREE.MeshBasicMaterial({ color: "#8a26e5" }),
    light: new THREE.MeshBasicMaterial({ color: "#ffefd7" }),
  };
  const cube = new THREE.BoxGeometry(1, 1, 1), sphere = new THREE.SphereGeometry(1, 12, 8), cyl = new THREE.CylinderGeometry(1, 1, 1, 12);
  const geometries: THREE.BufferGeometry[] = [cube, sphere, cyl];
  function box(parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, d: number, material: THREE.Material) {
    const mesh = new THREE.Mesh(cube, material); mesh.position.set(x, y, z); mesh.scale.set(w, h, d); mesh.castShadow = material !== mats.glass && material !== mats.light; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function cylinder(parent: THREE.Object3D, x: number, y: number, z: number, r: number, h: number, material: THREE.Material) {
    const mesh = new THREE.Mesh(cyl, material); mesh.position.set(x, y, z); mesh.scale.set(r, h, r); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function plant(parent: THREE.Object3D, x: number, y: number, z: number, size = .9) {
    const group = new THREE.Group(); group.position.set(x, y, z); group.scale.setScalar(size); parent.add(group);
    cylinder(group, 0, .26, 0, .22, .5, mats.cream);
    cylinder(group, 0, .83, 0, .025, .8, mats.oak);
    for (let i = 0; i < 13; i++) {
      const leaf = new THREE.Mesh(sphere, mats.green); leaf.position.set(Math.sin(i * 2.4) * .22, .65 + i * .045, Math.cos(i * 2.4) * .22); leaf.scale.set(.08, .27, .03); leaf.rotation.set(.35, i * 2.4, .6); leaf.castShadow = true; group.add(leaf);
    }
  }
  function chair(parent: THREE.Object3D, x: number, floor: number, z: number, angle = 0) {
    const g = new THREE.Group(); g.position.set(x, floor, z); g.rotation.y = angle; parent.add(g);
    box(g, 0, .49, 0, .51, .09, .5, mats.chair); box(g, 0, .78, -.24, .51, .56, .07, mats.chair);
    cylinder(g, 0, .26, 0, .04, .42, mats.metal);
    for (let i = 0; i < 5; i++) { const leg = box(g, 0, .085, 0, .055, .05, .7, mats.metal); leg.rotation.y = i * Math.PI / 5; }
    box(g, -.29, .68, 0, .035, .035, .36, mats.metal); box(g, .29, .68, 0, .035, .035, .36, mats.metal);
  }
  const screenMaterials = ["screen", "chat", "check"].map(kind => new THREE.MeshBasicMaterial({ map: texture(kind as "screen" | "chat" | "check"), side: THREE.DoubleSide }));
  const plane = new THREE.PlaneGeometry(1, 1); geometries.push(plane);
  function monitor(parent: THREE.Object3D, x: number, floor: number, z: number, kind = 0, angle = 0) {
    const g = new THREE.Group(); g.position.set(x, floor, z); g.rotation.y = angle; parent.add(g);
    box(g, 0, .045, 0, .37, .05, .26, mats.metal); box(g, 0, .22, 0, .055, .35, .05, mats.metal);
    box(g, 0, .45, 0, .89, .57, .065, mats.metal);
    const face = new THREE.Mesh(plane, screenMaterials[kind]); face.position.set(0, .45, .035); face.scale.set(.83, .51, 1); g.add(face);
  }
  const people: { parent: THREE.Object3D; x: number; y: number; z: number; angle: number; seated: boolean; arriving?: boolean }[] = [];
  function person(parent: THREE.Object3D, x: number, y: number, z: number, angle: number, seated = true, arriving = false) { people.push({ parent, x, y, z, angle, seated, arriving }); }
  function desk(parent: THREE.Object3D, x: number, y: number, z: number, kind = 0) {
    box(parent, x, y + .79, z, 1.9, .07, .88, mats.oak);
    for (const dx of [-.78, .78]) box(parent, x + dx, y + .4, z, .045, .77, .68, mats.metal);
    monitor(parent, x, y + .83, z - .17, kind); box(parent, x, y + .84, z + .25, .52, .025, .17, mats.paper);
    for (let i = 0; i < 3; i++) box(parent, x + .64, y + .84 + i * .018, z, .24, .018, .3, mats.paper);
    cylinder(parent, x - .7, y + .9, z + .1, .045, .12, mats.cream);
    chair(parent, x, y, z + .8, Math.PI); person(parent, x, y, z + .79, Math.PI);
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.tile); geometries.push(ground.geometry); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const buildingGroups: THREE.Group[] = [];
  function building(x: number, z: number, kind: number) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.userData.feature = kind + 1; scene.add(g); buildingGroups.push(g);
    const w = 8.4, d = 6.3;
    box(g, 0, .12, 0, w + .65, .24, d + .65, mats.stone);
    box(g, 0, .265, 0, w, .045, d, mats.floor);
    box(g, 0, 3.45, 0, w + .3, .38, d + .3, mats.stone);
    box(g, 0, 6.55, 0, w + .32, .38, d + .32, mats.stone);
    // Recessed roof and fine parapet, not an open toy dollhouse.
    box(g, 0, 6.75, 0, w - .2, .04, d - .2, mats.cream);
    for (const sx of [-1, 1]) { box(g, sx * (w / 2), 6.84, 0, .14, .3, d + .3, mats.stone); box(g, 0, 6.84, sx * d / 2, w, .3, .14, mats.stone); }
    box(g, 0, 6.87, -.45, 3.4, .12, 2.1, mats.metal);
    box(g, 0, 6.95, -.45, 3.18, .04, 1.88, mats.glass);
    for (const floor of [.28, 3.65]) {
      box(g, 0, floor + 1.36, -d / 2 + .1, w - .5, 2.7, .14, mats.oak);
      // Warm oak batten wall and linear ceiling luminaires.
      for (let i = 0; i < 39; i++) box(g, -3.9 + i * .2, floor + 1.35, -2.99, .035, 2.67, .06, mats.oak);
      for (const dx of [-2.5, 2.5]) box(g, dx, floor + 2.72, 0, .065, .025, 4.8, mats.light);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, sx * (w / 2 - .16), floor + 1.35, sz * (d / 2 - .12), .34, 2.72, .34, mats.stone);
      for (let i = 0; i <= 4; i++) box(g, -4 + i * 2, floor + 1.35, d / 2, .045, 2.7, .08, mats.metal);
      for (let i = 0; i < 4; i++) {
        if (!(floor < 1 && i === 2)) box(g, -3 + i * 2, floor + 1.35, d / 2, 1.95, 2.64, .02, mats.glass);
      }
      for (const sx of [-1, 1]) {
        for (let i = 0; i <= 3; i++) box(g, sx * (w / 2), floor + 1.35, -3 + i * 2, .07, 2.7, .045, mats.metal);
        for (let i = 0; i < 3; i++) box(g, sx * (w / 2), floor + 1.35, -2 + i * 2, .02, 2.64, 1.95, mats.glass);
      }
      plant(g, -3.5, floor, 2.25); plant(g, 3.45, floor, -2.35, 1.05);
      const lamp = new THREE.PointLight(0xffe8be, 7, 8, 2); lamp.position.set(0, floor + 2.4, 0); g.add(lamp);
    }
    if (kind === 0) {
      box(g, 1.9, .83, .65, 3.0, 1.1, .88, mats.stone); box(g, 1.9, 1.41, .65, 3.08, .06, .94, mats.oak);
      monitor(g, 1.9, 1.44, .5, 2, Math.PI); chair(g, 1.9, .28, -.22); person(g, 1.9, .28, -.23, 0);
      box(g, -.1, .28, 2.85, 1.5, .04, 1.3, mats.chair);
      const kiosk = new THREE.Group(); kiosk.position.set(.65, .24, 3.85); g.add(kiosk);
      box(kiosk, 0, .06, 0, .55, .1, .49, mats.stone); box(kiosk, 0, .58, 0, .3, 1.05, .24, mats.paper);
      box(kiosk, 0, 1.4, 0, .6, .85, .085, mats.metal);
      const face = new THREE.Mesh(plane, screenMaterials[2]); face.position.set(0, 1.4, .046); face.scale.set(.54, .78, 1); kiosk.add(face);
      person(g, .1, .27, 5.15, Math.PI, false, true);
      box(g, -2.6, .64, .8, 1.8, .47, .72, mats.cream); box(g, -2.6, .94, .43, 1.8, .48, .09, mats.cream);
      desk(g, -1.8, 3.65, -.65, 1); desk(g, 1.5, 3.65, -.65, 1);
    } else if (kind === 1) {
      box(g, 0, 4.48, -.3, 4.0, .09, 1.5, mats.oak);
      for (const dx of [-1.4, 1.4]) box(g, dx, 4.02, -.3, .09, .88, .9, mats.metal);
      for (const dx of [-1.4, 0, 1.4]) for (const side of [-1, 1]) {
        const cz = -.3 + side * 1.17; chair(g, dx, 3.65, cz, side > 0 ? Math.PI : 0); person(g, dx, 3.65, cz, side > 0 ? Math.PI : 0);
        cylinder(g, dx + .2, 4.58, -.3 + side * .48, .045, .13, mats.paper);
        box(g, dx, 4.55, -.3 + side * .45, .45, .025, .3, mats.metal);
      }
      box(g, .7, 5.35, -2.88, 2.9, 1.36, .055, mats.paper);
      for (const dx of [-.5, .65, 1.8]) box(g, dx, 5.3, -2.837, .58, .24, .01, mats.cream);
      person(g, -2.4, 3.65, -1.8, .5, false);
      desk(g, -1.65, .28, -.3); desk(g, 1.65, .28, -.3);
    } else {
      for (const dx of [-2.3, 0, 2.3]) { desk(g, dx, 3.65, -.85); desk(g, dx, .28, -.5); }
      box(g, 2.8, 4.34, -2.72, 1.8, 1.4, .37, mats.cream);
      for (let i = 0; i < 12; i++) box(g, 2.05 + i * .13, 4.75, -2.51, .07, .48, .2, i % 3 ? mats.paper : mats.oak);
    }
    return g;
  }
  building(6, 7, 0); building(6, -5, 1); building(-7, -5, 2);
  // Ground-level connections: restrained purple inlay, no glow or floating roads.
  const sign = new THREE.Group(); sign.position.set(0, 0, 3.1); scene.add(sign);
  box(sign, 0, .15, 0, 1.7, .3, 1.0, mats.stone); box(sign, 0, 1.15, 0, 1.15, 1.75, .24, mats.stone);
  const logoMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
  const logoFace = new THREE.Mesh(plane, logoMaterial); logoFace.position.set(0, 1.25, .13); logoFace.scale.set(.94, .4, 1); sign.add(logoFace);
  new THREE.TextureLoader().load("/images/aspio-logo.webp", t => { if (disposed) { t.dispose(); return; } t.colorSpace = THREE.SRGBColorSpace; logoMaterial.map = t; logoMaterial.needsUpdate = true; textures.push(t); dirty = true; });
  function connection(points: V[]) {
    for (let i = 1; i < points.length; i++) {
      const from = new THREE.Vector3(...points[i - 1]), to = new THREE.Vector3(...points[i]);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, from.distanceTo(to), 6), mats.line); geometries.push(mesh.geometry); mesh.position.copy(from).add(to).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.sub(from).normalize()); scene.add(mesh);
    }
  }
  connection([[0, .03, 3.1], [3, .03, 6], [6.65, .03, 10.85]]);
  connection([[0, .03, 3.1], [3.5, .03, .5], [7, .03, -1.75]]);
  connection([[0, .03, 3.1], [-4.8, .03, -.3], [-6, .03, -1.75]]);
  for (const [x, z] of [[-11.9, -5], [11.4, -6], [-10.9, -9]]) {
    box(scene, x, .27, z, 1.4, .54, 1.2, mats.stone); plant(scene, x, .53, z, 2);
  }
  const anchorPositions = [new THREE.Vector3(6, 7.25, 7), new THREE.Vector3(6, 7.25, -5), new THREE.Vector3(-7, 7.25, -5)];
  const picking = new THREE.Raycaster(), pointer = new THREE.Vector2();
  let dirty = true, disposed = false, width = 1, height = 1, currentProgress = 0, hovered = -1;
  const eye = new THREE.Vector3(), at = new THREE.Vector3(), projected = new THREE.Vector3();
  const extraMaterials: THREE.Material[] = [logoMaterial, ...screenMaterials];
  const personRoots: THREE.Object3D[] = [];
  new GLTFLoader().load("/models/campus-colleague.glb", gltf => {
    if (disposed) { gltf.scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(m => m.dispose()); } }); return; }
    const modelBounds = new THREE.Box3().setFromObject(gltf.scene);
    const scale = 1.72 / modelBounds.getSize(new THREE.Vector3()).y;
    function aim(root: THREE.Object3D, name: string, childName: string, direction: THREE.Vector3) {
      const bone = root.getObjectByName(`mixamorig${name}`) || root.getObjectByName(`mixamorig:${name}`);
      const child = root.getObjectByName(`mixamorig${childName}`) || root.getObjectByName(`mixamorig:${childName}`);
      if (!bone || !child || !bone.parent) return;
      root.updateMatrixWorld(true);
      const initial = child.getWorldPosition(new THREE.Vector3()).sub(bone.getWorldPosition(new THREE.Vector3())).normalize();
      const world = bone.getWorldQuaternion(new THREE.Quaternion());
      world.premultiply(new THREE.Quaternion().setFromUnitVectors(initial, direction.normalize()));
      bone.quaternion.copy(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
    }
    people.forEach((p, index) => {
      const model = clone(gltf.scene); model.scale.setScalar(scale); model.position.set(p.x, p.y + (p.seated ? -.35 : 0), p.z); model.rotation.y = p.angle;
      p.parent.add(model); personRoots.push(model);
      model.traverse(object => { if (object instanceof THREE.Mesh) {
        object.castShadow = true; object.receiveShadow = true;
        const original = Array.isArray(object.material) ? object.material[0] : object.material;
        const material = original.clone() as THREE.MeshStandardMaterial; material.roughness = .84; material.envMapIntensity = .35;
        // Neutral workwear; retain the source model's detailed face and hair texture.
        const minY = modelBounds.min.y, h = modelBounds.getSize(new THREE.Vector3()).y;
        material.onBeforeCompile = shader => {
          shader.vertexShader = "varying float campusBodyHeight;\n" + shader.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\ncampusBodyHeight = (position.y - ${minY.toFixed(3)}) / ${h.toFixed(3)};`);
          shader.fragmentShader = "varying float campusBodyHeight;\n" + shader.fragmentShader.replace("#include <map_fragment>", "#include <map_fragment>\nif (campusBodyHeight > .37 && campusBodyHeight < .79) { float l = dot(diffuseColor.rgb, vec3(.299,.587,.114)); diffuseColor.rgb = vec3(l) * vec3(.82,.78,.72); }");
        };
        material.customProgramCacheKey = () => "campus-workwear"; object.material = material; extraMaterials.push(material);
      }});
      const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.angle);
      const dir = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(rotation);
      for (const side of ["Left", "Right"]) {
        const s = side === "Left" ? 1 : -1;
        aim(model, `${side}Arm`, `${side}ForeArm`, dir(s * .12, -.65, p.seated ? .28 : .06));
        aim(model, `${side}ForeArm`, `${side}Hand`, dir(s * .05, p.seated ? -.07 : -.55, p.seated ? .45 : .02));
        if (p.seated) {
          aim(model, `${side}UpLeg`, `${side}Leg`, dir(s * .055, -.05, .45));
          aim(model, `${side}Leg`, `${side}Foot`, dir(0, -.5, -.015));
        }
      }
      if (p.arriving) model.userData.arriving = true;
      model.userData.offset = index;
    });
    dirty = true;
  }, undefined, () => { dirty = true; });

  function resize() {
    width = Math.max(1, host.clientWidth); height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height); camera.aspect = width / height;
    // Compose the campus to the right of the live copy, without relocating any building.
    camera.setViewOffset(width, height, -width * (width < 700 ? 0 : .19), 0, width, height);
    camera.updateProjectionMatrix(); dirty = true;
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  function update(progress: number, reduced: boolean) {
    progress = THREE.MathUtils.clamp(progress, 0, 4);
    if (reduced) progress = Math.round(progress);
    if (Math.abs(progress - currentProgress) > .0001) dirty = true;
    currentProgress = progress;
    if (!dirty) return;
    const index = Math.min(3, Math.floor(progress)), t = progress - index;
    const smooth = t * t * (3 - 2 * t), from = poses[index], to = poses[index + 1];
    eye.fromArray(from.eye).lerp(new THREE.Vector3(...to.eye), smooth);
    at.fromArray(from.at).lerp(new THREE.Vector3(...to.at), smooth);
    if (width < 700) { eye.sub(at).multiplyScalar(1.28).add(at); }
    camera.position.copy(eye); camera.lookAt(at); camera.fov = THREE.MathUtils.lerp(from.fov, to.fov, smooth); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    anchorPositions.forEach((anchor, i) => {
      projected.copy(anchor).project(camera);
      const x = (projected.x * .5 + .5) * width, y = (-projected.y * .5 + .5) * height;
      const label = labels[i]; if (!label) return;
      label.style.setProperty("--label-x", `${x}px`); label.style.setProperty("--label-y", `${y}px`);
      label.dataset.inFrame = String(projected.z < 1 && x > 20 && x < width - 20 && y > 80 && y < height - 70);
    });
    renderer.render(scene, camera); host.dataset.camera = camera.position.toArray().map(n => n.toFixed(3)).join(",");
    host.dataset.geometry = String(scene.children.length); dirty = false;
  }
  function pick(event: PointerEvent) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / width * 2 - 1, -(event.clientY - bounds.top) / height * 2 + 1);
    picking.setFromCamera(pointer, camera);
    const hit = picking.intersectObjects(buildingGroups, true)[0];
    if (!hit) return -1;
    let object: THREE.Object3D | null = hit.object;
    while (object && object.userData.feature === undefined) object = object.parent;
    return object?.userData.feature ?? -1;
  }
  function highlight(index: number) {
    if (hovered === index) return;
    hovered = index; renderer.domElement.style.cursor = index > 0 ? "pointer" : "default";
    buildingGroups.forEach((g, i) => { g.traverse(o => { if (o instanceof THREE.Mesh && o.material === mats.glass) o.visible = true; }); labels[i]?.classList.toggle("is-hovered", i + 1 === index); }); dirty = true;
  }
  const click = (e: PointerEvent) => { const index = pick(e); if (index > 0) onSelect(index); };
  const move = (e: PointerEvent) => highlight(pick(e));
  const leave = () => highlight(-1);
  renderer.domElement.addEventListener("pointerup", click); renderer.domElement.addEventListener("pointermove", move); renderer.domElement.addEventListener("pointerleave", leave);
  const lost = (e: Event) => { e.preventDefault(); onError(); }; renderer.domElement.addEventListener("webglcontextlost", lost);
  update(0, true); onReady();
  return { update, highlight, dispose() {
    disposed = true; observer.disconnect();
    renderer.domElement.removeEventListener("pointerup", click); renderer.domElement.removeEventListener("pointermove", move); renderer.domElement.removeEventListener("pointerleave", leave); renderer.domElement.removeEventListener("webglcontextlost", lost);
    const geometrySet = new Set(geometries), materialSet = new Set<THREE.Material>([...Object.values(mats), ...extraMaterials]);
    scene.traverse(o => { if (o instanceof THREE.Mesh) { geometrySet.add(o.geometry); const materials = Array.isArray(o.material) ? o.material : [o.material]; materials.forEach(m => materialSet.add(m)); }});
    geometrySet.forEach(g => g.dispose()); materialSet.forEach(m => { for (const value of Object.values(m)) if (value instanceof THREE.Texture) value.dispose(); m.dispose(); }); textures.forEach(t => t.dispose()); env.dispose(); renderer.dispose(); renderer.domElement.remove();
  }};
}
