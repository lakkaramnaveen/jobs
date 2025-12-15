import type { JSX } from "react";
import SpaceScene from "./components/SpaceScene";

/**
 * App Shell
 *
 * Why this exists:
 * - Keeps the top-level React tree small and predictable.
 * - Provides a stable mount point for the 3D scene and persistent UI chrome (footer).
 *
 * Observable behavior is intentionally unchanged.
 */
export default function App(): JSX.Element {
  return (
    <div className="app">
      <SpaceScene />
      <footer className="footer" aria-label="Usage tip">
        <span>
          Tip: Click stars, or use Mission Control list. Press <b>Space</b> to
          start/stop “Story Mode”.
        </span>
      </footer>
    </div>
  );
}
