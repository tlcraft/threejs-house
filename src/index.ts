import { 
  AmbientLight,
  AxesHelper,
  BoxBufferGeometry,
  BufferGeometry,
  Clock,
  ConeBufferGeometry,
  DoubleSide,
  EdgesGeometry,
  Fog,
  Group,
  Light,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneBufferGeometry,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereBufferGeometry,
  TextureLoader,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { door, doorAmbientOcclusion, doorHeight, doorMetallic, doorNormal, doorOpacity, doorRoughness } from '~textures';
import * as dat from 'dat.gui';
import { Cursor } from '~models/cursor';

const debugGui = generateDebugGui();

const clock = new Clock();
const cursor: Cursor = { x: 1, y: 1 };
const scene = generateScene();
const camera = generatePerspectivCamera();
const renderer = generateRenderer();
const textureLoader = new TextureLoader();
const doorTexture = textureLoader.load(door);
const doorAmbientOcclusionTexture = textureLoader.load(doorAmbientOcclusion);
const doorHeightTexture = textureLoader.load(doorHeight);
const doorMetallicTexture = textureLoader.load(doorMetallic);
const doorNormalTexture = textureLoader.load(doorNormal);
const doorOpacityTexture = textureLoader.load(doorOpacity);
const doorRoughnessTexture = textureLoader.load(doorRoughness);

function startup(): void {
    const controls = generateControls();
    const axesHelper = new AxesHelper();
    scene.add(axesHelper);

    const container: HTMLElement | any = document.getElementById("three");
    container.appendChild( renderer.domElement );

    const ground = generatePlane();
    scene.add(ground);
    
    const house = generateHouse();
    scene.add(house);

    const bush = generateBush();
    bush.scale.set(0.5, 0.5, 0.5);
    bush.position.set(6.5, -2.8, 2.5);
    scene.add(bush);

    const largeBush = generateLargeBush();
    scene.add(largeBush);

    const graves = generateGraves();
    scene.add(graves);

    const ambientLight = new AmbientLight( "#b9d5ff", 0.2 );
    scene.add(ambientLight);

    const houseLight = generateHouseLight();
    scene.add(houseLight);

    const fog = generateFog();
    scene.fog = fog;

    const animate = function () {
        requestAnimationFrame(animate);

        //const delta = clock.getDelta();

        // Alternative control schemes
        // camera.position.x = cursor.x * 100;
        // camera.position.y = cursor.y * 100;
        
        // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3;
        // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3;
        // camera.position.y = cursor.y * 5;
        // camera.lookAt(axesHelper.position);

        controls.update();
        renderer.render(scene, camera);
    };

    configureMeshDebug(ground, 'ground plane');
    configureLightDebug(ambientLight, 'ambient light');
    animate();
}

function generateDebugGui(): dat.GUI {
    const debugGui = new dat.GUI({ 
        closed: true, 
        width: 350,
    });
    debugGui.hide();
    return debugGui;
}

function configureMeshDebug(mesh: Mesh<BufferGeometry, MeshLambertMaterial | MeshBasicMaterial | Material>, name: string): void {
    const folder = debugGui.addFolder(`${name} section`);
    folder.add(mesh.position, 'x').min(mesh.position.x-40).max(mesh.position.x+40).step(0.01).name('x-axis');
    folder.add(mesh.position, 'y').min(mesh.position.y-40).max(mesh.position.y+40).step(0.01).name('y-axis');
    folder.add(mesh.position, 'z').min(mesh.position.z-40).max(mesh.position.z+40).step(0.01).name('z-axis');

    folder.add(mesh.rotation, 'x').min(0).max(Math.PI * 2).step(0.01).name('x-axis rotation');
    folder.add(mesh.rotation, 'y').min(0).max(Math.PI * 2).step(0.01).name('y-axis rotation');
    folder.add(mesh.rotation, 'z').min(0).max(Math.PI * 2).step(0.01).name('z-axis rotation');

    folder.add(mesh, 'visible');
    folder.add(mesh.material, 'wireframe');

    if(mesh.material.hasOwnProperty('color')) {
        const parameters = {
            color: mesh.material.color.getHex()
        };
    
        folder.addColor(parameters, 'color').onChange(() => {
            mesh.material.color.set(parameters.color);
        });
    }

    if(mesh.material.hasOwnProperty('metalness')) {
        folder.add(mesh.material, 'metalness').min(0).max(1).step(0.001);
    }

    if(mesh.material.hasOwnProperty('roughness')) {
        folder.add(mesh.material, 'roughness').min(0).max(1).step(0.001);
    }

    if(mesh.material.hasOwnProperty('aoMapIntensity')) {
        folder.add(mesh.material, 'aoMapIntensity').min(0).max(10).step(0.001);
    }
        
    if(mesh.material.hasOwnProperty('displacementScale')) {
        folder.add(mesh.material, 'displacementScale').min(0).max(1).step(0.001);
    }
}

function configureLightDebug(light: Light, name: string): void {
    const folder = debugGui.addFolder(`${name} section`);
    folder.add(light, 'intensity').min(0).max(10).step(0.05);
    
    folder.add(light.position, 'x').min(light.position.x-40).max(light.position.x+40).step(0.01).name('x-axis');
    folder.add(light.position, 'y').min(light.position.y-40).max(light.position.y+40).step(0.01).name('y-axis');
    folder.add(light.position, 'z').min(light.position.z-40).max(light.position.z+40).step(0.01).name('z-axis');

    folder.add(light.rotation, 'x').min(0).max(Math.PI * 2).step(0.01).name('x-axis rotation');
    folder.add(light.rotation, 'y').min(0).max(Math.PI * 2).step(0.01).name('y-axis rotation');
    folder.add(light.rotation, 'z').min(0).max(Math.PI * 2).step(0.01).name('z-axis rotation');
    
    folder.add(light, 'visible');

    const parameters = {
        color: light.color.getHex()
    };

    folder.addColor(parameters, 'color').onChange(() => {
        light.color.set(parameters.color);
    });

    if(light.hasOwnProperty('castShadow')) {
        folder.add(light, 'castShadow');
    }
}

function generateScene(): Scene {
    const scene = new Scene();
    return scene;
}

function generatePerspectivCamera(): PerspectiveCamera { // Vision like a cone
    // A field of view between 45 and 75 is generally sufficent depending on your needs
    const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.setZ(10);
    return camera;
}

function generateRenderer(): WebGLRenderer {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.setClearColor("#262837");
    return renderer;
}

function generateControls(): OrbitControls {
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    return controls;
}

function generateHouse(): Group {
    const house = new Group();

    const walls = generateWalls();
    house.add(walls);

    const edges = generateMeshEdges(walls);
    house.add(edges);

    const roof = generateRoof();
    house.add(roof);

    const roofEdges = generateMeshEdges(roof);
    house.add(roofEdges);

    const door = generateDoor();
    house.add(door);

    return house;
}

function generateWalls(): Mesh {
    const geometry = new BoxBufferGeometry(4, 3, 4);
    const material = new MeshStandardMaterial({ color: '#ac8e00' });
    const walls = new Mesh(geometry, material);
    walls.position.set(5, -1.5, 0);
    return walls;
}

function generateMeshEdges(mesh: Mesh, color: string = '#000000', linewidth:  number = 2): LineSegments {
    const geometry = new EdgesGeometry(mesh.geometry);
    const material = new LineBasicMaterial({ color, linewidth });
    const edges = new LineSegments(geometry, material);
    edges.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
    edges.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z);
    return edges;
}

function generateRoof(): Mesh {
    const geometry = new ConeBufferGeometry(3.5, 1, 4);
    const material = new MeshStandardMaterial({ color: '#b35f45' });
    const roof = new Mesh(geometry, material);
    roof.position.set(5, 0.5, 0);
    roof.rotation.set(0, Math.PI / 4, 0);
    return roof;
}

function generateDoor(): Mesh {
    const geometry = new PlaneBufferGeometry(1, 2);
    const material = new MeshStandardMaterial({ 
        map: doorTexture
     });
    const door = new Mesh(geometry, material);
    door.position.set(4.85, -2, 2.01);
    return door; 
}

function generateHouseLight(): Light {
    const houseLight = new PointLight("#ff7d46", 1, 7);
    houseLight.position.set(4.85, -0.9, 2.3);
    return houseLight;
}

function generateFog(): Fog {
    const fog = new Fog("#262837", 1, 15);
    return fog;
}

function generateBush(): Mesh {
    const geometry = new SphereBufferGeometry(1, 16, 16);
    const material = new MeshStandardMaterial({color: "#89c854" });
    const bush = new Mesh(geometry, material);
    return bush;
}

function generateLargeBush(): Group {
    const bushGroup = new Group();
    
    const largeBush = generateBush();
    largeBush.scale.set(0.65, 0.65, 0.65);
    largeBush.position.set(3, -2.8, 2.5);

    bushGroup.add(largeBush);

    const smallBush = generateBush();
    smallBush.scale.set(0.5, 0.5, 0.5);
    smallBush.position.set(3.7, -3, 2.5);

    bushGroup.add(smallBush);

    return bushGroup;
}

function generateGraves(): Group {
    const graves = new Group();

    const geometry = new BoxBufferGeometry(0.6, 0.8, 0.3);
    const material = new MeshStandardMaterial({ "color": "#b2b6b2" });

    for(let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 4 + Math.random() * 7;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        const grave = new Mesh(geometry, material);
        grave.position.set(x + 4, -2.66, z);
        grave.rotation.y = (Math.random() - 0.5) * 0.3;
        grave.rotation.z = (Math.random() - 0.3) * 0.2;
        graves.add(grave);
        const edges = generateMeshEdges(grave, "#000000");
        scene.add(edges);
    }

    return graves;
}

function generatePlane(): Mesh<BufferGeometry, MeshLambertMaterial> {
    const planeGeometry = new PlaneGeometry( 60, 60 );
    const planeMaterial = new MeshLambertMaterial( {color: 0xa9c388, side: DoubleSide} );
    const plane = new Mesh( planeGeometry, planeMaterial );
    plane.position.set(0, -3.01, 0);
    plane.rotateX( - Math.PI / 2);
    plane.receiveShadow = true;
    return plane;
}

function onKeyDown(event: any): void{
    switch(event.keyCode) {
        case 83: // forward W
            camera.position.z += 0.25;
            break;
        case 87: // backward S
            camera.position.z -= 0.25;
            break;
        case 65: // left A
            camera.position.x -= 0.25;
            break;
        case 68: // right D
            camera.position.x += 0.25;
            break;
        case 38: // up arrow
            camera.position.y += 0.25;
            break;
        case 40: // down arrow
            camera.position.y -= 0.25;
            break;
        default:
            break;
    }
}

document.body.addEventListener( 'keydown', onKeyDown, false );

window.addEventListener('mousemove', (event: any) => {
    cursor.x = event.clientX / window.innerWidth - 0.5;
    cursor.y = (event.clientY / window.innerHeight - 0.5);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if(!fullscreenElement) {
        if(container.requestFullscreen){
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        }
    } else {
        if(document.exitFullscreen){
            document.exitFullscreen();
        } else if(document.webkitExitFullscreen){
            document.webkitExitFullscreen();
        }
    }
});

startup();
