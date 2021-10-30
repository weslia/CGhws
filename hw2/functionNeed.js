import * as THREE from "https://threejs.org/build/three.min.js";

export function buildVehicle() {
    let car = new THREE.Group();
    let bodyGeometry =  new THREE.BoxGeometry (16,6,10);
    let body = new THREE.Mesh (bodyGeometry, new THREE.MeshBasicMaterial({ color: 0x0080ff, side: THREE.DoubleSide}));
    let bodyE = new THREE.EdgesGeometry( bodyGeometry);
    let bodyEL = new THREE.LineSegments( bodyE, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
    body.position.y += 3;
    bodyEL.position.y += 3;
    car.add (body,bodyEL);
    let headGeometry =  new THREE.BoxGeometry (11,4,10);
    let head = new THREE.Mesh (headGeometry, new THREE.MeshBasicMaterial({ color: 0x0080ff, side: THREE.DoubleSide}));
    let headE = new THREE.EdgesGeometry( headGeometry );
    let headEL = new THREE.LineSegments( headE, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
    head.position.set(-1, 8, 0);
    headEL.position.set(-1, 8, 0);
    car.add (head,headEL);
    let pillarOut = new THREE.Mesh (new THREE.CylinderGeometry( 2, 2, 2.5, 50 ), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide}));
    let pillarIn = new THREE.Mesh (new THREE.CylinderGeometry( 4/3, 4/3, 3, 50 ), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide}));
    pillarOut.rotation.x = Math.PI/2;
    pillarIn.rotation.x = Math.PI/2;
    pillarOut.position.set(-4.5, 0, 4);
    pillarIn.position.set(-4.5, 0, 4);
    car.add (pillarOut,pillarIn);
    pillarOut = pillarOut.clone();
    pillarIn = pillarIn.clone();
    pillarOut.position.set(4.5, 0, 4);
    pillarIn.position.set(4.5, 0, 4);
    car.add (pillarOut,pillarIn);
    pillarOut = pillarOut.clone();
    pillarIn = pillarIn.clone();
    pillarOut.position.set(4.5, 0, -4);
    pillarIn.position.set(4.5, 0, -4);
    car.add (pillarOut,pillarIn);
    pillarOut = pillarOut.clone();
    pillarIn = pillarIn.clone();
    pillarOut.position.set(-4.5, 0, -4);
    pillarIn.position.set(-4.5, 0, -4);
    car.add (pillarOut,pillarIn);
    let windowGeometry =  new THREE.BoxGeometry (4.5,3,10.5);
    let window = new THREE.Mesh (windowGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide}));
    let windowE = new THREE.EdgesGeometry( windowGeometry );
    let windowEL = new THREE.LineSegments( windowE, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
    window.position.set(1.5, 8.05, 0);
    windowEL.position.set(1.5, 8.05, 0);
    car.add (window,windowEL);
    window = window.clone();
    windowEL = windowEL.clone();
    window.position.set(-3.5, 8.05, 0);
    windowEL.position.set(-3.5, 8.05, 0);
    car.add (window,windowEL);
    let windowFBGeometry =  new THREE.BoxGeometry (11.5,3,9);
    let windowFB = new THREE.Mesh (windowFBGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide}));
    let windowFBE = new THREE.EdgesGeometry( windowFBGeometry );
    let windowFBEL = new THREE.LineSegments( windowFBE, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
    windowFB.position.set(-1, 8.05, 0);
    windowFBEL.position.set(-1, 8.05, 0);
    car.add (windowFB,windowFBEL);
    let frontLihgt = new THREE.Mesh (new THREE.CylinderGeometry( 1, 1, 14.5, 50 ), new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide}));
    let backLihgt = new THREE.Mesh (new THREE.BoxGeometry (14.5, 1, 2), new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide}));
    frontLihgt.rotation.z = Math.PI/2;
    frontLihgt.position.set(1, 1.5, 3.2);
    backLihgt.position.set(-1, 1.5, 3.2);
    car.add (frontLihgt,backLihgt);
    frontLihgt = frontLihgt.clone();
    backLihgt = backLihgt.clone();
    frontLihgt.position.set(1, 1.5, -3.2);
    backLihgt.position.set(-1, 1.5, -3.2);
    car.add (frontLihgt,backLihgt);
    return car;
}

export function makeRect() {
    let Rect = {};
    Rect.max = new THREE.Vector3(8, 0, 5);
    Rect.min = new THREE.Vector3(-8, 0, -5);
    return Rect;
}	

export function Check_Intersect(Rect, C, Rad) {
    const Rad2 = Rad * Rad;

    /* Translate coordinates, placing C at the origin. */
    // duplicate R object here for computation ...
    let R = objectCopy (Rect);
    let c = car.worldToLocal(C.clone().position);

    R.max.x -= c.x;  R.max.z -= c.z;
    R.min.x -= c.x;  R.min.z -= c.z;

    if (R.max.x < 0) 			/* R to left of circle center */
        if (R.max.z < 0) 		/* R in lower left corner */
            return ((R.max.x * R.max.x + R.max.z * R.max.z) < Rad2);
        else if (R.min.z > 0) 	/* R in upper left corner */
            return ((R.max.x * R.max.x + R.min.z * R.min.z) < Rad2);
        else 					/* R due West of circle */
            return(Math.abs(R.max.x) < Rad);
    else if (R.min.x > 0)  	/* R to right of circle center */
            if (R.max.z < 0) 	/* R in lower right corner */
                return ((R.min.x * R.min.x + R.max.z * R.max.z) < Rad2);
        else if (R.min.z > 0)  	/* R in upper right corner */
            return ((R.min.x * R.min.x + R.min.z * R.min.z) < Rad2);
        else 				/* R due East of circle */
            return (R.min.x < Rad);
    else				/* R on circle vertical centerline */
            if (R.max.z < 0) 	/* R due South of circle */
            return (Math.abs(R.max.z) < Rad);
        else if (R.min.z > 0)  	/* R due North of circle */
            return (R.min.z < Rad);
        else 				/* R contains circle centerpoint */
            return(true);
} 

export function traverse(pos) {
    if(pos.x > 100)
        pos.x = -100;
    if(pos.x < -100)
        pos.x = 100;
    if(pos.z > 100)
        pos.z = -100;
    if(pos.z < -100)
        pos.z = 100;
}

