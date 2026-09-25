import { useEffect, useRef, useState } from "react";

const TARGET_TOTAL = 15;
const BEST_KEY = "portfolio-aim-best-v1";

function getStoredBest() {
  const stored = Number(localStorage.getItem(BEST_KEY) || 0);
  return Number.isFinite(stored) && stored > 0 ? stored : 0;
}

function createTarget(id = 0) {
  return {
    id,
    x: 9 + Math.random() * 82,
    y: 12 + Math.random() * 76,
  };
}

function AimLabPage({ Icon, onAimSound, onNavigate }) {
  const [status, setStatus] = useState("idle");
  const [target, setTarget] = useState(() => createTarget());
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [resultAverage, setResultAverage] = useState(0);
  const [best, setBest] = useState(getStoredBest);
  const [isNewBest, setIsNewBest] = useState(false);
  const targetShownAtRef = useRef(0);

  const attempts = hits + misses;
  const accuracy = attempts ? Math.round((hits / attempts) * 100) : 100;
  const liveAverage = reactionTimes.length
    ? Math.round(reactionTimes.reduce((total, time) => total + time, 0) / reactionTimes.length)
    : 0;

  const placeTarget = (id) => {
    setTarget(createTarget(id));
    window.requestAnimationFrame(() => {
      targetShownAtRef.current = performance.now();
    });
  };

  const startRound = () => {
    setStatus("playing");
    setHits(0);
    setMisses(0);
    setReactionTimes([]);
    setResultAverage(0);
    setIsNewBest(false);
    targetShownAtRef.current = 0;
    window.requestAnimationFrame(() => placeTarget(1));
  };

  const finishRound = (times) => {
    const average = Math.round(times.reduce((total, time) => total + time, 0) / times.length);
    const nextIsBest = !best || average < best;

    setResultAverage(average);
    setStatus("finished");
    setIsNewBest(nextIsBest);

    if (nextIsBest) {
      setBest(average);
      localStorage.setItem(BEST_KEY, String(average));
    }
  };

  const handleTargetClick = (event) => {
    event.stopPropagation();
    if (status !== "playing") return;

    const reaction = Math.max(1, Math.round(performance.now() - targetShownAtRef.current));
    const nextHits = hits + 1;
    const nextTimes = [...reactionTimes, reaction];

    setHits(nextHits);
    setReactionTimes(nextTimes);
    onAimSound?.("type");

    if (nextHits >= TARGET_TOTAL) {
      finishRound(nextTimes);
      return;
    }

    placeTarget(nextHits + 1);
  };

  const handleArenaClick = () => {
    if (status !== "playing") return;
    setMisses((current) => current + 1);
    onAimSound?.("error");
  };

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onNavigate?.("/#profile");
        return;
      }

      if (event.key === "Enter" && status !== "playing" && !event.repeat) {
        event.preventDefault();
        startRound();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [status, best, onNavigate]);

  return (
    <section className="typing-page aim-page content-width" aria-labelledby="aim-title">
      <header className="typing-page-header">
        <div>
          <a className="page-back-link" href="/#profile">← BACK TO PORTFOLIO</a>
          <p className="eyebrow">07 / PLAYGROUND</p>
          <h1 id="aim-title">Aim <span>Lab.</span></h1>
          <nav className="playground-game-switcher" aria-label="Playground games">
            <a href="/playground">Typing</a>
            <a className="is-active" href="/aim-lab" aria-current="page">Aim Lab</a>
            <a href="/stack-climber">Climber</a>
          </nav>
        </div>
        <p>A quick mouse accuracy drill. Hit every target, avoid empty space, and beat your reaction time.</p>
      </header>

      <div className={`aim-lab is-${status}`}>
        <div className="aim-toolbar">
          <div className="typing-shortcuts" aria-label="Keyboard shortcuts">
            <span><kbd>enter</kbd> {status === "finished" ? "try again" : "start"}</span>
            <span><kbd>esc</kbd> close</span>
          </div>

          <div className="aim-stats" aria-live="polite">
            <div><strong>{hits}<small>/{TARGET_TOTAL}</small></strong><span>HITS</span></div>
            <div><strong>{accuracy}<sup>%</sup></strong><span>ACCURACY</span></div>
            <div><strong>{liveAverage || "-"}<small>{liveAverage ? "ms" : ""}</small></strong><span>AVERAGE</span></div>
            <div><strong>{best || "-"}<small>{best ? "ms" : ""}</small></strong><span>BEST</span></div>
          </div>
        </div>

        <div className="aim-arena" onClick={handleArenaClick}>
          {status === "playing" && (
            <button
              className="aim-target"
              type="button"
              aria-label={`Target ${hits + 1} of ${TARGET_TOTAL}`}
              onClick={handleTargetClick}
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
              key={target.id}
            >
              <span />
            </button>
          )}

          {status === "idle" && (
            <div className="aim-message">
              <span className="aim-demo-target"><i /></span>
              <p>15 targets · clicks outside count as misses</p>
              <button className="typing-restart" type="button" aria-keyshortcuts="Enter" onClick={startRound}>
                <kbd>enter</kbd>
                Start round
              </button>
            </div>
          )}

          {status === "finished" && (
            <div className="aim-result" aria-live="polite">
              <span className="typing-result-mode">ROUND COMPLETE</span>
              <strong>{resultAverage}<small>ms</small></strong>
              <span>AVERAGE REACTION</span>
              <div>
                <p><strong>{accuracy}<sup>%</sup></strong><span>ACCURACY</span></p>
                <p><strong>{misses}</strong><span>MISSES</span></p>
              </div>
              <p className={isNewBest ? "is-best" : ""}>
                {isNewBest ? `New personal best · ${resultAverage} ms` : `Personal best · ${best} ms`}
              </p>
              <button className="typing-restart" type="button" aria-keyshortcuts="Enter" onClick={startRound}>
                <kbd>enter</kbd>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="typing-page-footer">
        <span>BUILT FOR FOCUS, NOT COMPETITION.</span>
        <a href="/#contact">LET’S WORK TOGETHER <Icon name="arrow" size={12} /></a>
      </footer>
    </section>
  );
}

export default AimLabPage;
