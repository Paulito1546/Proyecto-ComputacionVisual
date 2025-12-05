import * as THREE from 'three';

let scene, camera, renderer;
let sphere;

// Estado interno de la animación
let rotationSpeed = 0.02; // Un poco más rápido por defecto para que sea evidente
let rotationDirection = 1;
let isFrozen = false;

export function initScene(containerId) {
    const container = document.getElementById(containerId);
    
    // 1. Escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); 

    // 2. Cámara
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 4;

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 4. Objeto: Esfera Bicolor (Pintando vértices)
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    
    // Accedemos a la posición de cada vértice para colorearlo
    const count = geometry.attributes.position.count;
    const colors = [];
    const positions = geometry.attributes.position;

    const color1 = new THREE.Color(0xff0000); // Rojo
    const color2 = new THREE.Color(0x0000ff); // Azul

    for (let i = 0; i < count; i++) {
        // Obtenemos la coordenada X del vértice
        const x = positions.getX(i);
        
        // Si X > 0 pintamos rojo, si no, azul. Esto divide la esfera por la mitad.
        if (x > 0) {
            colors.push(color1.r, color1.g, color1.b);
        } else {
            colors.push(color2.r, color2.g, color2.b);
        }
    }

    // Añadimos el atributo de color a la geometría
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Usamos un material que respete los colores de los vértices
    const material = new THREE.MeshStandardMaterial({ 
        vertexColors: true, // ¡IMPORTANTE!
        roughness: 0.1,
        metalness: 0.1
    });

    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 5. Luz (Blanca neutra para ver los colores reales)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Loop
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (!isFrozen) {
        // Rotamos en dos ejes para que el efecto "bicolor" se aprecie mejor
        sphere.rotation.y += rotationSpeed * rotationDirection;
        sphere.rotation.z += (rotationSpeed * 0.3) * rotationDirection;
    }

    renderer.render(scene, camera);
}

// --- API ---

export function setBackgroundColor(mode) {
    if (mode === 'day') scene.background.setHex(0xeeeeee);
    if (mode === 'night') scene.background.setHex(0x000000);
}

export function setRotationState(action) {
    switch(action) {
        case 'SPEED_UP':
            rotationSpeed = 0.08; // Muy rápido
            isFrozen = false;
            break;
        case 'NORMAL':
            rotationSpeed = 0.02;
            isFrozen = false;
            break;
        case 'FREEZE':
            isFrozen = true;
            break;
        case 'REVERSE':
            rotationDirection *= -1;
            isFrozen = false;
            break;
    }
}

export function updateFromEEG(eegData) {
    // Escala
    const scale = 1 + (eegData.alpha / 200); 
    sphere.scale.set(scale, scale, scale);

    // En este modo VertexColor, no podemos cambiar intensidad de color individual fácilmente,
    // así que usaremos el EEG para alterar la intensidad de la LUZ de la escena
    // o la "rugosidad" del material.
    if(sphere.material) {
        sphere.material.roughness = eegData.beta / 100; // Beta afecta textura
        sphere.material.wireframe = eegData.gamma > 80; // Gamma alto activa modo "Matrix" (Wireframe)
    }
}