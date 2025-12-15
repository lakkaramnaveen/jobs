import { Canvas } from "@react-three/fiber";
import { useMemo, useState, useCallback, useEffect } from "react";
import { STORY, type StoryNode } from "../data/story";
import StarMap from "./StarMap";
import StoryPanel from "./StoryPanel";
import HUD from "./HUD";
import SearchDock from "./SearchDock";
import MovieDock from "./MovieDock";

export default function SpaceScene() {
  const [selectedId, setSelectedId] = useState<string>("birth");
  const [query, setQuery] = useState<string>("");

  // Movie Mode state
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1600); // default: 1.6s per star
  const [loop] = useState(true); // keep simple; can expose as toggle later

  const selected = useMemo(
    () => STORY.find((s) => s.id === selectedId) ?? STORY[0],
    [selectedId]
  );

  const onSelect = useCallback((id: string) => {
    setSelectedId(id); // clicking a star jumps instantly (camera warps via StarMap logic)
  }, []);

  // Slideshow: advances to next star after speedMs.
  // Uses setTimeout + cleanup to be reliable and respond to speed changes immediately. :contentReference[oaicite:2]{index=2}
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

  return (
    <div className={`scene ${playing ? "cinema" : ""}`}>
      <Canvas
        dpr={1} // performance: keep predictable on laptops/mobiles
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 14], fov: 55, near: 0.1, far: 250 }}
      >
        <color attach="background" args={["#000006"]} />
        <StarMap story={STORY} selectedId={selectedId} onSelect={onSelect} />
      </Canvas>

      <HUD
        story={STORY}
        selectedId={selectedId}
        onSelect={onSelect}
        query={query}
      />

      {/* Key trick: key resets internal panel UI between slides (e.g., image reveal state). */}
      <StoryPanel key={selected.id} node={selected as StoryNode} />

      <SearchDock query={query} setQuery={setQuery} />

      <MovieDock
        story={STORY}
        selectedId={selectedId}
        playing={playing}
        setPlaying={setPlaying}
        speedMs={speedMs}
        setSpeedMs={setSpeedMs}
        onSelect={onSelect}
      />
    </div>
  );
}
