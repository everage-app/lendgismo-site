import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function Json({ data }: { data: any }) {
  return (
    <pre className="text-xs whitespace-pre-wrap break-words bg-zinc-900/60 p-3 rounded border border-white/10">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function IntegrationsDemo() {
  const [plaid, setPlaid] = useState<any>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [sms, setSms] = useState<any>(null);
  const [email, setEmail] = useState<any>(null);
  const [csv, setCsv] = useState<any>(null);
  const [mode, setMode] = useState<{ live: boolean } | null>(null);
  useEffect(() => {
    fetch('/api/integrations/status').then(r => r.ok ? r.json() : null).then(setMode).catch(() => setMode(null));
  }, []);

  const { toast } = useToast();
  const call = async (url: string, opts?: RequestInit) => {
    try {
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
      const text = await res.text();
      try { return JSON.parse(text); } catch { return { raw: text, status: res.status }; }
    } catch (e) {
      return { error: String(e) };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href="/" className="text-sm text-zinc-300 hover:text-white">← Back</Link>
          <div className="text-lg font-semibold text-brand-400">Integrations Demo</div>
          <div className="ml-auto flex items-center gap-2 text-xs text-zinc-400">
            <span>Mock-friendly. Real calls when env vars are set.</span>
            {mode && (
              <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${mode.live ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10' : 'text-amber-300 border-amber-500/40 bg-amber-500/10'}`}>
                {mode.live ? 'Live Mode' : 'Mock Mode'}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 grid md:grid-cols-2 gap-6">
        <Card className="bg-zinc-950/60 border-white/10">
          <CardHeader>
            <CardTitle>Plaid</CardTitle>
            <CardDescription>Create Link token, then exchange (mock in absence of secrets)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={async () => {
                const data = await call('/api/plaid/link-token', { method: 'POST' });
                setPlaid(data);
                toast({ title: data?.error ? 'Plaid error' : 'Link token created', description: data?.error ? String(data.error) : (data?.mock ? 'Mock response (no secrets set)' : 'Ready to launch Plaid Link') });
              }}>Create Link Token</Button>
              <Button variant="secondary" onClick={async () => {
                const data = await call('/api/plaid/exchange-token', { method: 'POST', body: JSON.stringify({ public_token: 'public-sandbox-abc' }) });
                setPlaid(data);
                toast({ title: data?.error ? 'Exchange failed' : 'Token exchanged', description: data?.error ? String(data.error) : (data?.mock ? 'Mock response (no secrets set)' : 'Access token issued') });
              }}>Exchange Token</Button>
            </div>
            {plaid && <Json data={plaid} />}
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/60 border-white/10">
          <CardHeader>
            <CardTitle>Stripe</CardTitle>
            <CardDescription>Payment intent (client_secret mocked if no key)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={async () => {
                const data = await call('/api/stripe/payment-intent', { method: 'POST', body: JSON.stringify({ amount: 1999, currency: 'usd' }) });
                setStripe(data);
                toast({ title: data?.error ? 'Stripe error' : 'Payment intent ready', description: data?.error ? String(data.error) : (data?.mock ? 'Mock client_secret (no key set)' : 'Use client_secret with Stripe.js') });
              }}>Create $19.99 Intent</Button>
            </div>
            {stripe && <Json data={stripe} />}
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/60 border-white/10">
          <CardHeader>
            <CardTitle>Twilio SMS</CardTitle>
            <CardDescription>Send an SMS (no-op mock without secrets)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={async () => {
                const data = await call('/api/twilio/send', { method: 'POST', body: JSON.stringify({ to: '+15555550123', body: 'Hello from Lendgismo' }) });
                setSms(data);
                toast({ title: data?.error ? 'SMS error' : 'SMS queued', description: data?.error ? String(data.error) : (data?.mock ? 'Mock send (no TWILIO_* set)' : `SID: ${data?.sid ?? ''}`) });
              }}>Send Test SMS</Button>
            </div>
            {sms && <Json data={sms} />}
          </CardContent>
        </Card>

        <Card className="bg-zinc-950/60 border-white/10">
          <CardHeader>
            <CardTitle>SendGrid Email</CardTitle>
            <CardDescription>Sends basic email (mocked without key)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button onClick={async () => {
                const data = await call('/api/sendgrid/send', { method: 'POST', body: JSON.stringify({ to: 'you@example.com', subject: 'Hello from Lendgismo', text: 'Email body' }) });
                setEmail(data);
                toast({ title: data?.error ? 'Email error' : 'Email sent', description: data?.error ? String(data.error) : (data?.mock ? 'Mock send (no key set)' : 'Accepted by SendGrid') });
              }}>Send Test Email</Button>
            </div>
            {email && <Json data={email} />}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-zinc-950/60 border-white/10">
          <CardHeader>
            <CardTitle>CSV Upload</CardTitle>
            <CardDescription>Parse CSV server-side (no file storage)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={async () => {
              const data = await call('/api/csv/upload', { method: 'POST', body: JSON.stringify({ csv: 'name,amount\nAlice,100\nBob,200' }) });
              setCsv(data);
              toast({ title: data?.error ? 'CSV parse failed' : 'CSV parsed', description: data?.error ? String(data.error) : `${data?.rowsParsed ?? 0} rows parsed` });
            }}>Upload Sample CSV</Button>
            {csv && <Json data={csv} />}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
