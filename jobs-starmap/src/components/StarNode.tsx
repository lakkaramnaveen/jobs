import { Html, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type JSX } from "react";
import * as THREE from "three";

type StarNodeProps = {
  id: string;
  label: string;
  basePosition: THREE.Vector3;
  brightness: number;
  selected: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

/**
 * StarNode
 *
 * Why this component exists:
 * - Encapsulates the visuals + micro-interactions for a single “star” node.
 * - Keeps the StarMap render loop clean and scalable as the timeline grows.
 *
 * Behavior is preserved:
 * - Same hover/click behavior (cursor, propagation).
 * - Same twinkle, hover pop, halo/ripple, and label rendering rules.
 */
export default function StarNode({
  id,
  label,
  basePosition,
  brightness,
  selected,
  hovered,
  onHover,
  onSelect,
}: StarNodeProps): JSX.Element {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const rippleRef = useRef<THREE.Mesh>(null);

  // ---------- Deterministic per-node seed ----------
  const seed = useMemo(() => computeSeed(id), [id]);

  // ---------- Shared geometry (cheap + stable) ----------
  const coreGeometry = useMemo(
    () => new THREE.SphereGeometry(0.22, 22, 22),
    []
  );
  const rippleGeometry = useMemo(
    () => new THREE.RingGeometry(0.35, 0.62, 32),
    []
  );

  // ---------- Materials (created once, updated in-frame) ----------
  const glowTexture = useMemo(() => createGlowTexture(), []);
  const glowMaterial = useMemo(
    () => createGlowMaterial(glowTexture),
    [glowTexture]
  );

  const coreMaterial = useMemo(
    () => createCoreMaterial(brightness),
    [brightness]
  );

  const rippleMaterial = useMemo(() => createRippleMaterial(), []);

  // Prevent cursor “leaks” if the component unmounts while hovered.
  useEffect(() => {
    return () => {
      if (document.body.style.cursor === "pointer") {
        document.body.style.cursor = "default";
      }
    };
  }, []);

  // Convenience flags keep JSX readable and reduce branching
  const isActive = hovered || selected;

  useFrame((state, dt) => {
    const group = groupRef.current;
    if (!group) return;

    const t = state.clock.getElapsedTime();

    // Subtle “living” drift — purely cosmetic, doesn't affect node identity.
    applyPositionDrift(group, basePosition, t, seed);

    // Twinkle + hover/selected amplification
    applyCoreTwinkle(coreMaterial, {
      brightness,
      selected,
      hovered,
      t,
      seed,
      baseX: basePosition.x,
    });

    // Scale pop on hover/selection
    applyScale(group, { selected, hovered });

    // Halo reacts to hover/selection
    applyGlow(glowRef.current, glowMaterial, { selected, hovered });

    // Ripple expands when hovered and fades out smoothly otherwise
    applyRipple(rippleRef.current, rippleMaterial, { hovered, t, seed, dt });
  });

  return (
    <group ref={groupRef} position={basePosition}>
      {/* Glow halo */}
      <sprite ref={glowRef} material={glowMaterial} scale={[2.2, 2.2, 1]} />

      {/* Ripple */}
      <mesh
        ref={rippleRef}
        geometry={rippleGeometry}
        material={rippleMaterial}
      />

      {/* Star core */}
      <mesh
        geometry={coreGeometry}
        material={coreMaterial}
        onPointerEnter={(e) => {
          e.stopPropagation();
          onHover(id);
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          onHover(null);
          document.body.style.cursor = "default";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
      />

      {/* Hover sparkles (only render when needed) */}
      {isActive && (
        <Sparkles
          count={22}
          scale={[1.2, 1.2, 1.2]}
          size={2.2}
          speed={0.8}
          opacity={0.7}
        />
      )}

      {/* Label */}
      {isActive && (
        <Html center distanceFactor={10}>
          <div className={`starLabel ${selected ? "selected" : ""}`}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

/* =============================================================================
   Helpers (pure functions)
   ============================================================================= */

/**
 * Deterministic seed per id.
 * Why: keeps motion stable across renders and devices without storing state.
 */
function computeSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

/**
 * Creates a radial gradient glow texture (no external assets).
 * Why: avoids network cost and keeps the “space” theme crisp.
 */
function createGlowTexture(): THREE.CanvasTexture {
  const size = 128;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // Fallback: create a tiny empty texture (should never happen in browsers that can run WebGL).
    const fallback = new THREE.DataTexture(
      new Uint8Array([255, 255, 255, 255]),
      1,
      1
    );
    fallback.needsUpdate = true;
    return fallback as unknown as THREE.CanvasTexture;
  }

  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0.0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(124,199,255,0.85)");
  g.addColorStop(1.0, "rgba(124,199,255,0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createGlowMaterial(map: THREE.Texture): THREE.SpriteMaterial {
  return new THREE.SpriteMaterial({
    map,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.65,
    color: new THREE.Color("#9ad7ff"),
  });
}

function createCoreMaterial(brightness: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color("#ffffff"),
    emissive: new THREE.Color("#7cc7ff"),
    emissiveIntensity: brightness,
    roughness: 0.18,
    metalness: 0.08,
  });
}

function createRippleMaterial(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color("#9ad7ff"),
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

function applyPositionDrift(
  group: THREE.Group,
  base: THREE.Vector3,
  t: number,
  seed: number
): void {
  group.position.set(
    base.x + Math.sin(t * 0.8 + seed * 10) * 0.08,
    base.y + Math.cos(t * 0.9 + seed * 12) * 0.06,
    base.z + Math.sin(t * 0.6 + seed * 8) * 0.05
  );
}

function applyCoreTwinkle(
  material: THREE.MeshStandardMaterial,
  params: {
    brightness: number;
    selected: boolean;
    hovered: boolean;
    t: number;
    seed: number;
    baseX: number;
  }
): void {
  const { brightness, selected, hovered, t, seed, baseX } = params;

  const twinkle = 0.25 + 0.22 * Math.sin(t * (2.2 + seed) + baseX * 0.7);
  const selectedBoost = selected ? 1.5 : 1.0;
  const hoverBoost = hovered ? 1.35 : 1.0;

  material.emissiveIntensity =
    brightness * selectedBoost * hoverBoost * (1 + twinkle);
}

function applyScale(
  group: THREE.Group,
  params: { selected: boolean; hovered: boolean }
): void {
  const targetScale = params.selected ? 1.55 : params.hovered ? 1.35 : 1.0;
  group.scale.lerp(
    new THREE.Vector3(targetScale, targetScale, targetScale),
    0.1
  );
}

function applyGlow(
  sprite: THREE.Sprite | null,
  material: THREE.SpriteMaterial,
  params: { selected: boolean; hovered: boolean }
): void {
  if (!sprite) return;

  const { selected, hovered } = params;

  const haloScale = selected ? 3.2 : hovered ? 2.8 : 2.2;
  sprite.scale.set(haloScale, haloScale, 1);

  material.opacity = hovered || selected ? 0.9 : 0.55;
}

function applyRipple(
  mesh: THREE.Mesh | null,
  material: THREE.MeshBasicMaterial,
  params: { hovered: boolean; t: number; seed: number; dt: number }
): void {
  if (!mesh) return;

  const { hovered, t, seed, dt } = params;

  if (hovered) {
    const wave = 0.35 + 0.35 * Math.sin(t * 3.0 + seed * 10);
    const s = 1.0 + wave;

    mesh.scale.set(s, s, 1);
    material.opacity = 0.35 + 0.25 * Math.sin(t * 3.0 + seed * 10);
  } else {
    material.opacity = THREE.MathUtils.damp(material.opacity, 0.0, 8, dt);
  }
}
