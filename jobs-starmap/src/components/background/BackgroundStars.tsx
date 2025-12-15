/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo, useRef, type JSX } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type BackgroundStarsProps = {
  count: number;
  radius: number;
};

/**
 * BackgroundStars (Instanced)
 *
 * Why: Uses instancing to render many tiny “star spheres” efficiently (single draw call),
 * giving slightly richer depth cues than points while staying performant.
 *
 * Behavior is preserved:
 * - Same random distribution, scale variance, cool-white color variance, and slow rotation.
 * - Returns an InstancedMesh with per-instance colors.
 *
 * Note: The original code created a material via `usePopMaterial()` but also returned
 * a `<meshBasicMaterial />` child. In Three.js, the child material overrides the `args`
 * material. To preserve the observable behavior, we keep the visible material as the child.
 */
export default function BackgroundStars({
  count,
  radius,
}: BackgroundStarsProps): JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Reused helpers to avoid per-iteration allocations.
  const helpers = useMemo(() => {
    return {
      dummy: new THREE.Object3D(),
      tempVec: new THREE.Vector3(),
      colors: new Float32Array(count * 3),
    };
  }, [count]);

  // Geometry is stable (can be shared across renders).
  const geometry = useMemo(() => new THREE.SphereGeometry(0.03, 6, 6), []);

  // Material hook placeholder kept for future upgrades; not used for rendering currently.
  usePopMaterial();

  /**
   * Why: instanced attributes must be (re)built when count/radius changes,
   * but should not be rebuilt every frame.
   */
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { dummy, tempVec, colors } = helpers;

    for (let i = 0; i < count; i++) {
      // Random point in a spherical shell.
      tempVec
        .randomDirection()
        .multiplyScalar(radius * (0.2 + Math.random() * 0.8));

      dummy.position.copy(tempVec);

      const s = 0.6 + Math.random() * 1.6;
      dummy.scale.setScalar(s);

      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);

      // Slight color variance (cool whites).
      const c = 0.75 + Math.random() * 0.25;
      const idx = i * 3;
      colors[idx + 0] = c;
      colors[idx + 1] = c;
      colors[idx + 2] = 1.0;
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Attach per-instance color attribute.
    // Disposing old attribute prevents leaks when count changes.
    const prev = mesh.geometry.getAttribute("color") as
      | THREE.InstancedBufferAttribute
      | undefined;

    const colorAttr = new THREE.InstancedBufferAttribute(helpers.colors, 3);
    mesh.geometry.setAttribute("color", colorAttr);

    return () => {
      if (prev) {
        // dispose exists on some three.js builds; use any to avoid TS error
        (prev as any).dispose?.();
      }
      // some three.js typings don't include dispose on InstancedBufferAttribute, so cast to any
      (colorAttr as any).dispose?.();
    };
  }, [count, radius, helpers]);

  // Slow “galaxy rotation”.
  useFrame((_, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.rotation.y += dt * 0.02;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined as any, count]}>
      {/* Child material is the one that renders (preserves original visible behavior). */}
      <meshBasicMaterial vertexColors transparent opacity={0.9} />
    </instancedMesh>
  );
}

function usePopMaterial(): THREE.Material | null {
  // Placeholder hook for future shader/material upgrades.
  // Returning null avoids forcing a fake material into InstancedMesh args.
  return null;
}
