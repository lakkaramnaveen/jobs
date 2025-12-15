import { Canvas } from "@react-three/fiber";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { STORY, type StoryNode } from "../data/story";
import StarMap from "./StarMap";
import StoryPanel from "./StoryPanel";
import HUD from "./HUD";
import SearchDock from "./SearchDock";
import MovieDock from "./MovieDock";
import ChromeBar from "./ChromeBar";

const MOBILE_BP = 980;

export default function SpaceScene() {
  const [selectedId, setSelectedId] = useState<string>("birth");
  const [query, setQuery] = useState<string>("");

  // Movie Mode
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1600);
  const loop = true;

  // Responsive panels: closed by default on small screens
  const [hudOpen, setHudOpen] = useState(() => window.innerWidth > MOBILE_BP);
  const [panelOpen, setPanelOpen] = useState(
    () => window.innerWidth > MOBILE_BP
  );

  // OrbitControls ref so we can zoom globally (even over UI)
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const selected = useMemo(
    () => STORY.find((s) => s.id === selectedId) ?? STORY[0],
    [selectedId]
  );

  // Manual navigation pauses Movie Mode.
  // On mobile/tablet, we auto-open the details panel so the user sees what they clicked.
  const selectManual = useCallback((id: string) => {
    setPlaying(false);
    setSelectedId(id);

    if (window.innerWidth <= MOBILE_BP) {
      setPanelOpen(true);
      setHudOpen(false);
    }
  }, []);

  // Slideshow timer (auto-advance should NOT call selectManual, otherwise it pauses itself)
  useEffect(() => {
    if (!playing) return;

    const currentIdx = Math.max(
      0,
      STORY.findIndex((s) => s.id === selectedId)
    );
    const last = STORY.length - 1;
    const nextIdx = currentIdx === last ? (loop ? 0 : last) : currentIdx + 1;

    const t = window.setTimeout(() => {
      if (!loop && currentIdx === last) {
        setPlaying(false);
        return;
      }
      setSelectedId(STORY[nextIdx].id);
    }, speedMs);

    return () => window.clearTimeout(t);
  }, [playing, speedMs, selectedId, loop]);

  // Keep panel defaults in sync with breakpoint changes
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BP}px)`);
    const apply = () => {
      if (mq.matches) {
        setHudOpen(false);
        setPanelOpen(false);
      } else {
        setHudOpen(true);
        setPanelOpen(true);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // ---- Global zoom helpers (entire page) ----
  const zoomByScale = useCallback((scale: number) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Pause Movie Mode on any user-driven zoom
    setPlaying(false);

    const cam = controls.object as THREE.PerspectiveCamera;
    const target = controls.target.clone();

    const dir = cam.position.clone().sub(target);
    if (dir.lengthSq() < 1e-8) dir.set(0, 0, 1);
    dir.normalize();

    const dist = cam.position.distanceTo(target);

    // Respect the same min/max as your OrbitControls config
    const minD = (controls as any).minDistance ?? 6;
    const maxD = (controls as any).maxDistance ?? 42;

    const nextDist = THREE.MathUtils.clamp(dist * scale, minD, maxD);

    cam.position.copy(target.add(dir.multiplyScalar(nextDist)));
    controls.update();
  }, []);

  const onZoomIn = useCallback(() => zoomByScale(0.9), [zoomByScale]); // closer
  const onZoomOut = useCallback(() => zoomByScale(1.12), [zoomByScale]); // farther

  // Global wheel zoom: Alt/Ctrl/⌘ + wheel works anywhere, even over panels.
  // Without a modifier, scrolling inside panels remains normal.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const controls = controlsRef.current;
      if (!controls) return;

      const overUI = (e.target as HTMLElement | null)?.closest(
        ".hud, .panel, .searchDock, .movieDock"
      );

      const wantsGlobalZoom = e.altKey || e.ctrlKey || e.metaKey;

      // If the user is scrolling a panel normally, let it scroll.
      if (overUI && !wantsGlobalZoom) return;

      // Otherwise, treat as zoom (and prevent page scroll)
      e.preventDefault();
      const scale = e.deltaY > 0 ? 1.1 : 0.92;
      zoomByScale(scale);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel as any);
  }, [zoomByScale]);

  return (
    <div className={`scene ${playing ? "cinema" : ""}`}>
      <Canvas
        dpr={1}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 14], fov: 55, near: 0.1, far: 250 }}
        style={{ touchAction: "none" }} // improves gesture handling on canvas
      >
        <color attach="background" args={["#000006"]} />
        <StarMap
          story={STORY}
          selectedId={selectedId}
          onSelect={selectManual}
          onUserControlStart={() => setPlaying(false)} // drag/zoom pauses
          controlsRefExternal={controlsRef} // enables global zoom buttons/shortcuts
        />
      </Canvas>

      <ChromeBar
        hudOpen={hudOpen}
        panelOpen={panelOpen}
        onToggleHud={() => setHudOpen((v) => !v)}
        onTogglePanel={() => setPanelOpen((v) => !v)}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />

      <HUD
        open={hudOpen}
        story={STORY}
        selectedId={selectedId}
        onSelect={selectManual}
        query={query}
      />
      <StoryPanel
        open={panelOpen}
        key={selected.id}
        node={selected as StoryNode}
      />

      <SearchDock query={query} setQuery={setQuery} />

      <MovieDock
        story={STORY}
        selectedId={selectedId}
        playing={playing}
        setPlaying={setPlaying}
        speedMs={speedMs}
        setSpeedMs={setSpeedMs}
        onSelect={selectManual} // reel-dot click pauses
      />
    </div>
  );
}
