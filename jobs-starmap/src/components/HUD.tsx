import { useEffect, useMemo, useState } from "react";
import type { StoryNode } from "../data/story";

type Props = {
  story: StoryNode[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function HUD({ story, selectedId, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return story;
    return story.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        String(s.year).includes(q)
    );
  }, [query, story]);

  // Space toggles “Story Mode” (simple: jump next each press)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      const idx = story.findIndex((s) => s.id === selectedId);
      const next = story[(idx + 1) % story.length];
      onSelect(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSelect, selectedId, story]);

  return (
    <aside className="hud" aria-label="Mission Control timeline navigation">
      <div className="hudHeader">
        <div className="hudTitle">Mission Control</div>
        <div className="hudSub">Navigate Steve Jobs’ life as a star map</div>
        <input
          className="hudSearch"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search year, title…"
          aria-label="Search timeline"
        />
      </div>

      <div className="hudList" role="list">
        {filtered.map((n) => {
          const active = n.id === selectedId;
          return (
            <button
              key={n.id}
              className={`hudItem ${active ? "active" : ""}`}
              onClick={() => onSelect(n.id)}
              aria-current={active ? "true" : "false"}
            >
              <span className="hudYear">{n.year}</span>
              <span className="hudText">
                <span className="hudItemTitle">{n.title}</span>
                <span className="hudItemSub">{n.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
