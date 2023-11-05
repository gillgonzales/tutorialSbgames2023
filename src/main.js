import * as THREE from 'three'
import { createSkyBox } from './skybox'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

const QTD_ENEMIES = 5
const HIT_RADIUS = .125
let TOTAL_SHOTS = 1000

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(
  40, //campo de visao vertical 
  window.innerWidth / window.innerHeight, //aspecto da imagem (Largura/Altura)
  0.1, //Plano proximo
  1000 //Plano distante
);
camera.position.set(0, .25, 2)

const skyBox = await createSkyBox('bluesky', 500)
skyBox.position.y = .25
scene.add(skyBox)

const jetPath = 'models/f15c/'
const mtlFile = 'f15c.mtl'
const objFile = 'f15c.obj'

const manager = new THREE.LoadingManager();
const mtlLoader = new MTLLoader(manager);
const objLoader = new OBJLoader();

mtlLoader.setPath(jetPath)
objLoader.setPath(jetPath)

objLoader.setMaterials(await mtlLoader.loadAsync(mtlFile))
const jet = await objLoader.loadAsync(objFile)
const jetJoystick = { x: null, y: null }

jet.scale.setScalar(.5)
jet.position.y = -.2
jet.shots = new Array()
scene.add(jet)

const light = new THREE.AmbientLight(0xffffff, 10);
scene.add(light);

const plight = new THREE.PointLight(0xffffff, 500, 50,.5);
plight.position.set(0, 25, 10);
scene.add(plight);

const enemyMtlFile = 'f15c_e.mtl'
const enemyMtlLoader = new MTLLoader(manager);
const enemyObjLoader = new OBJLoader();

enemyMtlLoader.setPath(jetPath)
enemyObjLoader.setPath(jetPath)
enemyObjLoader.setMaterials(await enemyMtlLoader.loadAsync(enemyMtlFile))

const enemy = await enemyObjLoader.loadAsync(objFile)
enemy.scale.setScalar(.5)
enemy.position.y = .4
enemy.rotateY(3.14)
// enemy.position.z = -1
// scene.add(enemy)

const enemies = createEnemies()

const sphere_geometry = new THREE.SphereGeometry(HIT_RADIUS / 2, 64, 32);
const sphereColor = new THREE.MeshStandardMaterial({ color: 0xffff00 });
const sphere = new THREE.Mesh(sphere_geometry, sphereColor);
const hitSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), HIT_RADIUS)

function shooting() {
  if (TOTAL_SHOTS > 0) {
    if (jet.shots.length > 50)
      return 0
    TOTAL_SHOTS--
    const shot = {
      rx: jet.rotation.z,
      ry: jet.rotation.x,
      model: sphere.clone(),
      hit: hitSphere.clone(),
    }
    shot.hit.radius = HIT_RADIUS / 2
    shot.model.material.transparent = true
    shot.model.material.opacity = .5
    shot.model.material.emissive = new THREE.Color(0xffff00)
    shot.model.material.roughness = .5
    shot.model.material.metalness = 1
    shot.model.position.set(...jet.position)
    shot.hit.center.copy(shot.model.position)
    scene.add(shot.model)
    jet.shots.push(shot)
  } else {
    console.warn("ACABOU A MUNIÇÃO!!!")
  }
}

function updateShots() {
  if (jet.shots.length == 0) return 0
  jet.shots.forEach((shot) => {
    shot.model.position.z -= 1
    shot.model.position.x += -shot.rx / 2
    shot.model.position.y += shot.ry / 5
    shot.hit.center.copy(shot.model.position)
  })

  jet.shots = jet.shots.filter((shot) => {
    if (shot.model.position.z < -150) {
      scene.remove(shot.model)
      return false
    }
    return true
  })
}

function createEnemies() {
  let distance = 5
  let horizontalLimit = 5
  return Array.from({ length: QTD_ENEMIES }).map(() => {
    enemy.position.z = -(Math.random() * distance + distance)
    enemy.position.x = (Math.random() * (Math.random() > .5 ? 1 : -1));
    enemy.position.x *= horizontalLimit
    let enemyClone = {
      model: enemy.clone(),
      dead: false
    }
    scene.add(enemyClone.model)
    return enemyClone
  })
}

function moveEnemy(enemy) {
  let velocity = .16
  let distance = enemy.model.position.z
  if (!enemy.dead) {
    if (distance > 30) {
      enemy.model.position.z = -(Math.random() * 100 + 100)
      enemy.model.position.x = Math.random() * (Math.random() > .5 ? 5 : -5);
    } else if (distance > -40) {
      velocity += .48
    } else if (distance > -30) {
      velocity += .32
    } else if (distance > -10) {
      velocity += .24
    }
    enemy.model.position.z += velocity
  }
}

function updateJoystick(event) {
  if (!event.buttons) {
    jetJoystick.x = event.clientX
    jetJoystick.y = event.clientY
  } else {
    jetJoystick.x = null
    jetJoystick.y = null
  }
}

function moveJet() {
  if (jet
    && jetJoystick.x
    && jetJoystick.y) {

    let wh = window.innerHeight
    let ww = window.innerWidth

    jet.rotation.x += (jetJoystick.y - wh / 2) / wh / 100

    if (Math.abs(jet.position.x) > 1) {
      jet.position.x = jet.position.x / Math.abs(jet.position.x)
    } else {
      jet.rotation.z -= (jetJoystick.x - ww / 2) / ww / 10
    }

    if (Math.abs(jet.rotation.z) != 0) {
      jet.position.x += (jetJoystick.x - ww / 2) / ww / 10
      jet.rotation.y = jet.rotation.z / 2.5
    }

    if (Math.abs(jet.rotation.y) > .5)
      jet.rotation.y = .5 * (jet.rotation.y / Math.abs(jet.rotation.y))
  }
}

const gameLoop = () => {
  skyBox.rotation.y += .0001
  skyBox.position.z += .0001
  moveJet()
  enemies.forEach((e) => moveEnemy(e))
  renderer.render(scene, camera)
  requestAnimationFrame(gameLoop)
}

window.addEventListener('mousemove', updateJoystick)
window.addEventListener('click', shooting);
window.addEventListener('keydown', e =>{
  return ((e.key == ' ' || e.key == 'Enter') && shooting())
});

gameLoop()