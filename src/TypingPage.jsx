import { useEffect, useMemo, useRef, useState } from "react";

const typingModes = {
  easy: {
    label: "Easy",
    description: "short and familiar sentences",
    passages: [
      "the sun is bright and the sky looks clear today",
      "i like to build simple things that help people",
      "we can learn new skills one small step at a time",
      "good ideas become better when we share them with others",
      "my goal is to make every project easy to use",
      "a clean design helps people find what they need faster",
      "small changes can make a big difference in our work",
      "the best way to improve is to practice every day",
      "our team works together to solve one problem at a time",
      "take a short break and come back with a clear mind",
      "simple code is easier to read change and maintain",
      "every good project starts with a clear and useful plan",
    ],
  },
  medium: {
    label: "Medium",
    description: "longer sentences with work vocabulary",
    passages: [
      "careful planning helps a small team finish complex projects without wasting time or losing focus",
      "a useful product should solve a real problem and remain easy for everyone to understand",
      "clear communication allows designers and developers to turn good ideas into reliable digital experiences",
      "regular practice builds confidence and helps you type longer sentences with fewer mistakes over time",
      "thoughtful feedback can improve the quality of our work before a project reaches its users",
      "strong teams ask better questions test their ideas and learn quickly from every result",
      "modern websites should feel fast remain accessible and work well across many different screen sizes",
      "good documentation helps every team member understand important decisions and complete their tasks with confidence",
    ],
  },
  hard: {
    label: "Hard",
    description: "long technical sentences and advanced words",
    passages: [
      "reliable software requires thoughtful architecture consistent testing clear documentation and careful attention to changing business requirements",
      "experienced developers balance performance security accessibility and maintainability while delivering practical solutions under demanding deadlines",
      "effective information management connects people processes and technology so organizations can make faster and more confident decisions",
      "continuous improvement depends on honest feedback disciplined practice measurable outcomes and the willingness to challenge familiar assumptions",
      "sophisticated interfaces should reduce cognitive effort while preserving clarity responsiveness and consistent behavior across different devices",
      "technical excellence becomes valuable when complex systems remain dependable understandable and genuinely useful to the people operating them",
      "scalable applications require efficient data structures resilient services secure authentication and continuous monitoring across production environments",
      "successful engineering teams communicate uncertainty clearly evaluate competing tradeoffs and adapt their approach when new evidence becomes available",
    ],
  },
};

function createPassage(mode = "easy", previousPassage = "") {
  const passages = typingModes[mode].passages;
  const nextPassage = passages[Math.floor(Math.random() * passages.length)];
  return nextPassage === previousPassage ? createPassage(mode, previousPassage) : nextPassage;
}

const keyboardRows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

function getBestStorageKey(mode) {
  return mode === "easy" ? "portfolio-typing-best-v1" : `portfolio-typing-best-v1-${mode}`;
}

function getStoredBest(mode = "easy") {
  const stored = Number(localStorage.getItem(getBestStorageKey(mode)) || 0);
  return Number.isFinite(stored) ? stored : 0;
}

function TypingPage({ Icon, onTypingSound, onNavigate }) {
  const [mode, setMode] = useState("easy");
  const [passage, setPassage] = useState(() => createPassage("easy"));
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
  const [best, setBest] = useState(() => getStoredBest("easy"));
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
    localStorage.setItem(getBestStorageKey(mode), String(wpm));
  }, [best, finished, mode, wpm]);

  useEffect(() => () => {
    window.clearTimeout(keyTimerRef.current);
    window.clearTimeout(mistakeTimerRef.current);
  }, []);

  const restartTest = () => {
    previousBestRef.current = best;
    setPassage((current) => createPassage(mode, current));
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

  useEffect(() => {
    if (!finished) return undefined;

    const handleResultShortcut = (event) => {
      if (event.key !== "Enter" || event.repeat) return;
      event.preventDefault();
      restartTest();
    };

    window.addEventListener("keydown", handleResultShortcut);
    return () => window.removeEventListener("keydown", handleResultShortcut);
  }, [finished]);

  const selectMode = (nextMode) => {
    if (nextMode === mode) {
      inputRef.current?.focus({ preventScroll: true });
      return;
    }

    const nextBest = getStoredBest(nextMode);
    previousBestRef.current = nextBest;
    setMode(nextMode);
    setBest(nextBest);
    setPassage(createPassage(nextMode));
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

      if (currentWordIndex === passageWords.length - 1 && nextValue === targetWord) {
        setCompletedWords((current) => [...current, nextValue]);
        setCurrentInput("");
        setMistakeAt(-1);
        finishTest();
        return;
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
      onNavigate?.("/#profile");
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
          <nav className="playground-game-switcher" aria-label="Playground games">
            <a className="is-active" href="/playground" aria-current="page">Typing Test</a>
            <a href="/aim-lab">Aim Lab</a>
          </nav>
        </div>
        <p>A quick focus break. Type the line, check your pace, then run it again.</p>
      </header>

      <div className={`typing-lab ${finished ? "is-finished" : ""}`}>
        <div className="typing-shortcuts" aria-label="Keyboard shortcuts">
          {finished
            ? <span><kbd>enter</kbd> try again</span>
            : <span><kbd>tab</kbd> restart</span>}
          <span><kbd>esc</kbd> close</span>
        </div>

        <div className="typing-mode-picker">
          <span className="typing-mode-label">DIFFICULTY</span>
          <div className="typing-mode-buttons" role="group" aria-label="Typing difficulty">
            {Object.entries(typingModes).map(([modeKey, modeConfig]) => (
              <button
                className={mode === modeKey ? "is-active" : ""}
                type="button"
                aria-pressed={mode === modeKey}
                onClick={() => selectMode(modeKey)}
                key={modeKey}
              >
                {modeConfig.label}
              </button>
            ))}
          </div>
          <span className="typing-mode-description">{typingModes[mode].description}</span>
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
            <span className="typing-result-mode">{typingModes[mode].label} MODE</span>
            <strong className="typing-result-score">{wpm}</strong>
            <span className="typing-result-label">WORDS PER MINUTE</span>

            <div className="typing-result-details">
              <div><strong>{accuracy}<sup>%</sup></strong><span>ACCURACY</span></div>
              <div><strong>{rawWpm}</strong><span>RAW</span></div>
            </div>

            <p className={isNewBest ? "is-best" : ""}>
              {isNewBest ? `New personal best · ${wpm} wpm` : `Personal best · ${best} wpm`}
            </p>
            <button className="typing-restart" type="button" aria-keyshortcuts="Enter" onClick={restartTest}>
              <kbd>enter</kbd>
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
