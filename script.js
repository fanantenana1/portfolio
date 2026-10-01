// --- 1. THÈME : bouton manuel (mémorisé), plus de changement automatique ---
const body = document.body;
const themes = [
    { id: 'colorcode', starColor: 0xc084fc, lineColor: 0x635bff },
    { id: 'darktech', starColor: 0x00d2ff, lineColor: 0x0088ff }
];
let currentThemeIndex = 0;
try { currentThemeIndex = Math.max(0, themes.findIndex(t => t.id === localStorage.getItem('theme'))); } catch (e) {}

function applyTheme(i) {
    const t = themes[i];
    body.setAttribute('data-theme', t.id);
    if (typeof starsMaterial !== 'undefined') {
        starsMaterial.color.setHex(t.starColor);
        lineMaterial.color.setHex(t.lineColor);
    }
    try { localStorage.setItem('theme', t.id); } catch (e) {}
}
document.getElementById('theme-toggle')?.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    applyTheme(currentThemeIndex);
});

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
    color: themes[currentThemeIndex].starColor,
    size: 0.6,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// --- FILAMENTS EN FORME DE RÉSEAU DE NEURONES (Nombre réduit à 8) ---
const lineMaterial = new THREE.LineBasicMaterial({
    color: themes[currentThemeIndex].lineColor,
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

const codeSymbols = ['</>', '{..}', '0011', 'AI', 'IoT', 'CSS', 'Bot'];
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

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function animate() {
    requestAnimationFrame(animate);
    if (document.hidden || reduceMotion) return; // économise batterie/CPU
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
applyTheme(currentThemeIndex);

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
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('active')));
}


// --- 3. PROJETS (données) + filtres par spécialité ---
const projects = [
    { t: "Transition éducative digitale", d: "Modèle d'enseignement numérique soutenu par un accompagnement intelligent par IA.", c: ["ia"], tags: ["IA", "EdTech"], icon: "fa-brain", g: "Transition-educative-digitale" },
    { t: "Reconnaissance faciale : pointage universitaire", d: "Pointage automatique des présences avec caméras Hikvision, API FastAPI, MongoDB et stockage Cloudinary.", c: ["ia", "cyber"], tags: ["Hikvision", "FastAPI", "MongoDB"], img: "pointage.jpg", g: "Syst-me-de-Pointage-Intelligent-avec-cam-ras-Hikvision", f: 1 },
    { t: "Automatisation en cybersécurité (desktop)", d: "Évaluation des risques, gestion des vulnérabilités, sécurité Wi-Fi, audit et génération de rapports.", c: ["cyber", "auto"], tags: ["Audit", "Wi-Fi", "Desktop"], img: "sec_sys.png", g: "Application-bireau-cybersecurite", f: 1 },
    { t: "Gestion intelligente des déchets", d: "Optimisation de la collecte urbaine par IoT et IA pour réduire les coûts de ramassage.", c: ["iot", "ia", "auto"], tags: ["IoT", "IA"], img: "poubele2.png", g: "Systeme_Gestion_Intelligente_Dechets_FR_MG", f: 1 },
    { t: "Adduction d'eau potable par pompe solaire", d: "Pompage automatisé piloté par interfaces web, mobile et logiciel de bureau.", c: ["iot", "auto"], tags: ["IoT", "Web", "Mobile"], img: "pompe.png", g: "Syst-me-automatis-d-adduction-d-eau-potable-par-pompe-solaire", f: 1 },
    { t: "Sécurisation intelligente par reconnaissance faciale", d: "Contrôle d'accès avec interface web, IoT et OpenCV.", c: ["ia", "cyber", "iot"], tags: ["OpenCV", "Web", "IoT"], img: "recon_sec1.png", g: "Reconnaissance-Faciale-Web-interface_dernier_version" },
    { t: "Anti-délestage automatique et connecté", d: "Basculement automatique de l'alimentation électrique avec ESP32.", c: ["iot", "auto"], tags: ["ESP32", "Automatisation"], img: "elec1.png", g: "Systeme_anti-delestage_automatique_et_connecte" },
    { t: "Localisation et traçage pour élevage bovin", d: "Suivi des zébus par GPS et IoT avec cartographie.", c: ["iot"], tags: ["GPS", "IoT"], img: "omby1.png", g: "Syst-me-de-localisation-et-tra-age-pour-levage-bovin" },
    { t: "Paiement automatique pour transports", d: "Paiement par Mobile Money et carte scannée.", c: ["auto"], tags: ["Mobile Money", "NFC"], img: "car2.png", g: "Des-projet-diferent" },
    { t: "Parking intelligent à déroute IoT", d: "Guidage dynamique des véhicules avec effets lumineux Trix Colors.", c: ["iot", "auto"], tags: ["ESP32", "Web"], img: "in_route.png", g: "Systme_IoT_deroute_intelligente" }
];
const grid = document.getElementById('projects-grid');
grid.innerHTML = projects.map(p => `
<article class="project-card" data-cat="${p.c.join(' ')}">
  <div class="card-media">${p.img ? `<img src="images/${p.img}" alt="${p.t}" class="real-img" loading="lazy">` : `<div class="media-fallback"><i class="fa-solid ${p.icon}"></i></div>`}${p.f ? '<span class="featured-badge">★ Projet phare</span>' : ''}</div>
  <div class="project-info">
    <h3>${p.t}</h3><p>${p.d}</p>
    <div class="tags">${p.tags.map(x => `<span>${x}</span>`).join('')}</div>
    <a href="https://github.com/fanantenana1/${p.g}" target="_blank" rel="noopener" class="project-link">Voir le code <i class="fa-solid fa-arrow-right"></i></a>
  </div>
</article>`).join('');

document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    grid.querySelectorAll('.project-card').forEach(c => { c.hidden = !(f === 'all' || c.dataset.cat.split(' ').includes(f)); });
}));
