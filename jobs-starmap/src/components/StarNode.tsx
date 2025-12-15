import { Html, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  id: string;
  label: string;
  basePosition: THREE.Vector3;
  brightness: number;
  selected: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

function makeGlowTexture() {
  // Uses CanvasTexture + radial gradient (fast, no external image required)
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

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

export default function StarNode({
  id,
  label,
  basePosition,
  brightness,
  selected,
  hovered,
  onHover,
  onSelect,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Sprite>(null);
  const ripple = useRef<THREE.Mesh>(null);

  const glowTex = useMemo(() => makeGlowTexture(), []);
  const glowMat = useMemo(() => {
    return new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.65,
      color: new THREE.Color("#9ad7ff"),
    });
  }, [glowTex]);

  const coreMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffffff"),
      emissive: new THREE.Color("#7cc7ff"),
      emissiveIntensity: brightness,
      roughness: 0.18,
      metalness: 0.08,
    });
  }, [brightness]);

  const ringMat = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color("#9ad7ff"),
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const geom = useMemo(() => new THREE.SphereGeometry(0.22, 22, 22), []);
  const ringGeom = useMemo(() => new THREE.RingGeometry(0.35, 0.62, 32), []);

  const seed = useMemo(() => {
    // deterministic but unique
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return (h % 1000) / 1000;
  }, [id]);

  useFrame((state, dt) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();

    // Gentle living motion (tiny orbit wobble)
    group.current.position.set(
      basePosition.x + Math.sin(t * 0.8 + seed * 10) * 0.08,
      basePosition.y + Math.cos(t * 0.9 + seed * 12) * 0.06,
      basePosition.z + Math.sin(t * 0.6 + seed * 8) * 0.05
    );

    // Twinkle + hover pop
    const tw = 0.25 + 0.22 * Math.sin(t * (2.2 + seed) + basePosition.x * 0.7);
    coreMat.emissiveIntensity =
      brightness * (selected ? 1.5 : 1.0) * (hovered ? 1.35 : 1.0) * (1 + tw);

    const scaleTarget = selected ? 1.55 : hovered ? 1.35 : 1.0;
    group.current.scale.lerp(
      new THREE.Vector3(scaleTarget, scaleTarget, scaleTarget),
      0.1
    );

    // Glow sprite reacts to hover/selection
    if (glow.current) {
      const gScale = selected ? 3.2 : hovered ? 2.8 : 2.2;
      glow.current.scale.set(gScale, gScale, 1);
      glowMat.opacity = hovered || selected ? 0.9 : 0.55;
    }

    // Ripple ring on hover (expands + fades)
    if (ripple.current) {
      const mat = ripple.current.material as THREE.MeshBasicMaterial;
      if (hovered) {
        const s = 1.0 + (0.35 + 0.35 * Math.sin(t * 3.0 + seed * 10));
        ripple.current.scale.set(s, s, 1);
        mat.opacity = 0.35 + 0.25 * Math.sin(t * 3.0 + seed * 10);
      } else {
        mat.opacity = THREE.MathUtils.damp(mat.opacity, 0.0, 8, dt);
      }
    }
  });

  return (
    <group ref={group} position={basePosition}>
      {/* Glow halo */}
      <sprite ref={glow} material={glowMat} scale={[2.2, 2.2, 1]} />

      {/* Ripple */}
      <mesh
        ref={ripple}
        geometry={ringGeom}
        material={ringMat}
        rotation={[0, 0, 0]}
      />

      {/* Star core */}
      <mesh
        ref={core}
        material={coreMat}
        geometry={geom}
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
      {(hovered || selected) && (
        <Sparkles
          count={22}
          scale={[1.2, 1.2, 1.2]}
          size={2.2}
          speed={0.8}
          opacity={0.7}
        />
      )}

      {(selected || hovered) && (
        <Html center distanceFactor={10}>
          <div className={`starLabel ${selected ? "selected" : ""}`}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
