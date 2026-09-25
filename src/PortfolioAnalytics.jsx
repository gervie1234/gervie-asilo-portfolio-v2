import { useEffect, useState } from "react";

const endpoint = `${String(import.meta.env.VITE_CMS_API_URL || "").trim().replace(/\/$/, "")}/traffic`;
let session;
let lastPage;
function send(kind, path = window.location.pathname) {
  if (!import.meta.env.PROD || endpoint === "/traffic" || navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;
  try {
    const now = Date.now();
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem("portfolio-visit") || "null"); } catch { /* Storage may be blocked. */ }
    session = saved || session;
    if (!session || now - session.lastSeen > 30 * 60 * 1000) session = { id: crypto.randomUUID() };
    session.lastSeen = now;
    try { sessionStorage.setItem("portfolio-visit", JSON.stringify(session)); } catch { /* In-memory fallback. */ }
    let referrer = "";
    try { const source = new URL(document.referrer); if (source.origin !== location.origin) referrer = source.hostname; } catch { /* Direct visit. */ }
    const device = /iPad|Tablet/i.test(navigator.userAgent) ? "Tablet" : /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
    return fetch(endpoint, { method: "POST", credentials: "omit", keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: crypto.randomUUID(), sessionId: session.id, path, kind, referrer, device })
    }).catch(() => {});
  } catch { /* Tracking never blocks the portfolio. */ }
}

export function usePortfolioPageView(path) {
  useEffect(() => {
    if (lastPage === path) return;
    lastPage = path;
    send("pageview", path);
  }, [path]);
}

export function useViewingNow() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    if (!import.meta.env.PROD || endpoint === "/traffic") return;
    let cancelled = false;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      await send("presence");
      try {
        const response = await fetch(`${endpoint}/viewing-now`, { cache: "no-store" });
        if (!response.ok) throw new Error("Viewer count unavailable");
        const data = await response.json();
        if (!cancelled) setCount(Number.isInteger(data.count) && data.count >= 0 ? data.count : null);
      } catch {
        if (!cancelled) setCount(null);
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => { cancelled = true; window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  return count;
}

export default function PortfolioAnalytics() {
  useEffect(() => {
    function onClick(event) {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.href, location.href);
      if (anchor.matches(".resume-download")) send("resume");
      else if (url.protocol === "mailto:") send("email");
      else if (url.protocol === "tel:") send("phone");
      else if (url.origin === location.origin) {
        if (url.pathname === "/contact" || url.hash === "#contact") send("contact");
        else if (/^\/projects\/[^/]+\/?$/.test(url.pathname)) send("project", url.pathname);
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
