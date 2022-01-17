import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { KeyboardState } from "./KeyboardState.js";
import { TeapotGeometry } from "./TeapotGeometry.js";

var scene, renderer, camera;
var mesh, pointLight;
var teapots = [];
var keyboard = new KeyboardState();
var turn = true;
var angle = 0;

function init() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0x888888);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    camera.position.y = 100;
    camera.position.z = 250;

    let controls = new OrbitControls (camera, renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    var gridXZ = new THREE.GridHelper(200, 20, 'red', 'white');
    scene.add(gridXZ);

    pointLight = new THREE.PointLight(0xffffff);
    scene.add (pointLight);
    scene.add (new THREE.PointLightHelper(pointLight, 5));

		var ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

 
    let meshMaterial = new THREE.ShaderMaterial({
        uniforms: {
        lightpos: {type: 'v3', value: new THREE.Vector3()}
        },
        vertexShader: [
            "uniform vec3 lightpos;",
            "varying vec3 eyelightdir;",
            "varying vec3 eyenormal;",
            "varying vec4 eyepos;",
            "void main() {",
            "    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "    eyepos = modelViewMatrix * vec4 (position, 1.0);",
            "    vec4 eyelightpos= viewMatrix * vec4 (lightpos, 1.0);",
            "    eyelightdir =  eyelightpos.xyz - eyepos.xyz;",
            "    eyenormal = normalMatrix * normal;",
            "}"
        ].join("\n"),
        fragmentShader: [
            "varying vec3 eyelightdir;",
            "varying vec3 eyenormal;",
            "varying vec4 eyepos;",
            "void main() {",
                "    float intensity = dot (normalize (eyenormal), normalize (eyelightdir));",
                "    if (intensity > 0.8)",
                "        intensity = 0.8;",
                "    else if (intensity > 0.4)",
                "        intensity = 0.4;",
                "    else",
                "    intensity = 0.0;",
                "    vec3 diffuse = intensity*vec3 (1,1,1);",
                "    vec3 h = normalize(-normalize (eyepos.xyz) + normalize (eyelightdir));",
                "    float shininess = 40.;    ",
                "    vec3 specular = pow (dot (eyenormal, h), shininess) *vec3 (1,0,0);",
                "    //gl_FragColor = vec4(diffuse + specular, 1.0);",
                "    gl_FragColor = vec4 (diffuse + vec3(0,0,0.13), 1.0);",
                "}"
        ].join("\n")
    });
    //var geometry = new THREE.TorusKnotGeometry(20, 5, 100, 16);
    var size = 5;
    var geometry = new TeapotGeometry (size);
    
    for(var i=-5; i<5; i++){
        for(var j=-5; j<5; j++){
            mesh = new THREE.Mesh(geometry, meshMaterial);
            mesh.position.set (i*20+10,size, j*20+10);
            teapots.push(mesh);
            scene.add(mesh);
        }
    }
    //mesh.rotation.y = Math.PI/2;
}

function animate() {
    
    keyboard.update();
    
    if (keyboard.down("Z")) turn = !turn;    
    if (turn) angle += 0.01;
    
    pointLight.position.set(50 * Math.cos(angle), 80, 50 * Math.sin(angle));    
    for(let i=0; i<100; i++){
        teapots[i].material.uniforms.lightpos.value.copy (pointLight.position);
        teapots[i].rotation.y = 1.3*angle;
    }
    /*
    mesh.material.uniforms.lightpos.value.copy (pointLight.position);
    mesh.rotation.y = 1.3*angle;
    */

    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export {init, animate};