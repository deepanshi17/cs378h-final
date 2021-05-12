import { Group, Color, PlaneGeometry, PlaneBufferGeometry, Vector2, TextureLoader, Reflector, Refractor } from 'three';
import  SimplexNoise  from 'simplex-noise';
import { Chunk } from '../Chunk';
import { Water } from 'three/examples/jsm/objects/water2.js';
import NORM0 from './water/Water_1_M_Normal.jpg';
import NORM1 from './water/Water_2_M_Normal.jpg';

const startYBelow = 300;
const pixel_width = 600;
const vert_width = 100;
class ChunkManager extends Group {
    constructor(parent) {
        super();
 
        this.name = "ChunkManager"

        this.state = {
            
            parent: parent,
            gui: parent.state.gui,

            blocks: [],
            block_width: pixel_width,
            block_vert_width: vert_width,
            total_width: vert_width * 5,
            x_off: 0,
            z_off: 0,

            simplex: {},
            num: 1,
            displayOrbs: false,
            displayClouds: true,

            power: 1,
            octaves: 16,
            exaggeration: 20,
            ogExaggeration: 20,
            waterLevel: 0,
            activeWater: true,
            waterColor: new Color(50, 90, 145),
            bankColor: new Color(0, 255, 0),
            middleColor: new Color(255, 0, 0),
            peakColor: new Color(0, 0, 255),
            colorWiggle: 0.1,
            middleGradient: 0.5,
            randSeed: 4,
            freq: 1,
            terraced: false,
            terraces: 15,
            updateWithMusic: false,

            model: "",

        };

        this.state.simplex = new SimplexNoise(this.state.randSeed);

        const coordinates = [
          [this.state.block_width, 0, this.state.block_width],
          [0, 0, this.state.block_width],
          [-this.state.block_width, 0, this.state.block_width],
          [this.state.block_width, 0, 0],
          [0, 0, 0],
          [-this.state.block_width, 0, 0],
          [this.state.block_width, 0, -this.state.block_width],
          [0, 0, -this.state.block_width],
          [-this.state.block_width, 0, -this.state.block_width]
        ]

        for (let i = 0; i < coordinates.length; i++) {
          let new_plane_geo = new PlaneGeometry(this.state.block_width, this.state.block_width,
                                      this.state.block_vert_width - 1, this.state.block_vert_width - 1);
          const new_chunk = new Chunk(this, coordinates[i][0], coordinates[i][1], coordinates[i][2], new_plane_geo);
          this.add(new_chunk);
          this.state.blocks.push(new_chunk);
        }

        parent.addToQueue(this);

        this.waterGeometry = new PlaneBufferGeometry( this.state.block_width*3, this.state.block_width*3 );

        var textureLoader = new TextureLoader();

        if (this.state.activeWater === true) {
          this.water = new Water( this.waterGeometry, {
            normalMap0: textureLoader.load(NORM0),
            normalMap1: textureLoader.load(NORM1),
            scale: this.state.waterScale,
            flowDirection: new Vector2( this.state.flowX, this.state.flowY ),
            textureWidth: 1024,
            textureHeight: 1024,
          } );


          this.water.rotation.x = Math.PI * - 0.5;
          this.add( this.water );
        }


        var folder0 = this.state.gui.addFolder( 'World Generation' );
        folder0.add(this.state, 'octaves', 1, 16).name("Noise").onChange(() => this.updateNoise()) ;
        folder0.add(this.state, 'freq', 1, 10).name("Height").onChange(() => this.updateNoise());

        let folder = this.state.gui.addFolder('Customize World');

        folder.add(this.state, 'ogExaggeration', 0, 70).name("Frequency").onChange(() => this.updateExaggeration());
        folder.add(this.state, 'power', 0, 5).name("Depth").onChange(() => this.updateTerrainGeo());
        folder.add(this.state, 'displayClouds').name("Show Objects");
        folder.add(this.state, 'colorWiggle', -1, 1).name("Chroma").onChange(() => this.updateTerrainGeo());
        this.state.gui.add(this.state, 'model');
        this.state.gui.add(this.state, 'updateWithMusic').name("Dynamic").onChange(() => this.breathingTerrain());
        this.state.gui.add(this.state, 'displayOrbs').name("");
        this.state.gui.add(this.state, 'displayClouds').name("Volumetric Clouds");
        this.state.gui.add(this.state, 'activeWater').name("Ocean").onChange(() => this.addActiveWater());


        this.loadPreset();
    }

    breathingTerrain() {
      if(this.state.updateWithMusic == false) { 
        this.updateDisplay(this.state.gui);
      }
      this.updateTerrainGeo();
    }

    loadPreset() {

        this.state.power = 1
        this.state.octaves = 16
        this.state.exaggeration = 45
        this.state.ogExaggeration = 45
        this.state.waterLevel = 0
        this.state.waterColor = new Color(14, 116, 255)
        this.state.bankColor = new Color(255, 147, 0)
        this.state.middleColor = new Color(255, 13, 13)
        this.state.peakColor = new Color(255, 255, 255)
        this.state.colorWiggle = 0.1
        this.state.middleGradient = 0.65
        this.state.randSeed = 4
        this.state.freq = 7.1
        this.state.terraced = false
        this.state.terraces = 15
        this.state.updateWithMusic = false
        this.state.parent.state.skyTexture = 'Sunset'
        this.state.displayClouds = true
        this.state.parent.updateSky();

        this.updateNoise();
        this.updateWaterLevel();
        this.updateDisplay(this.state.gui);
    }

    updateDisplay(gui) {
        for (var i in gui.__controllers) {
            gui.__controllers[i].updateDisplay();
        }
        for (var f in gui.__folders) {
            this.updateDisplay(gui.__folders[f]);
        }
    }

    updateSimplexSeed() {
      this.state.simplex = new SimplexNoise(this.state.randSeed);

      this.updateNoise();
    }

    updateNoise() {
      for(let chunk of this.state.blocks) {
        chunk.updateNoise();
      }
    }

    updateExaggeration() {
      this.state.exaggeration = this.state.ogExaggeration;
      this.updateTerrainGeo()
    }

    updateTerrainGeo() {
      for(let chunk of this.state.blocks) {
        chunk.updateTerrainGeo();
      }
    }

    addActiveWater() {
      if (this.state.activeWater === true) {
        var textureLoader = new TextureLoader();

        this.water = new Water( this.waterGeometry, {
          normalMap0: textureLoader.load(NORM0),
          normalMap1: textureLoader.load(NORM1),
          scale: this.state.waterScale,
          flowDirection: new Vector2( this.state.flowX, this.state.flowY ),
          textureWidth: 1024,
          textureHeight: 1024,
        } );


        this.water.rotation.x = Math.PI * - 0.5;
        this.add( this.water );

      }
      else {
        this.remove(this.water);
      }
      this.updateWaterLevel();
    }

    updateWaterLevel() {
      if (this.state.activeWater === true) {
        this.water.position.y = this.state.waterLevel;
        this.updateTerrainGeo();
      }
    }

    update(t, x, y, z) {
      let plane_geos = [0, 0, 0];
      let need_update = (z > this.state.block_width/2) || (z < -this.state.block_width/2)
      || (x > this.state.block_width/2) || (x < -this.state.block_width/2);

      if(z > this.state.block_width/2) {
        this.state.z_off += this.state.block_width;
        this.state.parent.state.z -= this.state.block_width;

        this.remove(this.state.blocks[6])
        this.remove(this.state.blocks[7])
        this.remove(this.state.blocks[8])
        plane_geos[0] = this.state.blocks[6].disposeOf();
        plane_geos[1] = this.state.blocks[7].disposeOf()
        plane_geos[2] = this.state.blocks[8].disposeOf()

        this.state.blocks[6] = this.state.blocks[3]
        this.state.blocks[7] = this.state.blocks[4]
        this.state.blocks[8] = this.state.blocks[5]

        this.state.blocks[3] = this.state.blocks[0]
        this.state.blocks[4] = this.state.blocks[1]
        this.state.blocks[5] = this.state.blocks[2]

        this.state.blocks[0] = new Chunk(this, this.state.block_width + this.state.x_off, 0, this.state.block_width + this.state.z_off, plane_geos
        [0]);
        this.state.blocks[1] = new Chunk(this, this.state.x_off, 0, this.state.block_width + this.state.z_off,plane_geos
        [1]);
        this.state.blocks[2] = new Chunk(this, -this.state.block_width + this.state.x_off, 0, this.state.block_width + this.state.z_off,plane_geos
        [2]);

        this.add(this.state.blocks[0])
        this.add(this.state.blocks[1])
        this.add(this.state.blocks[2])

      }
      else if(z < -this.state.block_width/2) {
        this.state.z_off -= this.state.block_width;
        this.state.parent.state.z += this.state.block_width;

        this.remove(this.state.blocks[0])
        this.remove(this.state.blocks[1])
        this.remove(this.state.blocks[2])
        plane_geos[0] = this.state.blocks[0].disposeOf()
        plane_geos[1] = this.state.blocks[1].disposeOf()
        plane_geos[2] = this.state.blocks[2].disposeOf()


        this.state.blocks[0] = this.state.blocks[3]
        this.state.blocks[1] = this.state.blocks[4]
        this.state.blocks[2] = this.state.blocks[5]

        this.state.blocks[3] = this.state.blocks[6]
        this.state.blocks[4] = this.state.blocks[7]
        this.state.blocks[5] = this.state.blocks[8]

        this.state.blocks[6] = new Chunk(this, this.state.block_width + this.state.x_off, 0, -this.state.block_width + this.state.z_off,plane_geos
        [0]);
        this.state.blocks[7] = new Chunk(this, this.state.x_off, 0, -this.state.block_width + this.state.z_off,plane_geos
        [1]);
        this.state.blocks[8] = new Chunk(this, -this.state.block_width + this.state.x_off, 0, -this.state.block_width + this.state.z_off,plane_geos
        [2]);

        this.add(this.state.blocks[6])
        this.add(this.state.blocks[7])
        this.add(this.state.blocks[8])

      }


      else if(x > this.state.block_width/2) {

        this.state.x_off += this.state.block_width;
        this.state.parent.state.x -= this.state.block_width;

        this.remove(this.state.blocks[2])
        this.remove(this.state.blocks[5])
        this.remove(this.state.blocks[8])
        plane_geos[0] = this.state.blocks[2].disposeOf()
        plane_geos[1] = this.state.blocks[5].disposeOf()
        plane_geos[2] = this.state.blocks[8].disposeOf()


        this.state.blocks[2] = this.state.blocks[1]
        this.state.blocks[5] = this.state.blocks[4]
        this.state.blocks[8] = this.state.blocks[7]

        this.state.blocks[1] = this.state.blocks[0]
        this.state.blocks[4] = this.state.blocks[3]
        this.state.blocks[7] = this.state.blocks[6]

        this.state.blocks[0] = new Chunk(this, this.state.block_width + this.state.x_off, 0, this.state.block_width + this.state.z_off,plane_geos
        [0]);
        this.state.blocks[3] = new Chunk(this, this.state.block_width + this.state.x_off, 0, this.state.z_off,plane_geos
        [1]);
        this.state.blocks[6] = new Chunk(this, this.state.block_width + this.state.x_off, 0, -this.state.block_width + this.state.z_off,plane_geos
        [2]);

        this.add(this.state.blocks[0])
        this.add(this.state.blocks[3])
        this.add(this.state.blocks[6])

      }

      else if(x < -this.state.block_width/2) {
        this.state.x_off -= this.state.block_width;
        this.state.parent.state.x += this.state.block_width;

        this.remove(this.state.blocks[0])
        this.remove(this.state.blocks[3])
        this.remove(this.state.blocks[6])
        plane_geos[0] = this.state.blocks[0].disposeOf()
        plane_geos[1] = this.state.blocks[3].disposeOf()
        plane_geos[2] = this.state.blocks[6].disposeOf()


        this.state.blocks[0] = this.state.blocks[1]
        this.state.blocks[3] = this.state.blocks[4]
        this.state.blocks[6] = this.state.blocks[7]

        this.state.blocks[1] = this.state.blocks[2]
        this.state.blocks[4] = this.state.blocks[5]
        this.state.blocks[7] = this.state.blocks[8]

        this.state.blocks[2] = new Chunk(this, -this.state.block_width + this.state.x_off, 0, this.state.block_width + this.state.z_off, plane_geos
        [0]);
        this.state.blocks[5] = new Chunk(this, -this.state.block_width + this.state.x_off, 0, this.state.z_off, plane_geos
        [1]);
        this.state.blocks[8] = new Chunk(this, -this.state.block_width + this.state.x_off, 0, -this.state.block_width + this.state.z_off, plane_geos
        [2]);

        this.add(this.state.blocks[2])
        this.add(this.state.blocks[5])
        this.add(this.state.blocks[8])


      }
      if (need_update) {
        this.state.blocks[0].setBlockPosition(this.state.block_width, 0, this.state.block_width)
        this.state.blocks[1].setBlockPosition(0, 0, this.state.block_width)
        this.state.blocks[2].setBlockPosition(-this.state.block_width, 0, this.state.block_width)
        this.state.blocks[3].setBlockPosition(this.state.block_width, 0, 0)
        this.state.blocks[4].setBlockPosition(0, 0, 0)
        this.state.blocks[5].setBlockPosition(-this.state.block_width, 0, 0)
        this.state.blocks[6].setBlockPosition(this.state.block_width, 0, -this.state.block_width)
        this.state.blocks[7].setBlockPosition(0, 0, -this.state.block_width)
        this.state.blocks[8].setBlockPosition(-this.state.block_width, 0, -this.state.block_width)
      }

      this.position.x = -x;
      this.position.y = y - startYBelow;
      this.position.z = -z;

    }


}

export default ChunkManager;
