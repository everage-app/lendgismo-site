import { useEffect, useState } from "react";
import LegalLayout from "./LegalLayout";
import Meta from "./_components/Meta";
import { SITE_DOMAIN } from "./_components/constants";

type Prefs = {
  analyticsOptOut: boolean;
  marketingOptOut: boolean;
  saleShareOptOut: boolean;
};

const STORAGE_KEY = "lg_privacy_prefs_v1";

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { analyticsOptOut: false, marketingOptOut: false, saleShareOptOut: false };
}

function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

export default function PrivacyChoices() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [gpc, setGpc] = useState<boolean | null>(null);

  // Honor Global Privacy Control (GPC) automatically
  useEffect(() => {
    const g = (navigator as any)?.globalPrivacyControl === true;
    setGpc(g);
    if (g && !prefs.saleShareOptOut) {
      const next = { ...prefs, saleShareOptOut: true };
      setPrefs(next);
      savePrefs(next);
    }
  }, []);

  useEffect(() => {
    savePrefs(prefs);
    // expose as data attributes for any inline scripts to consume if present later
    document.documentElement.dataset.analyticsOptOut = String(prefs.analyticsOptOut);
    document.documentElement.dataset.marketingOptOut = String(prefs.marketingOptOut);
    document.documentElement.dataset.saleShareOptOut = String(prefs.saleShareOptOut);
  }, [prefs]);

  return (
    <LegalLayout>
      <Meta
        title={`Your Privacy Choices — ${SITE_DOMAIN}`}
        description={`Manage analytics, marketing, and sale/share preferences. We honor Global Privacy Control (GPC).`}
        canonical={`https://${SITE_DOMAIN}/legal/privacy-choices`}
      />

      <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">Your Privacy Choices</h1>
      {gpc !== null && (
        <p className="text-xs text-zinc-400 mb-6">
          Global Privacy Control detected: <strong>{gpc ? "On" : "Off"}</strong>. {gpc ? "We have applied a CPRA sale/share opt-out automatically." : "You can opt out below."}
        </p>
      )}

      <div className="space-y-6">
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-xl font-semibold text-white">Analytics</h2>
          <p className="text-sm text-zinc-300 mb-3">Allow us to measure usage to improve the site and debug issues.</p>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!prefs.analyticsOptOut}
              onChange={(e) => setPrefs((p) => ({ ...p, analyticsOptOut: !e.target.checked }))}
            />
            <span>Enable analytics</span>
          </label>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-xl font-semibold text-white">Marketing</h2>
          <p className="text-sm text-zinc-300 mb-3">Allow limited marketing cookies for retargeting or conversion measurement.</p>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!prefs.marketingOptOut}
              onChange={(e) => setPrefs((p) => ({ ...p, marketingOptOut: !e.target.checked }))}
            />
            <span>Enable marketing cookies</span>
          </label>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-xl font-semibold text-white">CPRA Sale/Share</h2>
          <p className="text-sm text-zinc-300 mb-3">
            Opt out of “sale” or “sharing” of personal information as defined under CPRA. We treat GPC as a valid opt-out signal.
          </p>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={prefs.saleShareOptOut}
              onChange={(e) => setPrefs((p) => ({ ...p, saleShareOptOut: e.target.checked }))}
            />
            <span>Opt out of sale/share</span>
          </label>
        </section>

        <p className="text-sm text-zinc-400">Your choices are stored in this browser and apply to this site only.</p>
        <p className="text-sm text-zinc-400">See our <a className="text-brand-400" href="/legal/privacy">Privacy Policy</a> and <a className="text-brand-400" href="/legal/cookies">Cookie Policy</a>.</p>
      </div>
    </LegalLayout>
  );
}
