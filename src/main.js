import * as THREE from 'three'
import { createSkyBox } from './skybox'

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

const gameLoop=()=>{
  renderer.render(scene, camera)
	requestAnimationFrame(gameLoop)
}
gameLoop()