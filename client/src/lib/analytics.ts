const ANALYTICS_ENDPOINT = "https://platform.lendgismo.com/api/ingest";
const SESSION_KEY = "_lga_sid";
const PREFS_KEY = "lg_privacy_prefs_v1";

function hasBrowserApis() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function analyticsOptedOut() {
  if (!hasBrowserApis()) return true;

  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (raw && JSON.parse(raw)?.analyticsOptOut === true) return true;
  } catch {}

  return document.documentElement.dataset.analyticsOptOut === "true";
}

function getSessionId() {
  try {
    let sid = window.sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      window.sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
}

export function trackMarketingPageview(path: string, search = "", title?: string) {
  if (!hasBrowserApis() || analyticsOptedOut()) return;

  const event = {
    type: "pageview",
    path,
    search,
    title: (title || document.title || "").slice(0, 300),
    ts: Date.now(),
    referrer: document.referrer,
    sid: getSessionId(),
  };

  const body = JSON.stringify(event);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    return;
  }

  void fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    credentials: "include",
  }).catch(() => undefined);
}

export function trackMarketingConversion(name: string) {
  if (!hasBrowserApis()) return;

  const params = new URLSearchParams({ source_path: window.location.pathname || "/" });
  if (window.location.search) params.set("source_search", window.location.search);

  trackMarketingPageview(`/__conversion/${name}`, `?${params.toString()}`, `Conversion: ${name}`);
}