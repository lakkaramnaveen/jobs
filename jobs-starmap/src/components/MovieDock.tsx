import type { JSX } from "react";
import type { StoryNode } from "../data/story";

type MovieDockProps = {
  story: StoryNode[];
  selectedId: string;
  playing: boolean;
  setPlaying: (value: boolean) => void;

  /** Speed in milliseconds between slides */
  speedMs: number;
  setSpeedMs: (value: number) => void;

  /** Jump instantly to any node (manual selection should pause autoplay in the parent). */
  onSelect: (id: string) => void;
};

/**
 * MovieDock
 *
 * Why: Provides a playful “slideshow” mode with direct scene jumping (film reel),
 * while keeping the interaction model simple and predictable.
 *
 * Behavior is preserved:
 * - Play/Pause toggles `playing`
 * - Slider updates `speedMs`
 * - Reel dots call `onSelect` (instant jump)
 * - Current scene index + count displayed
 */
export default function MovieDock({
  story,
  selectedId,
  playing,
  setPlaying,
  speedMs,
  setSpeedMs,
  onSelect,
}: MovieDockProps): JSX.Element {
  const currentIndex = Math.max(
    0,
    story.findIndex((s) => s.id === selectedId)
  );
  const secondsPerStar = (speedMs / 1000).toFixed(1);

  const togglePlaying = () => setPlaying(!playing);

  const handleSpeedChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSpeedMs(Number(e.target.value));
  };

  return (
    <div className="movieDock" aria-label="Movie mode controls">
      <div className="movieTop">
        <div className="movieTitle">Movie Mode</div>

        <button
          type="button"
          className={`moviePlay ${playing ? "playing" : ""}`}
          onClick={togglePlaying}
          aria-pressed={playing}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
        >
          <span className="movieIcon" aria-hidden="true" />
          <span className="movieBtnText">{playing ? "Pause" : "Play"}</span>
        </button>
      </div>

      <div className="movieRow">
        <label className="movieLabel" htmlFor="speed">
          Warp speed: <b>{secondsPerStar}s</b>/star
        </label>

        <input
          id="speed"
          className="movieSlider"
          type="range"
          min={600}
          max={5000}
          step={100}
          value={speedMs}
          onChange={handleSpeedChange}
          aria-label="Slideshow speed"
        />

        <div className="movieScale">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      {/* “Film reel” dots: click any dot to jump instantly. */}
      <div className="movieReel" role="list" aria-label="Slideshow reel">
        {story.map((node) => {
          const isActive = node.id === selectedId;

          return (
            <button
              key={node.id}
              type="button"
              className={`reelDot ${isActive ? "active" : ""}`}
              onClick={() => onSelect(node.id)}
              title={`${node.year} • ${node.title}`}
              aria-label={`Jump to ${node.year} ${node.title}`}
              aria-current={isActive ? "true" : "false"}
              role="listitem"
            />
          );
        })}
      </div>

      <div className="movieFooter">
        Scene <b>{currentIndex + 1}</b> / {story.length}
      </div>
    </div>
  );
}
