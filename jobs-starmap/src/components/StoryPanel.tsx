import type { StoryNode } from "../data/story";

export default function StoryPanel({ node }: { node: StoryNode }) {
  return (
    <section className="panel" aria-label="Selected story details">
      <div className="panelTop">
        <div className="panelKicker">
          {node.dateLabel ? node.dateLabel : node.year}
        </div>
        <h1 className="panelTitle">{node.title}</h1>
        <div className="panelSubtitle">{node.subtitle}</div>
      </div>

      {node.image?.url && (
        <div className="panelImageWrap">
          <img
            className="panelImage"
            src={node.image.url}
            alt={node.image.alt}
            loading="lazy"
          />
          <div className="panelCredit">{node.image.credit}</div>
        </div>
      )}

      <div className="panelSection">
        <h2>Kid Version</h2>
        <p>{node.kid}</p>
      </div>

      <div className="panelSection">
        <h2>More Detail</h2>
        <p>{node.deep}</p>
      </div>

      <div className="panelSection">
        <h2>Sources</h2>
        <ul className="panelSources">
          {node.sources.map((s) => (
            <li key={s.url}>
              {/* URLs are fine inside code/projects; on-page they’re clickable */}
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
