import { evaluateLeadHealth } from './lead-health.js';

export const config = {
  schedule: '0 * * * *',
};

async function postGoogleChat(webhookUrl, text) {
  if (!webhookUrl) return { skipped: true };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ text }),
  });
  return { ok: res.ok, status: res.status };
}

async function postInternal(url, payload, secret) {
  if (!url) return { skipped: true };
  const headers = { 'Content-Type': 'application/json' };
  if (secret) headers['X-Signature'] = `sha256=${secret}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return { ok: res.ok, status: res.status };
}

export async function handler() {
  try {
    const report = await evaluateLeadHealth();

    if (report.status === 'healthy') {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, skippedAlert: true, report }),
      };
    }

    const text = [
      `Lendgismo lead health alert: ${report.status.toUpperCase()}`,
      `siteId: ${report.siteId || '(missing)'}`,
      `missingForms: ${(report.missingForms || []).join(', ') || '(none)'}`,
      `submissionsLast40d: ${report?.totals?.submissionsLast40d ?? 'n/a'}`,
      `warning: ${report.warning || '(none)'}`,
    ].join('\n');

    const payload = {
      event: 'lead.health.alert',
      report,
      generatedAt: new Date().toISOString(),
    };

    const [chat, internal] = await Promise.allSettled([
      postGoogleChat(process.env.GOOGLE_CHAT_WEBHOOK_URL, text),
      postInternal(process.env.INTERNAL_WEBHOOK_URL, payload, process.env.INTERNAL_WEBHOOK_SECRET),
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        alertSent: true,
        report,
        chat: chat.status === 'fulfilled' ? chat.value : { ok: false, error: String(chat.reason) },
        internal: internal.status === 'fulfilled' ? internal.value : { ok: false, error: String(internal.reason) },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(error) }),
    };
  }
}
