import type React from "react";

export default function TrustBelt() {
  const items = [
    { name: "Plaid", note: "Bank & identity" },
    { name: "Stripe", note: "Card & ACH" },
    { name: "QuickBooks", note: "Financials" },
    { name: "DataMerch", note: "Alt credit" },
    { name: "DecisionLogic", note: "Risk & fraud" },
    { name: "Twilio", note: "SMS" },
    { name: "SendGrid", note: "Email" },
    { name: "CSV Import", note: "Bulk ingest" },
    { name: "AWS / Azure / GCP", note: "Any cloud" },
    { name: "PostgreSQL", note: "Primary DB" },
  ];

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-sm uppercase tracking-wider text-zinc-400">Integrations & Data Ecosystem</p>
          <p className="mt-2 text-xs text-zinc-500 max-w-xl mx-auto">From banking and payments to accounting, alternative credit, and fraud detection—production-ready connectors accelerate underwriting and operations.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {items.map((it) => (
            <div
              key={it.name}
              className="rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-white/10 px-3 py-2 text-center hover:border-brand-500/40 hover:from-brand-500/10 hover:to-brand-500/5 transition-colors"
            >
              <div className="text-white font-medium text-sm">{it.name}</div>
              <div className="text-[11px] text-zinc-400">{it.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
