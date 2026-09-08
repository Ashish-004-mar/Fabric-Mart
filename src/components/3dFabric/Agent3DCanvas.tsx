import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Agent3DCanvasProps {
  state?: 'idle' | 'listening' | 'processing' | 'speaking';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Agent3DCanvas: React.FC<Agent3DCanvasProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  const dimension = size === 'sm' ? 48 : size === 'lg' ? 96 : 64;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.15, 3.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(dimension, dimension);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.objectFit = 'contain';
    renderer.domElement.style.borderRadius = '9999px';
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 2.0);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0x38bdf8, 2, 5);
    accentLight.position.set(0, 0.5, 2);
    scene.add(accentLight);

    // ROOT AGENT GROUP (for floating animation)
    const agentGroup = new THREE.Group();
    scene.add(agentGroup);

    // HEAD GROUP (for tilting & nodding)
    const headGroup = new THREE.Group();
    agentGroup.add(headGroup);

    // 1. Sleek Metallic Head Shell (Sphere stretched vertically)
    const headGeo = new THREE.SphereGeometry(0.62, 32, 32);
    headGeo.scale(1, 1.08, 0.95);
    const headMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc, // Pearl White / Platinum
      metalness: 0.85,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.9,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headGroup.add(headMesh);

    // 2. Futuristic Dark Glass Curved Visor Face
    const visorGeo = new THREE.SphereGeometry(0.58, 32, 16, 0, Math.PI, 0.25, Math.PI * 0.55);
    visorGeo.scale(1.02, 1.02, 0.98);
    visorGeo.rotateY(Math.PI / 2);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x020617,
      metalness: 0.9,
      roughness: 0.05,
      transmission: 0.2,
      ior: 1.5,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.02, 0.06);
    headGroup.add(visorMesh);

    // 3. Dynamic Expressive Visor Canvas Texture (For Eyes/Soundwaves)
    const visorCanvas = document.createElement('canvas');
    visorCanvas.width = 256;
    visorCanvas.height = 128;
    const visorCtx = visorCanvas.getContext('2d');

    const visorTexture = new THREE.CanvasTexture(visorCanvas);
    visorTexture.colorSpace = THREE.SRGBColorSpace;

    const eyeDisplayGeo = new THREE.PlaneGeometry(0.85, 0.42);
    const eyeDisplayMat = new THREE.MeshBasicMaterial({
      map: visorTexture,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const eyeDisplayMesh = new THREE.Mesh(eyeDisplayGeo, eyeDisplayMat);
    eyeDisplayMesh.position.set(0, 0.05, 0.61);
    headGroup.add(eyeDisplayMesh);

    // 4. Sleek Side Ear Receptors / Headphones
    const earGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 32);
    earGeo.rotateZ(Math.PI / 2);
    const earMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.1,
    });

    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.62, 0.02, 0);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.62, 0.02, 0);
    headGroup.add(rightEar);

    // Ear Glowing Ring Accents
    const earRingGeo = new THREE.TorusGeometry(0.16, 0.02, 16, 32);
    earRingGeo.rotateY(Math.PI / 2);
    const earRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    
    const leftEarRing = new THREE.Mesh(earRingGeo, earRingMat);
    leftEarRing.position.set(-0.68, 0.02, 0);
    headGroup.add(leftEarRing);

    const rightEarRing = new THREE.Mesh(earRingGeo, earRingMat);
    rightEarRing.position.set(0.68, 0.02, 0);
    headGroup.add(rightEarRing);

    // 5. Floating Holographic Halo Ring
    const haloGeo = new THREE.TorusGeometry(0.85, 0.025, 16, 64);
    haloGeo.rotateX(Math.PI / 2.3);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0.75, 0);
    agentGroup.add(haloMesh);

    // 6. Floating Body Collar / Torso Base
    const torsoGeo = new THREE.ConeGeometry(0.45, 0.45, 32);
    torsoGeo.rotateX(Math.PI);
    const torsoMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
      clearcoat: 0.8,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.set(0, -0.85, 0);
    agentGroup.add(torsoMesh);

    // Glowing Chest Core Crystal
    const coreCrystalGeo = new THREE.OctahedronGeometry(0.14);
    const coreCrystalMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const coreCrystal = new THREE.Mesh(coreCrystalGeo, coreCrystalMat);
    coreCrystal.position.set(0, -0.72, 0.15);
    agentGroup.add(coreCrystal);

    // 7. Ambient Particle Halo
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 0.95 + Math.random() * 0.4;
      pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.85,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    agentGroup.add(particlePoints);

    // ANIMATION & CANVAS RENDER LOOP
    const startTime = performance.now();

    const drawVisorDisplay = (time: number, currentState: string) => {
      if (!visorCtx) return;

      visorCtx.clearRect(0, 0, 256, 128);

      let mainColor = '#38bdf8'; // Sky Blue
      let glowColor = 'rgba(56, 189, 248, 0.4)';

      if (currentState === 'listening') {
        mainColor = '#f43f5e'; // Rose Pink
        glowColor = 'rgba(244, 63, 94, 0.5)';
      } else if (currentState === 'speaking') {
        mainColor = '#10b981'; // Emerald Green
        glowColor = 'rgba(16, 185, 129, 0.5)';
      } else if (currentState === 'processing') {
        mainColor = '#f59e0b'; // Amber
        glowColor = 'rgba(245, 158, 11, 0.5)';
      }

      visorCtx.fillStyle = mainColor;
      visorCtx.shadowColor = mainColor;
      visorCtx.shadowBlur = 12;

      if (currentState === 'speaking') {
        // Render 7 dynamic equalizer bars on the visor!
        const numBars = 7;
        const barWidth = 14;
        const startX = 128 - (numBars * barWidth + (numBars - 1) * 8) / 2;
        for (let i = 0; i < numBars; i++) {
          const h = 12 + Math.abs(Math.sin(time * 10 + i * 1.2)) * 50;
          const x = startX + i * (barWidth + 8);
          const y = 64 - h / 2;
          visorCtx.beginPath();
          visorCtx.roundRect(x, y, barWidth, h, 6);
          visorCtx.fill();
        }
      } else if (currentState === 'processing') {
        // Render a rotating scanning light ring
        visorCtx.lineWidth = 6;
        visorCtx.strokeStyle = mainColor;
        visorCtx.beginPath();
        visorCtx.arc(128, 64, 28, time * 6, time * 6 + Math.PI * 1.2);
        visorCtx.stroke();
      } else if (currentState === 'listening') {
        // Expressive wide alert eyes with pulse
        const pulse = Math.sin(time * 8) * 3;
        visorCtx.beginPath();
        visorCtx.arc(80, 64, 18 + pulse, 0, Math.PI * 2);
        visorCtx.arc(176, 64, 18 + pulse, 0, Math.PI * 2);
        visorCtx.fill();
      } else {
        // Idle: Sleek curved futuristic glowing eye slits
        visorCtx.beginPath();
        visorCtx.ellipse(82, 64, 20, 6 + Math.sin(time * 2) * 1.5, 0, 0, Math.PI * 2);
        visorCtx.ellipse(174, 64, 20, 6 + Math.sin(time * 2) * 1.5, 0, 0, Math.PI * 2);
        visorCtx.fill();
      }

      visorTexture.needsUpdate = true;
    };

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;

      // State colors for lights & materials
      let activeColor = 0x38bdf8;
      let rotSpeed = 1.0;

      if (state === 'listening') {
        activeColor = 0xf43f5e;
        rotSpeed = 2.2;
      } else if (state === 'speaking') {
        activeColor = 0x10b981;
        rotSpeed = 1.8;
      } else if (state === 'processing') {
        activeColor = 0xf59e0b;
        rotSpeed = 2.5;
      }

      earRingMat.color.setHex(activeColor);
      haloMat.color.setHex(activeColor);
      coreCrystalMat.color.setHex(activeColor);
      accentLight.color.setHex(activeColor);

      // Smooth Bobbing Hover Animation
      const floatOffsetY = Math.sin(elapsedTime * 2) * 0.08;
      agentGroup.position.y = floatOffsetY;

      // Gentle Head Sway / Nod
      headGroup.rotation.y = Math.sin(elapsedTime * 1.2) * 0.12;
      headGroup.rotation.x = Math.cos(elapsedTime * 1.5) * 0.06;

      // Halo Ring Spinning
      haloMesh.rotation.z = elapsedTime * 0.8 * rotSpeed;

      // Core Crystal Spin
      coreCrystal.rotation.y = elapsedTime * 2 * rotSpeed;
      coreCrystal.rotation.x = elapsedTime * 1.5 * rotSpeed;

      // Particle Aura Rotation
      particlePoints.rotation.y = elapsedTime * 0.2 * rotSpeed;

      // Update visor display texture
      drawVisorDisplay(elapsedTime, state);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      headGeo.dispose();
      headMat.dispose();
      visorGeo.dispose();
      visorMat.dispose();
      eyeDisplayGeo.dispose();
      eyeDisplayMat.dispose();
      earGeo.dispose();
      earMat.dispose();
      earRingGeo.dispose();
      earRingMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      torsoGeo.dispose();
      torsoMat.dispose();
      coreCrystalGeo.dispose();
      coreCrystalMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      visorTexture.dispose();
    };
  }, [dimension, state]);

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: dimension, height: dimension }}
    />
  );
};
