import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sun, Maximize2, Wind, Eye, Layers, Sparkles, Sliders, Shield } from 'lucide-react';

export type Fabric3DMode = 'cloth' | 'ball' | 'roll' | 'curtain' | 'garment';
export type LightingPreset = 'studio' | 'daylight' | 'sunset' | 'runway';

interface Fabric3DViewerProps {
  textureUrl: string;
  fabricName?: string;
  fabricType?: string;
  colorHex?: string;
  mode?: Fabric3DMode;
  height?: string;
  autoRotateDefault?: boolean;
  showControlsBar?: boolean;
  onOpenFullStudio?: () => void;
}

export const Fabric3DViewer: React.FC<Fabric3DViewerProps> = ({
  textureUrl,
  fabricName = 'Real Fabric',
  fabricType = 'Cotton',
  colorHex,
  mode: initialMode = 'cloth',
  height = '420px',
  autoRotateDefault = true,
  showControlsBar = true,
  onOpenFullStudio,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const [currentMode, setCurrentMode] = useState<Fabric3DMode>(initialMode);
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [lighting, setLighting] = useState<LightingPreset>('studio');
  const [isWaving, setIsWaving] = useState(true);
  const [isTextureLoaded, setIsTextureLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const lightsGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Mouse Orbit Control state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationRef = useRef<{ x: number; y: number }>({ x: 0.2, y: 0.3 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.2, y: 0.3 });
  const distanceRef = useRef<number>(3.5);

  // Material tuning based on fabric type
  const getMaterialParams = (typeStr: string) => {
    const t = typeStr.toLowerCase();
    if (t.includes('silk') || t.includes('satin') || t.includes('charmeuse')) {
      return { roughness: 0.2, metalness: 0.1, sheen: 1.0, clearcoat: 0.4 };
    } else if (t.includes('velvet')) {
      return { roughness: 0.75, metalness: 0.05, sheen: 0.9, clearcoat: 0.1 };
    } else if (t.includes('leather') || t.includes('suede')) {
      return { roughness: 0.4, metalness: 0.2, sheen: 0.3, clearcoat: 0.3 };
    } else if (t.includes('denim') || t.includes('canvas') || t.includes('hemp')) {
      return { roughness: 0.85, metalness: 0.0, sheen: 0.1, clearcoat: 0.0 };
    } else if (t.includes('chiffon') || t.includes('organza')) {
      return { roughness: 0.3, metalness: 0.0, sheen: 0.6, transparent: true, opacity: 0.85 };
    }
    return { roughness: 0.5, metalness: 0.05, sheen: 0.3, clearcoat: 0.1 };
  };

  // Safe Texture Creation (handles CORS fallback via canvas)
  const createTextureFromUrl = (url: string): Promise<THREE.CanvasTexture | THREE.Texture> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 1024;
        canvas.height = img.height || 1024;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const texture = new THREE.CanvasTexture(canvas);
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.needsUpdate = true;
          resolve(texture);
          return;
        }
        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.colorSpace = THREE.SRGBColorSpace;
          resolve(tex);
        });
      };
      img.onerror = () => {
        // Fallback procedural pattern canvas if image blocked
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, 512, 512);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          for (let i = 0; i < 512; i += 32) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
          }
        }
        const fallbackTex = new THREE.CanvasTexture(canvas);
        fallbackTex.wrapS = THREE.RepeatWrapping;
        fallbackTex.wrapT = THREE.RepeatWrapping;
        resolve(fallbackTex);
      };
      img.src = url;
    });
  };

  // Helper to construct geometry based on selected mode
  const createGeometryForMode = (m: Fabric3DMode): THREE.BufferGeometry => {
    switch (m) {
      case 'cloth': {
        // High density grid for cloth waving animation
        const geo = new THREE.PlaneGeometry(2.4, 2.4, 48, 48);
        return geo;
      }
      case 'ball': {
        // Material Inspector Ball with inner core details
        const geo = new THREE.SphereGeometry(1.2, 64, 64);
        return geo;
      }
      case 'roll': {
        // Fabric bolt cylinder
        const geo = new THREE.CylinderGeometry(0.8, 0.8, 2.4, 48, 24, false);
        return geo;
      }
      case 'curtain': {
        // Draped folded hanging curtain plane
        const geo = new THREE.PlaneGeometry(2.4, 2.8, 64, 64);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          // Corrugate along X to create curtain pleats/folds
          const z = Math.sin(x * 8) * 0.22 + Math.cos(y * 4) * 0.08;
          pos.setZ(i, z);
        }
        geo.computeVertexNormals();
        return geo;
      }
      case 'garment': {
        // Stylized 3D Mannequin Torso
        const groupGeo = new THREE.CylinderGeometry(0.9, 0.65, 2.2, 48, 32);
        const pos = groupGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);
          // Pinch waist and widen shoulders
          const waistFactor = 1 - Math.exp(-Math.pow(y * 1.2, 2)) * 0.35;
          pos.setX(i, x * waistFactor);
          pos.setZ(i, z * waistFactor);
        }
        groupGeo.computeVertexNormals();
        return groupGeo;
      }
      default:
        return new THREE.PlaneGeometry(2.2, 2.2, 32, 32);
    }
  };

  // Initialize Scene, Camera, Renderer, & Lighting
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const heightPx = mountRef.current.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(lighting === 'sunset' ? '#111827' : '#0f172a');
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 100);
    camera.position.set(0, 0, distanceRef.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Clear previous canvas
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting Group
    const lightsGroup = new THREE.Group();
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    lightsGroup.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(4, 6, 5);
    dirLight.castShadow = true;
    dirLightRef.current = dirLight;
    lightsGroup.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-4, -2, -3);
    lightsGroup.add(fillLight);

    const pointLight = new THREE.PointLight(0xf43f5e, 1.2, 10);
    pointLight.position.set(0, 2, 2);
    lightsGroup.add(pointLight);

    scene.add(lightsGroup);
    lightsGroupRef.current = lightsGroup;

    // Load Real Fabric Texture & Create Mesh
    createTextureFromUrl(textureUrl).then((texture) => {
      if (!sceneRef.current) return;

      // Repeat scaling for realistic weave visibility
      if (currentMode === 'cloth' || currentMode === 'curtain') {
        texture.repeat.set(1.5, 1.5);
      } else if (currentMode === 'ball') {
        texture.repeat.set(2, 2);
      } else {
        texture.repeat.set(2, 2);
      }

      const matParams = getMaterialParams(fabricType);
      const material = new THREE.MeshPhysicalMaterial({
        map: texture,
        color: colorHex ? new THREE.Color(colorHex) : new THREE.Color(0xffffff),
        roughness: matParams.roughness,
        metalness: matParams.metalness,
        sheen: matParams.sheen,
        sheenRoughness: 0.3,
        sheenColor: new THREE.Color(0xffffff),
        clearcoat: matParams.clearcoat || 0.1,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
        transparent: matParams.transparent || false,
        opacity: matParams.opacity || 1.0,
      });

      const geometry = createGeometryForMode(currentMode);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Adjust initial orientation
      if (currentMode === 'cloth') {
        mesh.rotation.x = -0.3;
      }

      scene.add(mesh);
      meshRef.current = mesh;
      setIsTextureLoaded(true);
    });

    // Animation Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const elapsedTime = clockRef.current.getElapsedTime();

      // Smooth Orbit Lerp
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.08;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.08;

      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.005;
      }

      if (meshRef.current) {
        meshRef.current.rotation.x = rotationRef.current.x;
        meshRef.current.rotation.y = rotationRef.current.y;

        // Animate cloth undulating waves in wind if mode is cloth or curtain
        if (isWaving && (currentMode === 'cloth' || currentMode === 'curtain')) {
          const geo = meshRef.current.geometry;
          const pos = geo.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const wave = Math.sin(x * 3 + elapsedTime * 2.5) * 0.08 + Math.cos(y * 2.5 + elapsedTime * 2) * 0.06;
            pos.setZ(i, wave);
          }
          pos.needsUpdate = true;
          geo.computeVertexNormals();
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [textureUrl, currentMode]);

  // Update Fabric Color Hex dynamically
  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      if (colorHex) {
        mat.color = new THREE.Color(colorHex);
      } else {
        mat.color = new THREE.Color(0xffffff);
      }
      mat.needsUpdate = true;
    }
  }, [colorHex]);

  // Update Lighting Preset
  useEffect(() => {
    if (!lightsGroupRef.current || !sceneRef.current) return;
    if (lighting === 'studio') {
      sceneRef.current.background = new THREE.Color('#0f172a');
      if (dirLightRef.current) {
        dirLightRef.current.color.setHex(0xffffff);
        dirLightRef.current.intensity = 1.8;
      }
    } else if (lighting === 'daylight') {
      sceneRef.current.background = new THREE.Color('#1e293b');
      if (dirLightRef.current) {
        dirLightRef.current.color.setHex(0xfef08a);
        dirLightRef.current.intensity = 2.2;
      }
    } else if (lighting === 'sunset') {
      sceneRef.current.background = new THREE.Color('#311b92');
      if (dirLightRef.current) {
        dirLightRef.current.color.setHex(0xf97316);
        dirLightRef.current.intensity = 2.4;
      }
    } else if (lighting === 'runway') {
      sceneRef.current.background = new THREE.Color('#030712');
      if (dirLightRef.current) {
        dirLightRef.current.color.setHex(0x38bdf8);
        dirLightRef.current.intensity = 2.5;
      }
    }
  }, [lighting]);

  // Mouse / Touch Controls Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x += deltaY * 0.008;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    distanceRef.current = Math.max(1.8, Math.min(6.0, distanceRef.current + e.deltaY * 0.003));
    if (cameraRef.current) {
      cameraRef.current.position.z = distanceRef.current;
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl select-none group"
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        isDraggingRef.current = false;
      }}
    >
      {/* 3D WebGL Canvas Mounting Point */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Loading Overlay */}
      {!isTextureLoaded && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-10">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Rendering 3D Real Fabric Mesh...
          </span>
        </div>
      )}

      {/* Header Overlay Badges */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          Interactive 3D Real Fabric
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700 backdrop-blur-md">
          {fabricType} Weaver
        </span>
      </div>

      {/* Top Right Quick Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title={autoRotate ? 'Pause Auto Rotation' : 'Enable Auto Rotation'}
          className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
            autoRotate
              ? 'bg-indigo-600/80 text-white border-indigo-500'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin-slow' : ''}`} />
        </button>

        {onOpenFullStudio && (
          <button
            onClick={onOpenFullStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-medium shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all hover:scale-105"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            3D Studio
          </button>
        )}
      </div>

      {/* Interactive Drag Guidance Tag (fades out on interaction) */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none z-10 opacity-70 group-hover:opacity-100 transition-opacity">
        <span className="px-3 py-1 rounded-full text-[10px] font-medium bg-slate-950/70 text-slate-300 border border-slate-800 backdrop-blur-md">
          Drag to rotate • Scroll to zoom 3D texture
        </span>
      </div>

      {/* Bottom Controls Toolbar */}
      {showControlsBar && (
        <div className="absolute bottom-2 inset-x-2 sm:bottom-3 sm:inset-x-3 z-10 flex flex-nowrap items-center justify-between gap-1.5 p-1.5 sm:p-2 rounded-xl bg-slate-950/90 border border-slate-800/80 backdrop-blur-md text-white text-xs max-w-full overflow-hidden">
          {/* Mode Selectors */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 px-1 shrink-0">Mode:</span>
            {(
              [
                { id: 'cloth', label: '3D Wave', icon: Wind },
                { id: 'curtain', label: 'Draped Curtain', icon: Layers },
                { id: 'ball', label: 'Material Ball', icon: Eye },
                { id: 'roll', label: 'Fabric Bolt', icon: RotateCw },
                { id: 'garment', label: '3D Garment', icon: Shield },
              ] as const
            ).map((m) => {
              const Icon = m.icon;
              const active = currentMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setCurrentMode(m.id)}
                  className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Lighting Presets */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5 shrink-0">
            <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={lighting}
              onChange={(e) => setLighting(e.target.value as LightingPreset)}
              className="bg-slate-900 text-slate-200 text-[11px] sm:text-xs rounded-lg px-1.5 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="studio">Studio Light</option>
              <option value="daylight">Sunlight</option>
              <option value="sunset">Sunset Glow</option>
              <option value="runway">Runway Neon</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
