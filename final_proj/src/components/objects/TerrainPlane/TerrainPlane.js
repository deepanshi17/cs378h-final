import { Group, Color, PlaneBufferGeometry, VertexColors, PlaneGeometry, MeshStandardMaterial, MeshLambertMaterial, Mesh} from 'three';
import  SimplexNoise  from 'simplex-noise';

const terrainSize = {width: 1000, height: 1000, vertsWidth: 100, vertsHeight: 100};

class TerrainPlane extends Group {

    constructor(parent, x_off, y_off, z_off, planeGeometry) {
        super();

        this.state = {
            gui: parent.state.gui,
            parent: parent,
            block_width: parent.state.block_width,
            block_vert_width: parent.state.block_vert_width,
            total_width: parent.state.total_width,
            x_off: x_off,
            y_off: y_off,
            z_off: z_off,

        };

        this.state.x_off = x_off*parent.state.block_vert_width/parent.state.block_width;
        this.state.z_off = z_off * parent.state.block_vert_width / parent.state.block_width;

        this.geometry = planeGeometry;
        this.geometry.verticesNeedUpdate = true;
        this.geometry.colorsNeedUpdate = true;
        this.heightMap = this.generateTexture(x_off, z_off);
        this.updateTerrainGeo();

        this.geometry.computeFlatVertexNormals()
        this.material = new MeshLambertMaterial({
            vertexColors: VertexColors,
            flatShading:true,
        });
        const terrain = new Mesh(this.geometry, this.material)
        const lowerTerrain = new Mesh(this.geometry, this.material)

        terrain.rotation.x = -Math.PI / 2;
        terrain.rotation.z = -Math.PI / 2;
        terrain.receiveShadow = true;
        terrain.castShadow = true;

        lowerTerrain.rotation.x = -Math.PI / 2;
        lowerTerrain.rotation.z = -Math.PI / 2;
        lowerTerrain.receiveShadow = false;
        lowerTerrain.castShadow = false;
        lowerTerrain.position.y = -15;

        this.add(terrain);
        this.add(lowerTerrain);

    }

    updateTerrainGeo() {
      for(let j = 0; j < this.heightMap.length; j++) {
          for (let i = 0; i < this.heightMap[0].length; i++) {
              const index = (j*(this.heightMap.length)+i)
              const v1 = this.geometry.vertices[index]
              if(this.state.parent.state.terraced == true) {
                v1.z = (Math.round(Math.pow(this.heightMap[j][i], Math.ceil(this.state.parent.state.power)) * this.state.parent.state.terraces)/this.state.parent.state.terraces)*this.state.parent.state.exaggeration*10
              }
              else {
                v1.z = Math.pow(this.heightMap[j][i], Math.ceil(this.state.parent.state.power))*this.state.parent.state.exaggeration*10
              }
          }
      }
      this.geometry.faces.forEach(f=>{
          const a = this.geometry.vertices[f.a]
          const b = this.geometry.vertices[f.b]
          const c = this.geometry.vertices[f.c]

          var wiggle = this.state.parent.state.colorWiggle * 25;
          const max = (a.z+b.z+c.z)/3

          var ratio = (max - this.state.parent.state.waterLevel)/(this.state.parent.state.exaggeration*7);

          if(ratio >= 1) return f.color.setRGB((this.state.parent.state.peakColor.r+ Math.random()*wiggle)/255, (this.state.parent.state.peakColor.g+ Math.random()*wiggle)/255, (this.state.parent.state.peakColor.b+ Math.random()*wiggle)/255)


          if(ratio >= this.state.parent.state.middleGradient) {
            ratio = (ratio-this.state.parent.state.middleGradient)/this.state.parent.state.middleGradient;
            return f.color.setRGB((this.state.parent.state.peakColor.r*ratio + this.state.parent.state.middleColor.r*(1-ratio) + Math.random()*wiggle)/255,
                                    (this.state.parent.state.peakColor.g*ratio + this.state.parent.state.middleColor.g*(1-ratio) + Math.random()*wiggle)/255,
                                    (this.state.parent.state.peakColor.b*ratio + this.state.parent.state.middleColor.b*(1-ratio) + Math.random()*wiggle)/255);
          }

          if(ratio < 0) {
            ratio = 1 + ratio;
            return f.color.setRGB((this.state.parent.state.bankColor.r*ratio + this.state.parent.state.waterColor.r*(1-ratio) + Math.random()*wiggle)/255,
                                    (this.state.parent.state.bankColor.g*ratio + this.state.parent.state.waterColor.g*(1-ratio) + Math.random()*wiggle)/255,
                                    (this.state.parent.state.bankColor.b*ratio + this.state.parent.state.waterColor.b*(1-ratio) + Math.random()*wiggle)/255);

          }

          ratio = (ratio)/this.state.parent.state.middleGradient;
          return f.color.setRGB((this.state.parent.state.middleColor.r*ratio + this.state.parent.state.bankColor.r*(1-ratio) + Math.random()*wiggle)/255,
                                    (this.state.parent.state.middleColor.g*ratio + this.state.parent.state.bankColor.g*(1-ratio) + Math.random()*wiggle)/255,
                                    (this.state.parent.state.middleColor.b*ratio + this.state.parent.state.bankColor.b*(1-ratio) + Math.random()*wiggle)/255);

      })

      this.geometry.verticesNeedUpdate = true;
      this.geometry.colorsNeedUpdate = true;
      this.geometry.computeFlatVertexNormals();
    }

    updateNoise() {
      this.heightMap = this.generateTexture();

      this.updateTerrainGeo();
    }
    noise(nx, ny, simplex) {
        return simplex.noise2D(nx,ny);
    }
    octave(nx,ny,octaves, simplex, x_off, z_off) {
        let val = 0;
        let freq = this.state.parent.state.freq;
        let max = 0;
        let amp = 1; 
        for(let i=0; i<octaves; i++) {
            val += this.noise(nx*freq, ny*freq, simplex)*amp;
            max += amp;
            amp /= 2;
            freq  *= 2;
        }
        return val/max;
    }

    generateTexture() {

        var simplex = this.state.parent.state.simplex;

        const canvas = new Array(this.state.block_vert_width);
        for (var i = 0; i < canvas.length; i++) {
          canvas[i] = new Array(this.state.block_vert_width);
        }

        for(let i=0; i<this.state.block_vert_width; i++) {
            for(let j=0; j<this.state.block_vert_width; j++) {
                let v =  this.octave((i - this.state.block_vert_width - this.state.x_off + 1 + Math.floor(this.state.x_off/this.state.block_vert_width))/(this.state.total_width-3),
                                     (j + this.state.block_vert_width + this.state.z_off - 1 - Math.floor(this.state.z_off/this.state.block_vert_width))/(this.state.total_width-3),
                                      this.state.parent.state.octaves, simplex)
                canvas[i][j] = v
            }
        }
        return canvas
    }
    disposeOf() {
      this.material.dispose();
      this.remove(this.children[0]);
      this.remove(this.children[1]);

      return this.geometry;
    }

}

export default TerrainPlane;
