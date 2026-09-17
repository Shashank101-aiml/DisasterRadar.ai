import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  geocodeLocation,
  fetchGlobalLiveTelemetry,
  predictFloodRisk,
  fetchMiraBhayandarGIS
} from '../services/api';

// Global Preset Disaster / Hotspot Locations
const PRESET_HOTSPOTS = [
  { name: 'Mira Bhayandar', country: 'India', lat: 19.2952, lng: 72.8544, desc: 'MBMC Coastal Creek Plain' },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, desc: 'Mithi River Basin' },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lng: 77.5946, desc: 'Urban Valley & Lake Overflows' },
  { name: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918, desc: 'Atlantic Coastal Sea Rise' },
  { name: 'Jakarta', country: 'Indonesia', lat: -6.2088, lng: 106.8456, desc: 'North Jakarta Subsidence' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, desc: 'Arakawa Storm Surge Basin' },
  { name: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155, desc: 'Lagoon Tidal Acqua Alta' },
  { name: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, desc: 'Thames Barrier Inundation' }
];

export default function GlobeRiskMap({
  onSelectLocationForPredict,
  onBackToDashboard,
  activeLocation,
  onLocationChange,
  onOpenHistoryModal
}) {
  // View mode: '3d-globe' or '2d-gis'
  const [viewMode, setViewMode] = useState('3d-globe');

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Lat / Lng Direct Input States
  const [latInput, setLatInput] = useState(activeLocation?.lat?.toFixed(3) || '19.295');
  const [lngInput, setLngInput] = useState(activeLocation?.lng?.toFixed(3) || '72.854');

  // Active Target Location
  const [targetLocation, setTargetLocation] = useState(activeLocation || {
    name: 'Mira Bhayandar',
    country: 'India',
    lat: 19.2952,
    lng: 72.8544
  });


  // Telemetry & Prediction States
  const [telemetry, setTelemetry] = useState({
    rainfall24h: 125,
    rainfall72h: 240,
    elevation: 12,
    temperature: 28,
    humidity: 88,
    windSpeed: 18,
    pressure: 1002,
    status: 'live',
    source: 'Open-Meteo Global Satellite & DEM'
  });

  const [prediction, setPrediction] = useState({
    probability: 88.5,
    riskLevel: 'CRITICAL',
    riskClass: 'high',
    recommendation: 'Immediate flood risk! Deploy high-capacity dewatering pumps to Rai Creek outlet and issue low-lying evacuation alerts.',
    riskFactors: [
      { name: 'Rainfall (72h)', value: 38, color: '#ef4444' },
      { name: 'Rainfall (24h)', value: 26, color: '#f97316' },
      { name: 'Elevation (Low)', value: 16, color: '#eab308' },
      { name: 'Humidity Saturation', value: 12, color: '#84cc16' },
      { name: 'Tidal Pressure', value: 8, color: '#06b6d4' }
    ]
  });

  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // References for Three.js 3D Globe
  const globeContainerRef = useRef(null);
  const threeStateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    globeMesh: null,
    atmosphereMesh: null,
    beaconGroup: null,
    targetRotation: { x: 0, y: 0 },
    currentRotation: { x: 0, y: 0 },
    isDragging: false,
    prevMouse: { x: 0, y: 0 },
    reqId: null,
    pulseVal: 0
  });

  // References for 2D GIS Leaflet Map
  const leafletContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const [gisData, setGisData] = useState(null);
  const [activeLayers, setActiveLayers] = useState({
    zones: true,
    railway: true,
    roads: true,
    hotspots: true
  });

  // ==========================================================================
  // ==========================================================================
  // 1. THREE.JS 3D WORLD GLOBE ENGINE (ULTRA 3D DIMENSIONAL REALISM)
  // ==========================================================================
  useEffect(() => {
    if (viewMode !== '3d-globe' || !globeContainerRef.current) return;

    const container = globeContainerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040711); // Deep space cosmic black

    // 2. Camera setup with dynamic perspective
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 3000);
    camera.position.z = 285;

    // 3. WebGL Renderer with High-DPI antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Multi-directional Cinematic 3D Lighting
    // Strong Key Sun Light (produces dramatic continental shadows and relief)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.6);
    sunLight.position.set(450, 200, 320);
    scene.add(sunLight);

    // Earthshine / Atmosphere Back-scatter Light (subtle cyan/sky glow)
    const backRimLight = new THREE.DirectionalLight(0x0284c7, 0.9);
    backRimLight.position.set(-400, -120, -280);
    scene.add(backRimLight);

    // Deep space cold ambient fill (keeps dark side of planet visible with coordinate lines)
    const ambientLight = new THREE.AmbientLight(0x0a1628, 0.6);
    scene.add(ambientLight);

    // 5. Dual-Layer Multi-Depth 3D Starfield
    const starFieldGroup = new THREE.Group();
    // Distant micro-stars
    const starsGeo = new THREE.BufferGeometry();
    const starCoords = [];
    for (let i = 0; i < 1200; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 1800 - 400;
      starCoords.push(x, y, z);
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 1.1, transparent: true, opacity: 0.65 });
    starFieldGroup.add(new THREE.Points(starsGeo, starsMat));

    // Foreground brighter navigation stars
    const navStarsGeo = new THREE.BufferGeometry();
    const navStarCoords = [];
    for (let i = 0; i < 180; i++) {
      const x = (Math.random() - 0.5) * 1400;
      const y = (Math.random() - 0.5) * 1400;
      const z = (Math.random() - 0.5) * 1200 - 200;
      navStarCoords.push(x, y, z);
    }
    navStarsGeo.setAttribute('position', new THREE.Float32BufferAttribute(navStarCoords, 3));
    const navStarsMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 1.8, transparent: true, opacity: 0.85 });
    starFieldGroup.add(new THREE.Points(navStarsGeo, navStarsMat));
    scene.add(starFieldGroup);

    // 6. High-Resolution Procedural Texture Generation (Albedo, Bump Relief, Specular, Clouds)
    const canvasW = 2048;
    const canvasH = 1024;

    // A. Albedo Canvas (Land, Oceans, Polar Caps)
    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = canvasW;
    albedoCanvas.height = canvasH;
    const albedoCtx = albedoCanvas.getContext('2d');

    // Deep oceanic body
    albedoCtx.fillStyle = '#07162c';
    albedoCtx.fillRect(0, 0, canvasW, canvasH);

    // Draw rich multi-tone continents and landforms
    drawRichContinents(albedoCtx, canvasW, canvasH);

    // Lat / Long Coordinate Grid lines on Earth
    albedoCtx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
    albedoCtx.lineWidth = 1;
    for (let lat = -80; lat <= 80; lat += 20) {
      const y = ((90 - lat) / 180) * canvasH;
      albedoCtx.beginPath();
      albedoCtx.moveTo(0, y);
      albedoCtx.lineTo(canvasW, y);
      albedoCtx.stroke();
    }
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = ((lng + 180) / 360) * canvasW;
      albedoCtx.beginPath();
      albedoCtx.moveTo(x, 0);
      albedoCtx.lineTo(x, canvasH);
      albedoCtx.stroke();
    }

    // B. Bump Map Canvas (Grayscale Elevation for 3D Mountain/Topography Relief)
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = canvasW;
    bumpCanvas.height = canvasH;
    const bumpCtx = bumpCanvas.getContext('2d');
    bumpCtx.fillStyle = '#000000'; // Oceans have zero elevation
    bumpCtx.fillRect(0, 0, canvasW, canvasH);
    drawElevationRelief(bumpCtx, canvasW, canvasH);

    // C. Specular Map Canvas (Oceans reflect sunlight; land is matte)
    const specCanvas = document.createElement('canvas');
    specCanvas.width = canvasW;
    specCanvas.height = canvasH;
    const specCtx = specCanvas.getContext('2d');
    specCtx.fillStyle = '#c0d0e0'; // Water is reflective
    specCtx.fillRect(0, 0, canvasW, canvasH);
    drawContinentMask(specCtx, canvasW, canvasH, '#000000'); // Land is non-reflective

    // D. Cloud Layer Canvas (Atmospheric swirls)
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = canvasW;
    cloudCanvas.height = canvasH;
    const cloudCtx = cloudCanvas.getContext('2d');
    drawProceduralClouds(cloudCtx, canvasW, canvasH);

    // Textures
    const earthTexture = new THREE.CanvasTexture(albedoCanvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.ClampToEdgeWrapping;

    const specularTexture = new THREE.CanvasTexture(specCanvas);
    specularTexture.wrapS = THREE.RepeatWrapping;
    specularTexture.wrapT = THREE.ClampToEdgeWrapping;

    const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
    cloudTexture.wrapS = THREE.RepeatWrapping;
    cloudTexture.wrapT = THREE.ClampToEdgeWrapping;

    // 7. Base Earth Sphere with High Polygon Density & 3D Bump Relief
    const globeRadius = 95;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 96, 96);
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 3.4, // Physically raises mountain ranges & coastlines in 3D
      specularMap: specularTexture,
      specular: new THREE.Color(0x60a5fa), // Vivid oceanic specular sun glint
      shininess: 45
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globeMesh);

    // Async load photo-realistic NASA imagery if available, seamlessly swapping in
    const imgLoader = new THREE.TextureLoader();
    imgLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', (tex) => {
      globeMesh.material.map = tex;
      globeMesh.material.needsUpdate = true;
    });
    imgLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png', (bumpTex) => {
      globeMesh.material.bumpMap = bumpTex;
      globeMesh.material.bumpScale = 3.6;
      globeMesh.material.needsUpdate = true;
    });

    // 8. TRUE 3D FLOATING CLOUD LAYER (With Separate Parallax Rotation)
    const cloudGeo = new THREE.SphereGeometry(globeRadius * 1.018, 80, 80);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.44,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    imgLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png', (cTex) => {
      cloudMesh.material.map = cTex;
      cloudMesh.material.needsUpdate = true;
    });

    // 9. ATMOSPHERIC RAYLEIGH FRESNEL HALO SHADER
    // Custom vertex/fragment shader gives photorealistic luminous limb glow
    const atmosGeo = new THREE.SphereGeometry(globeRadius * 1.15, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = pow(0.72 - dot(vNormal, viewDir), 2.4);
          gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * fresnel * 1.35;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    const atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphereMesh);

    // Inner soft atmospheric rim
    const innerAtmosGeo = new THREE.SphereGeometry(globeRadius * 1.006, 64, 64);
    const innerAtmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending
    });
    const innerAtmosMesh = new THREE.Mesh(innerAtmosGeo, innerAtmosMat);
    scene.add(innerAtmosMesh);

    // 10. 3D TELEMETRY ARCS & DATA FLOW WAVES (Connecting Major World Weather Centers)
    const arcGroup = new THREE.Group();
    const arcsData = [];
    const worldHubs = [
      { from: [19.29, 72.85], to: [35.67, 139.65] }, // Mira Bhayandar -> Tokyo
      { from: [19.29, 72.85], to: [51.50, -0.12] },  // Mira Bhayandar -> London
      { from: [19.29, 72.85], to: [1.35, 103.81] },  // Mira Bhayandar -> Singapore
      { from: [35.67, 139.65], to: [37.77, -122.41] }, // Tokyo -> San Francisco
      { from: [51.50, -0.12], to: [40.71, -74.00] },  // London -> New York
      { from: [40.71, -74.00], to: [25.76, -80.19] },  // New York -> Miami
      { from: [1.35, 103.81], to: [-33.86, 151.20] }  // Singapore -> Sydney
    ];

    worldHubs.forEach((hub, idx) => {
      const vStart = latLngToVector3(hub.from[0], hub.from[1], globeRadius);
      const vEnd = latLngToVector3(hub.to[0], hub.to[1], globeRadius);

      // Apex lifted high above Earth surface (radius 118-124)
      const mid = vStart.clone().add(vEnd).multiplyScalar(0.5);
      const distance = vStart.distanceTo(vEnd);
      const apexRadius = globeRadius + Math.min(32, Math.max(16, distance * 0.18));
      mid.normalize().multiplyScalar(apexRadius);

      const curve = new THREE.QuadraticBezierCurve3(vStart, mid, vEnd);
      const points = curve.getPoints(45);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0x38bdf8 : 0x0284c7,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcGroup.add(arcLine);

      // Glowing moving photon bead traveling along arc
      const beadGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const beadMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const beadMesh = new THREE.Mesh(beadGeo, beadMat);
      arcGroup.add(beadMesh);

      arcsData.push({ curve, bead: beadMesh, progress: (idx * 0.15) % 1 });
    });
    globeMesh.add(arcGroup);

    // 11. 3D ORBITING WEATHER RADAR SATELLITE
    const satelliteGroup = new THREE.Group();
    // Satellite bus body
    const satBodyGeo = new THREE.BoxGeometry(2.2, 2.2, 3.2);
    const satBodyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.25 });
    const satBody = new THREE.Mesh(satBodyGeo, satBodyMat);
    satelliteGroup.add(satBody);

    // Solar panels
    const panelGeo = new THREE.BoxGeometry(7.0, 0.2, 2.0);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const leftPanel = new THREE.Mesh(panelGeo, panelMat);
    leftPanel.position.set(-5.0, 0, 0);
    satelliteGroup.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeo, panelMat);
    rightPanel.position.set(5.0, 0, 0);
    satelliteGroup.add(rightPanel);

    // Satellite orbital path ring (tilted at 58 degrees)
    const satOrbitGeo = new THREE.RingGeometry(137.5, 138.2, 64);
    const satOrbitMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    });
    const satOrbitRing = new THREE.Mesh(satOrbitGeo, satOrbitMat);
    satOrbitRing.rotation.x = Math.PI * 0.38;
    satOrbitRing.rotation.y = Math.PI * 0.15;
    scene.add(satOrbitRing);
    scene.add(satelliteGroup);

    // 12. 3D Holographic Target Beacon Marker Group
    const beaconGroup = new THREE.Group();
    globeMesh.add(beaconGroup);

    // Store state in ref
    threeStateRef.current = {
      scene,
      camera,
      renderer,
      globeMesh,
      cloudMesh,
      atmosphereMesh,
      beaconGroup,
      satelliteGroup,
      arcsData,
      targetRotation: { x: 0, y: 0 },
      currentRotation: { x: 0, y: 0 },
      isDragging: false,
      prevMouse: { x: 0, y: 0 },
      reqId: null,
      pulseVal: 0,
      satAngle: 0
    };

    // Calculate rotation to face initial target
    updateGlobeTargetRotation(targetLocation.lat, targetLocation.lng);

    // Mouse Controls (Rotate / Orbit / Zoom)
    const onMouseDown = (e) => {
      threeStateRef.current.isDragging = true;
      threeStateRef.current.prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!threeStateRef.current.isDragging) return;
      const deltaX = e.clientX - threeStateRef.current.prevMouse.x;
      const deltaY = e.clientY - threeStateRef.current.prevMouse.y;
      threeStateRef.current.prevMouse = { x: e.clientX, y: e.clientY };

      threeStateRef.current.targetRotation.y += deltaX * 0.0055;
      threeStateRef.current.targetRotation.x = Math.max(
        -Math.PI / 2.2,
        Math.min(Math.PI / 2.2, threeStateRef.current.targetRotation.x + deltaY * 0.0055)
      );
    };

    const onMouseUp = () => {
      threeStateRef.current.isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      // Allow zooming close (135 units) for maximum 3D terrain horizon curvature
      camera.position.z = Math.max(135, Math.min(480, camera.position.z + e.deltaY * 0.25));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    // 13. Dynamic Animation Loop (Parallax, Clouds, Telemetry Pulses, Orbiting Satellite)
    let pulseVal = 0;
    let satAngle = 0;
    const animate = () => {
      threeStateRef.current.reqId = requestAnimationFrame(animate);

      // Auto rotation if not dragging and autoRotate is on
      if (autoRotate && !threeStateRef.current.isDragging) {
        threeStateRef.current.targetRotation.y += 0.0016;
      }

      // Smooth damping interpolation (Ease-Out)
      const cur = threeStateRef.current.currentRotation;
      const tgt = threeStateRef.current.targetRotation;
      cur.x += (tgt.x - cur.x) * 0.08;
      cur.y += (tgt.y - cur.y) * 0.08;

      if (globeMesh) {
        globeMesh.rotation.x = cur.x;
        globeMesh.rotation.y = cur.y;
      }

      // TRUE 3D CLOUD PARALLAX: Clouds rotate slightly faster and independent from the Earth below
      if (cloudMesh) {
        cloudMesh.rotation.x = cur.x * 0.98;
        cloudMesh.rotation.y = cur.y * 1.04 + 0.0004;
      }

      // Animate 3D Telemetry Traveling Photons
      if (threeStateRef.current.arcsData) {
        threeStateRef.current.arcsData.forEach((arc) => {
          arc.progress = (arc.progress + 0.008) % 1;
          const pos = arc.curve.getPoint(arc.progress);
          arc.bead.position.copy(pos);
        });
      }

      // Animate 3D Orbiting Satellite around Earth
      satAngle += 0.012;
      const orbitR = 138;
      const sx = Math.cos(satAngle) * orbitR;
      const sz = Math.sin(satAngle) * orbitR * Math.cos(0.55);
      const sy = Math.sin(satAngle) * orbitR * Math.sin(0.55);
      satelliteGroup.position.set(sx, sy, sz);
      satelliteGroup.lookAt(0, 0, 0);

      // Animate 3D Holographic Target Beacon (Pulsing ring + rotating diamond)
      pulseVal += 0.055;
      if (beaconGroup) {
        const ring = beaconGroup.getObjectByName('beaconRing');
        if (ring) {
          const s = 1.0 + Math.sin(pulseVal) * 0.45;
          ring.scale.set(s, s, s);
          ring.material.opacity = 0.85 - (s - 1.0) * 0.8;
        }
        const crystal = beaconGroup.getObjectByName('beaconCrystal');
        if (crystal) {
          crystal.rotation.y += 0.04;
          crystal.rotation.x += 0.02;
          crystal.position.y += Math.sin(pulseVal * 1.5) * 0.04;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (threeStateRef.current.reqId) cancelAnimationFrame(threeStateRef.current.reqId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [viewMode, autoRotate]);

  // Helper: Draw Rich Biome Continents (Foliage, highlands, deserts, polar ice caps)
  function drawRichContinents(ctx, w, h) {
    // Base continent shapes
    ctx.fillStyle = '#1e3a5f'; // Coastal waters / continental shelf
    drawRawPolygons(ctx);

    // Foliage & temperate landmass
    ctx.fillStyle = '#22543d';
    drawInnerLand(ctx);

    // Arid & mountainous elevations
    ctx.fillStyle = '#65532f';
    drawMountainRidges(ctx);

    // Polar ice caps (North & South)
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.rect(0, 0, w, h * 0.09); // Arctic
    ctx.fill();
    ctx.beginPath();
    ctx.rect(0, h * 0.91, w, h * 0.09); // Antarctica
    ctx.fill();
  }

  // Helper: Draw Grayscale Elevation Relief for 3D Bump Mapping
  function drawElevationRelief(ctx, w, h) {
    // Continents base elevation (mid-gray)
    ctx.fillStyle = '#555555';
    drawRawPolygons(ctx);

    // Mountain chains (bright white for maximum physical height)
    ctx.fillStyle = '#ffffff';
    drawMountainRidges(ctx);
  }

  // Helper: Mask for Specular Reflection
  function drawContinentMask(ctx, w, h, fillStyle) {
    ctx.fillStyle = fillStyle;
    drawRawPolygons(ctx);
  }

  // Helper: Procedural Weather Front Cloud Swirls
  function drawProceduralClouds(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';

    // Equatorial trade wind cloud bands
    for (let i = 0; i < 40; i++) {
      const cx = (i * 55) % w;
      const cy = h * 0.45 + (Math.sin(i * 0.8) * 60);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 75, 22, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    // Mid-latitude cyclone spirals
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    const spirals = [
      [380, 260], [800, 240], [1350, 270], [1700, 250],
      [450, 720], [1150, 740], [1600, 710]
    ];
    spirals.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 50, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawRawPolygons(ctx) {
    // North America
    ctx.beginPath();
    ctx.ellipse(450, 320, 190, 110, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // South America
    ctx.beginPath();
    ctx.ellipse(650, 680, 110, 190, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Eurasia
    ctx.beginPath();
    ctx.ellipse(1400, 300, 320, 160, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Africa
    ctx.beginPath();
    ctx.ellipse(1100, 560, 150, 200, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // India & Southeast Asia
    ctx.beginPath();
    ctx.ellipse(1440, 460, 70, 90, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Australia
    ctx.beginPath();
    ctx.ellipse(1750, 720, 110, 80, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawInnerLand(ctx) {
    ctx.beginPath();
    ctx.ellipse(440, 315, 150, 80, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(645, 660, 85, 150, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1390, 290, 260, 120, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1090, 550, 115, 160, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1435, 455, 50, 70, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1740, 715, 80, 60, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawMountainRidges(ctx) {
    // Himalayas
    ctx.beginPath();
    ctx.ellipse(1430, 400, 90, 28, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Rockies
    ctx.beginPath();
    ctx.ellipse(370, 310, 28, 120, -0.25, 0, Math.PI * 2);
    ctx.fill();
    // Andes
    ctx.beginPath();
    ctx.ellipse(580, 680, 22, 170, -0.18, 0, Math.PI * 2);
    ctx.fill();
    // Alps
    ctx.beginPath();
    ctx.ellipse(1130, 290, 45, 20, 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Helper: Convert Lat/Lng to 3D Cartesian coordinates on sphere
  const latLngToVector3 = (lat, lng, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Update Globe Orientation to Face Target Location & Render 3D Holographic Beacon
  const updateGlobeTargetRotation = (lat, lng) => {
    if (!threeStateRef.current) return;
    const targetX = (lat * Math.PI) / 180;
    const targetY = -((lng - 90) * Math.PI) / 180;

    threeStateRef.current.targetRotation.x = targetX;
    threeStateRef.current.targetRotation.y = targetY;

    // Rebuild 3D Holographic Beacon marker on the Globe
    const beaconGroup = threeStateRef.current.beaconGroup;
    if (beaconGroup) {
      // Clear old markers
      while (beaconGroup.children.length > 0) {
        const obj = beaconGroup.children[0];
        beaconGroup.remove(obj);
      }

      const radius = 95.5;
      const pos = latLngToVector3(lat, lng, radius);

      // 1. Glowing Center Pin Core at Surface
      const pinGeo = new THREE.SphereGeometry(2.2, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      beaconGroup.add(pinMesh);

      // 2. Pulsing Outer Target Ring on Surface
      const ringGeo = new THREE.RingGeometry(3.0, 4.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.name = 'beaconRing';
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      beaconGroup.add(ringMesh);

      // 3. Volumetric 3D Laser Pillar Beam rising high into space
      const beamHeight = 28;
      const beamGeo = new THREE.CylinderGeometry(0.4, 0.4, beamHeight, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      const normal = pos.clone().normalize();
      const beamPos = pos.clone().add(normal.clone().multiplyScalar(beamHeight / 2));
      beamMesh.position.copy(beamPos);
      beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      beaconGroup.add(beamMesh);

      // 4. Floating 3D Rotating Crystal / Diamond at Beacon Top
      const crystalGeo = new THREE.OctahedronGeometry(2.4, 0);
      const crystalMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true
      });
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.name = 'beaconCrystal';
      const crystalPos = pos.clone().add(normal.clone().multiplyScalar(beamHeight + 3.0));
      crystalMesh.position.copy(crystalPos);
      beaconGroup.add(crystalMesh);
    }
  };

  // ==========================================================================
  // 2. TELEMETRY FETCH & ML MODEL PREDICTION FLOW
  // ==========================================================================
  const handleNavigateToLocation = useCallback(async (locationItem) => {
    setIsLoadingTelemetry(true);
    setTargetLocation(locationItem);
    setLatInput(locationItem.lat.toFixed(4));
    setLngInput(locationItem.lng.toFixed(4));

    // 1. Fly Globe to coordinates
    updateGlobeTargetRotation(locationItem.lat, locationItem.lng);

    // Notify parent about location change
    onLocationChange?.(locationItem);

    // 2. Fetch Live Telemetry from Open-Meteo & Copernicus DEM APIs

    const liveTelemetry = await fetchGlobalLiveTelemetry(locationItem.lat, locationItem.lng);
    setTelemetry(liveTelemetry);

    // 3. Feed Live Parameters into AI Model for Risk Prediction
    const predictionInput = {
      rainfall24h: liveTelemetry.rainfall24h,
      rainfall72h: liveTelemetry.rainfall72h,
      temperature: liveTelemetry.temperature,
      humidity: liveTelemetry.humidity,
      windSpeed: liveTelemetry.windSpeed,
      pressure: liveTelemetry.pressure,
      elevation: liveTelemetry.elevation,
      latitude: locationItem.lat,
      longitude: locationItem.lng,
      location: `${locationItem.name}${locationItem.country ? ', ' + locationItem.country : ''}`
    };

    const result = await predictFloodRisk(predictionInput);
    setPrediction(result);
    setIsLoadingTelemetry(false);
  }, []);

  // Handle Search Input Change with Debounced Geocoding
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await geocodeLocation(val);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  };

  // Handle Select from Search Autocomplete Dropdown
  const handleSelectSearchResult = (result) => {
    setShowDropdown(false);
    setSearchQuery(`${result.name}, ${result.country}`);
    handleNavigateToLocation({
      name: result.name,
      country: result.country,
      lat: result.lat,
      lng: result.lng
    });
  };

  // Handle Direct Lat/Long Input "Fly & Analyze"
  const handleFlyToCoords = (e) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (-90 to 90 for Latitude, -180 to 180 for Longitude)');
      return;
    }

    handleNavigateToLocation({
      name: `Point (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
      country: 'Custom Coordinates',
      lat: lat,
      lng: lng
    });
  };

  // ==========================================================================
  // 3. 2D CARTOGRAPHIC GIS ATLAS (MATCHING SCREENSHOT)
  // ==========================================================================
  useEffect(() => {
    if (viewMode !== '2d-gis' || !leafletContainerRef.current) return;

    // Fetch GIS Data for Mira Bhayandar
    async function loadGIS() {
      const data = await fetchMiraBhayandarGIS();
      if (data) setGisData(data);
    }
    loadGIS();

    // Initialize Leaflet Map
    const map = L.map(leafletContainerRef.current, {
      center: [targetLocation.lat, targetLocation.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // World Topo Map Tiles (matching the cartographic hillshade aesthetic)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{x}/{y}', {
      maxZoom: 18
    }).addTo(map);

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [viewMode, targetLocation.lat, targetLocation.lng]);

  // Render Leaflet GIS Layers when data or toggles change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || viewMode !== '2d-gis') return;

    const layerGroup = L.layerGroup().addTo(map);

    // If target is Mira Bhayandar, render full GIS polygons
    const isMira = Math.abs(targetLocation.lat - 19.2952) < 0.1 && Math.abs(targetLocation.lng - 72.8544) < 0.1;
    if (isMira) {
      // Risk Zones
      if (activeLayers.zones) {
        const defaultZones = [
          {
            name: "Bhayandar Creek Basin & Station Lowlands",
            risk: "Very High",
            color: "#f44336",
            coords: [[19.310, 72.845], [19.318, 72.850], [19.322, 72.858], [19.315, 72.868], [19.302, 72.862], [19.298, 72.852], [19.303, 72.846]]
          },
          {
            name: "Navghar & Penkarpada Inundation Pocket",
            risk: "Very High",
            color: "#f44336",
            coords: [[19.295, 72.860], [19.301, 72.868], [19.298, 72.876], [19.288, 72.872], [19.289, 72.862]]
          },
          {
            name: "Mira Road Central Urban Grid",
            risk: "High",
            color: "#ff9800",
            coords: [[19.285, 72.850], [19.295, 72.852], [19.302, 72.862], [19.295, 72.875], [19.282, 72.882], [19.275, 72.868], [19.278, 72.855]]
          },
          {
            name: "Rai-Morva & Murdha Agricultural Plain",
            risk: "Moderate",
            color: "#ffeb3b",
            coords: [[19.300, 72.795], [19.315, 72.815], [19.320, 72.840], [19.305, 72.845], [19.295, 72.825], [19.285, 72.810]]
          }
        ];

        defaultZones.forEach(z => {
          L.polygon(z.coords, {
            color: '#ffffff',
            weight: 1.5,
            fillColor: z.color,
            fillOpacity: 0.65
          }).bindTooltip(`<strong>${z.name}</strong><br/>Risk: ${z.risk}`).addTo(layerGroup);
        });
      }

      // Railway
      if (activeLayers.railway) {
        L.polyline([[19.325, 72.852], [19.314, 72.853], [19.298, 72.856], [19.282, 72.858], [19.265, 72.860]], {
          color: '#1d4ed8',
          weight: 4
        }).addTo(layerGroup);
      }

      // Roads
      if (activeLayers.roads) {
        const roads = [
          [[19.262, 72.870], [19.275, 72.873], [19.290, 72.880], [19.305, 72.892]],
          [[19.278, 72.785], [19.295, 72.815], [19.305, 72.835], [19.312, 72.850]],
          [[19.290, 72.850], [19.292, 72.865], [19.294, 72.880]]
        ];
        roads.forEach(r => L.polyline(r, { color: '#0f172a', weight: 2 }).addTo(layerGroup));
      }
    } else {
      // Generic pin for any global coordinates
      const targetMarker = L.circleMarker([targetLocation.lat, targetLocation.lng], {
        radius: 9,
        fillColor: prediction.probability > 70 ? '#ef4444' : (prediction.probability > 40 ? '#f59e0b' : '#10b981'),
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(layerGroup);

      targetMarker.bindPopup(`
        <strong>${targetLocation.name}</strong><br/>
        Risk: ${prediction.riskLevel} (${prediction.probability}%)<br/>
        Elev: ${telemetry.elevation}m | 24h Rain: ${telemetry.rainfall24h}mm
      `).openPopup();
    }

    return () => layerGroup.remove();
  }, [viewMode, activeLayers, targetLocation, prediction, telemetry]);

  // Load into Main Predictor Dashboard
  const handleAnalyzeInPredictor = () => {
    if (onSelectLocationForPredict) {
      onSelectLocationForPredict({
        name: targetLocation.name,
        country: targetLocation.country,
        lat: targetLocation.lat,
        lng: targetLocation.lng,
        r24: telemetry.rainfall24h,
        r72: telemetry.rainfall72h,
        elev: telemetry.elevation,
        temp: telemetry.temperature,
        hum: telemetry.humidity,
        pressure: telemetry.pressure,
        wind: telemetry.windSpeed,
        probability: prediction.probability,
        riskLevel: prediction.riskLevel
      });
    }
  };

  return (
    <div className="globe-page-wrapper">
      {/* 1. TOP DUAL-SEARCH & NAVIGATION BAR */}
      <div className="globe-top-bar">
        {/* Title & Back Button */}
        <div className="globe-header-left">
          <button className="back-btn" onClick={onBackToDashboard}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Dashboard</span>
          </button>
          <div>
            <h2 className="globe-main-title">
              {viewMode === '3d-globe' ? '3D World Globe Flood Radar' : 'High-Resolution Topographic GIS Atlas'}
            </h2>
            <div className="globe-sub-title">
              Planetary Geospatial Telemetry Ingestion & Real-Time AI Risk Inference
            </div>
          </div>
        </div>

        {/* View Switcher Toggle (3D Globe ⟷ 2D GIS Atlas) */}
        <div className="globe-view-toggle">
          <button
            className={`view-toggle-btn ${viewMode === '3d-globe' ? 'active' : ''}`}
            onClick={() => setViewMode('3d-globe')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>3D World Globe</span>
          </button>
          <button
            className={`view-toggle-btn ${viewMode === '2d-gis' ? 'active' : ''}`}
            onClick={() => setViewMode('2d-gis')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <span>2D GIS Atlas</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Action Button: View Area History */}
          <button
            className="view-history-globe-btn"
            onClick={() => onOpenHistoryModal?.(targetLocation)}
            title={`View Historical Flood Registry for ${targetLocation.name}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <span>📜 View Area History</span>
          </button>

          {/* Action Button: Analyze in Predictor */}
          <button className="predict-globe-btn" onClick={handleAnalyzeInPredictor}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
            <span>Analyze in Predictor</span>
          </button>
        </div>
      </div>


      {/* 2. DUAL INPUT SEARCH CONTROLS BAR */}
      <div className="globe-search-controls-bar">
        {/* A. City / Country Search Input with Autocomplete */}
        <div className="search-input-group city-search-wrapper">
          <label className="search-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>City & Country</span>
          </label>
          <div className="input-with-loader">
            <input
              type="text"
              className="globe-search-input"
              placeholder="e.g. Mira Bhayandar, Tokyo, Miami, Paris..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            />
            {isSearching && <span className="search-spinner" />}
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  className="search-result-item"
                  onClick={() => handleSelectSearchResult(item)}
                >
                  <div className="result-name">
                    <strong>{item.name}</strong>
                    {item.admin && <span className="result-admin">, {item.admin}</span>}
                    {item.country && <span className="result-country"> ({item.country})</span>}
                  </div>
                  <div className="result-coords">
                    {item.lat.toFixed(3)}°, {item.lng.toFixed(3)}° • Elev: {item.elevation}m
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* B. Direct Latitude & Longitude Coordinate Inputs */}
        <form className="search-input-group coords-form" onSubmit={handleFlyToCoords}>
          <div className="coord-field">
            <label className="search-label">Latitude</label>
            <input
              type="number"
              step="any"
              className="coord-input"
              placeholder="e.g. 19.295"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
            />
          </div>
          <div className="coord-field">
            <label className="search-label">Longitude</label>
            <input
              type="number"
              step="any"
              className="coord-input"
              placeholder="e.g. 72.854"
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
            />
          </div>
          <button type="submit" className="coord-go-btn" title="Fly to Latitude/Longitude">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>Fly & Analyze</span>
          </button>
        </form>

        {/* C. Preset Hotspots Quick-Chips */}
        <div className="hotspot-pills-row">
          <span className="pills-label">Presets:</span>
          {PRESET_HOTSPOTS.map((spot, i) => (
            <button
              key={i}
              className={`hotspot-pill ${targetLocation.name === spot.name ? 'active' : ''}`}
              onClick={() => handleNavigateToLocation(spot)}
            >
              {spot.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MAIN MAP & HUD VIEWPORT CONTAINER */}
      <div className="globe-viewport-wrapper">
        {/* Mode A: 3D Three.js Interactive Earth Globe */}
        {viewMode === '3d-globe' && (
          <div className="globe-canvas-frame">
            <div ref={globeContainerRef} className="three-globe-container" />

            {/* Orbit & Auto-spin controls on 3D Globe */}
            <div className="globe-floating-controls">
              <button
                className={`control-btn ${autoRotate ? 'active' : ''}`}
                onClick={() => setAutoRotate(!autoRotate)}
                title="Toggle Auto Orbit Rotation"
              >
                {autoRotate ? '⏸ Pause Spin' : '▶ Auto Spin'}
              </button>
              <div className="interaction-hint">
                🖱️ Drag to rotate • Scroll to zoom
              </div>
            </div>
          </div>
        )}

        {/* Mode B: 2D Topographic Cartographic GIS Atlas */}
        {viewMode === '2d-gis' && (
          <div className="gis-canvas-container">
            <div ref={leafletContainerRef} className="gis-leaflet-container" />

            {/* GIS Layer Toggles */}
            <div className="gis-layer-toggles-floating">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={activeLayers.zones}
                  onChange={(e) => setActiveLayers((p) => ({ ...p, zones: e.target.checked }))}
                />
                <span>Risk Zones</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={activeLayers.railway}
                  onChange={(e) => setActiveLayers((p) => ({ ...p, railway: e.target.checked }))}
                />
                <span>Railway</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={activeLayers.roads}
                  onChange={(e) => setActiveLayers((p) => ({ ...p, roads: e.target.checked }))}
                />
                <span>Roads</span>
              </label>
            </div>

            {/* Compass Rose */}
            <div className="gis-compass-rose">
              <svg width="60" height="60" viewBox="0 0 100 100">
                <polygon points="50,10 56,44 50,42" fill="#0f172a" />
                <polygon points="50,10 44,44 50,42" fill="#cbd5e1" />
                <polygon points="50,90 56,56 50,58" fill="#0f172a" />
                <polygon points="50,90 44,56 50,58" fill="#cbd5e1" />
                <polygon points="10,50 44,56 42,50" fill="#cbd5e1" />
                <polygon points="10,50 44,44 42,50" fill="#0f172a" />
                <polygon points="90,50 56,56 58,50" fill="#0f172a" />
                <polygon points="90,50 56,44 58,50" fill="#cbd5e1" />
                <circle cx="50" cy="50" r="4" fill="#0f172a" />
                <text x="50" y="8" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#0f172a">N</text>
                <text x="50" y="99" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0f172a">S</text>
                <text x="3" y="54" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0f172a">W</text>
                <text x="97" y="54" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0f172a">E</text>
              </svg>
            </div>

            {/* Cartographic Legend (Matching Reference Image) */}
            <div className="gis-bottom-legend-panel">
              <div className="legend-title-col">
                <h3 className="legend-main-title">FLOOD RISK</h3>
                <div className="legend-place-name">{targetLocation.name}</div>
                <div className="legend-date">Date: Real-Time Stream</div>
              </div>

              <div className="legend-symbols-col">
                <div className="sym-row">
                  <span className="sym-boundary-box" />
                  <span className="sym-label">City Boundary</span>
                </div>
                <div className="sym-row">
                  <span className="sym-road-line" />
                  <span className="sym-label">Road Network</span>
                </div>
                <div className="sym-row">
                  <span className="sym-rail-line" />
                  <span className="sym-label">Railway Corridor</span>
                </div>
              </div>

              <div className="legend-risk-col">
                <div className="sym-label" style={{ fontWeight: 700, marginBottom: '6px' }}>Flood Risk Tiers</div>
                <div className="risk-grid">
                  <div className="risk-item"><span className="color-box" style={{ background: '#1b5e20' }} /> Very Low</div>
                  <div className="risk-item"><span className="color-box" style={{ background: '#4caf50' }} /> Low</div>
                  <div className="risk-item"><span className="color-box" style={{ background: '#ffeb3b' }} /> Moderate</div>
                  <div className="risk-item"><span className="color-box" style={{ background: '#ff9800' }} /> High</div>
                  <div className="risk-item"><span className="color-box" style={{ background: '#f44336' }} /> Very High</div>
                </div>
              </div>

              <div className="legend-metadata-col">
                <div>Coordinate System: GCS WGS 1984</div>
                <div>Datum: WGS 1984</div>
                <div>Data Source: Open-Meteo & Copernicus DEM</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. OVERLAY HUD: TELEMETRY STREAM & ML PREDICTION CARDS */}
        <div className="globe-hud-overlay">
          {/* Card 1: Real-Time Telemetry Stream Ingestion */}
          <div className="hud-card telemetry-card">
            <div className="hud-card-header">
              <div className="hud-title-with-badge">
                <span className={`hud-pulse-dot ${isLoadingTelemetry ? 'fetching' : 'active'}`} />
                <span className="hud-card-title">Live API Telemetry Stream</span>
              </div>
              <span className="hud-provider-tag">{telemetry.source}</span>
            </div>

            <div className="target-location-banner">
              <strong>{targetLocation.name}</strong>
              <span>({targetLocation.lat.toFixed(3)}°N, {targetLocation.lng.toFixed(3)}°E)</span>
            </div>

            <div className="telemetry-metrics-grid">
              <div className="metric-pill">
                <div className="metric-label">24h Rainfall</div>
                <div className="metric-value highlight">{telemetry.rainfall24h} <span className="unit">mm</span></div>
              </div>
              <div className="metric-pill">
                <div className="metric-label">72h Cumulative</div>
                <div className="metric-value highlight-orange">{telemetry.rainfall72h} <span className="unit">mm</span></div>
              </div>
              <div className="metric-pill">
                <div className="metric-label">Ground Elevation</div>
                <div className="metric-value">{telemetry.elevation} <span className="unit">m</span></div>
              </div>
              <div className="metric-pill">
                <div className="metric-label">Humidity</div>
                <div className="metric-value">{telemetry.humidity} <span className="unit">%</span></div>
              </div>
              <div className="metric-pill">
                <div className="metric-label">Temperature</div>
                <div className="metric-value">{telemetry.temperature} <span className="unit">°C</span></div>
              </div>
              <div className="metric-pill">
                <div className="metric-label">Atm. Pressure</div>
                <div className="metric-value">{telemetry.pressure} <span className="unit">hPa</span></div>
              </div>
            </div>

            {/* Quick Link to Area History */}
            <button
              onClick={() => onOpenHistoryModal?.(targetLocation)}
              style={{
                width: '100%',
                marginTop: '10px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>📜 View {targetLocation.name.split(',')[0]} Flood History →</span>
            </button>
          </div>


          {/* Card 2: AI Model Ingestion & Flood Risk Prediction */}
          <div className="hud-card prediction-card">
            <div className="hud-card-header">
              <span className="hud-card-title">AI Inundation Predictor</span>
              <span className={`risk-badge ${prediction.riskClass || 'high'}`}>
                {prediction.riskLevel} RISK
              </span>
            </div>

            {/* Risk Gauge Bar */}
            <div className="risk-gauge-container">
              <div className="gauge-header">
                <span>Flood Inundation Probability</span>
                <strong className="probability-text">{prediction.probability}%</strong>
              </div>
              <div className="risk-bar-track">
                <div
                  className="risk-bar-fill"
                  style={{
                    width: `${prediction.probability}%`,
                    background:
                      prediction.probability >= 70
                        ? '#ef4444'
                        : prediction.probability >= 40
                        ? '#f59e0b'
                        : '#10b981'
                  }}
                />
              </div>
            </div>

            {/* Key Risk Drivers Breakdown */}
            <div className="risk-drivers-list">
              <div className="drivers-title">Dominant Environmental Drivers:</div>
              {prediction.riskFactors &&
                prediction.riskFactors.slice(0, 3).map((factor, idx) => (
                  <div key={idx} className="driver-row">
                    <div className="driver-name-val">
                      <span>{factor.name}</span>
                      <span>{factor.value}% impact</span>
                    </div>
                    <div className="driver-bar-track">
                      <div
                        className="driver-bar-fill"
                        style={{ width: `${factor.value * 2}%`, background: factor.color }}
                      />
                    </div>
                  </div>
                ))}
            </div>

            {/* Actionable Advisory */}
            <div className="advisory-box">
              <div className="advisory-title">⚠️ Mitigation Advisory</div>
              <div className="advisory-text">{prediction.recommendation}</div>
            </div>

            {/* Bridge Button */}
            <button className="hud-analyze-btn" onClick={handleAnalyzeInPredictor}>
              Transfer to Full Prediction Engine →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
