import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

console.log("✅ Script cargado correctamente");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101010);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.innerHTML = "";
document.body.appendChild(renderer.domElement);
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
camera.position.set(2, 2, 5);
const orthoCam = new THREE.OrthographicCamera(-2 * aspect, 2 * aspect, 2, -2, 0.1, 1000);
orthoCam.position.set(2, 2, 5);

let activeCamera = camera;

const controls = new OrbitControls(activeCamera, renderer.domElement);
controls.enableDamping = true;

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial({ color: 0x00ff00 })
);
scene.add(cube);

const hud = document.createElement("div");
hud.id = "hud";
hud.style.position = "absolute";
hud.style.top = "10px";
hud.style.left = "10px";
hud.style.color = "white";
hud.style.fontFamily = "monospace";
hud.style.background = "rgba(0,0,0,0.5)";
hud.style.padding = "8px";
hud.style.borderRadius = "8px";
document.body.appendChild(hud);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();

  const point3D = new THREE.Vector3(1, 1, 0);
  const projected = point3D.clone().project(activeCamera);
  const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

  hud.innerHTML = `
    <b>Cámara:</b> ${activeCamera.isPerspectiveCamera ? "Perspectiva" : "Ortográfica"}<br>
    <b>Posición:</b> (${activeCamera.position.x.toFixed(2)}, ${activeCamera.position.y.toFixed(2)}, ${activeCamera.position.z.toFixed(2)})<br>
    <b>Punto proyectado:</b> (${x.toFixed(1)}, ${y.toFixed(1)})
  `;

  renderer.render(scene, activeCamera);
}
animate();

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "c") {
    activeCamera = activeCamera === camera ? orthoCam : camera;
    controls.object = activeCamera;
  }
});

window.addEventListener("resize", () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  orthoCam.left = -2 * aspect;
  orthoCam.right = 2 * aspect;
  orthoCam.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
