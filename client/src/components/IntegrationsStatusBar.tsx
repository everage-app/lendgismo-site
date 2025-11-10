import React, { useEffect, useState } from 'react'

interface ProviderStatus {
  configured: boolean
  env?: string
  webhook?: boolean
  url?: string
}

interface StatusPayload {
  live: boolean
  providers: Record<string, ProviderStatus>
}

export default function IntegrationsStatusBar() {
  const [data, setData] = useState<StatusPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/.netlify/functions/integrations-status')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setData)
      .catch(e => setError(typeof e === 'string' ? e : 'Failed to load'))
  }, [])

  if (error) return null
  if (!data) return (
    <div className="text-[11px] text-zinc-500 animate-pulse">Checking integrations...</div>
  )

  const entries = Object.entries(data.providers)
    .filter(([name]) => ['plaid','stripe','quickbooks','datamerch','decisionlogic'].includes(name))

  return (
    <div className="mt-3 flex flex-wrap gap-2 items-center">
      {entries.map(([name, p]) => {
        const label = name.charAt(0).toUpperCase() + name.slice(1)
        const state = p.configured ? 'Ready' : 'Mock'
        const color = p.configured ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' : 'bg-zinc-800/50 text-zinc-400 border-zinc-700'
        return (
          <span key={name} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] ${color}`}
            title={p.env ? `${label} • ${state} • env:${p.env}` : `${label} • ${state}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {label}:{' '}{state}
          </span>
        )
      })}
    </div>
  )
}
