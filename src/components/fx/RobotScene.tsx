'use client';

import { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Bluish-white — keeps the hand in the light/white family but on a cool hue
// that clearly separates from the warm paper background.
const THEME_WHITE = new THREE.Color('#d8e5f1');

// Exact Mind Robotics configuration & viewport mapping
const CONFIG = {
  url: '/models/hand.glb',
  viewHeight: 0.8,
  shading: {
    light: { x: 1, y: -1, z: 0.53 },
  },
  offset: [0.415, 0.44],
  pose: {
    flip: 0.51,
    x: -0.22,
    y: -0.12,
    z: -0.81,
  },
  pointer: {
    yaw: 0.215,
    pitch: 0.475,
    ease: 4,
  },
};

/* Telephoto narrow-FOV camera distance calculation */
function cameraDistance(viewHeight: number, fov: number) {
  return (0.5 * viewHeight) / Math.tan(0.5 * THREE.MathUtils.degToRad(fov));
}

function MindRoboticsHand() {
  const groupRef = useRef<THREE.Group>(null);
  const orientRef = useRef<THREE.Group>(null);
  const normalizedPointer = useRef({ x: 0, y: 0 });

  // Load exact model and animation
  const { scene, animations } = useGLTF(CONFIG.url);
  const { actions } = useAnimations(animations, groupRef);

  // Auto-play default hand animation
  useEffect(() => {
    const actionList = Object.values(actions);
    if (actionList.length > 0 && actionList[0]) {
      const active = actionList[0];
      active.reset().play();
    }
  }, [actions]);

  // Window pointer tracking
  useEffect(() => {
    let halfW = 0.5 * window.innerWidth;
    let halfH = 0.5 * window.innerHeight;

    const handlePointer = (e: MouseEvent) => {
      normalizedPointer.current.x = (e.clientX - halfW) / halfW;
      normalizedPointer.current.y = (e.clientY - halfH) / halfH;
    };

    const handleResize = () => {
      halfW = 0.5 * window.innerWidth;
      halfH = 0.5 * window.innerHeight;
    };

    window.addEventListener('mousemove', handlePointer, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handlePointer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Clone scene and apply pristine cel/toon shaders with original Mind Robotics material colors
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const origMat = mesh.material as THREE.MeshStandardMaterial;
        let baseColor = THEME_WHITE.clone();
        // White parts carry an emissive floor of the same bluish tint. It lifts
        // every face to at least ~85% of the tint colour, so shadowed sides stay
        // light and blue instead of dropping to muddy dark grey.
        let emissiveColor = THEME_WHITE.clone().multiplyScalar(0.55);
        let emissiveIntensity = 1;

        if (origMat) {
          const matName = (origMat.name || '').toLowerCase();
          if (matName.includes('blue') || matName.includes('teal')) {
            baseColor = new THREE.Color(0x1a8f89); // Signature Teal accent
            emissiveIntensity = 0;                 // keep accents fully saturated
          } else if (matName.includes('red') || matName.includes('coral')) {
            baseColor = new THREE.Color(0xef6156); // Coral accent
            emissiveIntensity = 0;
          } else if (origMat.color) {
            const hsl = { h: 0, s: 0, l: 0 };
            origMat.color.getHSL(hsl);
            // Only recolor near-white parts; keep darker model colors (joints,
            // creases) so the hand keeps its definition.
            if (hsl.l > 0.75) {
              baseColor = THEME_WHITE.clone();
            } else {
              baseColor = origMat.color.clone();
              emissiveIntensity = 0;
            }
          }
        }

        mesh.material = new THREE.MeshToonMaterial({
          color: baseColor,
          emissive: emissiveColor,
          emissiveIntensity,
          side: THREE.DoubleSide,
        });
      }
    });

    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    const r = groupRef.current;
    const s = orientRef.current;
    if (!r || !s) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduced ? 0 : 1;

    // Viewport calculations matching Mind Robotics
    const a = 0.5 * CONFIG.viewHeight;
    const c = (a * state.size.width) / state.size.height;
    const [d, p] = CONFIG.offset;

    // Anchor r directly to the TOP RIGHT of the screen viewport
    r.position.set(c, a, 0);

    // Position s relative to top right: moves wrist right to the top edge and angles down-left around title
    s.position.set(d - c, p - a, 0);
    s.rotation.set(CONFIG.pose.x, CONFIG.pose.y, CONFIG.pose.z);

    clonedScene.rotation.y = CONFIG.pose.flip;

    // Pointer parallax rotation with smooth damping
    const targetY = normalizedPointer.current.x * CONFIG.pointer.yaw * speed;
    const targetX = normalizedPointer.current.y * CONFIG.pointer.pitch * speed;

    r.rotation.y = THREE.MathUtils.damp(r.rotation.y, targetY, CONFIG.pointer.ease, delta);
    r.rotation.x = THREE.MathUtils.damp(r.rotation.x, targetX, CONFIG.pointer.ease, delta);
  });

  return (
    <group ref={groupRef}>
      <group ref={orientRef}>
        <primitive object={clonedScene} />
      </group>
    </group>
  );
}

useGLTF.preload(CONFIG.url);

export default function RobotScene() {
  const dist = cameraDistance(CONFIG.viewHeight, 10);

  return (
    <Canvas
      dpr={[1, 2]}
      flat /* NoToneMapping — stops ACES from desaturating the blue tint to grey */
      camera={{
        fov: 10,
        near: 1,
        far: 20,
        position: [0, 0, dist],
      }}
      style={{ background: 'transparent' }}
      aria-hidden="true"
    >
      {/* Kept dim on purpose: the emissive tint already supplies the base
          brightness, so total irradiance stays under 1 and lit faces keep the
          blue tint instead of clipping to white. */}
      <ambientLight intensity={0.22} />
      <directionalLight position={[CONFIG.shading.light.x, CONFIG.shading.light.y, CONFIG.shading.light.z]} intensity={0.18} />
      <directionalLight position={[-2, 3, 2]} intensity={0.05} />

      <Suspense fallback={null}>
        <MindRoboticsHand />
      </Suspense>
    </Canvas>
  );
}
