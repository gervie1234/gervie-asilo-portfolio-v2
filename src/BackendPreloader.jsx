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
      <div className="backend-preloader-simple" aria-hidden="true">
        <p>Gervie Asilo</p>
        <div className="backend-preloader-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}

export default BackendPreloader;
