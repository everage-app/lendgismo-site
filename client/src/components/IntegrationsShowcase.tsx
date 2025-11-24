import type React from 'react'
import { Link } from 'wouter'
import { ShieldCheck, BarChart3, Calculator, Zap, ArrowRight } from 'lucide-react'
import IntegrationsStatusBar from '@/components/IntegrationsStatusBar'

export default function IntegrationsShowcase() {
  const cards = [
    {
      name: 'Zapier',
      icon: Zap,
      blurb: 'Connect to 6,000+ apps with no-code automation. Real-time webhooks for applications, decisions, and payments.',
      bullets: [
        'No-code workflow automation',
        'Salesforce, HubSpot, Slack, QuickBooks & more',
        'Secure webhooks with HMAC verification'
      ],
      docs: '/docs/41_zapier-integration',
      demo: '/docs/demo/integrations',
      badge: 'New'
    },
    {
      name: 'QuickBooks',
      icon: Calculator,
      blurb: 'Pull Profit & Loss, Balance Sheet, and Cash Flow to automate financial review and speed underwriting.',
      bullets: [
        'OAuth flow included (sandbox-ready)',
        'Company info + core financial reports',
        'Simple endpoints and clear responses'
      ],
      docs: '/docs/40_integrations#quickbooks-accounting',
      demo: '/docs/demo/integrations'
    },
    {
      name: 'DataMerch',
      icon: BarChart3,
      blurb: 'Alternative credit data and business insights—great for thin-file applicants and pre‑qualification.',
      bullets: [
        'Quick score API + full analysis report',
        'Risk factors and insight summaries',
        'Safe mock mode for demos'
      ],
      docs: '/docs/40_integrations#datamerch-alternative-data',
      demo: '/docs/demo/integrations'
    },
    {
      name: 'DecisionLogic',
      icon: ShieldCheck,
      blurb: 'Identity, credit, and fraud checks with clear decision outputs and recommendations.',
      bullets: [
        'Identity & credit verification',
        'Fraud analysis with risk score',
        'Comprehensive risk report endpoints'
      ],
      docs: '/docs/40_integrations#decisionlogic-credit--fraud',
      demo: '/docs/demo/integrations'
    }
  ]

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Integrations & Automation</h2>
          <p className="text-zinc-300 max-w-2xl mx-auto">Production‑ready integrations—from no-code automation and accounting to alternative credit and fraud detection—reducing manual review & time-to-decision.</p>
          <IntegrationsStatusBar />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.name} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 hover:border-brand-500/40 transition-colors relative">
              {c.badge && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {c.badge}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl bg-brand-500/20 p-3 text-brand-300"><c.icon size={22} /></div>
                <h3 className="text-white font-semibold text-lg">{c.name}</h3>
              </div>
              <p className="text-sm text-zinc-300 mb-4">{c.blurb}</p>
              <ul className="text-sm text-zinc-400 space-y-1 mb-5 list-disc pl-5">
                {c.bullets.map((b, i) => (<li key={i}>{b}</li>))}
              </ul>
              <div className="flex flex-col gap-2">
                <Link href={c.docs} className="btn-ghost inline-flex items-center justify-center gap-2">
                  View docs <ArrowRight size={16} />
                </Link>
                <Link href={c.demo} className="text-brand-300 hover:text-brand-200 underline underline-offset-4 text-sm text-center">Live demo endpoints</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
