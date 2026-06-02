import type React from "react";
import { Check, ExternalLink } from "lucide-react";

export default function Pricing() {
  const offerDeadline = "June 30, 2026";
  const features = [
    "Full source code & documentation",
    "Live code handoff workshop",
    "Integration guidance for your stack",
    "RBAC, tenants, and architecture walkthrough",
    "Deploy anywhere: AWS, Azure, GCP, or self-hosted",
  ];
  const handoffSteps = [
    "Confirm terms, NDA/PO, and delivery format",
    "Receive GitHub access or secure ZIP within 24 hours",
    "Walk through setup, deployment, and customization priorities",
  ];

  return (
    <section id="pricing" className="py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Simple, transparent engagement</h2>
          <p className="text-zinc-300 max-w-3xl mx-auto">
            One-time license with a hands-on code handoff. Full source code, docs & diagrams, demo data, and expert
            guidance. Multi‑tenant RBAC, CSV onboarding, analytics, and integrations (Plaid, Stripe, Twilio, SendGrid).
            Deploy anywhere: AWS, Azure, Google Cloud, or any modern cloud platform.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
          <div className="md:flex md:items-start md:justify-between md:gap-8">
            <div className="mb-6 md:mb-0">
              <div className="text-white text-xl font-semibold">One-time code handoff</div>
              <div className="text-sm text-brand-300">Limited-time $19,999 all-in offer</div>
              <div className="mt-2 text-xs uppercase tracking-wide text-zinc-400">Offer valid through {offerDeadline}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/contact" className="btn-primary text-center">Request handoff</a>
              <a href="/docs" target="_blank" rel="noopener noreferrer" className="btn-ghost inline-flex items-center justify-center gap-2">
                View docs <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-zinc-300">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <Check size={16} className="text-brand-400 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white mb-3">Handoff path</div>
            <div className="grid md:grid-cols-3 gap-3 text-sm text-zinc-300">
              {handoffSteps.map((step, index) => (
                <div key={step} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="text-xs uppercase tracking-wide text-brand-300 mb-1">Step {index + 1}</div>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mt-4 text-center">
          Need a formal quote or SOW? We can tailor the handoff and optional support window to your team’s needs.
        </p>
      </div>
    </section>
  );
}
