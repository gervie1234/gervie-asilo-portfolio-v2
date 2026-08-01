import { useCallback, useEffect, useRef, useState } from "react";

const BEST_KEY = "portfolio-stack-climber-best-v1";

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getStoredBest() {
  const stored = Number(localStorage.getItem(BEST_KEY) || 0);
  return Number.isFinite(stored) && stored > 0 ? stored : 0;
}

function addPlatform(game) {
  const previous = game.platforms.reduce((highest, platform) => (platform.y < highest.y ? platform : highest));
  const width = 82 + Math.random() * 54;
  const gap = 58 + Math.random() * 24;
  const x = clamp(previous.x + (Math.random() - 0.5) * 210, 18, game.width - width - 18);

  game.platforms.push({
    x,
    y: previous.y - gap,
    width,
    floor: previous.floor + 1,
  });
}

function createGame(width, height) {
  const groundWidth = Math.min(190, width * 0.48);
  const groundY = height - 48;
  const ground = {
    x: (width - groundWidth) / 2,
    y: groundY,
    width: groundWidth,
    floor: 0,
  };
  const game = {
    width,
    height,
    cameraY: 0,
    highestFloor: 0,
    platforms: [ground],
    player: {
      x: width / 2 - 13,
      y: groundY - 30,
      previousY: groundY - 30,
      width: 26,
      height: 30,
      vx: 0,
      vy: 0,
    },
  };

  for (let index = 0; index < 18; index += 1) addPlatform(game);
  return game;
}

function StackClimberPage({ Icon, onGameSound, onNavigate }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const frameRef = useRef(0);
  const controlsRef = useRef({ left: false, right: false });
  const statusRef = useRef("idle");
  const soundRef = useRef(onGameSound);
  const comboTimerRef = useRef(0);
  const [status, setStatus] = useState("idle");
  const [floor, setFloor] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(getStoredBest);
  const bestRef = useRef(best);

  useEffect(() => {
    soundRef.current = onGameSound;
  }, [onGameSound]);

  useEffect(() => {
    bestRef.current = best;
  }, [best]);

  const startRound = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const bounds = canvas.getBoundingClientRect();
    gameRef.current = createGame(bounds.width, bounds.height);
    controlsRef.current.left = false;
    controlsRef.current.right = false;
    statusRef.current = "playing";
    setStatus("playing");
    setFloor(0);
    setCombo(0);
    canvas.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        controlsRef.current.left = true;
      }
      if (key === "arrowright" || key === "d") {
        event.preventDefault();
        controlsRef.current.right = true;
      }
      if (event.key === "Enter" && statusRef.current !== "playing" && !event.repeat) {
        event.preventDefault();
        startRound();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onNavigate?.("/#profile");
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") controlsRef.current.left = false;
      if (key === "arrowright" || key === "d") controlsRef.current.right = false;
    };

    const releaseControls = () => {
      controlsRef.current.left = false;
      controlsRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", releaseControls);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", releaseControls);
    };
  }, [onNavigate, startRound]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");

    const resizeCanvas = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (!gameRef.current || statusRef.current !== "playing") {
        gameRef.current = createGame(bounds.width, bounds.height);
      } else {
        const game = gameRef.current;
        game.width = bounds.width;
        game.height = bounds.height;
        game.player.x = clamp(game.player.x, 8, bounds.width - game.player.width - 8);
        game.platforms.forEach((platform) => {
          platform.x = clamp(platform.x, 18, Math.max(18, bounds.width - platform.width - 18));
        });
      }
    };

    const finishRound = (game) => {
      statusRef.current = "finished";
      setStatus("finished");
      setCombo(0);
      soundRef.current?.("error");

      if (game.highestFloor > bestRef.current) {
        bestRef.current = game.highestFloor;
        setBest(game.highestFloor);
        localStorage.setItem(BEST_KEY, String(game.highestFloor));
      }
    };

    const registerLanding = (game, platform) => {
      if (platform.floor <= game.highestFloor) return;

      const floorsCleared = platform.floor - game.highestFloor;
      game.highestFloor = platform.floor;
      setFloor(platform.floor);
      soundRef.current?.("type");

      window.clearTimeout(comboTimerRef.current);
      if (floorsCleared > 1) {
        setCombo(floorsCleared);
        comboTimerRef.current = window.setTimeout(() => setCombo(0), 900);
      } else {
        setCombo(0);
      }
    };

    const updateGame = (game) => {
      const player = game.player;
      player.previousY = player.y;

      if (controlsRef.current.left && !controlsRef.current.right) player.vx -= 0.48;
      if (controlsRef.current.right && !controlsRef.current.left) player.vx += 0.48;
      if (controlsRef.current.left === controlsRef.current.right) player.vx *= 0.88;
      player.vx = clamp(player.vx, -5.4, 5.4);

      player.x += player.vx;
      if (player.x < 8) {
        player.x = 8;
        player.vx = Math.abs(player.vx) * 0.72;
      }
      if (player.x + player.width > game.width - 8) {
        player.x = game.width - player.width - 8;
        player.vx = -Math.abs(player.vx) * 0.72;
      }

      player.vy += 0.45;
      player.vy = Math.min(player.vy, 12);
      player.y += player.vy;

      if (player.vy > 0) {
        const previousBottom = player.previousY + player.height;
        const nextBottom = player.y + player.height;
        let landingPlatform = null;

        game.platforms.forEach((platform) => {
          const overlaps = player.x + player.width > platform.x + 4 && player.x < platform.x + platform.width - 4;
          const crossedTop = previousBottom <= platform.y + 1 && nextBottom >= platform.y;
          if (overlaps && crossedTop && (!landingPlatform || platform.y < landingPlatform.y)) {
            landingPlatform = platform;
          }
        });

        if (landingPlatform) {
          player.y = landingPlatform.y - player.height;
          player.vy = -10.8;
          registerLanding(game, landingPlatform);
        }
      }

      const desiredCameraY = player.y - game.height * 0.38;
      if (desiredCameraY < game.cameraY) {
        game.cameraY += (desiredCameraY - game.cameraY) * 0.12;
      }

      let highestPlatform = game.platforms.reduce((highest, platform) => (platform.y < highest.y ? platform : highest));
      while (highestPlatform.y > game.cameraY - game.height * 0.72) {
        addPlatform(game);
        highestPlatform = game.platforms[game.platforms.length - 1];
      }

      game.platforms = game.platforms.filter((platform) => platform.y < game.cameraY + game.height + 170);

      if (player.y - game.cameraY > game.height + 70) finishRound(game);
    };

    const drawRoundedRect = (x, y, width, height, radius) => {
      context.beginPath();
      context.roundRect(x, y, width, height, radius);
      context.fill();
      context.stroke();
    };

    const drawGame = (game) => {
      const styles = getComputedStyle(document.documentElement);
      const text = styles.getPropertyValue("--text").trim() || "#f4f3ef";
      const textFaint = styles.getPropertyValue("--text-faint").trim() || "#777";
      const surface = styles.getPropertyValue("--surface-raised").trim() || "#161718";
      const line = styles.getPropertyValue("--line-strong").trim() || "#343638";
      const accent = styles.getPropertyValue("--accent").trim() || "#b9ff38";

      context.clearRect(0, 0, game.width, game.height);
      context.save();
      context.font = "8px monospace";
      context.textBaseline = "bottom";

      game.platforms.forEach((platform) => {
        const screenY = platform.y - game.cameraY;
        if (screenY < -40 || screenY > game.height + 40) return;

        context.fillStyle = surface;
        context.strokeStyle = line;
        context.lineWidth = 1;
        drawRoundedRect(platform.x, screenY, platform.width, platform.floor === 0 ? 12 : 8, 4);

        context.fillStyle = platform.floor > 0 && platform.floor % 5 === 0 ? accent : textFaint;
        context.fillRect(platform.x + 6, screenY, Math.min(26, platform.width - 12), 2);
        context.fillStyle = textFaint;
        context.fillText(String(platform.floor).padStart(2, "0"), platform.x + 2, screenY - 6);
      });

      const player = game.player;
      const playerScreenY = player.y - game.cameraY;
      context.save();
      context.translate(player.x + player.width / 2, playerScreenY + player.height / 2);
      context.rotate(player.vx * 0.025);
      context.fillStyle = accent;
      context.strokeStyle = text;
      context.lineWidth = 1;
      drawRoundedRect(-player.width / 2, -player.height / 2, player.width, player.height, 7);
      context.fillStyle = "#111";
      context.font = "600 8px monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("GA", 0, 1);
      context.restore();
      context.restore();
    };

    const renderFrame = () => {
      const game = gameRef.current;
      if (game) {
        if (statusRef.current === "playing") updateGame(game);
        drawGame(game);
      }
      frameRef.current = window.requestAnimationFrame(renderFrame);
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    resizeCanvas();
    renderFrame();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameRef.current);
      window.clearTimeout(comboTimerRef.current);
    };
  }, []);

  const setTouchControl = (direction, active) => {
    controlsRef.current[direction] = active;
  };

  return (
    <section className="typing-page climber-page content-width" aria-labelledby="climber-title">
      <header className="typing-page-header">
        <div>
          <a className="page-back-link" href="/#profile">← BACK TO PORTFOLIO</a>
          <p className="eyebrow">07 / PLAYGROUND</p>
          <h1 id="climber-title">Stack <span>Climber.</span></h1>
          <nav className="playground-game-switcher" aria-label="Playground games">
            <a href="/playground">Typing</a>
            <a href="/aim-lab">Aim Lab</a>
            <a className="is-active" href="/stack-climber" aria-current="page">Climber</a>
          </nav>
        </div>
        <p>Build momentum, land cleanly, and climb the endless stack without falling below the screen.</p>
      </header>

      <div className={`climber-lab is-${status}`}>
        <div className="climber-toolbar">
          <div className="typing-shortcuts" aria-label="Game controls">
            <span><kbd>a</kbd><kbd>d</kbd> move</span>
            <span><kbd>enter</kbd> {status === "finished" ? "retry" : "start"}</span>
            <span><kbd>esc</kbd> close</span>
          </div>

          <div className="climber-stats" aria-live="polite">
            <div><strong>{floor}</strong><span>FLOOR</span></div>
            <div><strong>{combo > 1 ? `×${combo}` : "—"}</strong><span>COMBO</span></div>
            <div><strong>{best || "—"}</strong><span>BEST</span></div>
          </div>
        </div>

        <div className="climber-arena">
          <canvas ref={canvasRef} tabIndex="0" aria-label="Stack Climber game area" />

          {status === "idle" && (
            <div className="climber-message">
              <span className="climber-avatar">GA</span>
              <h2>Climb the stack.</h2>
              <p>Auto-jump is on. Steer left and right, then keep the platforms beneath you.</p>
              <button className="typing-restart" type="button" aria-keyshortcuts="Enter" onClick={startRound}>
                <kbd>enter</kbd>
                Start climbing
              </button>
            </div>
          )}

          {status === "finished" && (
            <div className="climber-message climber-result" aria-live="polite">
              <span className="typing-result-mode">RUN COMPLETE</span>
              <strong>{floor}</strong>
              <span>HIGHEST FLOOR</span>
              <p>{floor >= best && floor > 0 ? "Personal best reached." : `Personal best · floor ${best}`}</p>
              <button className="typing-restart" type="button" aria-keyshortcuts="Enter" onClick={startRound}>
                <kbd>enter</kbd>
                Try again
              </button>
            </div>
          )}

          <div className="climber-touch-controls" aria-label="Touch movement controls">
            <button
              type="button"
              aria-label="Move left"
              onPointerDown={() => setTouchControl("left", true)}
              onPointerUp={() => setTouchControl("left", false)}
              onPointerCancel={() => setTouchControl("left", false)}
              onPointerLeave={() => setTouchControl("left", false)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Move right"
              onPointerDown={() => setTouchControl("right", true)}
              onPointerUp={() => setTouchControl("right", false)}
              onPointerCancel={() => setTouchControl("right", false)}
              onPointerLeave={() => setTouchControl("right", false)}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <footer className="typing-page-footer">
        <span>ONE MORE FLOOR.</span>
        <a href="/#contact">LET’S WORK TOGETHER <Icon name="arrow" size={12} /></a>
      </footer>
    </section>
  );
}

export default StackClimberPage;
