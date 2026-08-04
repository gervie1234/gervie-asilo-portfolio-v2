export default function DesignsPage({ designs, designsState, Icon }) {
  return (
    <section className="designs-page content-width" aria-labelledby="designs-page-title">
      <a className="page-back-link" href="/#designs">← BACK HOME</a>

      <header className="designs-page-header">
        <div>
          <p className="eyebrow">02 / SELECTED VISUAL WORK</p>
          <h1 id="designs-page-title">Graphic<br />design.</h1>
        </div>
        <div className="designs-page-intro">
          <p>Product-led campaign visuals built to make offers clear, energetic, and immediately recognizable.</p>
          <span>CAMPAIGNS · BRANDING · SOCIAL CONTENT</span>
        </div>
      </header>

      {designs.length > 0 ? (
        <div className="designs-page-grid">
          {designs.map((design, index) => (
            <figure className="designs-page-card" id={design.slug} key={design.slug}>
              <div className="designs-page-image">
                <img
                  src={design.image}
                  alt={design.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
              <figcaption>
                <div>
                  <span>{String(index + 1).padStart(2, "0")} / {design.category}</span>
                  <h2>{design.title}</h2>
                </div>
                {design.href ? (
                  <a className="designs-page-link" href={design.href} target="_blank" rel="noreferrer" aria-label={`View ${design.title}`}>
                    <Icon name="arrow" size={15} />
                  </a>
                ) : <Icon name="arrow" size={15} aria-hidden="true" />}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="designs-page-empty" role="status">
          {designsState === "loading" ? "Loading published design work…" : designsState === "error" ? "Published designs are temporarily unavailable." : "No graphic designs are currently published."}
        </p>
      )}

      <aside className="designs-coming-soon" aria-label="More design work coming soon">
        <span>ARCHIVE EXPANDING</span>
        <div>
          <h2>More work to follow.</h2>
          <p>Additional social media, branding, and campaign design pieces are being curated for the next update.</p>
        </div>
      </aside>

      <footer className="designs-page-footer">
        <span>GRAPHIC DESIGN · CAMPAIGN VISUALS · SOCIAL CONTENT</span>
        <a href="/contact">START A PROJECT <Icon name="arrow" size={13} /></a>
      </footer>
    </section>
  );
}