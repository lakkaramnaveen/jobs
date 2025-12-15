/* eslint-disable react-hooks/purity */
import { useEffect, useMemo, useRef, type JSX } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type BackgroundStarsPointsProps = {
  count: number;
  radius: number;
};

/**
 * BackgroundStarsPoints
 *
 * Why: Renders a lightweight, points-based starfield (no textures) to keep the
 * scene fast while still feeling “alive”.
 *
 * Behavior is preserved:
 * - Same random distribution, color range, size, opacity, and slow rotation.
 */
export default function BackgroundStarsPoints({
  count,
  radius,
}: BackgroundStarsPointsProps): JSX.Element {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const tmpColor = new THREE.Color();
    const tmpVec = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // RandomDirection gives a uniform distribution over the sphere.
      // We scale radius to keep stars from clustering too tightly around the origin.
      tmpVec
        .randomDirection()
        // eslint-disable-next-line react-hooks/purity
        .multiplyScalar(radius * (0.2 + Math.random() * 0.8));

      const idx = i * 3;
      positions[idx + 0] = tmpVec.x;
      positions[idx + 1] = tmpVec.y;
      positions[idx + 2] = tmpVec.z;

      // Cool white-blue tint (kept identical to original logic)
      const c = 0.75 + Math.random() * 0.25;
      tmpColor.setRGB(c, c, 1.0);

      colors[idx + 0] = tmpColor.r;
      colors[idx + 1] = tmpColor.g;
      colors[idx + 2] = tmpColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true,
    });

    return { geometry, material };
  }, [count, radius]);

  // Dispose GPU resources on unmount/rebuild to avoid leaks during dev/HMR.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, dt) => {
    const points = pointsRef.current;
    if (!points) return;
    points.rotation.y += dt * 0.02;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
