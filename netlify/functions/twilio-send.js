export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const body = event.body ? JSON.parse(event.body) : {};
  const { to, body: text } = body;
  if (!to || !text) return { statusCode: 400, body: 'Missing to or body' };
  const { TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, INTEGRATIONS_LIVE } = process.env;
  const live = INTEGRATIONS_LIVE === 'true';
  if (!live || !TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sid: 'mock-sid', to, body: text, from: 'mock', mock: true }) };
  }
  try {
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: text }).toString()
    });
    const data = await res.json();
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify(data) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sid: data.sid }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Twilio error', details: String(err) }) };
  }
}
