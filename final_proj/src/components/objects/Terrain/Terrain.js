import { Group, Color, PlaneBufferGeometry, VertexColors, PlaneGeometry, MeshStandardMaterial, MeshLambertMaterial, Mesh, Vector2} from 'three';
import  SimplexNoise  from 'simplex-noise';

const terrainSize = {width: 1000, height: 1000, vertsWidth: 100, vertsHeight: 100};

class Terrain extends Group {

    constructor(parent) {
        super();

        this.state = {
            gui: parent.state.gui,

            base: new Color(0, 155, 0),
            mid: new Color(155, 0, 0),
            peak: new Color(0, 0, 255),
            room: 0.1,
            middleGradient: 0.5,

            waterColor: new Color(10, 90, 145),
            waterLevel: 0,

            octaves: 8,
            exaggeration: 20,
            freq: 1,
            randSeed: 4,
            
            
            breathOffset: 5,
            breathLength: 5,
            currentOffset: 0
        };

        this.geometry = new PlaneGeometry(terrainSize.width,terrainSize.height,
                                    terrainSize.vertsWidth-1,terrainSize.vertsHeight-1);
        this.geometry.verticesNeedUpdate = true;
        this.geometry.colorsNeedUpdate = true;



        this.heightMap = this.generateTexture()
        this.updateTerrainGeo();

        this.geometry.computeFlatVertexNormals();
        const terrain = new Mesh(this.geometry, new MeshLambertMaterial({
            vertexColors: VertexColors,
            flatShading: true,
        }))

        let groundY = -200 
        terrain.position.y = groundY - 1;
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;

        this.add(terrain);

        parent.addToQueue(this);

        var folder0 = this.state.gui.addFolder( 'World Generation' );
        folder0.add(this.state, 'octaves', 1, 8).name("Noise").onChange(() => this.updateNoise()) ;
        folder0.add(this.state, 'freq', 1, 10).name("Height").onChange(() => this.updateNoise());
        
        var folder = this.state.gui.addFolder( 'TERRAIN LOOK FACTORS' );
        folder.add(this.state, 'exaggeration', 0, 70).onChange(() => this.updateTerrainGeo());
        folder.add(this.state, 'waterLevel', -100, 100).name("Water Level").onChange(() => this.updateTerrainGeo());
        folder.add(this.state, 'room', -1, 1).name("Color Texturing").onChange(() => this.updateTerrainGeo());

        folder.open();
    }

    update(t, x, y, z) {
        /*console.log("update")
        var offset = this.state.breathOffset*Math.sin(t/(this.state.breathLength*1000));
        offset *= 10;
        console.log(offset)
        for(let i = 0; i < this.geometry.vertices.length; i++) {
          console.log("z = " + this.geometry.vertices[i].z);
          if(this.geometry.vertices[i] > this.state.waterLevel) {
            this.geometry.vertices[i].z = this.geometry.vertices[i].z + offset;
          }
        } */

        //console.log("TS = " + t + "(" + x + ", " + y + ", " + z + ")")
    }

    updateTerrainGeo() {
      for(let j = 0; j < this.heightMap.length; j++) {
          for (let i = 0; i < this.heightMap[0].length; i++) {
              const index = (j*(this.heightMap.length)+i)
              const v1 = this.geometry.vertices[index]
              v1.z = this.heightMap[j][i]*this.state.exaggeration*10
              v1.z = Math.max(this.state.waterLevel, v1.z)
          }
      }

      this.geometry.faces.forEach(f => {
          const a = this.geometry.vertices[f.a]
          const b = this.geometry.vertices[f.b]
          const c = this.geometry.vertices[f.c]

          var wiggle = this.state.room * 25;
          const max = (a.z+b.z+c.z)/3
          if(max <= this.state.waterLevel) {
            return f.color.setRGB((this.state.waterColor.r + Math.random()*wiggle)/255,
            (this.state.waterColor.g + Math.random()*wiggle)/255,
            (this.state.waterColor.b + Math.random()*wiggle)/255)
          }
          if(max - this.state.waterLevel > this.state.exaggeration*7) return f.color.setRGB((this.state.peak.r+ Math.random()*wiggle)/255, (this.state.peak.g+ Math.random()*wiggle)/255, (this.state.peak.b+ Math.random()*wiggle)/255)

          var ratio = (max - this.state.waterLevel)/(this.state.exaggeration*7);

          if(ratio >= this.state.middleGradient) {
            ratio = (ratio-this.state.middleGradient)/this.state.middleGradient;
            return f.color.setRGB((this.state.peak.r*ratio + this.state.mid.r*(1-ratio)
            + Math.random()*wiggle)/255,
            (this.state.peak.g*ratio + this.state.mid.g*(1-ratio) + Math.random()*wiggle)/255,
            (this.state.peak.b*ratio + this.state.mid.b*(1-ratio) + Math.random()*wiggle)/255);
          }

          ratio = (ratio)/this.state.middleGradient;
          return f.color.setRGB((this.state.mid.r*ratio + this.state.base.r*(1-ratio) + Math.random()*wiggle)/255,
                                    (this.state.mid.g*ratio + this.state.base.g*(1-ratio) + Math.random()*wiggle)/255,
                                    (this.state.mid.b*ratio + this.state.base.b*(1-ratio) + Math.random()*wiggle)/255);

      })

      this.geometry.verticesNeedUpdate = true;
      this.geometry.colorsNeedUpdate = true;
      this.geometry.computeFlatVertexNormals();
    }

    updateSimplexSeed() {

      this.updateNoise();
    }

    updateNoise() {
      this.heightMap = this.generateTexture();

      this.updateTerrainGeo();
    }

    noise(nx, ny, simplex) {
        return simplex.noise2D(nx,ny);
    }
    octave(nx,ny,octaves, simplex) {
        let val = 0;
        let freq = this.state.freq;
        let max = 0;
        let amp = 1; 
        for(let i=0; i<octaves; i++) {
            val += this.noise(nx*freq,ny*freq, simplex)*amp;
            max += amp;
            amp /= 2;
            freq  *= 2;
        }
        return val/max;
    }

    generateTexture() {
        var simplex = new SimplexNoise(this.state.randSeed);

        const canvas = new Array(terrainSize.vertsHeight);
        for (var i = 0; i < canvas.length; i++) {
          canvas[i] = new Array(terrainSize.vertsWidth);
        }

        for(let i=0; i<terrainSize.vertsHeight; i++) {
            for(let j=0; j<terrainSize.vertsWidth; j++) {
                let v =  this.octave(i/terrainSize.vertsWidth,j/terrainSize.vertsHeight,this.state.octaves, simplex)
                canvas[i][j] = v
            }
        }
        return canvas
    }

}

export default Terrain;
