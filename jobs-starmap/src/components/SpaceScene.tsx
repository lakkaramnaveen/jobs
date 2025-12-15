import { Canvas } from "@react-three/fiber";
import { useMemo, useState, useCallback, useEffect } from "react";
import { STORY, type StoryNode } from "../data/story";
import StarMap from "./StarMap";
import StoryPanel from "./StoryPanel";
import HUD from "./HUD";
import SearchDock from "./SearchDock";
import MovieDock from "./MovieDock";

// ...imports

export default function SpaceScene() {
  const [selectedId, setSelectedId] = useState<string>("birth");
  const [query, setQuery] = useState<string>("");

  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1600);
  const loop = true;

  const selected = useMemo(
    () => STORY.find((s) => s.id === selectedId) ?? STORY[0],
    [selectedId]
  );

  // Manual navigation always pauses
  const selectManual = useCallback((id: string) => {
    setPlaying(false);
    setSelectedId(id);
  }, []);

  // Slideshow keeps running only for AUTO-advance
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
      setSelectedId(STORY[nextIdx].id); // IMPORTANT: do not call selectManual here
    }, speedMs);

    return () => window.clearTimeout(t);
  }, [playing, speedMs, selectedId, loop]);

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
      >
        <color attach="background" args={["#000006"]} />
        <StarMap
          story={STORY}
          selectedId={selectedId}
          onSelect={selectManual} // star click pauses
          onUserControlStart={() => setPlaying(false)} // drag/zoom pauses
        />
      </Canvas>

      <HUD
        story={STORY}
        selectedId={selectedId}
        onSelect={selectManual}
        query={query}
      />
      <StoryPanel key={selected.id} node={selected as StoryNode} />
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
