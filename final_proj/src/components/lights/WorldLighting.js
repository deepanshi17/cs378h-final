/**
 * WorldLighting.js
 *
 * This handles sun and special lighting.
 *
 */

import { Group, DirectionalLight, SpotLight, SpotLightHelper, SphereBufferGeometry,
  MeshStandardMaterial, PointLight, Mesh, DirectionalLightHelper, Vector3, Geometry } from 'three';
var ColorTween = require('color-tween');

class WorldLighting extends Group {

  constructor(parent) {
      super();

      this.state = {
        gui: parent.state.gui,
        sun: null,
        aura: null,
        spin_rate: 0.003,
        sun_start: new Vector3(0, 150, 650),
        sun_distance: 650,
        autosun: false,
        sun_angle: 0
      }
      var sunGeometry = new SphereBufferGeometry(20, 25, 25);
      var sun = new DirectionalLight(0xffee88, 2);
      var sunMat = new MeshStandardMaterial({
					emissive: 0xffffee,
					emissiveIntensity: 1,
					color: 0xffee78,
          transparent: true,
          depthOrder: 1 
			});
      sun.add(new Mesh(sunGeometry, sunMat));
      sun.target.position.set(0, 0, 0);
      var starting = this.state.sun_start.clone();
      sun.position.set(starting.x, starting.y, starting.z);
	  sun.castShadow = true;
      sun.power = 1000;
      sun.decay = 2;
      sun.distance = 700;
      this.state.sun = sun;

      // glow aura around sun
      var auraSphere = new SphereBufferGeometry(35, 25, 25);
      var aura = new DirectionalLight(0xffee88, 0.5);
      var glowMat = new MeshStandardMaterial({
					emissive: 0xffffee,
					emissiveIntensity: 1,
					color: 0xffee88,
          transparent: true,
          wireframe: false,
          opacity: 0.35
			} );
      aura.add(new Mesh(auraSphere, glowMat));
      aura.target.position.set(0, 0, 0);
      aura.position.set(starting.x, starting.y, starting.z);
      this.state.aura = aura;

      this.add(sun);
      this.add(sun.target);
      this.add(aura);
      this.add(aura.target);

      // populate GUI
      let folder = this.state.gui.addFolder('Sun');
      folder.add(this.state, 'sun_angle', 0, 360).name("Sun Angle").onChange(() => this.updateSunAngle());
      folder.add(this.state, 'autosun').name("Rotating Sun");

      // add this object to SeedScene's update list
      parent.addToQueue(this);
    }

    // update position of the sun based on angle

    updateSunAngle() {
      var sun = this.state.sun;
      var aura = this.state.aura;
      var radians = this.state.sun_angle * (Math.PI/180);
      var rotated = this.state.sun_start.clone().applyAxisAngle(new Vector3(1, 0, 0), radians);

      sun.position.set(rotated.x, rotated.y, rotated.z);
      aura.position.set(rotated.x, rotated.y, rotated.z);
    }

    // move the sun
    update(t) {
      if (this.state.autosun) {
        this.rotateOnAxis(new Vector3(1, 0, 0), this.state.spin_rate);
      }
    }
}

export default WorldLighting;
