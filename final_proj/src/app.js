/**
 * app.js
 */
import { WebGLRenderer, PerspectiveCamera, PCFShadowMap } from 'three';
import { SeedScene } from 'scenes';

let bootstrap = '<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk" crossorigin="anonymous">';
document.head.innerHTML += bootstrap;

const renderer = new WebGLRenderer({ antialias: true });
renderer.xr.enabled = true;

const camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
const scene = new SeedScene(camera);

const windowHandler = () => {
    const { innerHeight, innerWidth } = window;
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
};
windowHandler();
window.addEventListener('resize', windowHandler, false);

renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled;
renderer.shadowMap.type = PCFShadowMap;

const canvas = renderer.domElement;
canvas.style.display = 'block';
document.body.appendChild(canvas);

const onAnimation = (t) => {
      scene.update && scene.update(t);
      renderer.render(scene, camera);
};
renderer.setAnimationLoop(onAnimation);
