const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SESSION_KEY = "site_analytics_session_id";

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function isAdminPath(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/");
}

function postAnalytics(body: {
  event_type: "page_view" | "click";
  path: string;
  referrer: string | null;
  user_agent: string | null;
  session_id: string;
}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  void fetch(`${SUPABASE_URL}/rest/v1/site_analytics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    // ignore network / RLS failures
  });
}

/** Fire-and-forget page view. Never throws; no-ops if env missing or SSR. */
export function trackPageView(path?: string): void {
  if (typeof window === "undefined") return;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  const resolvedPath = path ?? window.location.pathname;
  if (isAdminPath(resolvedPath)) return;

  const session_id = getSessionId();
  if (!session_id) return;

  postAnalytics({
    event_type: "page_view",
    path: resolvedPath,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null,
    session_id,
  });
}

function clickLabel(el: Element): string {
  const aria = el.getAttribute("aria-label")?.trim();
  if (aria) return aria.slice(0, 80);

  if (el instanceof HTMLAnchorElement) {
    const href = el.getAttribute("href")?.trim();
    if (href) return href.slice(0, 120);
  }

  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 80);

  const id = el.id?.trim();
  if (id) return `#${id}`;

  return el.tagName.toLowerCase();
}

function closestClickable(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null;
  return target.closest(
    "a[href], button, [role='button'], input[type='submit'], input[type='button'], summary",
  );
}

/** Record a single UI click on the public site. */
export function trackClick(path?: string, label?: string): void {
  if (typeof window === "undefined") return;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  const pagePath = path ?? window.location.pathname;
  if (isAdminPath(pagePath)) return;

  const session_id = getSessionId();
  if (!session_id) return;

  const resolvedPath = label ? `${pagePath} · ${label}` : pagePath;

  postAnalytics({
    event_type: "click",
    path: resolvedPath.slice(0, 200),
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null,
    session_id,
  });
}

let clickTrackerInstalled = false;
let lastClickAt = 0;

/** Listen for meaningful clicks site-wide (links, buttons). Call once from root. */
export function installClickTracker(): void {
  if (typeof window === "undefined") return;
  if (clickTrackerInstalled) return;
  clickTrackerInstalled = true;

  document.addEventListener(
    "click",
    (event) => {
      const el = closestClickable(event.target);
      if (!el) return;
      if (isAdminPath(window.location.pathname)) return;

      const now = Date.now();
      if (now - lastClickAt < 250) return;
      lastClickAt = now;

      trackClick(window.location.pathname, clickLabel(el));
    },
    { capture: true, passive: true },
  );
}
