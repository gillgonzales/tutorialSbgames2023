import * as THREE from 'three'
import { createSkyBox } from './skybox'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';


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
enemy.position.z = -1
scene.add(enemy)

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

const gameLoop=()=>{
  skyBox.rotation.y += .0001
  skyBox.position.z += .0001
  moveJet()
  renderer.render(scene, camera)
	requestAnimationFrame(gameLoop)
}

window.addEventListener('mousemove', updateJoystick)

gameLoop()