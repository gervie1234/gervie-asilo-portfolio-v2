import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import TechStackPage from "./StackPage";
import ContactPage from "./ContactPage";
import ProjectsPage from "./ProjectsPage";

const navItems = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "projects", label: "Projects", icon: "layers" },
  { id: "experience", label: "Experience", icon: "briefcase" },
  { id: "impact", label: "Impact", icon: "file" },
  { id: "stack", label: "Stack", icon: "code" },
  { id: "contact", label: "Contact", icon: "mail" },
];

const projects = [
  {
    number: "01",
    label: "LANDING PAGE",
    title: "Megalight Website",
    summary: "A nationwide solar-lighting website shaped for project-ready, DPWH-compliant solutions.",
    accent: "#d6ff64",
    kind: "flow",
    href: "https://megalight.ph/",
  },
  {
    number: "02",
    label: "BUSINESS SYSTEM",
    title: "Server Monitor",
    summary: "A lightweight .NET 9 dashboard for live server health, history, alerts, and Telegram notifications.",
    accent: "#8ea2ff",
    kind: "signal",
    href: "https://gervieasilo.com/projects/server-monitor",
  },
  {
    number: "03",
    label: "REAL ESTATE",
    title: "BahayPrime Realty",
    summary: "A polished property experience for discovering premium homes and investments across the Philippines.",
    accent: "#ff825c",
    kind: "key",
    href: "https://gervieasilo.com/projects/bahay-prime-realty",
  },
];

const careerImpact = [
  {
    metric: "5+",
    unit: "YEARS",
    title: "Business information system ownership",
    detail: "Developed and maintained Megalight’s full-scale Information Management System supporting company-wide business operations.",
    source: "MEGALIGHT · BUSINESS SYSTEM",
  },
  {
    metric: "200+",
    unit: "LISTINGS",
    title: "E-commerce execution",
    detail: "Designed and optimized product listings and promotional graphics across Shopee and Lazada.",
    source: "GLOBALINENS · E-COMMERCE",
  },
  {
    metric: "2K→150K+",
    unit: "FOLLOWERS",
    title: "Audience growth",
    detail: "Helped grow the Home de Luxe Shopee Store through branding, product presentation, and consistent digital content.",
    source: "HOME DE LUXE · BRAND GROWTH",
  },
];

const workHistory = [
  {
    initials: "ML",
    company: "Megalight",
    role: "Programmer / Graphic Designer",
    period: "March 2021 — March 2026",
    highlights: [
      "Developed and maintained a full-scale Information Management System (IMS) supporting company-wide business operations for 5+ years.",
      "Created high-impact marketing materials and social media campaigns that improved online engagement and strengthened brand visibility.",
      "Automated manual business processes, reducing operational workload and improving efficiency.",
      "Delivered reliable, maintainable software solutions that continued to support the company’s growth over multiple years.",
    ],
    tags: ["Information Management", "Business Systems", "Automation"],
  },
  {
    initials: "GL",
    company: "Globalinens",
    role: "Systems / E-commerce / Graphic Design",
    period: "January 2020 — February 2021",
    highlights: [
      "Built and deployed a custom internal business system that streamlined operations and remained in use for 3 years.",
      "Designed and optimized 200+ e-commerce product listings and promotional graphics for Shopee and Lazada.",
      "Helped grow the Home de Luxe Shopee Store from ~2K to 150K+ followers through branding, product presentation, and digital content.",
      "Developed the company website and created consistent branding assets across multiple digital platforms.",
    ],
    tags: ["Business System", "E-commerce", "Branding"],
  },
];

const coreStack = [
  "React",
  "TypeScript",
  "C# / .NET",
  "ASP.NET Core",
  "MySQL / SQL",
  "Flutter",
  "Git / GitHub",
  "Azure / IIS",
];

let sharedAudioContext;
let sharedNoiseBuffer;
let lastHoverSoundAt = 0;

function getMechanicalNoise(context) {
  if (sharedNoiseBuffer) return sharedNoiseBuffer;

  const frameCount = Math.floor(context.sampleRate * 0.08);
  sharedNoiseBuffer = context.createBuffer(1, frameCount, context.sampleRate);
  const samples = sharedNoiseBuffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    const decay = 1 - index / frameCount;
    samples[index] = (Math.random() * 2 - 1) * decay;
  }

  return sharedNoiseBuffer;
}

function playNoiseLayer(context, startTime, { duration, volume, frequency, filterType = "bandpass", q = 1 }) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = getMechanicalNoise(context);
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, startTime);
  filter.Q.setValueAtTime(q, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(startTime);
  source.stop(startTime + duration);
}

function playKeyLayer(context, startTime, { frequency, endFrequency, duration, volume, wave = "triangle" }) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function playUiTone(type) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (type === "hover") {
    const now = performance.now();
    if (now - lastHoverSoundAt < 55) return;
    lastHoverSoundAt = now;
  }

  try {
    sharedAudioContext ||= new AudioContextClass();
    if (sharedAudioContext.state === "suspended") sharedAudioContext.resume();

    const context = sharedAudioContext;
    const startTime = context.currentTime + 0.002;

    if (type === "hover") {
      playNoiseLayer(context, startTime, {
        duration: 0.018,
        volume: 0.007,
        frequency: 3100,
        filterType: "highpass",
      });
      playKeyLayer(context, startTime, {
        frequency: 1280,
        endFrequency: 760,
        duration: 0.016,
        volume: 0.0045,
      });
      return;
    }

    // A short downstroke plus release creates a tactile mouse/key switch click.
    playNoiseLayer(context, startTime, {
      duration: 0.03,
      volume: 0.025,
      frequency: 1850,
      q: 1.35,
    });
    playKeyLayer(context, startTime, {
      frequency: type === "disable" ? 190 : 240,
      endFrequency: 115,
      duration: 0.022,
      volume: 0.012,
      wave: "square",
    });
    playNoiseLayer(context, startTime + 0.034, {
      duration: 0.016,
      volume: 0.012,
      frequency: 3600,
      filterType: "highpass",
    });

    if (type === "enable") {
      playKeyLayer(context, startTime + 0.046, {
        frequency: 520,
        endFrequency: 680,
        duration: 0.038,
        volume: 0.008,
        wave: "sine",
      });
    }
  } catch {
    // Audio is optional; unsupported or blocked contexts should remain silent.
  }
}

function Icon({ name, size = 17 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5.5 20c.7-4 2.9-6 6.5-6s5.8 2 6.5 6" /></>,
    layers: <><path d="m12 3-9 5 9 5 9-5-9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    file: <><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4M9 12h6M9 16h5" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2" /></>,
    code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
    arrow: <><path d="M5 19 19 5M9 5h10v10" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    soundOn: <><path d="M11 5 6.5 9H3v6h3.5l4.5 4z" /><path d="M15 9.5a4 4 0 0 1 0 5M17.8 6.8a7.5 7.5 0 0 1 0 10.4" /></>,
    soundOff: <><path d="M11 5 6.5 9H3v6h3.5l4.5 4z" /><path d="m16 10 5 5M21 10l-5 5" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function SectionHeading({ number, children, action, actionHref = "#contact" }) {
  return (
    <div className="section-heading">
      <p><span>{number}</span> — {children}</p>
      {action && <a href={actionHref}>{action} <span aria-hidden="true">→</span></a>}
    </div>
  );
}

function Portrait() {
  return (
    <div className="portrait-wrap">
      <img
        className="portrait portrait-photo"
        src="/gervie-asilo.jpg"
        width="1080"
        height="1100"
        alt="Gervie Asilo working at his computer"
      />
      <div className="portrait-wash" aria-hidden="true" />
      <span className="portrait-index">GA / 2026</span>
    </div>
  );
}

function ProjectVisual({ kind, accent }) {
  if (kind === "flow") {
    return (
      <div className="project-visual flow-visual" style={{ "--accent": accent }}>
        <div className="mini-toolbar"><span /><span /><span /></div>
        <div className="flow-grid">
          <div className="flow-big">ML<small>WEB</small></div>
          <div className="flow-list"><i /><i /><i /></div>
        </div>
      </div>
    );
  }

  if (kind === "key") {
    return (
      <div className="project-visual key-visual" style={{ "--accent": accent }}>
        <span className="balance-label">REALTY</span>
        <strong>PH.</strong>
        <div className="chart-bars">
          {[46, 70, 38, 82, 60, 92, 55].map((height, index) => (
            <i key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="project-visual signal-visual" style={{ "--accent": accent }}>
      <div className="signal-orbit"><i /><i /><i /></div>
      <div className="signal-copy"><span>ALL SYSTEMS</span><strong>OPERATIONAL</strong></div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  return (
    <a
      className={`project-card project-card-${index + 1}`}
      href={project.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`View ${project.title} project`}
    >
      <div className="project-kicker">
        <span>{project.number}</span>
        <span>{project.label}</span>
      </div>
      <ProjectVisual kind={project.kind} accent={project.accent} />
      <div className="project-copy">
        <div>
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
        </div>
        <span className="round-arrow"><Icon name="arrow" size={15} /></span>
      </div>
    </a>
  );
}

function Sidebar({ activeSection, open, setOpen, theme, toggleTheme, soundEnabled, toggleSound, isStackPage = false, isContactPage = false, isProjectsPage = false }) {
  const [copied, setCopied] = useState(false);
  const siteUrl = "https://gervieasilo.com";

  const closeThenNavigate = (event, href) => {
    const isPrimaryClick = event.button === 0;
    const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const isMobileDrawer = window.matchMedia("(max-width: 920px)").matches;

    if (!open || !isMobileDrawer || !isPrimaryClick || hasModifier) {
      setOpen(false);
      return;
    }

    event.preventDefault();
    setOpen(false);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      window.location.assign(href);
    }, prefersReducedMotion ? 0 : 190);
  };

  const copyWebsite = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = siteUrl;
    }
  };

  return (
    <>
      <header className="mobile-header">
        <a className="brand" href={(isStackPage || isContactPage || isProjectsPage) ? "/" : "#profile"}>GERVIE ASILO</a>
        <button className="icon-button" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </header>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <a
            className="brand"
            href={(isStackPage || isContactPage || isProjectsPage) ? "/" : "#profile"}
            onClick={(event) => closeThenNavigate(event, (isStackPage || isContactPage || isProjectsPage) ? "/" : "#profile")}
          >
            GERVIE ASILO
          </a>
          <p className="sidebar-caption">FULL-STACK DEVELOPER + DESIGNER<br />METRO MANILA, PHILIPPINES</p>
        </div>

        <nav aria-label="Main navigation">
          <p className="nav-label">INDEX</p>
          {navItems.map((item, index) => {
            const isSecondaryPage = isStackPage || isContactPage || isProjectsPage;
            const href = item.id === "stack"
              ? "/stack"
              : item.id === "contact"
                ? "/contact"
                : item.id === "projects" && isSecondaryPage
                  ? "/projects"
                  : isSecondaryPage
                    ? "/#" + item.id
                    : "#" + item.id;
            const isActive = isStackPage
              ? item.id === "stack"
              : isContactPage
                ? item.id === "contact"
                : isProjectsPage
                  ? item.id === "projects"
                  : activeSection === item.id;
            return (
              <a
                key={item.id}
                href={href}
                className={isActive ? "active" : ""}
                onClick={(event) => closeThenNavigate(event, href)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                <small>{String(index + 1).padStart(2, "0")}</small>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="presence">
            <div className="avatar-stack" aria-hidden="true">
              <i>G</i><i>A</i><i>UI</i><i>+</i>
            </div>
            <p><span /> Available for freelance projects</p>
          </div>
          <div className="sidebar-actions">
            <button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <button
              className={`icon-button ${soundEnabled ? "is-sound-on" : ""}`}
              type="button"
              data-sound-toggle
              onClick={toggleSound}
              aria-label={soundEnabled ? "Disable interface sounds" : "Enable interface sounds"}
              aria-pressed={soundEnabled}
            >
              <Icon name={soundEnabled ? "soundOn" : "soundOff"} />
            </button>
            <a
              className="icon-button"
              href="/contact"
              aria-label="Open contact page"
              onClick={(event) => closeThenNavigate(event, "/contact")}
            >
              <Icon name="mail" />
            </a>
          </div>
          <p className="contact-label">WEB APPS, BUSINESS SYSTEMS<br />DESIGN &amp; TECHNICAL SUPPORT</p>
          <button className="email-copy" onClick={copyWebsite}>
            <span>gervieasilo.com</span>
            <Icon name={copied ? "check" : "copy"} size={15} />
          </button>
          <p className="copy-status" aria-live="polite">{copied ? "Website URL copied" : ""}</p>
        </div>
      </aside>
      <button
        className={`sidebar-scrim ${open ? "sidebar-scrim-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-label="Close navigation"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
      />
    </>
  );
}

function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const isStackPage = normalizedPath === "/stack";
  const isContactPage = normalizedPath === "/contact";
  const isProjectsPage = normalizedPath === "/projects";
  const [activeSection, setActiveSection] = useState(isStackPage ? "stack" : isContactPage ? "contact" : isProjectsPage ? "projects" : "profile");
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("portfolio-theme") || "dark");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("portfolio-sound") === "on");

  const toggleSound = () => {
    const nextEnabled = !soundEnabled;
    playUiTone(nextEnabled ? "enable" : "disable");
    setSoundEnabled(nextEnabled);
  };

  const toggleTheme = (event) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const direction = nextTheme === "light" ? "expand" : "contract";
    const rootElement = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    if (rootElement.hasAttribute("data-theme-transitioning")) return;

    const buttonRect = event.currentTarget.getBoundingClientRect();
    const x = buttonRect.left + buttonRect.width / 2;
    const y = buttonRect.top + buttonRect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    rootElement.style.setProperty("--theme-x", `${x}px`);
    rootElement.style.setProperty("--theme-y", `${y}px`);
    rootElement.style.setProperty("--theme-radius", `${endRadius}px`);
    rootElement.setAttribute("data-theme-transitioning", "");
    rootElement.setAttribute("data-theme-transition", direction);

    const finishTransition = () => {
      rootElement.removeAttribute("data-theme-transitioning");
      rootElement.removeAttribute("data-theme-transition");
    };

    if (!document.startViewTransition) {
      const reveal = document.createElement("span");
      reveal.className = `theme-reveal-fallback is-${direction}ing`;
      reveal.style.setProperty("--reveal-x", `${x}px`);
      reveal.style.setProperty("--reveal-y", `${y}px`);
      reveal.style.setProperty("--reveal-size", `${endRadius * 2}px`);
      reveal.style.setProperty(
        "--reveal-color",
        direction === "expand" ? "#efeee9" : "#efeee9",
      );
      document.body.appendChild(reveal);

      if (direction === "contract") {
        void reveal.offsetWidth;
        flushSync(() => setTheme(nextTheme));
        requestAnimationFrame(() => reveal.classList.add("is-active"));
        window.setTimeout(() => {
          reveal.remove();
          finishTransition();
        }, 540);
      } else {
        requestAnimationFrame(() => reveal.classList.add("is-active"));
        window.setTimeout(() => flushSync(() => setTheme(nextTheme)), 500);
        window.setTimeout(() => reveal.classList.add("is-fading"), 535);
        window.setTimeout(() => {
          reveal.remove();
          finishTransition();
        }, 730);
      }
      return;
    }

    try {
      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(nextTheme));
      });

      transition.finished.finally(finishTransition);
    } catch {
      finishTransition();
      setTheme(nextTheme);
    }
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("portfolio-sound", soundEnabled ? "on" : "off");

    if (!soundEnabled) return undefined;

    const handlePointerOver = (event) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest("a, button");
      if (!control || control.disabled || control.contains(event.relatedTarget)) return;
      playUiTone("hover");
    };

    const handleClick = (event) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest("a, button, input, select, textarea");
      if (!control || control.disabled || control.hasAttribute("data-sound-toggle")) return;
      playUiTone("click");
    };

    document.addEventListener("pointerover", handlePointerOver);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("click", handleClick, true);
    };
  }, [soundEnabled]);

  useEffect(() => {
    if (isStackPage || isContactPage || isProjectsPage) return undefined;

    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.05, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isStackPage, isContactPage, isProjectsPage]);

  if (isStackPage || isContactPage || isProjectsPage) {
    const activePage = isStackPage ? "stack" : isContactPage ? "contact" : "projects";
    return (
      <div className="site-shell">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <Sidebar
          activeSection={activePage}
          open={menuOpen}
          setOpen={setMenuOpen}
          theme={theme}
          toggleTheme={toggleTheme}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          isStackPage={isStackPage}
          isContactPage={isContactPage}
          isProjectsPage={isProjectsPage}
        />
        <main id="main-content">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          {isProjectsPage
            ? <ProjectsPage Icon={Icon} ProjectVisual={ProjectVisual} projects={projects} />
            : isStackPage
              ? <TechStackPage Icon={Icon} />
              : <ContactPage Icon={Icon} />}
        </main>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar
        activeSection={activeSection}
        open={menuOpen}
        setOpen={setMenuOpen}
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />

      <main id="main-content">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <section className="hero content-width" id="profile">
          <div className="hero-art">
            <p className="eyebrow">FULL-STACK / DESIGN / SYSTEMS</p>
            <Portrait />
          </div>
          <div className="hero-copy">
            <p className="availability"><span /> AVAILABLE FOR FREELANCE PROJECTS · METRO MANILA</p>
            <h1>Gervie Asilo</h1>
            <div className="hero-intro">
              <p>I’m a full-stack software developer and graphic designer building practical digital solutions with clean, modern design.</p>
              <p>I connect interfaces, backend systems, branding, and workflows so projects are easier to launch, manage, and improve.</p>
            </div>
            <div className="social-links" aria-label="Social links">
              <a href="https://gervieasilo.com/" target="_blank" rel="noreferrer">website <Icon name="arrow" size={12} /></a>
              <a href="https://gervieasilo.com/projects" target="_blank" rel="noreferrer">projects <Icon name="arrow" size={12} /></a>
              <a href="https://gervieasilo.com/gallery" target="_blank" rel="noreferrer">gallery <Icon name="arrow" size={12} /></a>
            </div>
          </div>
        </section>

        <section className="metrics content-width" aria-label="Career highlights">
          <div><strong>6<sup>+</sup></strong><span>YEARS OF<br />EXPERIENCE</span></div>
          <div><strong>7<sup>+</sup></strong><span>PUBLISHED<br />PROJECTS</span></div>
          <div><strong>100<sup>%</sup></strong><span>OUTCOME-FOCUSED<br />BUILDS</span></div>
          <div><strong>3<sup>IN 1</sup></strong><span>CODE · DESIGN<br />SYSTEMS</span></div>
        </section>

        <section className="projects-section content-width section-space" id="projects">
          <SectionHeading number="01" action="view all projects" actionHref="/projects">selected projects</SectionHeading>
          <div className="project-stage">
            {projects.map((project, index) => <ProjectCard key={project.title} project={project} index={index} />)}
          </div>
          <p className="project-hint">HOVER TO EXPLORE <span aria-hidden="true">↗</span></p>
          <a className="project-mobile-link" href="/projects"><span>VIEW ALL PROJECTS</span><Icon name="arrow" size={15} /></a>
        </section>

        <section className="work-history-section content-width section-space" id="experience">
          <SectionHeading number="02">experience</SectionHeading>
          <p className="work-history-lead">Experience shaped by building business systems, digital storefronts, brand assets, and reliable day-to-day workflows.</p>
          <div className="work-timeline">
            {workHistory.map((job) => (
              <article className="work-entry" key={job.company}>
                <div className="work-marker" aria-hidden="true">{job.initials}</div>
                <div className="work-entry-body">
                  <header className="work-entry-header">
                    <div>
                      <h3>{job.company}</h3>
                      <p>{job.role}</p>
                    </div>
                    <time>{job.period}</time>
                  </header>
                  <ul>
                    {job.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
                  <div className="work-tags" aria-label={job.company + " skills"}>
                    {job.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="impact-section content-width section-space" id="impact">
          <SectionHeading number="03">proven impact</SectionHeading>
          <div className="impact-intro">
            <p>Concrete results from real work—built for hiring managers who want evidence, not generic claims.</p>
          </div>
          <div className="impact-grid">
            {careerImpact.map((item) => (
              <article className="impact-card" key={item.title}>
                <div className="impact-metric">
                  <strong>{item.metric}</strong>
                  <span>{item.unit}</span>
                </div>
                <div className="impact-copy">
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
                <footer>{item.source}</footer>
              </article>
            ))}
          </div>
        </section>

        <section className="stack-section content-width section-space" id="stack-preview">
          <SectionHeading number="04" action="view all stacks" actionHref="/stack">core stack</SectionHeading>
          <div className="stack-layout">
            <p>My primary build path from interface to deployment—the tools I reach for most often when shipping practical products.</p>
            <div className="skill-cloud" role="list" aria-label="Core technologies">
              {coreStack.map((tool) => <span role="listitem" key={tool}>{tool}</span>)}
            </div>
          </div>
        </section>

        <section className="contact-section content-width" id="contact">
          <p className="eyebrow">HAVE A PROJECT IN MIND?</p>
          <h2>Let’s build<br />something useful.</h2>
          <a className="contact-button" href="/contact">
            <span>START A CONVERSATION</span>
            <Icon name="arrow" size={22} />
          </a>
          <footer>
            <span>© 2026 GERVIE ASILO</span>
            <span>DESIGNED &amp; BUILT WITH INTENT</span>
            <a href={(isStackPage || isContactPage || isProjectsPage) ? "/" : "#profile"}>BACK TO TOP ↑</a>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
