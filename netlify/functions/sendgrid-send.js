export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const body = event.body ? JSON.parse(event.body) : {};
  const { to, subject, html, text } = body;
  if (!to || !subject || (!html && !text)) return { statusCode: 400, body: 'Missing to, subject or content' };
  const { SENDGRID_KEY, SENDGRID_FROM = 'no-reply@lendgismo.com' } = process.env;
  if (!SENDGRID_KEY) {
    // Do not fail hard; return a mock response so UI can proceed, but clearly indicate mock.
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId: 'mock-message', to, subject, mock: true, reason: 'missing SENDGRID_KEY' }) };
  }
  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SENDGRID_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
  personalizations: [{ to: [{ email: to }], cc: [{ email: 'brysen@lendgismo.com' }] }],
  from: { email: SENDGRID_FROM, name: 'Lendgismo' },
        subject,
        content: [ html ? { type: 'text/html', value: html } : { type: 'text/plain', value: text } ]
      })
    });
    if (!res.ok) {
      const t = await res.text();
      return { statusCode: res.status, body: t };
    }
    // SendGrid returns 202 Accepted without body
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accepted: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'SendGrid error', details: String(err) }) };
  }
}
