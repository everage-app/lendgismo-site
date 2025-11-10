// Netlify Function: contact-email
// Sends contact form submissions to sales@lendgismo.com and brysen@lendgismo.com
// Uses SendGrid API directly (same pattern as sendgrid-send.js)

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const {
      firstName = '',
      lastName = '',
      email = '',
      company = '',
      role = '',
      interest = '',
      message = ''
    } = payload;

    const subject = `Lendgismo contact — ${company || 'No company'} (${firstName} ${lastName})`;

    const lines = [
      `Name: ${firstName} ${lastName}`,
      `Email: ${email}`,
      `Company: ${company}`,
      `Role: ${role}`,
      `Timeline: ${interest || '(not provided)'}`,
      '',
      'Message:',
      message || '(none)',
      '',
      `Submitted at: ${new Date().toISOString()}`
    ];
    const text = lines.join('\r\n');
    const html = `
      <h2>Lendgismo — New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company)}</p>
      <p><strong>Role:</strong> ${escapeHtml(role)}</p>
      <p><strong>Timeline:</strong> ${escapeHtml(interest || '(not provided)')}</p>
      ${message ? `<p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>` : ''}
      <hr>
      <p style="color:#888;font-size:12px">Submitted at ${new Date().toISOString()}</p>
    `;

    const { SENDGRID_KEY, SENDGRID_FROM } = process.env;
    // Sensible verified-sender fallbacks if env var isn't set or unverified
    const FALLBACK_FROM_CHAIN = [
      SENDGRID_FROM,
      'sales@lendgismo.com',
      'brysen@lendgismo.com',
      'no-reply@lendgismo.com'
    ].filter(Boolean);

    if (!SENDGRID_KEY) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ok: true, 
          mock: true, 
          reason: 'No SENDGRID_KEY set (dev/test mode)' 
        })
      };
    }

    // Try a short chain of from-addresses to avoid Sender Identity issues
    let lastErrorText = '';
    for (const fromEmail of FALLBACK_FROM_CHAIN) {
      try {
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${SENDGRID_KEY}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            personalizations: [{ 
              to: [
                { email: 'sales@lendgismo.com' },
                { email: 'brysen@lendgismo.com' }
              ],
              reply_to: { email }
            }],
            from: { email: fromEmail, name: 'Lendgismo Site' },
            subject,
            content: [
              { type: 'text/plain', value: text },
              { type: 'text/html', value: html }
            ]
          })
        });

        if (res.ok) {
          return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify({ ok: true, usedFrom: fromEmail })
          };
        } else {
          lastErrorText = await res.text();
          console.error('SendGrid error with from', fromEmail, res.status, lastErrorText);
        }
      } catch (e) {
        lastErrorText = String(e && e.message || e);
        console.error('SendGrid exception with from', fromEmail, lastErrorText);
      }
    }

    // Do not fail the user flow; return 200 with details for troubleshooting
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'All from-address attempts failed', details: lastErrorText })
    };
  } catch (err) {
    console.error('Contact email error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: String(err && err.message || err) })
    };
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
