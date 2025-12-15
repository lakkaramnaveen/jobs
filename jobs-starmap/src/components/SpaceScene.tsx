import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useMemo, useState, useCallback } from "react";
import { STORY, type StoryNode } from "../data/story";
import StarMap from "./StarMap";
import StoryPanel from "./StoryPanel";
import HUD from "./HUD";

export default function SpaceScene() {
  const [selectedId, setSelectedId] = useState<string>("birth");
  const selected = useMemo(
    () => STORY.find((s) => s.id === selectedId) ?? STORY[0],
    [selectedId]
  );

  const onSelect = useCallback((id: string) => setSelectedId(id), []);

  return (
    <div className="scene">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 14], fov: 55, near: 0.1, far: 200 }}
      >
        {/* Auto-reduce quality on low-end devices */}
        <PerformanceMonitor
          onDecline={() => {
            // You could lower star count here if you want.
          }}
        />

        <color attach="background" args={["#000006"]} />

        <StarMap story={STORY} selectedId={selectedId} onSelect={onSelect} />
      </Canvas>

      <HUD story={STORY} selectedId={selectedId} onSelect={onSelect} />

      <StoryPanel node={selected as StoryNode} />
    </div>
  );
}
