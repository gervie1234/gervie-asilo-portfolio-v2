import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { usePortfolioPageView, useViewingNow } from "./PortfolioAnalytics";
import TechStackPage from "./StackPage";
import ContactPage from "./ContactPage";
import ProjectsPage from "./ProjectsPage";
import ProjectDetailsPage from "./ProjectDetailsPage";
import DesignsPage from "./DesignsPage";
import TypingPage from "./TypingPage";
import AimLabPage from "./AimLabPage";
import StackClimberPage from "./StackClimberPage";
import BackendPreloader from "./BackendPreloader";
import { groupDesigns } from "./designCollections";

const navItems = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "projects", label: "Projects", icon: "layers" },
  { id: "experience", label: "Experience", icon: "briefcase" },
  { id: "impact", label: "Engineering", icon: "file" },
  { id: "stack", label: "Tech Stack", icon: "code" },
  { id: "designs", label: "Design Work", icon: "image" },
  { id: "playground", label: "Playground", icon: "play" },
  { id: "contact", label: "Contact", icon: "mail" },
];

const appPagePaths = new Set(["/", "/stack", "/contact", "/projects", "/designs", "/playground", "/aim-lab", "/stack-climber"]);

function isAppPagePath(pathname) {
  return appPagePaths.has(pathname) || /^\/projects\/[^/]+$/.test(pathname);
}

function getRouteKey(url = window.location) {
  return `${url.pathname}${url.search}${url.hash}`;
}

function scrollToRoute(url) {
  if (url.hash) {
    const targetId = decodeURIComponent(url.hash.slice(1));
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }
  }

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

const designVisualDefaults = [
  {
    slug: "air-max-90",
    title: "Air Everywhere",
    category: "PRODUCT CAMPAIGN",
    image: "/designs/sole-district-air-max-90.png",
    alt: "Sole District PH Nike Air Max 90 promotional graphic",
  },
  {
    slug: "air-jordan-1-high",
    title: "Air Jordan 1 High",
    category: "SALE CAMPAIGN",
    image: "/designs/sole-district-air-jordan-1.png",
    alt: "Sole District PH Air Jordan 1 High sale graphic",
  },
  {
    slug: "dunk-low",
    title: "Icon Status",
    category: "PRODUCT SPOTLIGHT",
    image: "/designs/sole-district-dunk-low.png",
    alt: "Sole District PH Nike Dunk Low promotional graphic",
  },
];

const projectVisualDefaults = [
  {
    number: "01",
    slug: "megalight-information-management-system",
    label: "BUSINESS SYSTEM",
    title: "Megalight Information Management System",
    summary: "A full-scale internal platform connecting delivery receipts, sales, payments, warranties, inventory, and branch operations.",
    accent: "#d6ff64",
    kind: "flow",
    image: "/projects/megalight-information-management-system.png",
    imageAlt: "Megalight Information Management System dashboard showing sales, delivery receipts, payments, warranties, and branch performance",
    href: "https://megalight.ph/",
  },
  {
    number: "02",
    slug: "server-monitor",
    label: "BUSINESS SYSTEM",
    title: "Server Monitor",
    summary: "A lightweight .NET 9 dashboard for live server health, history, alerts, and Telegram notifications.",
    accent: "#8ea2ff",
    kind: "signal",
    href: "https://gervieasilo.com/projects/server-monitor",
  },
  {
    number: "03",
    slug: "bahay-prime-realty",
    label: "REAL ESTATE",
    title: "BahayPrime Realty",
    summary: "A polished property experience for discovering premium homes and investments across the Philippines.",
    accent: "#ff825c",
    kind: "key",
    href: "https://gervieasilo.com/projects/bahay-prime-realty",
  },
];

const cmsApiBaseUrl = String(import.meta.env.VITE_CMS_API_URL || "").trim().replace(/\/$/, "");

const defaultProfile = {
  name: "Gervie Asilo",
  headline: "Full-stack Developer | ASP.NET Core & React",
  location: "Metro Manila, Philippines",
  availabilityText: "Open to developer opportunities",
  bioPrimary: "I build business applications with ASP.NET Core, C#, and React.",
  bioSecondary: "My experience includes developing and maintaining an inventory management system used in daily operations for over five years.",
  email: "gervieasilo@gmail.com",
  phone: "0918-400-1878",
  portraitUrl: "/gervie-asilo.jpg",
  resumeUrl: "/Gervie-Asilo-Resume-2026.pdf",
  seoTitle: "Gervie Asilo | Full-stack .NET Developer",
  seoDescription: "Full-stack developer building business applications with ASP.NET Core, C#, React, and SQL. Explore production systems, technical case studies, and my resume.",
};

const defaultSocialLinks = [
  { platform: "GitHub", label: "github", url: "https://github.com/gervie1234" },
  { platform: "LinkedIn", label: "linkedin", url: "https://www.linkedin.com/in/gervieasilo/" },
  { platform: "Facebook", label: "facebook", url: "https://www.facebook.com/gervieasilo" },
  { platform: "Email", label: "email", url: "mailto:gervieasilo@gmail.com" },
];



function telephoneHref(phone = "") {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "#contact";
  if (digits.startsWith("0")) return `tel:+63${digits.slice(1)}`;
  return `tel:+${digits}`;
}

function resolveCmsAsset(assetUrl = "") {
  if (!assetUrl.startsWith("/uploads/")) return assetUrl;
  if (!cmsApiBaseUrl) return assetUrl;
  return `${new URL(cmsApiBaseUrl).origin}${assetUrl}`;
}

function resolveCmsDesignImage(imageUrl = "") {
  return resolveCmsAsset(imageUrl);
}

function resolveCmsProjectImage(imageUrl = "") {
  return resolveCmsAsset(imageUrl);
}

function mapCmsProfile(profile = {}) {
  return {
    ...defaultProfile,
    ...profile,
    portraitUrl: resolveCmsAsset(profile.portraitUrl || defaultProfile.portraitUrl),
    resumeUrl: resolveCmsAsset(profile.resumeUrl || defaultProfile.resumeUrl),
  };
}

function mapCmsDesign(design) {
  const visualDefaults = designVisualDefaults.find((item) => item.slug === design.slug) || {};
  return {
    ...visualDefaults,
    slug: design.slug,
    title: design.title,
    category: design.category?.toUpperCase() || "DESIGN",
    description: design.description || "",
    image: resolveCmsDesignImage(design.imageUrl || visualDefaults.image),
    thumbnail: resolveCmsDesignImage(design.thumbnailUrl || design.imageUrl || visualDefaults.image),
    alt: design.imageAlt || visualDefaults.alt || "",
    href: design.externalUrl || "",
    isFeatured: design.isFeatured,
    collectionKey: design.collectionKey || "",
    collectionTitle: design.collectionTitle || "",
  };
}

function mapCmsProject(project, index) {
  const visualDefaults = projectVisualDefaults.find((item) => item.slug === project.slug) || {};

  return {
    ...visualDefaults,
    slug: project.slug,
    number: project.number || String(index + 1).padStart(2, "0"),
    label: project.category?.toUpperCase() || "PROJECT",
    title: project.title,
    summary: project.summary,
    accent: project.accentColor || visualDefaults.accent || "#d6ff64",
    image: resolveCmsProjectImage(project.featuredImageUrl || visualDefaults.image),
    thumbnail: resolveCmsProjectImage(project.featuredImageThumbnailUrl || project.featuredImageUrl || visualDefaults.image),
    imageAlt: project.featuredImageAlt || visualDefaults.imageAlt || "",
    href: `/projects/${project.slug}`,
    isFeatured: project.isFeatured,
  };
}

const careerImpact = [
  { metric: "5+", unit: "YEARS IN USE", title: "Inventory and business operations", detail: "Inventory, delivery receipts, and reporting in a system I developed and maintained for Megalight.", source: "MEGALIGHT / IMS", href: "/projects/megalight-ims" },
  { metric: "API", unit: "APPLICATION LAYER", title: "Content management and public APIs", detail: "An ASP.NET Core CMS serving project content, contact inquiries, and anonymous traffic analytics to this React portfolio.", source: "PORTFOLIO CMS", href: "/projects/portfolio-cms" }
];


const workHistory = [
  {
    initials: "ML",
    company: "Megalight",
    role: "Programmer / Graphic Designer",
    period: "March 2021 - March 2026",
    highlights: [
      "Developed and maintained an inventory management system covering inventory, delivery receipts, and reporting, used in daily operations for over five years.",
      "Implemented business workflows with ASP.NET Core, Entity Framework Core, and MySQL.",
      "Maintained receipt editing and archive workflows, including validation of line items and permission-controlled access.",
      "Also created product graphics and marketing materials for the business.",
    ],
    tags: ["ASP.NET Core", "EF Core", "MySQL"],
  },
  {
    initials: "GL",
    company: "Globalinens",
    role: "Systems / E-commerce / Graphic Design",
    period: "January 2020 - February 2021",
    highlights: [
      "Built and deployed an internal business system that remained in use for three years.",
      "Designed and optimized 200+ e-commerce product listings and promotional graphics for Shopee and Lazada.",
      "Helped grow the Home de Luxe Shopee Store from ~2K to 150K+ followers through branding, product presentation, and digital content.",
      "Developed the company website and created consistent branding assets across multiple digital platforms.",
    ],
    tags: ["Business System", "E-commerce", "Branding"],
  },
];

const coreStack = ["C# / .NET", "ASP.NET Core", "Entity Framework Core", "MySQL / SQL", "React", "TypeScript", "Git / GitHub", "IIS"];

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

    if (type === "type") {
      playNoiseLayer(context, startTime, {
        duration: 0.016,
        volume: 0.012,
        frequency: 2800,
        filterType: "highpass",
      });
      playKeyLayer(context, startTime, {
        frequency: 430,
        endFrequency: 250,
        duration: 0.018,
        volume: 0.006,
      });
      return;
    }

    if (type === "error") {
      playNoiseLayer(context, startTime, {
        duration: 0.034,
        volume: 0.022,
        frequency: 720,
        q: 1.8,
      });
      playKeyLayer(context, startTime, {
        frequency: 170,
        endFrequency: 88,
        duration: 0.045,
        volume: 0.012,
        wave: "square",
      });
      return;
    }

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
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 5-5 4 4 2-2 5 5" /></>,
    file: <><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4M9 12h6M9 16h5" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V4h6v3M3 12h18M10 12v2h4v-2" /></>,
    code: <><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></>,
    play: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4Z" /></>,
    restart: <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 1 0-1.6 4.4" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    phone: <path d="M7.2 3.5 10 8.3 7.8 10a14 14 0 0 0 6.2 6.2l1.7-2.2 4.8 2.8-.7 3.1c-.2.9-1 1.6-2 1.6C9.4 21 3 14.6 2.5 6.2c0-1 .7-1.8 1.6-2Z" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
    arrow: <><path d="M5 19 19 5M9 5h10v10" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 21h14" /></>,
    soundOn: <><path d="M11 5 6.5 9H3v6h3.5l4.5 4z" /><path d="M15 9.5a4 4 0 0 1 0 5M17.8 6.8a7.5 7.5 0 0 1 0 10.4" /></>,
    soundOff: <><path d="M11 5 6.5 9H3v6h3.5l4.5 4z" /><path d="m16 10 5 5M21 10l-5 5" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function SectionHeading({ number, children, action, actionHref = "#contact" }) {
  return (
    <div className="section-heading">
      <p><span>{number}</span> - {children}</p>
      {action && <a href={actionHref}>{action} <span aria-hidden="true">→</span></a>}
    </div>
  );
}

function Portrait({ profile }) {
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="portrait-wrap">
      <img
        className="portrait portrait-photo"
        src={profile.portraitUrl}
        width="1080"
        height="1100"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        alt={`${profile.name} working at a computer`}
      />
      <div className="portrait-wash" aria-hidden="true" />
      <span className="portrait-index">{initials} / 2026</span>
    </div>
  );
}

function ProjectVisual({ kind, accent, image, thumbnail, imageAlt = "" }) {
  if (image) {
    return (
      <div className="project-visual project-visual-screenshot" style={{ "--accent": accent }}>
        <img
          src={thumbnail || image}
          alt={imageAlt}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            if (image && event.currentTarget.src !== new URL(image, window.location.href).href) {
              event.currentTarget.src = image;
            }
          }}
        />
        <span className="project-visual-badge">LIVE SYSTEM</span>
      </div>
    );
  }

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
      aria-label={`View ${project.title} project`}
    >
      <div className="project-kicker">
        <span>{project.number}</span>
        <span>{project.label}</span>
      </div>
      <ProjectVisual kind={project.kind} accent={project.accent} image={project.image} thumbnail={project.thumbnail} imageAlt={project.imageAlt} />
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

function MobileProjectStage({ projects }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartRef = useRef(null);
  const swipedRef = useRef(false);
  const projectCount = projects.length;

  useEffect(() => {
    if (projectCount > 0 && activeIndex >= projectCount) setActiveIndex(0);
  }, [activeIndex, projectCount]);

  if (projectCount === 0) return <div className="project-stage" aria-label="Selected projects" />;

  const visibleCount = Math.min(3, projectCount);
  const visibleProjects = Array.from({ length: visibleCount }, (_, slot) => ({
    project: projects[(activeIndex + slot) % projectCount],
    slot,
  }));

  const handlePointerDown = (event) => {
    if (window.innerWidth > 640 || event.pointerType === "mouse") return;
    pointerStartRef.current = event.clientX;
    swipedRef.current = false;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerUp = (event) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (start === null || window.innerWidth > 640) return;
    const distance = event.clientX - start;
    if (Math.abs(distance) < 40 || projectCount < 2) return;
    swipedRef.current = true;
    setActiveIndex((current) => (current + (distance < 0 ? 1 : -1) + projectCount) % projectCount);
  };

  const handleClick = (event) => {
    if (!swipedRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    swipedRef.current = false;
  };

  return (
    <div
      className="project-stage"
      role="region"
      aria-label="Selected projects. Swipe left or right to explore."
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { pointerStartRef.current = null; }}
      onClick={handleClick}
    >
      {visibleProjects.map(({ project, slot }) => (
        <ProjectCard key={project.slug || project.title} project={project} index={projectCount === 1 ? 1 : slot} />
      ))}
      {projectCount > 1 && <span className="project-swipe-hint" aria-hidden="true">SWIPE TO EXPLORE</span>}
    </div>
  );
}
function Sidebar({ profile, activeSection, open, setOpen, theme, toggleTheme, soundEnabled, toggleSound, isStackPage = false, isContactPage = false, isProjectsPage = false, isDesignsPage = false, isPlaygroundPage = false }) {
  const viewingNow = useViewingNow();
  const isSecondaryPage = isStackPage || isContactPage || isProjectsPage || isDesignsPage || isPlaygroundPage;
  const closeThenNavigate = () => {
    setOpen(false);
  };

  return (
    <>
      <header className="mobile-header">
        <a className="brand" href={isSecondaryPage ? "/" : "#profile"}>{profile.name.toUpperCase()}</a>
        <button className="icon-button" onClick={() => setOpen(!open)} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </header>
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <a
            className="brand"
            href={isSecondaryPage ? "/" : "#profile"}
            onClick={(event) => closeThenNavigate(event, isSecondaryPage ? "/" : "#profile")}
          >
            {profile.name.toUpperCase()}
          </a>
          <p className="sidebar-caption">{profile.headline.toUpperCase()}<br />{profile.location.toUpperCase()}</p>
        </div>

        <nav aria-label="Main navigation">
          <p className="nav-label">INDEX</p>
          {navItems.map((item, index) => {
            const href = item.id === "stack"
              ? (isSecondaryPage ? "/#stack-preview" : "#stack-preview")
              : item.id === "playground"
                ? "/playground"
              : item.id === "contact"
                ? "/contact"
                : item.id === "projects" && isSecondaryPage
                  ? "/projects"
                  : item.id === "designs" && isSecondaryPage
                    ? "/designs"
                    : isSecondaryPage
                    ? "/#" + item.id
                    : "#" + item.id;
            const isActive = isStackPage
              ? item.id === "stack"
              : isContactPage
                ? item.id === "contact"
                : isProjectsPage
                  ? item.id === "projects"
                  : isDesignsPage
                    ? item.id === "designs"
                    : isPlaygroundPage
                      ? item.id === "playground"
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
            {viewingNow !== null && <div className="viewing-now" aria-label={`${viewingNow} viewing now`}><strong>{viewingNow}</strong> viewing now</div>}
            <p><span /> {profile.availabilityText}</p>
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
          <p className="contact-label">ASP.NET CORE, REACT, SQL<br />BUSINESS APPLICATIONS</p>
          <a className="sidebar-phone" href={telephoneHref(profile.phone)} aria-label={`Call ${profile.name} at ${profile.phone}`}>
            <Icon name="phone" size={14} />
            <span>{profile.phone}</span>
          </a>
          <a
            className="resume-download"
            href={profile.resumeUrl}
            download
            aria-label={`Download ${profile.name}'s résumé`}
          >
            <span>DOWNLOAD RÉSUMÉ</span>
            <Icon name="download" size={15} />
          </a>
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
  const [routeKey, setRouteKey] = useState(() => getRouteKey());
  const routeUrl = new URL(routeKey, window.location.origin);
  const normalizedPath = routeUrl.pathname.replace(/\/+$/, "") || "/";
  usePortfolioPageView(normalizedPath);
  const projectDetailsMatch = normalizedPath.match(/^\/projects\/([^/]+)$/);
  const projectSlug = projectDetailsMatch ? decodeURIComponent(projectDetailsMatch[1]) : "";
  const isProjectDetailsPage = Boolean(projectSlug);
  const isStackPage = normalizedPath === "/stack";
  const isContactPage = normalizedPath === "/contact";
  const isProjectsPage = normalizedPath === "/projects" || isProjectDetailsPage;
  const isDesignsPage = normalizedPath === "/designs";
  const isAimLabPage = normalizedPath === "/aim-lab";
  const isStackClimberPage = normalizedPath === "/stack-climber";
  const isPlaygroundPage = normalizedPath === "/playground" || isAimLabPage || isStackClimberPage;
  const [activeSection, setActiveSection] = useState(isStackPage ? "stack" : isContactPage ? "contact" : isProjectsPage ? "projects" : isDesignsPage ? "designs" : isPlaygroundPage ? "playground" : "profile");
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("portfolio-theme") || "dark");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("portfolio-sound") === "on");
const [profile, setProfile] = useState(defaultProfile);
  const [socialLinks, setSocialLinks] = useState(defaultSocialLinks);

  const [designs, setDesigns] = useState([]);
  const [designsState, setDesignsState] = useState("loading");
  const [projects, setProjects] = useState([]);
  const [projectsState, setProjectsState] = useState("loading");
const featuredProjects = projects.filter((project) => project.isFeatured);
  const featuredDesignGroups = groupDesigns(designs).filter((group) => group.isFeatured);
  const portfolioIsLoading = projectsState === "loading" || designsState === "loading";

useEffect(() => {
    if (!cmsApiBaseUrl) {
      setDesignsState("ready");
      setProjectsState("ready");
      return undefined;
    }

    const controller = new AbortController();

    async function loadPortfolioContent() {
      try {
        const response = await fetch(`${cmsApiBaseUrl}/portfolio`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`CMS returned ${response.status}`);

        const content = await response.json();
        if (!content?.profile || !Array.isArray(content.projects) || !Array.isArray(content.designs)) throw new Error("CMS portfolio response is invalid");
        setProfile(mapCmsProfile(content.profile));
        setSocialLinks(Array.isArray(content.socialLinks) ? content.socialLinks : defaultSocialLinks);

        setDesigns(content.designs.map(mapCmsDesign));
        setDesignsState("ready");
        setProjects(content.projects.map(mapCmsProject));
        setProjectsState("ready");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Unable to load CMS portfolio content.", error);
        setDesigns([]);
        setDesignsState("error");
        setProjects([]);
        setProjectsState("error");
      }
    }

    loadPortfolioContent();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (isProjectDetailsPage) return;
    document.title = profile.seoTitle || `${profile.name} - Portfolio`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", profile.seoDescription || profile.bioPrimary);
  }, [profile, isProjectDetailsPage]);

  const navigateTo = useCallback((href, { historyMode = "push" } = {}) => {
    const nextUrl = href instanceof URL ? href : new URL(href, window.location.href);
    if (nextUrl.origin !== window.location.origin) {
      window.location.assign(nextUrl.href);
      return;
    }

    const nextRouteKey = getRouteKey(nextUrl);
    if (nextRouteKey === routeKey) {
      scrollToRoute(nextUrl);
      return;
    }

    const currentUrl = new URL(routeKey, window.location.origin);
    const pageChanged = currentUrl.pathname !== nextUrl.pathname || currentUrl.search !== nextUrl.search;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rootElement = document.documentElement;

    const commitNavigation = () => {
      if (historyMode === "push") window.history.pushState({}, "", nextUrl.href);
      if (historyMode === "replace") window.history.replaceState({}, "", nextUrl.href);
      flushSync(() => setRouteKey(nextRouteKey));
      scrollToRoute(nextUrl);
    };

    if (!pageChanged || prefersReducedMotion || rootElement.hasAttribute("data-theme-transitioning")) {
      commitNavigation();
      return;
    }

    rootElement.setAttribute("data-route-transitioning", "");
    commitNavigation();
    window.setTimeout(() => rootElement.removeAttribute("data-route-transitioning"), 260);
  }, [routeKey]);

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
    const handleInternalNavigation = (event) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
        || !(event.target instanceof Element)
      ) return;

      const anchor = event.target.closest("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;
      const nextPath = nextUrl.pathname.replace(/\/+$/, "") || "/";
      if (!isAppPagePath(nextPath)) return;

      event.preventDefault();
      navigateTo(nextUrl);
    };

    const handleHistoryNavigation = () => navigateTo(window.location.href, { historyMode: "none" });

    document.addEventListener("click", handleInternalNavigation);
    window.addEventListener("popstate", handleHistoryNavigation);
    return () => {
      document.removeEventListener("click", handleInternalNavigation);
      window.removeEventListener("popstate", handleHistoryNavigation);
    };
  }, [navigateTo]);

  useEffect(() => {
    if (isStackPage || isContactPage || isProjectsPage || isDesignsPage || isPlaygroundPage) return undefined;

    const sections = navItems
      .map(({ id }) => document.getElementById(id === "stack" ? "stack-preview" : id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id === "stack-preview" ? "stack" : visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.05, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isStackPage, isContactPage, isProjectsPage, isDesignsPage, isPlaygroundPage]);

  if (isStackPage || isContactPage || isProjectsPage || isDesignsPage || isPlaygroundPage) {
    const activePage = isStackPage ? "stack" : isContactPage ? "contact" : isProjectsPage ? "projects" : isDesignsPage ? "designs" : "playground";
    return (
      <div className="site-shell">
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <BackendPreloader active={portfolioIsLoading} />
        <Sidebar
          profile={profile}
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
          isDesignsPage={isDesignsPage}
          isPlaygroundPage={isPlaygroundPage}
        />
        <main id="main-content">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          {isProjectsPage
            ? isProjectDetailsPage
              ? <ProjectDetailsPage Icon={Icon} slug={projectSlug} apiBaseUrl={cmsApiBaseUrl} resolveImage={resolveCmsProjectImage} projects={projects} />
              : <ProjectsPage Icon={Icon} ProjectVisual={ProjectVisual} projects={projects} projectsState={projectsState} />
            : isDesignsPage
              ? <DesignsPage Icon={Icon} designs={designs} designsState={designsState} />
              : isPlaygroundPage
                ? isStackClimberPage
                  ? <StackClimberPage Icon={Icon} onGameSound={(type) => soundEnabled && playUiTone(type)} onNavigate={navigateTo} />
                  : isAimLabPage
                  ? <AimLabPage Icon={Icon} onAimSound={(type) => soundEnabled && playUiTone(type)} onNavigate={navigateTo} />
                  : <TypingPage Icon={Icon} onTypingSound={(type) => soundEnabled && playUiTone(type)} onNavigate={navigateTo} />
              : isStackPage
              ? <TechStackPage Icon={Icon} />
              : <ContactPage Icon={Icon} profile={profile} apiBaseUrl={cmsApiBaseUrl} />}
        </main>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <BackendPreloader active={portfolioIsLoading} />
      <Sidebar
        profile={profile}
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
            <p className="eyebrow">BUSINESS APPLICATIONS / WEB DEVELOPMENT</p>
            <Portrait profile={profile} />
          </div>
          <div className="hero-copy">
            <p className="availability"><span /> {profile.availabilityText.toUpperCase()} · {profile.location.toUpperCase()}</p>
            <p className="hero-name">{profile.name}</p>
            <h1>Full-stack<br /><span className="hero-role-accent">.NET Developer.</span></h1>
            <div className="hero-intro">
              <p>{profile.bioPrimary}</p>
              <p>{profile.bioSecondary}</p>
            </div>
            <div className="hero-actions">
              <a className="primary-action" href="#projects">View development projects <Icon name="arrow" size={15} /></a>
              <a className="secondary-action" href={profile.resumeUrl} target="_blank" rel="noreferrer">Download résumé <Icon name="arrow" size={15} /></a>
            </div>
            <div className="social-links" aria-label="Professional profiles and contact">
              {socialLinks.filter((link) => link.platform !== "Facebook").map((link) => {
                const external = /^https?:/i.test(link.url);
                return (
                  <a
                    href={link.url}
                    key={`${link.platform}-${link.url}`}
                    target={external ? "_blank" : undefined}
                    rel={external ? "me noreferrer" : undefined}
                    aria-label={`${profile.name} - ${link.platform}`}
                  >
                    {link.label} <Icon name="arrow" size={12} />
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="metrics content-width" aria-label="Career highlights">
          {[{value:"5+",label:"Years of daily IMS use"},{value:".NET",label:"Backend & business logic"},{value:"React",label:"Web interfaces"},{value:"SQL",label:"Application data"}].map((metric) => (
            <div key={`${metric.value}-${metric.label}`}>
              <strong>{metric.value}<sup>{metric.suffix}</sup></strong>
              <span>{metric.label.toUpperCase()}</span>
            </div>
          ))}
        </section>

        <section className="projects-section content-width section-space" id="projects">
          <SectionHeading number="01" action="view all projects" actionHref="/projects">selected projects</SectionHeading>
          <div className="developer-project-grid">
            {featuredProjects.slice(0, 4).map((project) => (
              <a className="developer-project-card" href={project.href} key={project.slug}>
                <div className="developer-project-image">
                  {project.image && <img src={project.thumbnail || project.image} alt={project.imageAlt || project.title} loading="lazy" />}
                </div>
                <div className="developer-project-copy">
                  <p className="eyebrow">{project.label}</p>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <span className="project-read-link">Read case study <Icon name="arrow" size={15} /></span>
                </div>
              </a>
            ))}
          </div>
          <p className="project-hint">
            {projectsState === "loading" ? "LOADING PUBLISHED PROJECTS" : projectsState === "error" ? "PROJECTS TEMPORARILY UNAVAILABLE" : featuredProjects.length === 0 ? "NO FEATURED PROJECTS" : "SELECT A PROJECT TO EXPLORE THE IMPLEMENTATION"}
          </p>
          <a className="project-mobile-link" href="/projects"><span>VIEW ALL PROJECTS</span><Icon name="arrow" size={15} /></a>
        </section>

        <section className="work-history-section content-width section-space" id="experience">
          <SectionHeading number="02">experience</SectionHeading>
          <p className="work-history-lead">Experience developing and maintaining business applications, with additional work in web development and graphic design.</p>
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
          <SectionHeading number="03">engineering in practice</SectionHeading>
          <div className="impact-intro">
            <p>Explore the systems, implementation decisions, and workflows behind my work.</p>
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
                <footer><a href={item.href}>{item.source} <Icon name="arrow" size={13} /></a></footer>
              </article>
            ))}
          </div>
        </section>

        <section className="stack-section content-width section-space" id="stack-preview">
          <SectionHeading number="04" action="view capabilities" actionHref="/stack">core stack</SectionHeading>
          <div className="stack-layout">
            <p>My core tools for building and maintaining applications, from the database and API to the interface and deployment.</p>
            <div className="skill-cloud" role="list" aria-label="Core technologies">
              {coreStack.map((tool) => <span role="listitem" key={tool}>{tool}</span>)}
            </div>
          </div>
        </section>

        <section className="designs-section content-width section-space" id="designs">
          <SectionHeading number="05" action="view more" actionHref="/designs">graphic design</SectionHeading>
          <p className="designs-lead">A selection of my graphic design work, alongside my software development practice.</p>
          <div className="design-preview-grid">
            {featuredDesignGroups.map((group, index) => {
              const design = group.items[0];
              return (
              <a className="design-preview-card" href={"/designs#" + group.slug} key={group.key}>
                <figure>
                  <div className={`design-preview-image${group.isCollection ? " is-collection is-cover-only" : ""}`}>
                    <img
                      src={design.thumbnail || design.image}
                      alt={design.alt}
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        if (event.currentTarget.src !== new URL(design.image, window.location.href).href) {
                          event.currentTarget.src = design.image;
                        }
                      }}
                    />
                    {group.isCollection && <span className="design-collection-count">{group.items.length} IMAGES</span>}
                  </div>
                  <figcaption>
                    <span>{String(index + 1).padStart(2, "0")} / {group.isCollection ? "COLLECTION" : group.category}</span>
                    <strong>{group.title}</strong>
                  </figcaption>
                </figure>
              </a>
              );
            })}
          </div>
          <a className="designs-mobile-link" href="/designs"><span>VIEW MORE DESIGNS</span><Icon name="arrow" size={15} /></a>
        </section>

        <section className="contact-section content-width" id="contact">
          <p className="eyebrow">LOOKING FOR A FULL-STACK DEVELOPER?</p>
          <h2>Let’s talk about<br />your team.</h2>
          <a className="contact-button" href="/contact?type=hiring">
            <span>DISCUSS AN OPPORTUNITY</span>
            <Icon name="arrow" size={22} />
          </a>
          <footer>
            <span>© 2026 {profile.name.toUpperCase()}</span>
            <span>DESIGNED &amp; BUILT WITH INTENT</span>
            <a href={(isStackPage || isContactPage || isProjectsPage || isDesignsPage) ? "/" : "#profile"}>BACK TO TOP ↑</a>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
