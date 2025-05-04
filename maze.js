import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const MAZE = [
  [1,1,1,1,1],
  [1,0,0,0,1],
  [1,0,1,0,1],
  [1,0,1,0,1],
  [1,1,1,2,1],
];

const GOAL_TEXT = "You Win!";
const CELL_SIZE = 10;
let camera, scene, renderer, controls;
let velocity = new THREE.Vector3();
let moveForward, moveBackward, moveLeft, moveRight;
let font, goalWall;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new PointerLockControls(camera, renderer.domElement);
  scene.add(controls.getObject());

  // Mobile controls
  document.getElementById('forward').addEventListener('touchstart', () => moveForward = true);
  document.getElementById('forward').addEventListener('touchend', () => moveForward = false);
  document.getElementById('backward').addEventListener('touchstart', () => moveBackward = true);
  document.getElementById('backward').addEventListener('touchend', () => moveBackward = false);
  document.getElementById('left').addEventListener('touchstart', () => moveLeft = true);
  document.getElementById('left').addEventListener('touchend', () => moveLeft = false);
  document.getElementById('right').addEventListener('touchstart', () => moveRight = true);
  document.getElementById('right').addEventListener('touchend', () => moveRight = false);

  document.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'ArrowUp': case 'KeyW': moveForward = true; break;
      case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
      case 'ArrowDown': case 'KeyS': moveBackward = true; break;
      case 'ArrowRight': case 'KeyD': moveRight = true; break;
    }
  });
  document.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'ArrowUp': case 'KeyW': moveForward = false; break;
      case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
      case 'ArrowDown': case 'KeyS': moveBackward = false; break;
      case 'ArrowRight': case 'KeyD': moveRight = false; break;
    }
  });

  document.body.addEventListener('click', () => controls.lock());

  // Touch-look
  let touchStartX = 0;
  const touchSensitivity = 0.002;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
  });
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - touchStartX;
      controls.getObject().rotation.y -= deltaX * touchSensitivity;
      touchStartX = e.touches[0].clientX;
    }
  });

  // Lighting
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 100, 0);
  scene.add(light);

  createMaze();
  loadFont();

  // Initial position
  controls.getObject().position.set(CELL_SIZE * 1.5, 5, CELL_SIZE * 1.5);

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createMaze() {
  const wallHeight = 10;
  const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, wallHeight, CELL_SIZE);

  const loader = new THREE.TextureLoader();
  const wallTexture = loader.load('https://threejs.org/examples/textures/brick_diffuse.jpg');
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  wallTexture.repeat.set(1, 1);

  const wallMaterial = new THREE.MeshPhongMaterial({ map: wallTexture });
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
  const ceilingMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });

  for (let z = 0; z < MAZE.length; z++) {
    for (let x = 0; x < MAZE[z].length; x++) {
      const px = x * CELL_SIZE;
      const pz = z * CELL_SIZE;

      if (MAZE[z][x] === 1) {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(px, wallHeight / 2, pz);
        scene.add(wall);
        if (z === MAZE.length - 2 && x === MAZE[0].length - 2) goalWall = wall;
      } else {
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE),
          floorMaterial
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(px, 0, pz);
        scene.add(floor);

        const ceiling = new THREE.Mesh(
          new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE),
          ceilingMaterial
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(px, wallHeight, pz);
        scene.add(ceiling);
      }
    }
  }
}

function loadFont() {
  const loader = new FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (loadedFont) => {
    font = loadedFont;
  });
}

function isWalkable(x, z) {
  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(z / CELL_SIZE);
  return MAZE[row] && MAZE[row][col] === 0;
}

function animate() {
  requestAnimationFrame(animate);

  const delta = 0.05;
  velocity.set(0, 0, 0);
  if (moveForward) velocity.z -= 200.0 * delta;
  if (moveBackward) velocity.z += 200.0 * delta;
  if (moveLeft) velocity.x -= 200.0 * delta;
  if (moveRight) velocity.x += 200.0 * delta;

  const direction = controls.getDirection(new THREE.Vector3()).clone();
  direction.y = 0;
  direction.normalize();

  const pos = controls.getObject().position;
  const nextX = pos.x + direction.x * -velocity.z * delta + direction.z * -velocity.x * delta;
  const nextZ = pos.z + direction.z * -velocity.z * delta - direction.x * -velocity.x * delta;

  if (isWalkable(nextX, nextZ)) {
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
  }

  // Goal detection
  if (goalWall && font) {
    const distance = controls.getObject().position.distanceTo(goalWall.position);
    if (distance < CELL_SIZE * 1.5 && !goalWall.userData.solved) {
      const textGeo = new TextGeometry(GOAL_TEXT, {
        font: font,
        size: 2,
        height: 0.5,
      });
      const textMat = new THREE.MeshPhongMaterial({ color: 0xffff00 });
      const textMesh = new THREE.Mesh(textGeo, textMat);
      textGeo.computeBoundingBox();
      const bbox = textGeo.boundingBox;
      const textWidth = bbox.max.x - bbox.min.x;
      textMesh.position.set(
        goalWall.position.x - textWidth / 2,
        goalWall.position.y + 3,
        goalWall.position.z
      );
      scene.add(textMesh);
      goalWall.userData.solved = true;
    }
  }

  renderer.render(scene, camera);
}
