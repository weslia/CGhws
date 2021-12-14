import * as THREE from "https://threejs.org/build/three.module.js";

class Candle{
    constructor(x,y,z,name){
      // for pack all
      this.candle = new THREE.Group();
      this.candle.position.set(x,y,z);
      // Cylinder
      this.body = new THREE.Mesh (new THREE.CylinderGeometry(5,5,20,6), new THREE.MeshPhongMaterial({color: "red"}));
      this.wick = new THREE.Mesh (new THREE.CylinderGeometry(1,1,4,6), new THREE.MeshPhongMaterial({color: "gray"}));
      this.wick.position.y = 21.5;
      this.wick.name = name;
      this.body.position.y = 10;
      this.body.name = name;
      this.candle.add (this.wick);
      this.candle.add (this.body);
      // light 
      this.light = new THREE.PointLight( 0xffdc35, 1, 100 );
      this.light.power = 30;
      this.light.position.y = 28;
      this.candle.add (this.light);
      // flame
      this.flameGroup = new THREE.Group();
      this.flameGroup.position.set(0,21,0);
      this.loader = new THREE.TextureLoader();
      this.texture = this.loader.load('https://i.imgur.com/M2tr5Tm.png?1');
      this.texture.wrapS = THREE.RepeatWrapping;
      this.texture.wrapT = THREE.RepeatWrapping;
      this.texture.repeat.set (1/3,1/3);
      this.texture.offset.set (0,2/3);
      let texMat = new THREE.MeshBasicMaterial({
        map: this.texture,
        alphaTest:0.5
      });//\OAO/\\
      this.flameMesh = new THREE.Mesh(new THREE.PlaneGeometry(30,30), texMat);
      this.flameMesh.position.set(0,7,0);
      this.flameMesh.name = name;
      this.flameGroup.add(this.flameMesh);
      this.candle.add (this.flameGroup);
      this.flameInterval = setInterval (this.textureAnimate.bind(this), 100);
      // func judge
      this.isBurn = true;
      this.willBurn = false;
      this.count = (this.count === undefined) ? 1 : this.count;
    }
  
    textureAnimate() {
      this.count = (this.count === undefined) ? 1 : this.count;
      if(this.isBurn === true){
        if (this.flameMesh !== undefined) {
          this.texture = this.flameMesh.material.map;
          //console.log (`${textureAnimate.count}: [${texture.offset.x},${texture.offset.y}]`);
          this.texture.offset.x += 1/3;
          if (this.count % 3 === 0) {
            this.texture.offset.y -= 1/3;
          }
          this.count++;
        }
      }
    }
  }
  
  export {Candle};