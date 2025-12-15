// src/components/StarMap.tsx
import { OrbitControls, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSX, MutableRefObject } from "react";
import * as THREE from "three";

import type { StoryNode } from "../data/story";
import BackgroundStarsPoints from "./background/BackgroundStarsPoints";
import StarNode from "./StarNode";

// If TS complains about OrbitControls types, install once:
// npm i three-stdlib
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type StarMapProps = {
  story: StoryNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  onUserControlStart?: () => void;
  controlsRefExternal?: MutableRefObject<OrbitControlsImpl | null>;
};

type FocusAnimation = {
  startSeconds: number;
  durationSeconds: number;
  fromCameraPos: THREE.Vector3;
  toCameraPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
};

const ORIGIN = new THREE.Vector3(0, 0, 0);

const CAMERA = {
  minDistance: 6,
  maxDistance: 42,
  rotateSpeed: 0.45,
  zoomSpeed: 0.8,
  dampingFactor: 0.08,
  warpDurationSeconds: 0.55,
} as const;

const DRIFT = {
  x: 0.25,
  y: 0.18,
  damp: 6,
} as const;

const CONSTELLATION = {
  curveTension: 0.45,
  points: 240,
  lineOpacity: 0.22,
  glowOpacity: 0.08,
} as const;

const COMET = {
  speed: 0.06, // curve u per second
} as const;

const BRIGHTNESS: Record<string, number> = {
  birth: 4.0,
  iphone: 2.6,
  return: 2.3,
};

export default function StarMap({
  story,
  selectedId,
  onSelect,
  onUserControlStart,
  controlsRefExternal,
}: StarMapProps): JSX.Element {
  const { camera, pointer, clock } = useThree();

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const focusRef = useRef<FocusAnimation | null>(null);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const positionsById = useMemo(() => computeNodePositions(story), [story]);

  // Note: This preserves the original behavior of using the stored vector (not a clone).
  const selectedPosition = positionsById[selectedId] ?? ORIGIN;

  const constellationCurve = useMemo(
    () =>
      createConstellationCurve(
        story,
        positionsById,
        CONSTELLATION.curveTension
      ),
    [story, positionsById]
  );

  const constellationGeometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints(
        constellationCurve.getPoints(CONSTELLATION.points)
      ),
    [constellationCurve]
  );

  const cometRef = useRef<THREE.Group>(null);

  // Pause Movie Mode (or any autoplay) when the user starts controlling the camera.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !onUserControlStart) return;

    const handleStart = () => onUserControlStart();
    controls.addEventListener("start", handleStart);

    return () => {
      controls.removeEventListener("start", handleStart);
    };
  }, [onUserControlStart]);

  // When a new node is selected, “warp” directly to it.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    focusRef.current = buildFocusAnimation({
      camera,
      controls,
      clock,
      target: selectedPosition,
      durationSeconds: CAMERA.warpDurationSeconds,
    });
  }, [camera, clock, selectedId, selectedPosition]);

  const handleHover = useCallback((id: string | null) => setHoveredId(id), []);

  useFrame((state, dt) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const driftX = pointer.x * DRIFT.x;
    const driftY = pointer.y * DRIFT.y;

    const nowSeconds = state.clock.getElapsedTime();
    const activeAnim = focusRef.current;

    if (activeAnim) {
      const t = clamp01(
        (nowSeconds - activeAnim.startSeconds) / activeAnim.durationSeconds
      );
      const eased = easeInOutCubic(t);

      camera.position.lerpVectors(
        activeAnim.fromCameraPos,
        activeAnim.toCameraPos,
        eased
      );
      controls.target.lerpVectors(
        activeAnim.fromTarget,
        activeAnim.toTarget,
        eased
      );

      if (t >= 1) focusRef.current = null;
    } else {
      // Keep the “camera target” gently centered on the selected star (with a tiny cursor drift).
      controls.target.x = THREE.MathUtils.damp(
        controls.target.x,
        selectedPosition.x + driftX,
        DRIFT.damp,
        dt
      );
      controls.target.y = THREE.MathUtils.damp(
        controls.target.y,
        selectedPosition.y + driftY,
        DRIFT.damp,
        dt
      );
      controls.target.z = THREE.MathUtils.damp(
        controls.target.z,
        selectedPosition.z,
        DRIFT.damp,
        dt
      );
    }

    controls.update();

    if (cometRef.current) {
      const u = (nowSeconds * COMET.speed) % 1;
      cometRef.current.position.copy(constellationCurve.getPointAt(u));
    }
  });

  return (
    <group>
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 6, 7]} intensity={1.2} />

      <OrbitControls
        ref={(c) => {
          const typed = c as unknown as OrbitControlsImpl;
          controlsRef.current = typed;

          if (controlsRefExternal) {
            // eslint-disable-next-line react-hooks/immutability
            controlsRefExternal.current = typed;
          }
        }}
        enableDamping
        dampingFactor={CAMERA.dampingFactor}
        enableZoom
        minDistance={CAMERA.minDistance}
        maxDistance={CAMERA.maxDistance}
        enablePan={false}
        rotateSpeed={CAMERA.rotateSpeed}
        zoomSpeed={CAMERA.zoomSpeed}
      />

      <BackgroundStarsPoints count={4500} radius={130} />

      <primitive
        object={
          new THREE.Line(
            constellationGeometry,
            new THREE.LineBasicMaterial({
              color: "#4aa3ff",
              transparent: true,
              opacity: CONSTELLATION.lineOpacity,
            })
          )
        }
      />

      <primitive
        object={
          new THREE.Line(
            constellationGeometry,
            new THREE.LineBasicMaterial({
              color: "#9ad7ff",
              transparent: true,
              opacity: CONSTELLATION.glowOpacity,
            })
          )
        }
      />

      <Sparkles
        count={140}
        scale={[12, 6, 18]}
        size={1.4}
        speed={0.4}
        opacity={0.25}
      />

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
        const pos = positionsById[node.id];
        const isSelected = node.id === selectedId;
        const isHovered = hoveredId === node.id;

        return (
          <StarNode
            key={node.id}
            id={node.id}
            label={`${node.year} • ${node.title}`}
            basePosition={pos}
            brightness={getNodeBrightness(node.id)}
            selected={isSelected}
            hovered={isHovered}
            onHover={handleHover}
            onSelect={onSelect}
          />
        );
      })}
    </group>
  );
}

/* =============================================================================
   Helpers (pure functions)
   ============================================================================= */

/**
 * Why: keeps layout “organic” but deterministic (same id -> same position).
 */
function hashToUnit(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function computeNodePositions(
  story: StoryNode[]
): Record<string, THREE.Vector3> {
  const positions: Record<string, THREE.Vector3> = {};

  const radiusBase = 1.2;
  const spiralStep = 0.78;

  story.forEach((node, i) => {
    const t = i * 0.62;
    const r = radiusBase + i * spiralStep;

    const chapterBoost =
      node.id === "exit-apple" || node.id === "return" ? 2.0 : 0;

    const seed = hashToUnit(node.id);
    const jx = (seed - 0.5) * 0.8;
    const jy = (hashToUnit(node.id + "y") - 0.5) * 0.6;
    const jz = (hashToUnit(node.id + "z") - 0.5) * 0.4;

    const x = Math.cos(t) * (r + chapterBoost) + jx;
    const y = Math.sin(t) * (r * 0.55) + jy;
    const z = -i * 1.15 + jz;

    positions[node.id] = new THREE.Vector3(x, y, z);
  });

  positions["birth"] = new THREE.Vector3(0, 0, 0);
  return positions;
}

function createConstellationCurve(
  story: StoryNode[],
  positionsById: Record<string, THREE.Vector3>,
  tension: number
): THREE.CatmullRomCurve3 {
  const points = story
    .map((n) => positionsById[n.id])
    .filter((v): v is THREE.Vector3 => Boolean(v));

  // Defensive: if data is incomplete, avoid throwing while keeping rendering stable.
  const safePoints =
    points.length >= 2
      ? points
      : [ORIGIN, ORIGIN.clone().add(new THREE.Vector3(0, 0, -0.001))];

  return new THREE.CatmullRomCurve3(safePoints, false, "catmullrom", tension);
}

function getNodeBrightness(nodeId: string): number {
  return BRIGHTNESS[nodeId] ?? 1.6;
}

function buildFocusAnimation(params: {
  camera: THREE.Camera;
  controls: OrbitControlsImpl;
  clock: THREE.Clock;
  target: THREE.Vector3;
  durationSeconds: number;
}): FocusAnimation {
  const { camera, controls, clock, target, durationSeconds } = params;

  const startSeconds = clock.getElapsedTime();

  const fromTarget = controls.target.clone();
  const fromCameraPos = camera.position.clone();
  const toTarget = target.clone();

  const currentDist = THREE.MathUtils.clamp(
    fromCameraPos.distanceTo(fromTarget),
    CAMERA.minDistance,
    CAMERA.maxDistance
  );

  let direction = fromCameraPos.clone().sub(fromTarget);
  if (direction.lengthSq() < 1e-6) direction = new THREE.Vector3(0, 0, 1);
  direction.normalize();

  const toCameraPos = toTarget
    .clone()
    .add(direction.multiplyScalar(currentDist));

  return {
    startSeconds,
    durationSeconds,
    fromCameraPos,
    toCameraPos,
    fromTarget,
    toTarget,
  };
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
