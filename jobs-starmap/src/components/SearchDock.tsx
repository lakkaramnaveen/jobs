import type { JSX } from "react";

type SearchDockProps = {
  query: string;
  setQuery: (value: string) => void;
};

/**
 * SearchDock
 *
 * Why: Keeps a single, always-available search entry point that doesn't compete
 * with the 3D canvas for pointer focus.
 *
 * Behavior is preserved:
 * - Controlled input with the same placeholder and aria labels.
 * - Same hint text.
 */
export default function SearchDock({
  query,
  setQuery,
}: SearchDockProps): JSX.Element {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="searchDock" role="search" aria-label="Search the timeline">
      <input
        className="searchDockInput"
        value={query}
        onChange={handleChange}
        placeholder="Search year, title…"
        aria-label="Search year or title"
        autoComplete="off"
        inputMode="search"
      />
      <div className="searchDockHint">
        Tip: scroll to zoom, drag to rotate, click a star to warp
      </div>
    </div>
  );
}
