type Props = {
  hudOpen: boolean;
  panelOpen: boolean;
  onToggleHud: () => void;
  onTogglePanel: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function ChromeBar({
  hudOpen,
  panelOpen,
  onToggleHud,
  onTogglePanel,
  onZoomIn,
  onZoomOut,
}: Props) {
  return (
    <div className="chromeBar" aria-label="App controls">
      <button
        className={`iconBtn ${hudOpen ? "active" : ""}`}
        onClick={onToggleHud}
        aria-label={hudOpen ? "Close timeline list" : "Open timeline list"}
        aria-pressed={hudOpen}
      >
        <span className="hamburger" aria-hidden="true" />
      </button>

      <button
        className={`iconBtn ${panelOpen ? "active" : ""}`}
        onClick={onTogglePanel}
        aria-label={panelOpen ? "Close details panel" : "Open details panel"}
        aria-pressed={panelOpen}
      >
        <span className="infoDot" aria-hidden="true">
          i
        </span>
      </button>

      <div className="zoomGroup" aria-label="Zoom controls">
        <button className="iconBtn" onClick={onZoomOut} aria-label="Zoom out">
          −
        </button>
        <button className="iconBtn" onClick={onZoomIn} aria-label="Zoom in">
          +
        </button>
      </div>
    </div>
  );
}
