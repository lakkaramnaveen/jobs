import type { JSX } from "react";

type ChromeBarProps = {
  hudOpen: boolean;
  panelOpen: boolean;
  onToggleHud: () => void;
  onTogglePanel: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

/**
 * ChromeBar
 *
 * Why: Centralizes high-frequency app controls (panels + zoom) into a compact,
 * always-accessible bar that works on desktop and mobile without competing
 * with the 3D canvas for gestures.
 *
 * Behavior is preserved:
 * - Same toggle semantics and active styling.
 * - Same zoom in/out callbacks.
 * - Same ARIA labeling/pressed state.
 */
export default function ChromeBar({
  hudOpen,
  panelOpen,
  onToggleHud,
  onTogglePanel,
  onZoomIn,
  onZoomOut,
}: ChromeBarProps): JSX.Element {
  return (
    <div className="chromeBar" aria-label="App controls">
      <button
        type="button"
        className={`iconBtn ${hudOpen ? "active" : ""}`}
        onClick={onToggleHud}
        aria-label={hudOpen ? "Close timeline list" : "Open timeline list"}
        aria-pressed={hudOpen}
      >
        <span className="hamburger" aria-hidden="true" />
      </button>

      <button
        type="button"
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
        <button
          type="button"
          className="iconBtn"
          onClick={onZoomOut}
          aria-label="Zoom out"
        >
          −
        </button>

        <button
          type="button"
          className="iconBtn"
          onClick={onZoomIn}
          aria-label="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  );
}
