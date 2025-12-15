import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  id: string;
  label: string;
  position: THREE.Vector3;
  brightness: number;
  selected: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

export default function StarNode({
  id,
  label,
  position,
  brightness,
  selected,
  hovered,
  onHover,
  onSelect,
}: Props) {
  const mesh = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ffffff"),
      emissive: new THREE.Color("#7cc7ff"),
      emissiveIntensity: brightness,
      roughness: 0.2,
      metalness: 0.1,
    });
    return m;
  }, [brightness]);

  useFrame((state) => {
    if (!mesh.current) return;
    // Twinkle
    const t = state.clock.getElapsedTime();
    const tw = 0.25 + 0.2 * Math.sin(t * 2.4 + position.x * 0.7);
    material.emissiveIntensity =
      brightness * (selected ? 1.35 : 1.0) * (hovered ? 1.2 : 1.0) * (1 + tw);

    // Gentle pulse scale on select
    const target = selected ? 1.28 : hovered ? 1.12 : 1.0;
    mesh.current.scale.lerp(new THREE.Vector3(target, target, target), 0.08);
  });

  return (
    <group position={position}>
      <mesh
        ref={mesh}
        material={material}
        geometry={useMemo(() => new THREE.SphereGeometry(0.22, 22, 22), [])}
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

      {/* Minimal label, only when close/selected/hovered */}
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
