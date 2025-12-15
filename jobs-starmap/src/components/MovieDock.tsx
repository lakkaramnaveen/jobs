import type { StoryNode } from "../data/story";

type Props = {
  story: StoryNode[];
  selectedId: string;
  playing: boolean;
  setPlaying: (v: boolean) => void;

  // speed in milliseconds between slides
  speedMs: number;
  setSpeedMs: (v: number) => void;

  onSelect: (id: string) => void;
};

export default function MovieDock({
  story,
  selectedId,
  playing,
  setPlaying,
  speedMs,
  setSpeedMs,
  onSelect,
}: Props) {
  const idx = Math.max(
    0,
    story.findIndex((s) => s.id === selectedId)
  );
  const seconds = (speedMs / 1000).toFixed(1);

  return (
    <div className="movieDock" aria-label="Movie mode controls">
      <div className="movieTop">
        <div className="movieTitle">Movie Mode</div>

        <button
          className={`moviePlay ${playing ? "playing" : ""}`}
          onClick={() => setPlaying(!playing)}
          aria-pressed={playing}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
        >
          <span className="movieIcon" aria-hidden="true" />
          <span className="movieBtnText">{playing ? "Pause" : "Play"}</span>
        </button>
      </div>

      <div className="movieRow">
        <label className="movieLabel" htmlFor="speed">
          Warp speed: <b>{seconds}s</b>/star
        </label>

        <input
          id="speed"
          className="movieSlider"
          type="range"
          min={600}
          max={5000}
          step={100}
          value={speedMs}
          onChange={(e) => setSpeedMs(Number(e.target.value))}
          aria-label="Slideshow speed"
        />
        <div className="movieScale">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      {/* Unique: “film reel” dots. Click any dot to jump instantly. */}
      <div className="movieReel" role="list" aria-label="Slideshow reel">
        {story.map((s) => {
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              className={`reelDot ${active ? "active" : ""}`}
              onClick={() => onSelect(s.id)}
              title={`${s.year} • ${s.title}`}
              aria-label={`Jump to ${s.year} ${s.title}`}
              aria-current={active ? "true" : "false"}
              role="listitem"
            />
          );
        })}
      </div>

      <div className="movieFooter">
        Scene <b>{idx + 1}</b> / {story.length}
      </div>
    </div>
  );
}
