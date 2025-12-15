import { useMemo, type JSX } from "react";
import type { StoryNode } from "../data/story";

type HudProps = {
  open: boolean;
  story: StoryNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  query: string;
};

/**
 * HUD (Mission Control)
 *
 * Why: Provides a fast, keyboard-friendly index into the timeline without forcing
 * users to hunt for stars in 3D space.
 *
 * Behavior is preserved:
 * - Uses the same open/closed class toggle (`isClosed`).
 * - Filters by title/subtitle/year using the query (case-insensitive).
 * - Clicking a row calls `onSelect` and marks the active row.
 */
export default function HUD({
  open,
  story,
  selectedId,
  onSelect,
  query,
}: HudProps): JSX.Element {
  const filteredStory = useMemo(
    () => filterStory(story, query),
    [story, query]
  );

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
        {filteredStory.map((node) => {
          const isActive = node.id === selectedId;

          return (
            <button
              key={node.id}
              type="button"
              className={`hudItem ${isActive ? "active" : ""}`}
              onClick={() => onSelect(node.id)}
              aria-current={isActive ? "true" : "false"}
            >
              <span className="hudYear">{node.year}</span>

              <span className="hudText">
                <span className="hudItemTitle">{node.title}</span>
                <span className="hudItemSub">{node.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

/* =============================================================================
   Helpers
   ============================================================================= */

/**
 * Why: Centralizes filter logic so the component stays render-focused and
 * future filter rules (e.g., tags, dateLabel) can be added safely.
 */
function filterStory(story: StoryNode[], rawQuery: string): StoryNode[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return story;

  return story.filter((node) => {
    return (
      node.title.toLowerCase().includes(q) ||
      node.subtitle.toLowerCase().includes(q) ||
      String(node.year).includes(q)
    );
  });
}
