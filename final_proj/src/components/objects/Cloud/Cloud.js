import { Group, TextureLoader, IcosahedronGeometry, Geometry, BufferGeometry, InstancedMesh, MeshLambertMaterial, Object3D} from 'three';
import img from './cloudy.png';

class Cloud extends Group {
    constructor(parent, type) {
        super();
        let size = 20;
        let num = 2;

        let x = 140;
        let z = -1000;
        let y = 5;
        
        var geometry = new Geometry();

        var p1;
        var p2;
        var p3;

        if (type == 0) {
            p1 = new IcosahedronGeometry(0.5*size, 1);
            p2 = new IcosahedronGeometry(0.4*size, 1);
            p3 = new IcosahedronGeometry(0.3*size, 1);

            p2.translate(x,y,z);
            p1.translate(-0.5*size + x,y,z);
            p3.translate(0.5*size + x, y,z);

            geometry.merge(p1);
            geometry.merge(p2);
            geometry.merge(p3);
        }
        else {
            p1 = new IcosahedronGeometry(0.4*size, 1);
            p2 = new IcosahedronGeometry(0.6*size, 1);
            p3 = new IcosahedronGeometry(0.5*size, 1);

            p2.translate(x,y,z);
            p1.translate(-0.6*size + x,y - 0.2*size,z);
            p3.translate(0.6 * size + x, y - 0.2 * size, z);

            geometry.merge(p1);
            geometry.merge(p2);
            geometry.merge(p3);
        }
        this.geometry = new BufferGeometry().fromGeometry(geometry);
        var texture = new TextureLoader().load(img);
        this.material = new MeshLambertMaterial({
            map:texture,
            transparent: true,
            opacity: 0.5,
        });

        let mesh = new InstancedMesh(this.geometry, this.material, num );
        let orientation = new Object3D();

        let offset = 100;
        let off_x  = 100;

        for( let i = 0; i < num; i ++ ) {
            orientation.position.set(Math.random() * 2000 - 1000, 400 + Math.random() * 100, Math.random() * 2000 - 1000);
            if (i % 2 == 0) {
                orientation.rotation.y = Math.PI;
            }
            else {
                orientation.rotation.y = -Math.PI;
            }
            orientation.updateMatrix();
            mesh.setMatrixAt( i, orientation.matrix );
        }


        this.add( mesh );

    }
    disposeOf() {
        this.material.dispose()
  
        return this.geometry;
      }
}

export default Cloud;
