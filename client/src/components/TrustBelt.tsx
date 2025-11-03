import type React from "react";

export default function TrustBelt() {
  const items = [
    { name: "Plaid", note: "Bank data" },
    { name: "Stripe", note: "Payments" },
    { name: "Twilio", note: "SMS" },
    { name: "SendGrid", note: "Email" },
    { name: "AWS / Azure / GCP", note: "Any server" },
    { name: "PostgreSQL", note: "Database" },
  ];

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <p className="text-sm uppercase tracking-wider text-zinc-400">Integrations and ecosystem</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {items.map((it) => (
            <div
              key={it.name}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center"
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
