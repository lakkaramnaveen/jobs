import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { type StoryNode } from "../data/story";
import BackgroundStars from "./background/BackgroundStars";
import StarNode from "./StarNode";

type Props = {
  story: StoryNode[];
  selectedId: string;
  onSelect: (id: string) => void;
};

function makePositions(story: StoryNode[]) {
  // A gentle spiral “flight path” so the story feels like traveling through space.
  // Deterministic positions: same layout every time.
  const pts: Record<string, THREE.Vector3> = {};

  const radiusBase = 1.2;
  const spiralStep = 0.75;

  story.forEach((node, i) => {
    const t = i * 0.6;
    const r = radiusBase + i * spiralStep;

    // Slight “chapter” jumps for big pivots
    const chapterBoost =
      node.id === "exit-apple" || node.id === "return" ? 2.2 : 0;

    const x = Math.cos(t) * (r + chapterBoost);
    const y = Math.sin(t) * (r * 0.55);
    const z = -i * 1.15; // deeper into space as you progress

    pts[node.id] = new THREE.Vector3(x, y, z);
  });

  // Keep birth close to center, brighter anchor point
  pts["birth"] = new THREE.Vector3(0, 0, 0);

  return pts;
}

export default function StarMap({ story, selectedId, onSelect }: Props) {
  const group = useRef<THREE.Group>(null);
  const { camera, pointer } = useThree();

  const positions = useMemo(() => makePositions(story), [story]);

  const [hovered, setHovered] = useState<string | null>(null);

  const selectedPos = positions[selectedId] ?? new THREE.Vector3(0, 0, 0);

  // Smooth camera “floating” controlled by cursor.
  useFrame((state, dt) => {
    const target = new THREE.Vector3(
      selectedPos.x,
      selectedPos.y,
      selectedPos.z + 14
    );

    // Cursor drift (small + pleasant)
    const driftX = pointer.x * 0.9;
    const driftY = pointer.y * 0.6;

    target.x += driftX;
    target.y += driftY;

    camera.position.lerp(target, 1 - Math.pow(0.0005, dt));
    camera.lookAt(selectedPos.x, selectedPos.y, selectedPos.z);
  });

  const connectionGeometry = useMemo(() => {
    const pts = story.map((n) => positions[n.id]).filter(Boolean);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [story, positions]);

  const onHover = useCallback((id: string | null) => setHovered(id), []);

  return (
    <group ref={group}>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 6, 7]} intensity={1.2} />

      <BackgroundStars count={6000} radius={120} />

      {/* Constellation path */}
      <line geometry={connectionGeometry}>
        <lineBasicMaterial color="#4aa3ff" transparent opacity={0.22} />
      </line>

      {story.map((node) => {
        const pos = positions[node.id];
        const isSelected = node.id === selectedId;
        const isHovered = hovered === node.id;

        // “Birth” is the brightest center star
        const brightness =
          node.id === "birth"
            ? 4.0
            : node.id === "iphone"
            ? 2.5
            : node.id === "return"
            ? 2.3
            : 1.6;

        return (
          <StarNode
            key={node.id}
            id={node.id}
            label={`${node.year} • ${node.title}`}
            position={pos}
            brightness={brightness}
            selected={isSelected}
            hovered={isHovered}
            onHover={onHover}
            onSelect={onSelect}
          />
        );
      })}
    </group>
  );
}
