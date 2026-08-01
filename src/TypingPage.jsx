import { useEffect, useMemo, useRef, useState } from "react";

const commonWords = (
  "about after again all also always and any around ask back because before best better big both bring build but call can " +
  "change check clear close come could day do down each easy even every feel find first follow for form from get give go good " +
  "great group have help here high home how idea if in into it just keep kind know last learn left life like little long look " +
  "make many may me more most move much my need never new next no not now of off old on one only open or other our out over " +
  "page people place plan play point put right run same say see seem show simple small so some start still take team tell than " +
  "that the their them then there these they thing think this time to together too turn two up us use very want way we well " +
  "what when where which while who why will with word work world would write year you your app code design"
).split(" ");

function createPassage(previousPassage = "") {
  const wordCount = 12 + Math.floor(Math.random() * 4);
  const words = [];

  while (words.length < wordCount) {
    const candidate = commonWords[Math.floor(Math.random() * commonWords.length)];
    if (candidate !== words.at(-1)) words.push(candidate);
  }

  const nextPassage = words.join(" ");
  return nextPassage === previousPassage ? createPassage(previousPassage) : nextPassage;
}

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
  const [passage, setPassage] = useState(createPassage);
  const [completedWords, setCompletedWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeKey, setActiveKey] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [mistakeAt, setMistakeAt] = useState(-1);
  const [best, setBest] = useState(getStoredBest);
  const inputRef = useRef(null);
  const startTimeRef = useRef(0);
  const keyTimerRef = useRef(null);
  const mistakeTimerRef = useRef(null);
  const previousBestRef = useRef(best);

  const passageWords = useMemo(() => passage.split(" "), [passage]);
  const correctCharacters = useMemo(
    () => {
      const committedCorrect = completedWords.reduce((total, typedWord, wordIndex) => (
        total + typedWord.split("").reduce(
          (wordTotal, character, characterIndex) => wordTotal + (character === passageWords[wordIndex]?.[characterIndex] ? 1 : 0),
          0,
        )
      ), 0);
      const currentCorrect = currentInput.split("").reduce(
        (total, character, index) => total + (character === passageWords[currentWordIndex]?.[index] ? 1 : 0),
        0,
      );
      return committedCorrect + currentCorrect;
    },
    [completedWords, currentInput, currentWordIndex, passageWords],
  );
  const minutes = Math.max(elapsed / 60, 1 / 600);
  const wpm = started ? Math.max(0, Math.round((correctCharacters / 5) / minutes)) : 0;
  const rawWpm = started ? Math.max(0, Math.round((attempts / 5) / minutes)) : 0;
  const accuracy = attempts ? Math.max(0, Math.round(((attempts - mistakes) / attempts) * 100)) : 100;
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

  useEffect(() => () => {
    window.clearTimeout(keyTimerRef.current);
    window.clearTimeout(mistakeTimerRef.current);
  }, []);

  const restartTest = () => {
    previousBestRef.current = best;
    setPassage((current) => createPassage(current));
    setCompletedWords([]);
    setCurrentWordIndex(0);
    setCurrentInput("");
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setActiveKey("");
    setAttempts(0);
    setMistakes(0);
    setMistakeAt(-1);
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
  };

  const finishTest = () => {
    const finalElapsed = Math.max((performance.now() - startTimeRef.current) / 1000, 0.1);
    setElapsed(finalElapsed);
    setFinished(true);
  };

  const commitCurrentWord = () => {
    if (!currentInput) return;

    const targetWord = passageWords[currentWordIndex];
    const missingCharacters = Math.max(targetWord.length - currentInput.length, 0);
    const wordHasError = missingCharacters > 0 || currentInput.split("").some((character, index) => character !== targetWord[index]);

    if (missingCharacters) {
      setAttempts((current) => current + missingCharacters);
      setMistakes((current) => current + missingCharacters);
    }

    onTypingSound?.(wordHasError ? "error" : "type");
    setCompletedWords((current) => [...current, currentInput]);
    setMistakeAt(-1);

    if (currentWordIndex === passageWords.length - 1) {
      setCurrentInput("");
      finishTest();
      return;
    }

    setCurrentWordIndex((current) => current + 1);
    setCurrentInput("");
  };

  const handleChange = (event) => {
    if (finished) return;

    const targetWord = passageWords[currentWordIndex];
    const nextValue = event.target.value.replace(/\s/g, "").slice(0, targetWord.length + 12);
    if (nextValue.length > currentInput.length) {
      const typedIndex = currentInput.length;
      const nextCharacter = nextValue[typedIndex];
      const isCorrectKey = nextCharacter === targetWord[typedIndex];

      setAttempts((current) => current + 1);

      if (!started) {
        startTimeRef.current = performance.now();
        setStarted(true);
      }

      if (!isCorrectKey) {
        onTypingSound?.("error");
        setMistakes((current) => current + 1);
        setMistakeAt(typedIndex);
        window.clearTimeout(mistakeTimerRef.current);
        mistakeTimerRef.current = window.setTimeout(() => setMistakeAt(-1), 700);
      } else {
        onTypingSound?.("type");
        setMistakeAt(-1);
      }

      setCurrentInput(nextValue);
      return;
    }

    setCurrentInput(nextValue);
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

    if (event.key === "Backspace" && !currentInput && currentWordIndex > 0) {
      event.preventDefault();
      const previousInput = completedWords[completedWords.length - 1] || "";
      setCompletedWords((current) => current.slice(0, -1));
      setCurrentWordIndex((current) => current - 1);
      setCurrentInput(previousInput);
      setMistakeAt(-1);
      onTypingSound?.("type");
      return;
    }

    const nextKey = event.key === " " ? "space" : event.key.toLowerCase();
    setActiveKey(nextKey);
    window.clearTimeout(keyTimerRef.current);
    keyTimerRef.current = window.setTimeout(() => setActiveKey(""), 120);

    if (event.key === " ") {
      event.preventDefault();
      commitCurrentWord();
    }
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
                {passageWords.map((targetWord, wordIndex) => {
                  const isCompleted = wordIndex < currentWordIndex;
                  const isCurrent = wordIndex === currentWordIndex;
                  const typedWord = isCompleted ? completedWords[wordIndex] : isCurrent ? currentInput : "";
                  const characterCount = isCompleted || isCurrent
                    ? Math.max(targetWord.length, typedWord.length)
                    : targetWord.length;
                  const characters = [];

                  for (let characterIndex = 0; characterIndex < characterCount; characterIndex += 1) {
                    if (isCurrent && characterIndex === typedWord.length) {
                      characters.push(<span className="typing-word-caret" key={`caret-${wordIndex}`} />);
                    }

                    const hasTypedCharacter = characterIndex < typedWord.length;
                    const displayCharacter = hasTypedCharacter ? typedWord[characterIndex] : (targetWord[characterIndex] || "");
                    const state = hasTypedCharacter
                      ? (typedWord[characterIndex] === targetWord[characterIndex]
                        ? "is-correct"
                        : `is-error ${isCurrent && characterIndex === mistakeAt ? "is-recent-error" : ""}`)
                      : isCompleted
                        ? "is-missed"
                        : "";

                    characters.push(<span className={state} key={`${wordIndex}-${characterIndex}`}>{displayCharacter}</span>);
                  }

                  if (isCurrent && typedWord.length >= characterCount) {
                    characters.push(<span className="typing-word-caret" key={`caret-end-${wordIndex}`} />);
                  }

                  return (
                    <span className={`typing-word ${isCurrent ? "is-active" : ""}`} key={`${targetWord}-${wordIndex}`}>
                      {characters}
                    </span>
                  );
                })}
              </p>
              <textarea
                ref={inputRef}
                className="typing-capture"
                value={currentInput}
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

            <p className={`typing-hint ${mistakeAt >= 0 ? "is-error" : ""}`} aria-live="polite">
              {mistakeAt >= 0
                ? "Wrong letters stay red — press Space for the next word."
                : started
                  ? "Space: next word · Backspace on empty: previous word."
                  : "Click the line and start typing."}
            </p>
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
