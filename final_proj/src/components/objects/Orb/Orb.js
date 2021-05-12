import { Group, TextGeometry, MeshBasicMaterial, FontLoader, Mesh, MeshLambertMaterial,TextureLoader, InstancedMesh, DynamicDrawUsage,Object3D, Matrix4 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import ORB from './orb.png';
import 'three/examples/fonts/helvetiker_regular.typeface.json';
import FONT_PATH from './font.json';

class Orb extends Group {
    constructor(parent) {
        super();

        this.state = {
            gui: parent.state.gui,
            mesh: null,
            sphere: null,
            parent: parent,
            orientation: null,
            isDisplayed: true,
        };

        this.name = 'orb';

        if(Math.random() > 0.4) {
          this.state.isDisplayed = false;
          return;
        }
        this.updateOrbs(this.state.numOrb);
    }

    updateOrbs() {

      if(this.state.isDisplayed == false) { return; }

      if (this.state.mesh != null || this.state.sphere != null) {
        this.remove(this.state.mesh);
        this.state.mesh.geometry.dispose();
        this.state.mesh.material.dispose();
        this.state.sphere.geometry.dispose();
        this.state.sphere.material.dispose();
        this.state.mesh = null;
        this.state.sphere = null;
        this.state.orientation = null;
      }

      var loader = new FontLoader();
      var that = this;
      let font = loader.load(FONT_PATH, function ( font ) {

        let texture = new TextureLoader().load(ORB);
        let material = new MeshLambertMaterial({
          transparent: true,
          opacity: 0.85,
        });

        let sphere = new Mesh( geometry, material );
        let mesh = new InstancedMesh( geometry, material, that.state.parent.state.num);

        let orientation = new Object3D();
        that.state.orientation = orientation;

        for (let i = 0; i < that.state.parent.state.num; i ++ ) {
            orientation.position.set(Math.random() * 1000 - 500, Math.random() * 300, Math.random() * 1000 - 500);

            orientation.updateMatrix();
            mesh.setMatrixAt( i, orientation.matrix );
        }

        that.state.mesh = mesh;
        that.state.sphere = sphere;
        mesh.rotation.y = Math.PI;
        that.add( mesh );
      });
    }

    disposeOf() {
      if(this.state.isDisplayed == false) {return;}
      if(this.state.mesh != null) {
        this.state.mesh.geometry.dispose()
        this.state.mesh.material.dispose()
        this.remove(this.state.mesh)
      }
    }
}

export default Orb;
