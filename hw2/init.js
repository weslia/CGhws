import * as THREE from "https://threejs.org/build/three.min.js";

import {buildVehicle, makeRect, Check_Intersect, traverse, initHUD} from "./functionNeed.js"; 

var camera, camera3PV, scene, renderer;
var keyboard = new KeyboardState();
var clock;

var car, pillars = [], radius = 10;
var pos = new THREE.Vector3();
var vel = new THREE.Vector3();
var force = new THREE.Vector3();
var power, angle;

(function() {
  Math.clamp = function(val,min,max){
    return Math.min(Math.max(val,min),max);
    
  }})();
  
init();
animate();

function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set (0, 100, 200);
  scene.add(camera);

  camera3PV = new THREE.PerspectiveCamera(50, window.innerWidth/2 / window.innerHeight, 1, 1000);
  camera3PV.position.copy(new THREE.Vector3(-50,30,0));
  camera3PV.lookAt(30,0,0);

  var gridXZ = new THREE.GridHelper(200, 20, 'red', 'white');
  scene.add(gridXZ);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x888888);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  // disable OrbitControl keys
  controls.enableKeys = false;
  
  document.body.appendChild(renderer.domElement);
  //double scene
  initHUD();
	renderer.autoClear = false;
  ////////////////////////////////////////////////////////////////////////
  power = 1.0;
  angle = 0.0;
  	
  car = buildVehicle();
  car.add(camera3PV);
  scene.add(car);

  for(let i=0;i<4;i++){
    let pillarGeometry = new THREE.CylinderGeometry( radius, radius, 20, 50 );
    let pillar = new THREE.Mesh (pillarGeometry, new THREE.MeshBasicMaterial());
    pillars.push(pillar);
    scene.add (pillar);
    let plusOrMinus = Math.random() < 0.5 ? 1 : -1;
    let plusOrMinus2 = Math.random() < 0.5 ? 1 : -1;
    pillar.position.set ((Math.random()*70+30)*plusOrMinus, 10, (Math.random()*70+30)*plusOrMinus2);
    
  }
}

function update(dt) {

  keyboard.update();
  
  if (vel.length() > 0) {
    angle = 1.5*Math.PI + Math.atan2(vel.x, vel.z); 
  }

  if (keyboard.pressed("space"))  
 	  power = 0.001;
  if (keyboard.pressed("up"))  
 	  power += 5;
  if (keyboard.pressed("down"))  
 	  power -= 5;
 	
  power = Math.clamp (power, 0, 80.0); 
  
  var angle_thrust = angle;
  if (keyboard.pressed("left"))
    angle_thrust += 0.6;
  if (keyboard.pressed("right"))
    angle_thrust -= 0.6;
    
  // compute force
  var thrust = new THREE.Vector3(1,0,0).multiplyScalar(power).applyAxisAngle (new THREE.Vector3(0,1,0), angle_thrust);
  force.copy (thrust);
  force.add(vel.clone().multiplyScalar(-2))

  // eulers
  vel.add(force.clone().multiplyScalar(dt));
  pos.add(vel.clone().multiplyScalar(dt));
  traverse(pos);

  for(let i=0; i<pillars.length; i++){
    let Rect = makeRect();
    if(Check_Intersect(Rect, pillars[i], radius)){
      pillars[i].material.color = new THREE.Color ('red');
      vel.setLength(0.0001);
      power = 0.001;
    }else{
      pillars[i].material.color = new THREE.Color ('white');
    }
  }
}

function animate() {

  var dt = clock.getDelta();
  update(dt);

  // car update
  car.position.copy(pos);
  car.rotation.y = angle;

  requestAnimationFrame(animate);
  render();
}

function render() {
  var WW = window.innerWidth;
  var HH = window.innerHeight;

  renderer.clear();

	renderer.setViewport(0, 0, WW / 2, HH);
  camera.aspect = WW / 2 / HH;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  renderer.render(sceneHUD, cameraHUD);

  renderer.setViewport(WW / 2, 0, WW / 2, HH);
  renderer.render(scene, camera3PV);
  renderer.render(sceneHUD, cameraHUD);
}