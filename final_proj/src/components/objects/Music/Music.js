import DEEP from './sounds/deep.mp3';
import JAZZ from './sounds/jazzy.mp3';
import PIANO from './sounds/piano.mp3';
import MEDITATION from './sounds/5minbreathing.mp3';
import SLOW from './sounds/slowmotion.mp3';
import { Group, AudioListener, Audio, AudioLoader, AudioAnalyser, Color} from 'three';

class Music extends Group {
    constructor(parent, camera) {
        super();

        const library = {
            '1: Rhapsody In Blue': JAZZ,
        };

        let listener = new AudioListener();
        camera.add(listener);

        let sound = new Audio(listener);
        this.add(sound);

        // Init state
        this.state = {
            gui: parent.state.gui,
            camera: camera,
            library: library,
            audiofile: '1: Rhapsody In Blue',
            audioLoader: new AudioLoader(),
            listener: listener,
            sound: sound,
            analyser: new AudioAnalyser(sound, 32),
            colorLevel:0,
            soundUpdate:0,
            audioPlaying:false,
        };


        let folder = this.state.gui.addFolder('Music');
        folder.add(this.state, 'audiofile', ['1: Rhapsody In Blue']).name("Audio Track").onChange((audiofile) => this.updateAudioFile(audiofile));
        folder.add(this.state, 'audioPlaying').name("Toggle Audio").onChange(() => this.soundHandler(sound));


        window.addEventListener('keydown', (e) => {
          this.audioHandler(e);
        }, false);

        parent.addToQueue(this);


    }

    audioHandler(event) {
      debugger;
        if (event.key == 'p') {
          let sound = this.state.sound;
          if (sound) {
            this.soundHandler(sound);
          }
        }
        else return;
    }

    soundHandler(sound) {
      debugger;
      let music = this.state.library[this.state.audiofile];
      if (!sound.isPlaying) {
        this.state.audioPlaying = true;
        this.state.gui.updateDisplay();
        this.state.audioLoader.load(music, function(buffer) {
          sound.setBuffer(buffer);
          sound.setLoop(true);
          sound.setVolume(0.5);
          sound.play();
        });
      }
      else {
        this.state.audioPlaying = false;
        this.state.gui.updateDisplay();
        sound.pause();
      }
    }
    updateAudioFile(audiofile) {
      let sound = this.state.sound;

      if (sound.isPlaying) {
        sound.stop();
      }
      this.soundHandler(sound);
    }
    update() {
      if (this.state.soundUpdate % 5 == 0 && this.parent.chunkmanager.state.updateWithMusic == true) {
        let avg = this.state.analyser.getAverageFrequency();
        let chunkManager = this.parent.chunkmanager;
        if (avg > 10) {
          chunkManager.state.exaggeration = chunkManager.state.ogExaggeration*avg/50;
          let factor = avg/500;

          chunkManager.state.bankColor = new Color(chunkManager.state.bankColor.r, chunkManager.state.bankColor.g, chunkManager.state.bankColor.b)
          chunkManager.state.middleColor = new Color(chunkManager.state.middleColor.r, chunkManager.state.middleColor.g, chunkManager.state.middleColor.b)
          chunkManager.state.peakColor = new Color(chunkManager.state.peakColor.r, chunkManager.state.peakColor.g, chunkManager.state.peakColor.b)

          if (this.state.colorLevel == 0) {
            chunkManager.state.bankColor.lerp(chunkManager.state.middleColor,factor);

          }
          else if (this.state.colorLevel == 1) {
            chunkManager.state.middleColor.lerp(chunkManager.state.peakColor,factor);
          } else {
            chunkManager.state.peakColor.lerp(chunkManager.state.bankColor,factor);
          }
          chunkManager.updateTerrainGeo();
        }
      }

      if (this.state.soundUpdate % 300 == 0) {
        this.state.colorLevel = (this.state.colorLevel + 1) % 3;
      }

      this.state.soundUpdate = (this.state.soundUpdate + 1) % 500;
    }
}

export default Music;
