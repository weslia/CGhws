import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import {Candle} from "./Candle.js";

var camera, scene, renderer;
var raycaster ,mouse = new THREE.Vector2(), plane, pickables = []; // use for click event to get mouse x,y position
var flameMesh,flameGroup;
var candles = [], candlesMaxNumber = 10, candlesMinNumber = 5 , putRange = 200;

function init() {
    // init canvas to show world
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor (0x888888);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // init world and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0,200,200);
    camera.lookAt(0,0,0);
    // use for click event to get mouse x,y position
    raycaster = new THREE.Raycaster();
    document.addEventListener('pointerdown', onDocumentMouseDown, false);
    plane = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshPhongMaterial ({
        color: "gray",
        transparent: true,
        opacity: 0.5,
        visible: true
    }));
    scene.add(plane);
    plane.rotation.x = -Math.PI / 2;
    // control camera need
    let controls = new OrbitControls (camera, renderer.domElement);
    // canvas auto adjust window size
    window.addEventListener('resize', onWindowResize, false);
    // generate candles
    var candlesNumber = Math.ceil(Math.random() * (candlesMinNumber)) + candlesMaxNumber-candlesMinNumber;
    for(var i=0; i<candlesNumber; i++){
        candles.push(new Candle(Math.floor(Math.random() * putRange-putRange/2),0,Math.floor(Math.random() * putRange-putRange/2), "cand" + i));
        scene.add(candles[i].candle);
        pickables.push(candles[i].candle);
    }

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    // billboard
    for(var i=0; i<candles.length; i++){
        var flag = false;
        candles[i].flameGroup.lookAt (camera.position);
    }
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // find intersections
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(pickables,true);
    if (intersects.length > 0) {
        console.log(intersects[0].point.x + " " + intersects[0].point.y + " " + intersects[0].point.z );
        for(var i=0; i<candles.length; i++){
            console.log(intersects[0].object.name);
            if(intersects[0].object.name == candles[i].body.name){
                candles[i].isBurn = !candles[i].isBurn;
                if (candles[i].isBurn) {
                    candles[i].flameMesh.material.visible = true;
                    candles[i].light.visible = true;
                    candles[i].flameInterval = setInterval (candles[i].textureAnimate.bind(candles[i]), 100);
                } else {
                    candles[i].flameMesh.material.visible = false;
                    candles[i].light.visible = false;
                    console.log(candles[i].flameInterval);
                    clearInterval (candles[i].flameInterval);
                    candles[i].willBurn = true;
                    setTimeout(lighter.bind(candles[i]), 3000);
                }
                console.log(candles[i].isBurn);
            }
        }
    }
}

function lighter(){
    if(this.isBurn == false){
        this.flameMesh.material.visible = true;
        this.light.visible = true;
        this.flameInterval = setInterval (this.textureAnimate.bind(this), 100);
        this.isBurn = true;
        this.willBurn = false;
    }
}

export {init, animate};