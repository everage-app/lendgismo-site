import type React from "react";

export default function CompareTable() {
  const rows = [
    { label: "Time to market", lendgismo: "Weeks", build: "Months" },
    { label: "Upfront effort", lendgismo: "Low (integrate)", build: "High (greenfield)" },
    { label: "Architecture", lendgismo: "Pre-wired, modular", build: "Design from scratch" },
    { label: "Risk", lendgismo: "Lower (working baseline)", build: "Higher (unknowns)" },
    { label: "Compliance-ready features", lendgismo: "RBAC, audit trails", build: "Plan & implement" },
    { label: "Total ownership", lendgismo: "Full source code", build: "Build & document" },
  ];

  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Build vs. Buy</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 bg-white/5">
            <div className="px-4 py-3 text-sm text-zinc-400">Criteria</div>
            <div className="px-4 py-3 text-sm text-white font-medium">Lendgismo</div>
            <div className="px-4 py-3 text-sm text-zinc-300">Build from scratch</div>
          </div>
          {rows.map((r, i) => (
            <div key={r.label} className={"grid grid-cols-3 " + (i % 2 === 0 ? "bg-white/0" : "bg-white/5") }>
              <div className="px-4 py-3 text-sm text-zinc-300">{r.label}</div>
              <div className="px-4 py-3 text-sm text-white">{r.lendgismo}</div>
              <div className="px-4 py-3 text-sm text-zinc-300">{r.build}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
