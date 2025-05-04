import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/controls/PointerLockControls.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/geometries/TextGeometry.js';

const MAZE = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 2, 1], // Goal is at [4][3]
];
const CELL_SIZE = 10;
const GOAL_TEXT = "You made it!";

let camera, scene, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let clock = new THREE.Clock();
let goalReached = false;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 200, 0);
  scene.add(light);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshPhongMaterial({ color: 0x888888 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  createMaze();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, document.body);
  document.addEventListener('click', () => controls.lock());

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  setupMobileControls();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  camera.position.set(CELL_SIZE * 1.5, 5, CELL_SIZE * 1.5); // Start near center
}

function createMaze() {
  const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ff });
  const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
  const goalMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

  for (let z = 0; z < MAZE.length; z++) {
    for (let x = 0; x < MAZE[z].length; x++) {
      const cell = MAZE[z][x];
      if (cell === 1 || cell === 2) {
        const wall = new THREE.Mesh(wallGeometry, cell === 2 ? goalMaterial : wallMaterial);
        wall.position.set(x * CELL_SIZE, CELL_SIZE / 2, z * CELL_SIZE);
        wall.userData = { isGoal: cell === 2 };
        scene.add(wall);
      }
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if (moveForward || moveBackward) velocity.z -= direction.z * 100.0 * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * 100.0 * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  checkGoalReached();

  renderer.render(scene, camera);
}

function onKeyDown(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW': moveForward = true; break;
    case 'ArrowLeft':
    case 'KeyA': moveLeft = true; break;
    case 'ArrowDown':
    case 'KeyS': moveBackward = true; break;
    case 'ArrowRight':
    case 'KeyD': moveRight = true; break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW': moveForward = false; break;
    case 'ArrowLeft':
    case 'KeyA': moveLeft = false; break;
    case 'ArrowDown':
    case 'KeyS': moveBackward = false; break;
    case 'ArrowRight':
    case 'KeyD': moveRight = false; break;
  }
}

function checkGoalReached() {
  if (goalReached) return;
  const x = Math.floor(camera.position.x / CELL_SIZE);
  const z = Math.floor(camera.position.z / CELL_SIZE);
  if (MAZE[z] && MAZE[z][x] === 2) {
    goalReached = true;
    showGoalText();
  }
}

function showGoalText() {
  const loader = new FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
    const textGeometry = new TextGeometry(GOAL_TEXT, {
      font: font,
      size: 2,
      height: 0.5
    });
    const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const mesh = new THREE.Mesh(textGeometry, textMaterial);
    mesh.position.set(camera.position.x - 5, 5, camera.position.z - 5);
    scene.add(mesh);
  });
}

function setupMobileControls() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (!isMobile) return;

  document.getElementById('mobile-controls').style.display = 'block';

  document.getElementById('forward').ontouchstart = () => moveForward = true;
  document.getElementById('backward').ontouchstart = () => moveBackward = true;
  document.getElementById('left').ontouchstart = () => moveLeft = true;
  document.getElementById('right').ontouchstart = () => moveRight = true;

  document.getElementById('forward').ontouchend = () => moveForward = false;
  document.getElementById('backward').ontouchend = () => moveBackward = false;
  document.getElementById('left').ontouchend = () => moveLeft = false;
  document.getElementById('right').ontouchend = () => moveRight = false;
}
