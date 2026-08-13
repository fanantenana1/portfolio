// --- 1. CHANGEMENT AUTOMATIQUE DU THÈME TOUTES LES 20 SECONDES ---
const body = document.body;

// Les deux thèmes demandés
const themes = [
    { id: 'colorcode', name: 'ColorCode', starColor: 0xc084fc, lineColor: 0x635bff },
    { id: 'darktech', name: 'Dark Tech', starColor: 0x00d2ff, lineColor: 0x0088ff }
];

let currentThemeIndex = 0;

function switchThemeAutomatically() {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const selectedTheme = themes[currentThemeIndex];

    body.setAttribute('data-theme', selectedTheme.id);

    // Mise à jour dynamique des couleurs dans la scène Three.js
    if (typeof starsMaterial !== 'undefined' && typeof lineMaterial !== 'undefined') {
        starsMaterial.color.setHex(selectedTheme.starColor);
        lineMaterial.color.setHex(selectedTheme.lineColor);
    }
}

// Timer qui bascule le thème toutes les 20 000 ms (20s)
setInterval(switchThemeAutomatically, 20000);

// --- 2. SCÈNE THREE.JS : ESPACE, NEURONES, ÉTOILES ET CODE ---
const canvas = document.getElementById('bg-3d');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Étoiles
const starsCount = 100;
const starsGeometry = new THREE.BufferGeometry();
const starsPositions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i += 3) {
    starsPositions[i] = (Math.random() - 0.5) * 120;
    starsPositions[i + 1] = (Math.random() - 0.5) * 120;
    starsPositions[i + 2] = (Math.random() - 0.5) * 120;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));

const starsMaterial = new THREE.PointsMaterial({
    color: themes[0].starColor,
    size: 0.6,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// --- FILAMENTS EN FORME DE RÉSEAU DE NEURONES (Nombre réduit à 8) ---
const lineMaterial = new THREE.LineBasicMaterial({
    color: themes[0].lineColor,
    transparent: true,
    opacity: 0.2 // Opacité légère
});

const linesGroup = new THREE.Group();
const neuronNodesCount = 8; // Nombre de nœuds neurones fortement réduit
const neuronNodes = [];

// Création des positions des nœuds synaptiques (Cerveau / Neurones)
for (let i = 0; i < neuronNodesCount; i++) {
    const node = new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30
    );
    neuronNodes.push(node);
}

// Relier les nœuds entre eux pour former le réseau neuronal
for (let i = 0; i < neuronNodesCount; i++) {
    for (let j = i + 1; j < neuronNodesCount; j++) {
        // Connecte uniquement si la distance est raisonnable
        if (neuronNodes[i].distanceTo(neuronNodes[j]) < 35) {
            const points = [neuronNodes[i], neuronNodes[j]];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            linesGroup.add(line);
        }
    }
}
scene.add(linesGroup);

// --- SYMBOLES DE CODE (Éclairage/Opacité fortement diminuée) ---
function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#c084fc';
    ctx.font = 'Bold 50px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 64);

    return new THREE.CanvasTexture(canvas);
}

const codeSymbols = ['</>', '{..}', '0011', 'AI', 'IoT','CSS','Bot'];
const codeGroup = new THREE.Group();

codeSymbols.forEach((sym) => {
    const spriteMaterial = new THREE.SpriteMaterial({
        map: createTextTexture(sym),
        transparent: true,
        opacity: 0.50 // Éclairage diminué (0.25 au lieu de 0.6)
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 30
    );
    sprite.scale.set(3.5, 3.5, 1);
    codeGroup.add(sprite);
});
scene.add(codeGroup);

// Astres & Cube Technologique
const moonMaterial = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    wireframe: true,
    transparent: true,
    opacity: 0.2
});
const moonGeo = new THREE.IcosahedronGeometry(6, 2);
const moonMesh = new THREE.Mesh(moonGeo, moonMaterial);
moonMesh.position.set(-25, 12, -10);
scene.add(moonMesh);

const compGroup = new THREE.Group();
const compGeo = new THREE.BoxGeometry(3, 4, 3);
const compMat = new THREE.MeshBasicMaterial({ color: 0x4f46e5, wireframe: true, transparent: true, opacity: 0.25 });
const compMesh = new THREE.Mesh(compGeo, compMat);
compGroup.add(compMesh);
compGroup.position.set(22, -10, -5);
scene.add(compGroup);

// Parallaxe & Boucle d'Animation
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    starField.rotation.y = elapsedTime * 0.02;
    linesGroup.rotation.x = elapsedTime * 0.008;
    linesGroup.rotation.y = elapsedTime * 0.01;
    moonMesh.rotation.y = elapsedTime * 0.05;
    compGroup.rotation.y = -elapsedTime * 0.08;

    moonMaterial.opacity = 0.15 + Math.sin(elapsedTime * 1.5) * 0.1;
    compMat.opacity = 0.15 + Math.cos(elapsedTime * 2) * 0.1;

    // Animation douce du texte avec opacité maximale réduite à 0.3
    codeGroup.children.forEach((child, index) => {
        child.position.y += Math.sin(elapsedTime * 1.5 + index) * 0.005;
        child.material.opacity = 0.15 + Math.sin(elapsedTime * 1.5 + index) * 0.12;
    });

    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Menu Mobile Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}
