import { useMemo } from "react";
import type { StoryNode } from "../data/story";

type Props = {
  open: boolean;
  story: StoryNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  query: string;
};

export default function HUD({
  open,
  story,
  selectedId,
  onSelect,
  query,
}: Props) {
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

  return (
    <aside
      className={`hud ${open ? "" : "isClosed"}`}
      aria-label="Mission Control timeline navigation"
    >
      <div className="hudHeader">
        <div className="hudTitle">Mission Control</div>
        <div className="hudSub">Navigate Steve Jobs’ life as a star map</div>
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
