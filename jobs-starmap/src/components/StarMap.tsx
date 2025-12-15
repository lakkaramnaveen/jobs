import { OrbitControls, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import type { StoryNode } from "../data/story";
import BackgroundStarsPoints from "./background/BackgroundStarsPoints";
import StarNode from "./StarNode";

// If TS complains about OrbitControls types, install once:
// npm i three-stdlib
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type Props = {
  story: StoryNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  onUserControlStart?: () => void; // NEW
};

// ---------- Layout helpers (less rigid) ----------
function hashToUnit(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  // 0..1
  return (h >>> 0) / 4294967295;
}

function makePositions(story: StoryNode[]) {
  const pts: Record<string, THREE.Vector3> = {};

  const radiusBase = 1.2;
  const spiralStep = 0.78;

  story.forEach((node, i) => {
    const t = i * 0.62;
    const r = radiusBase + i * spiralStep;

    const chapterBoost =
      node.id === "exit-apple" || node.id === "return" ? 2.0 : 0;

    // Organic jitter (deterministic)
    const seed = hashToUnit(node.id);
    const jx = (seed - 0.5) * 0.8;
    const jy = (hashToUnit(node.id + "y") - 0.5) * 0.6;
    const jz = (hashToUnit(node.id + "z") - 0.5) * 0.4;

    const x = Math.cos(t) * (r + chapterBoost) + jx;
    const y = Math.sin(t) * (r * 0.55) + jy;
    const z = -i * 1.15 + jz;

    pts[node.id] = new THREE.Vector3(x, y, z);
  });

  pts["birth"] = new THREE.Vector3(0, 0, 0);
  return pts;
}

// Easing for “warp” feel
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type FocusAnim = {
  start: number;
  duration: number;
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
};

export default function StarMap({ story, selectedId, onSelect }: Props) {
  const { camera, pointer } = useThree();

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const focusRef = useRef<FocusAnim | null>(null);

  const [hovered, setHovered] = useState<string | null>(null);

  const positions = useMemo(() => makePositions(story), [story]);
  const selectedPos = positions[selectedId] ?? new THREE.Vector3(0, 0, 0);

  // Smooth constellation curve (less rigid than straight segments)
  const curvePoints = useMemo(() => {
    const base = story.map((n) => positions[n.id]).filter(Boolean);
    const curve = new THREE.CatmullRomCurve3(base, false, "catmullrom", 0.45);
    return curve.getPoints(240);
  }, [story, positions]);

  const constellationGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(curvePoints);
  }, [curvePoints]);

  // Comet that travels along the constellation path (playful!)
  const cometRef = useRef<THREE.Group>(null);
  const cometCurve = useMemo(() => {
    const base = story.map((n) => positions[n.id]).filter(Boolean);
    return new THREE.CatmullRomCurve3(base, false, "catmullrom", 0.45);
  }, [story, positions]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      onUserControlStart?.();
    };

    // OrbitControls fires "start" on drag and (typically) on wheel zoom
    controls.addEventListener("start", handleStart);

    return () => {
      controls.removeEventListener("start", handleStart);
    };
  }, [onUserControlStart]);

  // When a new star is selected, “warp” the camera directly to it
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const now = performance.now() / 1000;

    const fromTarget = controls.target.clone();
    const fromPos = camera.position.clone();

    const toTarget = selectedPos.clone();

    // Keep current viewing direction & distance for continuity
    const currentDist = THREE.MathUtils.clamp(
      fromPos.distanceTo(fromTarget),
      6,
      42
    );

    let dir = fromPos.clone().sub(fromTarget);
    if (dir.lengthSq() < 1e-6) dir = new THREE.Vector3(0, 0, 1);
    dir.normalize();

    const toPos = toTarget.clone().add(dir.multiplyScalar(currentDist));

    focusRef.current = {
      start: now,
      duration: 0.55,
      fromPos,
      toPos,
      fromTarget,
      toTarget,
    };
  }, [camera.position, selectedId, selectedPos]);

  const onHover = useCallback((id: string | null) => setHovered(id), []);

  useFrame((state, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Small “space drift” based on cursor, without breaking controls.
    const driftX = pointer.x * 0.25;
    const driftY = pointer.y * 0.18;

    const anim = focusRef.current;
    const now = state.clock.getElapsedTime();

    if (anim) {
      const t = THREE.MathUtils.clamp((now - anim.start) / anim.duration, 0, 1);
      const e = easeInOutCubic(t);

      camera.position.lerpVectors(anim.fromPos, anim.toPos, e);
      controls.target.lerpVectors(anim.fromTarget, anim.toTarget, e);

      if (t >= 1) focusRef.current = null;
    } else {
      // If not animating, gently keep target centered on selected star
      // (damp is efficient and looks better than raw lerp)
      controls.target.x = THREE.MathUtils.damp(
        controls.target.x,
        selectedPos.x + driftX,
        6,
        dt
      );
      controls.target.y = THREE.MathUtils.damp(
        controls.target.y,
        selectedPos.y + driftY,
        6,
        dt
      );
      controls.target.z = THREE.MathUtils.damp(
        controls.target.z,
        selectedPos.z,
        6,
        dt
      );
    }

    controls.update();

    // Move comet along curve
    if (cometRef.current) {
      const u = (now * 0.06) % 1;
      const p = cometCurve.getPointAt(u);
      cometRef.current.position.copy(p);
    }
  });

  return (
    <group>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 6, 7]} intensity={1.2} />

      {/* Zoom / rotate controls */}
      <OrbitControls
        ref={controlsRef as any}
        enableDamping
        dampingFactor={0.08}
        enableZoom
        minDistance={6}
        maxDistance={42}
        enablePan={false}
        rotateSpeed={0.45}
        zoomSpeed={0.8}
      />

      <BackgroundStarsPoints count={4500} radius={130} />

      {/* Constellation curve (base line) */}
      <line geometry={constellationGeometry}>
        <lineBasicMaterial color="#4aa3ff" transparent opacity={0.22} />
      </line>

      {/* Glow line on top (adds “magic”, still cheap) */}
      <line geometry={constellationGeometry}>
        <lineBasicMaterial color="#9ad7ff" transparent opacity={0.08} />
      </line>

      {/* A subtle sparkle field around the constellation region */}
      <Sparkles
        count={140}
        scale={[12, 6, 18]}
        size={1.4}
        speed={0.4}
        opacity={0.25}
      />

      {/* Traveling comet */}
      <group ref={cometRef}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={"#ffffff"} transparent opacity={0.9} />
        </mesh>
        <Sparkles
          count={18}
          scale={[0.8, 0.8, 0.8]}
          size={2.2}
          speed={0.8}
          opacity={0.6}
        />
      </group>

      {story.map((node) => {
        const pos = positions[node.id];
        const isSelected = node.id === selectedId;
        const isHovered = hovered === node.id;

        const brightness =
          node.id === "birth"
            ? 4.0
            : node.id === "iphone"
            ? 2.6
            : node.id === "return"
            ? 2.3
            : 1.6;

        return (
          <StarNode
            key={node.id}
            id={node.id}
            label={`${node.year} • ${node.title}`}
            basePosition={pos}
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
function onUserControlStart() {
  throw new Error("Function not implemented.");
}
