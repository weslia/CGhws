import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
import { KeyboardState } from "./KeyboardState.js";
import { TeapotGeometry } from "./TeapotGeometry.js";

var scene, renderer, camera;
var pointLight, mesh, quad;
var teapots = [];
var keyboard = new KeyboardState();
var turn = true;
var angle = 0;
var sceneRTT, renderTarget;

function init() {

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 100, 250);

    let controls = new OrbitControls(camera, renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    var gridXZ = new THREE.GridHelper(200, 20, 'red', 'white');
    scene.add(gridXZ);

    /////////////////////////////////////////////////////////

    sceneRTT = new THREE.Scene();
    pointLight = new THREE.PointLight(0xffffff);
    sceneRTT.add(pointLight);
    scene.add(new THREE.PointLightHelper(pointLight, 5));
    var ambientLight = new THREE.AmbientLight(0x111111);
    sceneRTT.add(ambientLight);

    renderTarget = new THREE.WebGLRenderTarget(
        1024, 1024, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBFormat
    }
    );
    ///////////////////////////////////////
    let meshMaterial = new THREE.ShaderMaterial({
        uniforms: {
            lightpos: { type: 'v3', value: new THREE.Vector3() }
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
    var size = 33;
    var geometry = new TeapotGeometry(size);
    mesh = new THREE.Mesh(geometry, meshMaterial);
    //mesh.scale.set(17, 17, 17);   
    sceneRTT.add(mesh);
    /////////////////////////////////////////
    let plane = new THREE.PlaneBufferGeometry(size * 2, size * 2 * window.innerHeight / window.innerWidth);

    let rttmaterial = new THREE.ShaderMaterial({
        uniforms: {
            mytex: {
                type: "t",
                value: renderTarget.texture
            }
        },
        vertexShader: [
            "varying vec2 vUv;",
            "void main() {",
            "    gl_Position = projectionMatrix* modelViewMatrix * vec4( position, 1.0);",
            "    vUv = uv;",
            "}"
        ].join("\n"),
        fragmentShader:[
            "uniform sampler2D mytex;",
            "varying vec2 vUv;",
        
            "void main() {",
                "    vec4 color = texture2D (mytex, vUv);",
                "    if (color.r == 1.0 && color.g == 1.0)",
                "        discard;",
                "    else",
                "        gl_FragColor = color;//texture2D (mytex, vUv);",
                "}"
        ].join("\n")
    });

    for (var i = -5; i < 5; i++) {
        for (var j = -5; j < 5; j++) {
            quad = new THREE.Mesh(plane, rttmaterial);
            quad.position.set(i * 20 + 10, size / 6, j * 20 + 10);
            teapots.push(quad);
            scene.add(quad);
        }
    }

    //scene.add(new THREE.AxesHelper(50));
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


function animate() {
    requestAnimationFrame(animate);

    keyboard.update();
    if (keyboard.down("Z")) turn = !turn;
    if (turn) angle += 0.01;
    pointLight.position.set(50 * Math.cos(angle), 80, 50 * Math.sin(angle));

    mesh.material.uniforms.lightpos.value.copy(pointLight.position);
    mesh.rotation.y = 1.3 * angle;

    // render torusKnot to texture
    renderer.setRenderTarget(renderTarget);
    renderer.setClearColor(0xffff00);
    renderer.render(sceneRTT, camera);

    // render texture to quad
    renderer.setRenderTarget(null);
    renderer.setClearColor(0x888888);
    renderer.render(scene, camera);
    for (let i = 0; i < 100; i++) {
        teapots[i].lookAt(camera.position);
    }

}

export { init, animate };