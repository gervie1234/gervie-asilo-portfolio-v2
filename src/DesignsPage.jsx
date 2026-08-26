import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { groupDesigns } from "./designCollections";

export default function DesignsPage({ designs, designsState, Icon }) {
  const designGroups = useMemo(() => groupDesigns(designs), [designs]);
  const [selection, setSelection] = useState(null);
  const closeButtonRef = useRef(null);
  const thumbnailRailRef = useRef(null);
  const touchStartX = useRef(null);
  const selectedGroup = selection === null ? null : designGroups[selection.groupIndex];
  const selectedDesign = selectedGroup?.items[selection.itemIndex] || null;
  const selectedItems = selectedGroup?.items || [];

  const closePreview = () => {
    setSelection(null);
    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  };

  const showPrevious = () => {
    setSelection((current) => current === null ? null : ({
      ...current,
      itemIndex: (current.itemIndex - 1 + selectedItems.length) % selectedItems.length,
    }));
  };

  const showNext = () => {
    setSelection((current) => current === null ? null : ({
      ...current,
      itemIndex: (current.itemIndex + 1) % selectedItems.length,
    }));
  };

  useEffect(() => {
    if (!designGroups.length || !window.location.hash) return;
    const slug = decodeURIComponent(window.location.hash.slice(1));
    const groupIndex = designGroups.findIndex((group) => group.slug === slug || group.items.some((design) => design.slug === slug));
    if (groupIndex < 0) return;
    const itemIndex = Math.max(0, designGroups[groupIndex].items.findIndex((design) => design.slug === slug));
    setSelection({ groupIndex, itemIndex });
  }, [designGroups]);

  useEffect(() => {
    if (!selectedDesign) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closePreview();
      if (event.key === "ArrowLeft" && selectedItems.length > 1) showPrevious();
      if (event.key === "ArrowRight" && selectedItems.length > 1) showNext();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedDesign, selectedItems.length]);

  useEffect(() => {
    if (!selectedGroup?.isCollection) return;
    const activeThumbnail = thumbnailRailRef.current?.querySelector("[aria-current='true']");
    activeThumbnail?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedGroup?.isCollection, selection?.itemIndex]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || selectedItems.length < 2) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 48) return;
    if (distance > 0) showPrevious();
    else showNext();
  };

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

      {designGroups.length > 0 ? (
        <div className="designs-page-grid">
          {designGroups.map((group, index) => (
            <button
              className="designs-page-card"
              id={group.slug}
              key={group.key}
              type="button"
              onClick={() => setSelection({ groupIndex: index, itemIndex: 0 })}
              aria-label={`Preview ${group.title}${group.isCollection ? ` collection with ${group.items.length} images` : ""}`}
            >
              <span className={`designs-page-image${group.isCollection ? " is-collection is-cover-only" : ""}`}>
                <img
                  src={group.items[0].thumbnail || group.items[0].image}
                  alt={group.items[0].alt}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  onError={(event) => {
                    const original = group.items[0].image;
                    if (event.currentTarget.src !== new URL(original, window.location.href).href) {
                      event.currentTarget.src = original;
                    }
                  }}
                />
                {group.isCollection && <span className="design-collection-count">{group.items.length} IMAGES</span>}
                <span className="designs-page-view-label">{group.isCollection ? "VIEW SET" : "VIEW FULL"}</span>
              </span>
              <span className="designs-page-card-caption">
                <span>
                  <small>{String(index + 1).padStart(2, "0")} / {group.isCollection ? "COLLECTION" : group.category}</small>
                  <strong>{group.title}</strong>
                </span>
                <span className="designs-page-link" aria-hidden="true">
                  <Icon name="arrow" size={15} />
                </span>
              </span>
            </button>
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

      {selectedDesign && createPortal((
        <div
          className="design-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby="design-lightbox-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePreview();
          }}
        >
          <header className="design-lightbox-topbar">
            <div>
              <span>{String(selection.itemIndex + 1).padStart(2, "0")} / {String(selectedItems.length).padStart(2, "0")}</span>
              <span>{selectedGroup.isCollection ? selectedGroup.title : selectedDesign.category}</span>
            </div>
            <button ref={closeButtonRef} type="button" onClick={closePreview} aria-label="Close design preview">
              CLOSE <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className="design-lightbox-stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {selectedItems.length > 1 && (
              <button className="design-lightbox-nav is-previous" type="button" onClick={showPrevious} aria-label="Previous design">
                <span aria-hidden="true">←</span>
              </button>
            )}

            <figure className="design-lightbox-figure">
              <div className="design-lightbox-image-wrap">
                <img src={selectedDesign.image} alt={selectedDesign.alt} />
              </div>
              <figcaption>
                <div>
                  {selectedGroup.isCollection && <span className="design-lightbox-collection">{selectedGroup.title}</span>}
                  <h2 id="design-lightbox-title">{selectedDesign.title}</h2>
                  {selectedDesign.description && <p>{selectedDesign.description}</p>}
                </div>
                {selectedDesign.href && selectedDesign.href !== "-" && (
                  <a href={selectedDesign.href} target="_blank" rel="noreferrer">
                    VIEW SOURCE <Icon name="arrow" size={13} />
                  </a>
                )}
              </figcaption>
            </figure>

            {selectedItems.length > 1 && (
              <button className="design-lightbox-nav is-next" type="button" onClick={showNext} aria-label="Next design">
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>

          {selectedGroup.isCollection && selectedItems.length > 1 && (
            <nav className="design-lightbox-thumbnails" aria-label={`${selectedGroup.title} images`} ref={thumbnailRailRef}>
              <div className="design-lightbox-thumbnail-track">
                {selectedItems.map((design, index) => (
                  <button
                    type="button"
                    className={index === selection.itemIndex ? "is-active" : ""}
                    aria-label={`View image ${index + 1}: ${design.title}`}
                    aria-current={index === selection.itemIndex ? "true" : undefined}
                    onClick={() => setSelection((current) => ({ ...current, itemIndex: index }))}
                    key={design.slug}
                  >
                    <img
                      src={design.thumbnail || design.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        if (event.currentTarget.src !== new URL(design.image, window.location.href).href) {
                          event.currentTarget.src = design.image;
                        }
                      }}
                    />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
              <p className="design-lightbox-hint">SWIPE OR USE ARROW KEYS · {selection.itemIndex + 1} OF {selectedItems.length}</p>
            </nav>
          )}
        </div>
      ), document.body)}
    </section>
  );
}
