import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = { count: number; radius: number };

export default function BackgroundStars({ count, radius }: Props) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const { dummy, colors } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const colors = new Float32Array(count * 3);
    return { dummy, colors };
  }, [count]);

  const material = usePopMaterial();

  const geometry = useMemo(() => new THREE.SphereGeometry(0.03, 6, 6), []);

  useMemo(() => {
    if (!mesh.current) return;

    for (let i = 0; i < count; i++) {
      // Random point in a sphere shell
      const v = new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(radius * (0.2 + Math.random() * 0.8));

      dummy.position.copy(v);

      const s = 0.6 + Math.random() * 1.6;
      dummy.scale.setScalar(s);

      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();

      mesh.current.setMatrixAt(i, dummy.matrix);

      // Slight color variance (cool whites)
      const c = 0.75 + Math.random() * 0.25;
      colors[i * 3 + 0] = c;
      colors[i * 3 + 1] = c;
      colors[i * 3 + 2] = 1.0;
    }

    mesh.current.instanceMatrix.needsUpdate = true;

    // Attach per-instance data
    mesh.current.geometry.setAttribute(
      "color",
      new THREE.InstancedBufferAttribute(colors, 3)
    );
  }, [count, radius, colors, dummy]);

  // Slow “galaxy rotation”
  useFrame((_, dt) => {
    if (mesh.current) mesh.current.rotation.y += dt * 0.02;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, material, count]}>
      <meshBasicMaterial vertexColors transparent opacity={0.9} />
    </instancedMesh>
  );
}

function usePopMaterial() {
  // Placeholder hook for future shader/material upgrades
  return undefined as unknown as THREE.Material;
}
