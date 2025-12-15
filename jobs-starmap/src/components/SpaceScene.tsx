import { Canvas } from "@react-three/fiber";
import { useMemo, useState, useCallback } from "react";
import { STORY, type StoryNode } from "../data/story";
import StarMap from "./StarMap";
import StoryPanel from "./StoryPanel";
import HUD from "./HUD";
import SearchDock from "./SearchDock";

export default function SpaceScene() {
  const [selectedId, setSelectedId] = useState<string>("birth");
  const [query, setQuery] = useState<string>("");

  const selected = useMemo(
    () => STORY.find((s) => s.id === selectedId) ?? STORY[0],
    [selectedId]
  );

  const onSelect = useCallback((id: string) => setSelectedId(id), []);

  return (
    <div className="scene">
      <Canvas
        dpr={1} // BIG perf win vs 2x on many laptops/mobiles
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
      <StoryPanel node={selected as StoryNode} />
      <SearchDock query={query} setQuery={setQuery} />
    </div>
  );
}
