import { Group, Vector3, AnimationMixer, NumberKeyframeTrack, AnimationClip, Euler} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Flamingo from './flamingo.glb';

class Bird extends Group {
  constructor(parent, camera) {
      super();

      this.state = {
          gui: parent.state.gui,
          parent: parent,

          camera: camera,
          speed: 1000,

          input: [],
          position: 'ArrowDown',
          animation: null,
          action: null,
          changed: false,
          repeated: true,

        bird: 'Flamingo',
        mod: null,
          mixer: null,

        t_i: null,
        t_up: 0,
        t_down: 0,
        t_r: 0,
        t_l: 0,
        t_forward: 0,
        t_back: 0,

        rot_x: 0,
        rot_y: 0,
        rot_z: 0,
          velocity: 2,
      };

      this.name = 'bird';
      this.onLoad('Flamingo');

      let folder = this.state.gui.addFolder('Animation');
      folder.add(this.state, 'velocity', 0, 5).onChange((e) => {this.state.velocity = e;});

      window.addEventListener('keydown', (e) => {
        this.birdHandler(e);
      }, false);
      window.addEventListener('keyup', (e) => {
        this.state.input[e.keyCode] = false;
      }, false);

      parent.addToQueue(this);
  }

  // move bird with WASD

  birdHandler(e) {

    let arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrows.includes(e.key)) {
      this.cameraHandler(e);
    }

      this.state.input[e.keyCode] = true;

    // w key

    if (this.state.input[87]) {
      this.state.t_up = e.t;
    }

    // s space key

    if (this.state.input[83]) {
      this.state.t_down = e.t;
      this.state.repeated = e.repeat;
    }

    // d key

    if (this.state.input[68]) {
      this.state.t_r = e.t;
    }

    // a key

    if (this.state.input[65]) {
      this.state.t_l = e.t;
    }
  }

  cameraHandler(e) {
    this.state.position = e.key;
    return;
  }


  onLoad(bird) {
    // Previous position of the bird

    let last_pos;

    if (this.state.mod !== null) {
        last_pos = this.state.mod;
        this.state.mixer = null;
        this.state.t_i = null;

      this.remove(this.state.mod);
      this.state.mod.geometry.dispose();
      this.state.mod.material.dispose();
        this.state.mod = null;

        this.state.speed = 1000;
        this.state.action = null;
        this.state.animation = null;
        this.state.changed = false;

      this.state.t_up = 0;
      this.state.t_down = 0;
      this.state.t_r = 0;
      this.state.t_l = 0;

    }
    const loader = new GLTFLoader();
    loader.load(Flamingo, (gltf) => {
      const mod = gltf.scene.children[0];
      if (last_pos == null) {
        mod.position.copy(new Vector3(0, 0, 0));
      }
      else {
        mod.position.copy(last_pos.position);
        mod.rotation.copy(last_pos.rotation);
      }

      mod.rotation.reorder('YXZ');
      this.state.rot_x = mod.rotation.x;
      this.state.rot_y = mod.rotation.y;
      this.state.rot_z = mod.rotation.z;

        this.state.animation = gltf.animations[0];

      const mixer = new AnimationMixer(mod);
      this.state.mixer = mixer;

      this.state.action = this.state.mixer.clipAction(this.state.animation);
      this.state.action.play();
      this.state.mod = mod;
      this.add(mod);
    })
  };

  update(t, x, y, z) {
      if (this.state.mod != null) {

      if (this.state.input[87]) {
        if (this.state.rot_x >= -0.5) {
          this.state.rot_x -= 0.008;
        }

        if (this.state.speed >= 700) {
          this.state.speed -= 150;
        }

        this.state.parent.state.y -= 0.5;
      }

      if (this.state.input[83]) {
        if (this.state.rot_x <= 0.5) {
            this.state.rot_x += 0.008;
        }

        let animation = this.state.animation.clone();
        let track =  animation.tracks[0];
        let values = track.values;

        let vals = [5,18,33,48,63,79,94,109,124,139,152,165,178,191,201];

        for (let i = 0; i <= values.length - 1; i++) {
          if (vals.includes(i)) {
            values[i] = 1;
          }
          else {
            values[i] = 0;
          }
        }

        this.state.speed = 1500;
        if (!this.state.repeated) {
          const action = this.state.mixer.clipAction(animation);
          this.state.action = this.state.action.crossFadeTo(action, 1, true);
            this.state.action.play();

          this.state.changed = true;
        }

        if (this.state.parent.state.y <= 100) {
          this.state.parent.state.y += .8;
        }
      }

      if (this.state.input[65]) {
        if (this.state.rot_z >= -0.5) {
          this.state.rot_z -= 0.02;
        }
        this.state.rot_y += 0.008;
        this.state.rot_y = this.state.rot_y % (2 * Math.PI);
      }

      if (this.state.input[68]) {
        if (this.state.rot_z <= 0.5) {
          this.state.rot_z += 0.02;
        }
        if (this.state.rot_y <= 0) {
          this.state.rot_y = 2 * Math.PI;
        }
        this.state.rot_y -= 0.008;
      }

      this.state.mod.rotation.x = this.state.rot_x;
      this.state.mod.rotation.y = this.state.rot_y;
      this.state.mod.rotation.z = this.state.rot_z;

          this.state.parent.state.z += Math.cos(this.state.rot_y) * this.state.velocity;
          this.state.parent.state.x += Math.sin(this.state.rot_y) * this.state.velocity;

      if (this.state.t_up + 1000 < t) {
        if (this.state.rot_x <= 0.008) {
          this.state.rot_x += 0.008;
        }
        if (this.state.speed <= 1000) {
          this.state.speed += 50;
        }
      }
      if (this.state.t_down + 1000 < t) {
        if (this.state.rot_x >= 0.008) {
          this.state.rot_x -= 0.008;
        }
      }
      if (this.state.t_down + 1000 < t && this.state.changed) {
          this.state.speed = 1000;

        this.state.mixer.stopAllAction();
        const action = this.state.mixer.clipAction(this.state.animation);
        this.state.action = this.state.action.crossFadeTo(action, 1, true);
          this.state.action.play();

        this.state.changed = false;
      }
      if (this.state.t_l + 1000 < t) {
        if (this.state.rot_z <= 0) {
          this.state.rot_z += 0.008;
        }
      }
      if (this.state.t_r + 1000 < t) {
        if (this.state.rot_z >= 0) {
          this.state.rot_z -= 0.008;
        }
      }
      // Update camera based on camera position

      // front

      if (this.state.position == 'ArrowUp') {
        this.state.camera.position.x = 300 * Math.sin((this.state.rot_y - Math.PI/10));
        this.state.camera.position.y = 350 * Math.sin(-(this.state.rot_x - Math.PI/15));
        this.state.camera.position.z = 300 * Math.cos(-(this.state.rot_y - Math.PI/10));
      }
      // back

      else if (this.state.position == 'ArrowDown') {
        this.state.camera.position.x = 300 * Math.sin(-this.state.rot_y);
        this.state.camera.position.y = 350 * Math.sin(this.state.rot_x + Math.PI/15);
        this.state.camera.position.z = -300 * Math.cos(this.state.rot_y);
      }
      // left

      else if (this.state.position == 'ArrowLeft') {
        this.state.camera.position.x = 300 * Math.sin((this.state.rot_y + Math.PI/2));
        this.state.camera.position.y = 350 * Math.sin(-(this.state.rot_x - Math.PI/15));
        this.state.camera.position.z = 300 * Math.cos(-(this.state.rot_y + Math.PI/2));
      }
      // right

      else if (this.state.position == 'ArrowRight') {
        this.state.camera.position.x = 300 * Math.sin((this.state.rot_y - Math.PI/2));
        this.state.camera.position.y = 350 * Math.sin(-(this.state.rot_x - Math.PI/15));
        this.state.camera.position.z = 300 * Math.cos(-(this.state.rot_y - Math.PI/2));
      }

      this.state.camera.lookAt(this.state.mod.position);

    }


      if (this.state.t_down + 1000 < t && this.state.t_up + 1000 < t && this.state.velocity >= 2){
      if (this.state.velocity >= 4) {
        this.state.speed = 1800 / 4;
      }
      else {this.state.speed = 1800 / this.state.velocity;}
    }

    //  animation

    if (this.state.mixer !== null) {
      if (this.state.t_i === null) {
        this.state.t_i = t;
      }

      const dif = (t - this.state.t_i) / this.state.speed;
      this.state.t_i = t;
      this.state.mixer.update(dif);
    }
  }
}

export default Bird;
