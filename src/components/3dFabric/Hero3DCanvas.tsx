import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Move3d, Eye, Zap, RefreshCw } from 'lucide-react';

export const Hero3DCanvas: React.FC<{ onExploreClick?: () => void }> = ({ onExploreClick }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeFabricIndex, setActiveFabricIndex] = useState(0);

  // Real Fabric High-Res Textures for 3D Banner
  const heroFabrics = [
    {
      name: 'Mulberry Silk Charmeuse',
      url: 'https://images.pexels.com/photos/18877232/pexels-photo-18877232.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      type: 'Silk',
      gsm: '85 GSM',
    },
    {
      name: 'Organic Damask Linen',
      url: 'https://images.pexels.com/photos/7794364/pexels-photo-7794364.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      type: 'Linen',
      gsm: '190 GSM',
    },
    {
      name: 'Raw Selvedge Indigo Denim',
      url: 'https://images.pexels.com/photos/10912871/pexels-photo-10912871.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      type: 'Denim',
      gsm: '420 GSM',
    },
    {
      name: 'Luxury Cotton Velvet',
      url: 'https://images.pexels.com/photos/31209268/pexels-photo-31209268.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      type: 'Velvet',
      gsm: '340 GSM',
    },
  ];

  const meshRef = useRef<THREE.Mesh | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const animFrameRef = useRef<number | null>(null);

  // Mouse tilt tracking
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 1.5);
    dirLight2.position.set(-5, -3, -2);
    scene.add(dirLight2);

    // Create 3D Draped Curtain Geometry
    const geometry = new THREE.PlaneGeometry(3.2, 3.2, 64, 64);

    // Load Real Fabric Texture via Canvas to bypass CORS restrictions safely
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
        texture.repeat.set(1.5, 1.5);
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshPhysicalMaterial({
          map: texture,
          roughness: 0.3,
          metalness: 0.05,
          sheen: 1.0,
          sheenColor: new THREE.Color(0xffffff),
          side: THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -0.2;
        scene.add(mesh);
        meshRef.current = mesh;
      }
    };
    img.src = heroFabrics[activeFabricIndex].url;

    // Animation loop with continuous wave physics
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      if (meshRef.current) {
        // Subtle mouse tracking rotation
        meshRef.current.rotation.y = mouseRef.current.x * 0.25;
        meshRef.current.rotation.x = -0.2 + mouseRef.current.y * 0.15;

        // Wave animation
        const pos = meshRef.current.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const wave = Math.sin(x * 4 + elapsed * 2.2) * 0.12 + Math.cos(y * 3 + elapsed * 1.8) * 0.08;
          pos.setZ(i, wave);
        }
        pos.needsUpdate = true;
        meshRef.current.geometry.computeVertexNormals();
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };

    const dom = mountRef.current;
    dom.addEventListener('mousemove', handleMouseMove);

    return () => {
      dom.removeEventListener('mousemove', handleMouseMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [activeFabricIndex]);

  return (
    <div className="relative w-full h-[480px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between p-6">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin-slow" />
          Real-Time 3D Fabric Physics Engine
        </span>

        <span className="text-xs font-mono text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur-md">
          66 Subcategories Draped
        </span>
      </div>

      {/* Center Informational Overlay */}
      <div className="relative z-10 max-w-sm bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1">
          <Move3d className="w-3.5 h-3.5" />
          Active 3D Real Swatch
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          {heroFabrics[activeFabricIndex].name}
        </h3>
        <p className="text-xs text-slate-300 mb-3">
          {heroFabrics[activeFabricIndex].type} Fiber • {heroFabrics[activeFabricIndex].gsm} • High Gloss Sheen
        </p>

        {/* Fabric Swatch Cycle Buttons */}
        <div className="flex items-center gap-2">
          {heroFabrics.map((f, idx) => (
            <button
              key={idx}
              onClick={() => setActiveFabricIndex(idx)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                activeFabricIndex === idx
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {f.type}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-slate-800/80">
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-emerald-400" />
          Hover mouse to tilt 3D lighting in real time
        </span>

        {onExploreClick && (
          <button
            onClick={onExploreClick}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105"
          >
            Inspect 3D Catalog →
          </button>
        )}
      </div>
    </div>
  );
};
