type Props = {
  query: string;
  setQuery: (v: string) => void;
};

export default function SearchDock({ query, setQuery }: Props) {
  return (
    <div className="searchDock" role="search" aria-label="Search the timeline">
      <input
        className="searchDockInput"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search year, title…"
        aria-label="Search year or title"
      />
      <div className="searchDockHint">
        Tip: scroll to zoom, drag to rotate, click a star to warp
      </div>
    </div>
  );
}
