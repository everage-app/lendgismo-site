// Netlify Function: contact-email
// Sends contact form submissions to brysen@lendgismo.com
// Uses SendGrid API directly (same pattern as sendgrid-send.js)

import leadStore from './lead-store.cjs';

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
      formName = 'contact',
      to = '',
      name = '',
      submissionId = '',
      firstName = '',
      lastName = '',
      email = '',
      company = '',
      role = '',
      phone = '',
      interest = '',
      message = ''
    } = payload;

    const normalizedFormName = String(formName || 'contact').trim().toLowerCase();
    const recipient = String(to || '').trim();
    const recipients = recipient
      ? [{ email: recipient }]
      : [
          { email: 'sales@lendgismo.com' },
          { email: 'brysen@lendgismo.com' }
        ];
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || String(name || '').trim();
    const [derivedFirstName, ...derivedRest] = fullName.split(' ').filter(Boolean);
    const safeFirstName = firstName || derivedFirstName || '';
    const safeLastName = lastName || derivedRest.join(' ');

    if (!email) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Missing required field: email' })
      };
    }

    const leadDb = await leadStore.saveLead({
      formName: normalizedFormName,
      source: 'contact-email',
      fields: { submissionId, firstName, lastName, name, email, company, role, phone, interest, message },
      raw: payload,
    }).catch((error) => {
      console.error('Lead DB save failed:', error);
      return { ok: false, error: String(error && error.message || error) };
    });

    const subject = normalizedFormName === 'roi-calculator'
      ? `Lendgismo ROI lead — ${fullName || 'Unknown name'} (${email})`
      : `Lendgismo contact — ${company || 'No company'} (${safeFirstName} ${safeLastName})`;

    const lines = normalizedFormName === 'roi-calculator'
      ? [
      'Form: roi-calculator',
      `Name: ${fullName || '(not provided)'}`,
      `Email: ${email}`,
      '',
      `Submitted at: ${new Date().toISOString()}`
    ] : [
      'Form: contact',
      `Name: ${safeFirstName} ${safeLastName}`,
      `Email: ${email}`,
      `Company: ${company}`,
      `Role: ${role}`,
      `Phone: ${phone || '(not provided)'}`,
      `Timeline: ${interest || '(not provided)'}`,
      '',
      'Message:',
      message || '(none)',
      '',
      `Submitted at: ${new Date().toISOString()}`
    ];

    const text = lines.join('\r\n');
    const html = normalizedFormName === 'roi-calculator'
      ? `
      <h2>Lendgismo — New ROI calculator lead</h2>
      <p><strong>Name:</strong> ${escapeHtml(fullName || '(not provided)')}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <hr>
      <p style="color:#888;font-size:12px">Submitted at ${new Date().toISOString()}</p>
    `
      : `
      <h2>Lendgismo — New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(safeFirstName)} ${escapeHtml(safeLastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company)}</p>
      <p><strong>Role:</strong> ${escapeHtml(role)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || '(not provided)')}</p>
      <p><strong>Timeline:</strong> ${escapeHtml(interest || '(not provided)')}</p>
      ${message ? `<p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>` : ''}
      <hr>
      <p style="color:#888;font-size:12px">Submitted at ${new Date().toISOString()}</p>
    `;

    const SENDGRID_KEY = process.env.SENDGRID_KEY || process.env.SENDGRID_API_KEY;
    const { SENDGRID_FROM } = process.env;
    // Sensible verified-sender fallbacks if env var isn't set or unverified
    const FALLBACK_FROM_CHAIN = [
      SENDGRID_FROM,
      'sales@lendgismo.com',
      'brysen@lendgismo.com',
      'no-reply@lendgismo.com'
    ].filter(Boolean);

    if (!SENDGRID_KEY) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: false,
          error: 'Server email is not configured (missing SENDGRID_KEY/SENDGRID_API_KEY)'
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
              to: recipients
            }],
            from: { email: fromEmail, name: 'Lendgismo Site' },
            reply_to: email ? { email, name: fullName || email } : undefined,
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
            body: JSON.stringify({ ok: true, usedFrom: fromEmail, leadDb })
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

    // Fail loudly so the frontend does not show a false success state.
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'All from-address attempts failed', details: lastErrorText })
    };
  } catch (err) {
    console.error('Contact email error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err && err.message || err) })
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
