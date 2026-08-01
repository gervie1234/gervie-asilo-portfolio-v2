import { useEffect, useMemo, useRef, useState } from "react";

const passages = [
  "clean systems turn complex work into simple reliable experiences",
  "design with intent build with care test the details ship with confidence",
  "useful software begins with listening and improves through iteration",
  "clear interfaces help people move faster with fewer mistakes",
  "good work connects thoughtful design dependable code and real outcomes",
  "small improvements repeated with purpose can transform an entire workflow",
];

const keyboardRows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

function getStoredBest() {
  const stored = Number(localStorage.getItem("portfolio-typing-best-v1") || 0);
  return Number.isFinite(stored) ? stored : 0;
}

function TypingPage({ Icon, onTypingSound }) {
  const [passageIndex, setPassageIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeKey, setActiveKey] = useState("");
  const [best, setBest] = useState(getStoredBest);
  const inputRef = useRef(null);
  const startTimeRef = useRef(0);
  const keyTimerRef = useRef(null);
  const previousBestRef = useRef(best);

  const passage = passages[passageIndex];
  const correctCharacters = useMemo(
    () => typed.split("").reduce((total, character, index) => total + (character === passage[index] ? 1 : 0), 0),
    [typed, passage],
  );
  const minutes = Math.max(elapsed / 60, 1 / 600);
  const wpm = started ? Math.max(0, Math.round((correctCharacters / 5) / minutes)) : 0;
  const rawWpm = started ? Math.max(0, Math.round((typed.length / 5) / minutes)) : 0;
  const accuracy = typed.length ? Math.round((correctCharacters / typed.length) * 100) : 100;
  const isNewBest = finished && wpm > previousBestRef.current;

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!started || finished) return undefined;

    const timer = window.setInterval(() => {
      setElapsed((performance.now() - startTimeRef.current) / 1000);
    }, 100);

    return () => window.clearInterval(timer);
  }, [started, finished]);

  useEffect(() => {
    if (!finished || wpm <= best) return;
    setBest(wpm);
    localStorage.setItem("portfolio-typing-best-v1", String(wpm));
  }, [best, finished, wpm]);

  useEffect(() => () => window.clearTimeout(keyTimerRef.current), []);

  const restartTest = () => {
    previousBestRef.current = best;
    setPassageIndex((current) => (current + 1) % passages.length);
    setTyped("");
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setActiveKey("");
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  };

  const handleChange = (event) => {
    if (finished) return;

    const nextValue = event.target.value.slice(0, passage.length);
    if (nextValue.length > typed.length) {
      const typedIndex = nextValue.length - 1;
      onTypingSound?.(nextValue[typedIndex] === passage[typedIndex] ? "type" : "error");
    }

    if (!started && nextValue.length > 0) {
      startTimeRef.current = performance.now();
      setStarted(true);
    }

    setTyped(nextValue);

    if (nextValue.length === passage.length) {
      const finalElapsed = Math.max((performance.now() - startTimeRef.current) / 1000, 0.1);
      setElapsed(finalElapsed);
      setFinished(true);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      restartTest();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      window.location.assign("/#profile");
      return;
    }

    const nextKey = event.key === " " ? "space" : event.key.toLowerCase();
    setActiveKey(nextKey);
    window.clearTimeout(keyTimerRef.current);
    keyTimerRef.current = window.setTimeout(() => setActiveKey(""), 120);
  };

  return (
    <section className="typing-page content-width" aria-labelledby="typing-title">
      <header className="typing-page-header">
        <div>
          <a className="page-back-link" href="/#profile">← BACK TO PORTFOLIO</a>
          <p className="eyebrow">07 / PLAYGROUND</p>
          <h1 id="typing-title">Typing <span>Lab.</span></h1>
        </div>
        <p>A quick focus break. Type the line, check your pace, then run it again.</p>
      </header>

      <div className={`typing-lab ${finished ? "is-finished" : ""}`}>
        <div className="typing-shortcuts" aria-label="Keyboard shortcuts">
          <span><kbd>tab</kbd> restart</span>
          <span><kbd>esc</kbd> close</span>
        </div>

        {!finished ? (
          <>
            <div className="typing-stats" aria-live="polite">
              <div><strong>{wpm}</strong><span>WPM</span></div>
              <div><strong>{accuracy}<sup>%</sup></strong><span>ACCURACY</span></div>
              <div><strong>{best}</strong><span>BEST</span></div>
            </div>

            <div className="typing-passage" onClick={() => inputRef.current?.focus()}>
              <p id="typing-instructions" className="typing-copy" aria-hidden="true">
                {passage.split("").map((character, index) => {
                  const state = index < typed.length
                    ? (typed[index] === character ? "is-correct" : "is-error")
                    : index === typed.length
                      ? "is-current"
                      : "";
                  return <span className={state} key={`${character}-${index}`}>{character}</span>;
                })}
              </p>
              <textarea
                ref={inputRef}
                className="typing-capture"
                value={typed}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={(event) => event.preventDefault()}
                aria-label="Typing test input"
                aria-describedby="typing-instructions"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>

            <div className="typing-keyboard" aria-hidden="true">
              {keyboardRows.map((row, rowIndex) => (
                <div className="typing-key-row" key={rowIndex}>
                  {row.map((key) => <span className={activeKey === key ? "is-active" : ""} key={key}>{key}</span>)}
                </div>
              ))}
              <div className="typing-key-row"><span className={`space-key ${activeKey === "space" ? "is-active" : ""}`}>SPACE</span></div>
            </div>

            <p className="typing-hint">{started ? "Keep going — corrections are allowed." : "Click the line and start typing."}</p>
          </>
        ) : (
          <div className="typing-result" aria-live="polite">
            <strong className="typing-result-score">{wpm}</strong>
            <span className="typing-result-label">WORDS PER MINUTE</span>

            <div className="typing-result-details">
              <div><strong>{accuracy}<sup>%</sup></strong><span>ACCURACY</span></div>
              <div><strong>{rawWpm}</strong><span>RAW</span></div>
            </div>

            <p className={isNewBest ? "is-best" : ""}>
              {isNewBest ? `New personal best · ${wpm} wpm` : `Personal best · ${best} wpm`}
            </p>
            <button className="typing-restart" type="button" onClick={restartTest}>
              <Icon name="restart" size={15} />
              Try again
            </button>
          </div>
        )}
      </div>

      <footer className="typing-page-footer">
        <span>BUILT FOR FOCUS, NOT COMPETITION.</span>
        <a href="/#contact">LET’S WORK TOGETHER <Icon name="arrow" size={12} /></a>
      </footer>
    </section>
  );
}

export default TypingPage;
