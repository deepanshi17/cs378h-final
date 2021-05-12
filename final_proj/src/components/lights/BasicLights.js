import { Group, SpotLight, SpotLightHelper, AmbientLight, DirectionalLightHelper, DirectionalLight } from 'three';

class BasicLights extends Group {
    constructor(...args) {
        super(...args);

        const dir = new SpotLight(0xffffff, 1.5, 6, 0.8, 1, 1);
        const ambi = new AmbientLight(0x404040, 0.5); 

        var objLight = new DirectionalLight(0xffffff, 0.75);
        objLight.power = 800; // 4 * Math.PI
        objLight.position.set(0, 0, -100);
        objLight.target.position.set(0, 0, 0);
        objLight.castShadow = true;
        objLight.decay = 100;
        objLight.distance = 200;

        // var helper = new DirectionalLightHelper(objLight);

        // SpotLight needs a position and target
        dir.position.set(5, 1, 2);
        dir.target.position.set(0, 0, 0);

        this.add(ambi, objLight, objLight.target);
    }
}

export default BasicLights;
