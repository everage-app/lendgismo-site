import type React from "react";

export default function CompareTable() {
  const rows = [
    { label: "Time to market", lendgismo: "Weeks, not months", build: "Months" },
    { label: "Upfront effort", lendgismo: "Low (integrate + customize)", build: "High (greenfield build)" },
    { label: "Architecture", lendgismo: "Pre-wired, modular", build: "Design from scratch" },
    { label: "Risk", lendgismo: "Lower (proven baseline)", build: "Higher (more unknowns)" },
    { label: "Compliance-ready features", lendgismo: "RBAC, audit trails", build: "Plan & implement" },
    { label: "Total ownership", lendgismo: "Full source code, no lock-in", build: "Build & document" },
    { label: "ROI timeline", lendgismo: "Months (live in weeks)", build: "Years (after first full release)" },
  ];

  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Build vs. Buy</h2>
          <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-medium text-emerald-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Recommended: Start from Lendgismo
          </span>
        </div>
        <p className="text-sm text-zinc-400 mb-5 max-w-2xl">
          See how starting from a production-ready lending platform compares to funding a ground-up build.
        </p>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 bg-white/5">
            <div className="px-4 py-3 text-xs md:text-sm text-zinc-400">Criteria</div>
            <div className="px-4 py-3 text-xs md:text-sm text-white font-semibold bg-emerald-500/15 border-x border-emerald-500/30">
              Lendgismo
            </div>
            <div className="px-4 py-3 text-xs md:text-sm text-zinc-300">Build from scratch</div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={
                "grid grid-cols-3 " +
                (i % 2 === 0 ? "bg-white/0" : "bg-white/[0.03]")
              }
            >
              <div className="px-4 py-3 text-xs md:text-sm text-zinc-300">{r.label}</div>
              <div className="px-4 py-3 text-xs md:text-sm text-emerald-100 bg-emerald-500/[0.07] border-x border-emerald-500/20 font-medium">
                {r.lendgismo}
              </div>
              <div className="px-4 py-3 text-xs md:text-sm text-zinc-400">{r.build}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
