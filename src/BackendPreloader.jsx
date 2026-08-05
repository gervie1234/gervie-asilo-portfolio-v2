import { useEffect, useRef, useState } from "react";

const SHOW_DELAY_MS = 420;
const MIN_VISIBLE_MS = 650;
const EXIT_DURATION_MS = 420;

function BackendPreloader({ active, message = "Loading the latest work" }) {
  // Cover the very first React paint when CMS content is already loading.
  // Later, short-lived reloads still use SHOW_DELAY_MS to avoid flashing.
  const [visible, setVisible] = useState(() => active);
  const [leaving, setLeaving] = useState(false);
  const shownAt = useRef(active ? Date.now() : 0);

  useEffect(() => {
    let showTimer;
    let leaveTimer;
    let removeTimer;

    if (active) {
      setLeaving(false);
      if (!visible) {
        showTimer = window.setTimeout(() => {
          shownAt.current = Date.now();
          setVisible(true);
        }, SHOW_DELAY_MS);
      }
    } else if (visible) {
      const visibleFor = Date.now() - shownAt.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - visibleFor);

      leaveTimer = window.setTimeout(() => {
        setLeaving(true);
        removeTimer = window.setTimeout(() => {
          setVisible(false);
          setLeaving(false);
        }, EXIT_DURATION_MS);
      }, remaining);
    }

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [active, visible]);

  if (!visible) return null;

  return (
    <div
      className={`backend-preloader${leaving ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="backend-preloader-grid" aria-hidden="true" />
      <div className="backend-preloader-panel">
        <div className="backend-preloader-brand" aria-hidden="true">
          <span>GA</span>
          <p>GERVIE ASILO / PORTFOLIO</p>
        </div>

        <div className="backend-preloader-mark" aria-hidden="true">
          <span className="backend-preloader-orbit" />
          <span className="backend-preloader-core">G</span>
        </div>

        <div className="backend-preloader-copy">
          <p>{message}</p>
          <span>Connecting to the portfolio CMS</span>
        </div>

        <div className="backend-preloader-progress" aria-hidden="true">
          <span />
        </div>

        <div className="backend-preloader-index" aria-hidden="true">
          <span>01</span><span>02</span><span>03</span><span>04</span>
        </div>
      </div>
    </div>
  );
}

export default BackendPreloader;
