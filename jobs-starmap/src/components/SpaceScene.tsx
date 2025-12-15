/* eslint-disable @typescript-eslint/no-explicit-any */
import { Canvas } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { STORY } from "../data/story";
import StarMap from "./StarMap";
import StoryPanel from "./StoryPanel";
import HUD from "./HUD";
import SearchDock from "./SearchDock";
import MovieDock from "./MovieDock";
import ChromeBar from "./ChromeBar";

const MOBILE_BREAKPOINT_PX = 980;

const CANVAS_CONFIG = {
  dpr: 1,
  camera: {
    position: [0, 0, 14] as [number, number, number],
    fov: 55,
    near: 0.1,
    far: 250,
  },
  gl: {
    antialias: false,
    alpha: false,
    powerPreference: "high-performance" as const,
  },
  background: "#000006",
} as const;

const UI_SELECTOR = ".hud, .panel, .searchDock, .movieDock";

/**
 * SpaceScene
 *
 * Why this component exists:
 * - Owns the "app shell" state (selected node, panels, search, movie mode).
 * - Bridges UI and 3D controls without letting UI event handling fight OrbitControls.
 *
 * Behavior is preserved:
 * - Manual selection pauses Movie Mode.
 * - Autoplay advances on a timer (doesn't self-pause).
 * - Panels auto-close on small screens; manual selection opens the details panel.
 * - Global zoom works with Alt/Ctrl/⌘ + wheel anywhere (panels still scroll normally otherwise).
 */
export default function SpaceScene(): JSX.Element {
  const [selectedId, setSelectedId] = useState<string>("birth");
  const [query, setQuery] = useState<string>("");

  // Movie Mode
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideDelayMs, setSlideDelayMs] = useState(1600);
  const loopSlides = true;

  // Panels: closed by default on small screens
  const [isHudOpen, setIsHudOpen] = useState(
    () => window.innerWidth > MOBILE_BREAKPOINT_PX
  );
  const [isPanelOpen, setIsPanelOpen] = useState(
    () => window.innerWidth > MOBILE_BREAKPOINT_PX
  );

  // OrbitControls reference for global zoom
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const selectedNode = useMemo(() => {
    return STORY.find((s) => s.id === selectedId) ?? STORY[0];
  }, [selectedId]);

  /**
   * Manual selection always pauses autoplay.
   * Why: user intent should "win" over automation.
   */
  const selectNodeManually = useCallback((id: string) => {
    setIsPlaying(false);
    setSelectedId(id);

    if (window.innerWidth <= MOBILE_BREAKPOINT_PX) {
      setIsPanelOpen(true);
      setIsHudOpen(false);
    }
  }, []);

  // Autoplay (slideshow) advances by index without calling manual-select (otherwise it pauses itself).
  useEffect(() => {
    if (!isPlaying) return;

    const currentIndex = Math.max(
      0,
      STORY.findIndex((s) => s.id === selectedId)
    );
    const lastIndex = STORY.length - 1;

    const nextIndex =
      currentIndex === lastIndex
        ? loopSlides
          ? 0
          : lastIndex
        : currentIndex + 1;

    const timerId = window.setTimeout(() => {
      if (!loopSlides && currentIndex === lastIndex) {
        setIsPlaying(false);
        return;
      }
      setSelectedId(STORY[nextIndex].id);
    }, slideDelayMs);

    return () => window.clearTimeout(timerId);
  }, [isPlaying, slideDelayMs, selectedId, loopSlides]);

  // Keep panel defaults in sync with breakpoint changes
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT_PX}px)`
    );

    const apply = () => {
      if (mediaQuery.matches) {
        setIsHudOpen(false);
        setIsPanelOpen(false);
      } else {
        setIsHudOpen(true);
        setIsPanelOpen(true);
      }
    };

    apply();
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  // ---- Global zoom helpers (entire page) ----

  const pauseAutoplay = useCallback(() => setIsPlaying(false), []);

  const zoomByScale = useCallback(
    (scale: number) => {
      const controls = controlsRef.current;
      if (!controls) return;

      pauseAutoplay();

      // OrbitControls exposes the camera as `object`
      const camera = controls.object as THREE.PerspectiveCamera;
      const target = controls.target.clone();

      const direction = camera.position.clone().sub(target);
      if (direction.lengthSq() < 1e-8) direction.set(0, 0, 1);
      direction.normalize();

      const currentDistance = camera.position.distanceTo(target);

      // Respect OrbitControls min/max distance
      const minDistance = (controls as any).minDistance ?? 6;
      const maxDistance = (controls as any).maxDistance ?? 42;

      const nextDistance = THREE.MathUtils.clamp(
        currentDistance * scale,
        minDistance,
        maxDistance
      );

      camera.position.copy(target.add(direction.multiplyScalar(nextDistance)));
      controls.update();
    },
    [pauseAutoplay]
  );

  const handleZoomIn = useCallback(() => zoomByScale(0.9), [zoomByScale]);
  const handleZoomOut = useCallback(() => zoomByScale(1.12), [zoomByScale]);

  /**
   * Global wheel zoom:
   * - Alt/Ctrl/⌘ + wheel zooms anywhere (even over UI overlays)
   * - Regular wheel scroll inside panels remains normal
   */
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const controls = controlsRef.current;
      if (!controls) return;

      const targetEl = e.target as HTMLElement | null;
      const isOverUi = Boolean(targetEl?.closest(UI_SELECTOR));
      const wantsGlobalZoom = e.altKey || e.ctrlKey || e.metaKey;

      if (isOverUi && !wantsGlobalZoom) return;

      e.preventDefault();
      zoomByScale(e.deltaY > 0 ? 1.1 : 0.92);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [zoomByScale]);

  return (
    <div className={`scene ${isPlaying ? "cinema" : ""}`}>
      <Canvas
        dpr={CANVAS_CONFIG.dpr}
        gl={CANVAS_CONFIG.gl}
        camera={CANVAS_CONFIG.camera}
        style={{ touchAction: "none" }}
      >
        <color attach="background" args={[CANVAS_CONFIG.background]} />
        <StarMap
          story={STORY}
          selectedId={selectedId}
          onSelect={selectNodeManually}
          onUserControlStart={pauseAutoplay}
          controlsRefExternal={controlsRef}
        />
      </Canvas>

      <ChromeBar
        hudOpen={isHudOpen}
        panelOpen={isPanelOpen}
        onToggleHud={() => setIsHudOpen((v) => !v)}
        onTogglePanel={() => setIsPanelOpen((v) => !v)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      <HUD
        open={isHudOpen}
        story={STORY}
        selectedId={selectedId}
        onSelect={selectNodeManually}
        query={query}
      />

      <StoryPanel
        open={isPanelOpen}
        key={selectedNode.id}
        node={selectedNode}
      />

      <SearchDock query={query} setQuery={setQuery} />

      <MovieDock
        story={STORY}
        selectedId={selectedId}
        playing={isPlaying}
        setPlaying={setIsPlaying}
        speedMs={slideDelayMs}
        setSpeedMs={setSlideDelayMs}
        onSelect={selectNodeManually}
      />
    </div>
  );
}
