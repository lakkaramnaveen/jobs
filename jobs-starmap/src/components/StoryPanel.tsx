import { useEffect, useMemo, useState, type JSX } from "react";
import type { StoryNode } from "../data/story";

type StoryPanelProps = {
  open: boolean;
  node: StoryNode;
};

/**
 * StoryPanel
 *
 * Why this component exists:
 * - Presents a single “pivot point” with layered detail (kid-friendly + deeper context).
 * - Defers media loading by default to keep the initial experience fast on slower devices.
 *
 * Behavior is preserved:
 * - Panel hides via `isClosed` class.
 * - Image loads only after the user requests it.
 * - Sources render as external links.
 */
export default function StoryPanel({
  open,
  node,
}: StoryPanelProps): JSX.Element {
  const [isImageVisible, setIsImageVisible] = useState(false);

  // Reset image visibility when the user navigates to a different node.
  // Why: prevents carrying “show image” state across nodes, keeping the UX predictable and lightweight.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsImageVisible(false);
  }, [node.id]);

  const kickerText = useMemo(
    () => node.dateLabel ?? String(node.year),
    [node.dateLabel, node.year]
  );

  const hasImage = Boolean(node.image?.url);

  return (
    <section
      className={`panel ${open ? "" : "isClosed"}`}
      aria-label="Selected story details"
    >
      <header className="panelTop">
        <div className="panelKicker">{kickerText}</div>
        <h1 className="panelTitle">{node.title}</h1>
        <p className="panelSubtitle">{node.subtitle}</p>
      </header>

      {hasImage && (
        <section className="panelSection" aria-label="Photo">
          {!isImageVisible ? (
            <button
              className="btn"
              type="button"
              onClick={() => setIsImageVisible(true)}
            >
              Show photo (loads on demand)
            </button>
          ) : (
            <figure className="panelImageWrap">
              <img
                className="panelImage"
                src={node.image!.url}
                alt={node.image!.alt}
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <figcaption className="panelCredit">
                {node.image!.credit}
              </figcaption>
            </figure>
          )}
        </section>
      )}

      <section className="panelSection" aria-label="Kid version">
        <h2>Kid Version</h2>
        <p>{node.kid}</p>
      </section>

      <section className="panelSection" aria-label="More detail">
        <h2>More Detail</h2>
        <p>{node.deep}</p>
      </section>

      <section className="panelSection" aria-label="Sources">
        <h2>Sources</h2>
        <ul className="panelSources">
          {node.sources.map(({ label, url }) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
