import * as Dat from 'dat.gui';
import { Scene, Color, SphereGeometry, SpotLight, BoxGeometry } from 'three';
import { Bird, Flower, Land, Terrain, Cloud, ChunkManager, Chunk, TerrainPlane, Text, Music, Orb } from 'objects';
import { BasicLights } from 'lights';
import { WorldLighting } from 'lights';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import SKY from '../../textures/sky.jpg';
const THREE = require ('three');

class SeedScene extends Scene {
    constructor(camera) {
        super();

        this.state = {
            gui: new Dat.GUI(), 
            audiofile: 'Rhapsody In Blue',
            skyTexture: 'Sky',
            updateList: [],
            x: 0,
            y: 0,
            z: 0,
            text: null,
            quotes: false,
        };



        this.background = new THREE.TextureLoader().load(SKY);
        const lights = new BasicLights();
        this.add(lights);

        const chunkmanager = new ChunkManager(this);
        this.add(chunkmanager);
        this.chunkmanager = chunkmanager;

        const bird = new Bird(this, camera);
        this.add(bird);

        const music = new Music(this, camera);
        this.add(music);

        this.fog = new THREE.Fog(0xcce0ff, 500, 1100);

        const worldlights = new WorldLighting(this);
        this.add(worldlights);

        let quotes = this.state.gui.addFolder('Text');
        quotes.add(this.state, 'quotes').name('Quotes').onChange(() => this.updateQuotes());

        this.state.gui.__ul.childNodes[1].classList += ' step2';
        this.state.gui.__ul.childNodes[2].classList += ' step3';
        this.state.gui.__ul.childNodes[3].classList += ' step4';
        this.state.gui.__ul.childNodes[4].classList += ' step5';
        this.state.gui.__ul.childNodes[5].classList += ' step6';
        this.state.gui.__ul.childNodes[6].classList += ' step7';
        this.state.gui.__ul.childNodes[7].classList += ' step8';
        this.state.gui.__ul.childNodes[8].classList += ' step9';
        this.state.gui.__ul.childNodes[9].classList += ' step10';
        this.state.gui.__ul.childNodes[10].classList += ' step11';
    }

    updateQuotes() {
      if (this.state.quotes) {
        this.state.quotes = true;
        console.log("add text...")
        const text = new Text();
        this.state.text = text;
      }
      else {
        let quotes = document.getElementById('slideshow');
        document.body.removeChild(quotes);
      }
    }

    addToQueue(object) {
        this.state.updateList.push(object);
    }

    updateSky() {
      if (this.state.skyTexture == 'Sky') {
        var texture  = new THREE.TextureLoader().load(RED);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.background = texture;
        this.fog = new THREE.Fog(0xA36DA1, 500, 1000);

      }
    }

    update(timeStamp) {
        const { updateList, x, y, z } = this.state;
        for (const obj of updateList) {
            obj.update(timeStamp, this.state.x, this.state.y, this.state.z);

            // again

            if (obj.name == "ChunkManager") {
                obj.update(timeStamp, this.state.x, this.state.y, this.state.z);
            }
        }
    }

}

export default SeedScene;
