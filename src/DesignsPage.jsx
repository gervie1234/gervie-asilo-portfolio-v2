export default function DesignsPage({ designs, Icon }) {
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
          <span>FEATURED CLIENT · SOLE DISTRICT PH</span>
        </div>
      </header>

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
              <Icon name="arrow" size={15} />
            </figcaption>
          </figure>
        ))}
      </div>

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
