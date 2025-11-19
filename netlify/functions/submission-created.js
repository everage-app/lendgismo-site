// Event-triggered Netlify Function: runs when a form submission is created
// Docs: https://docs.netlify.com/functions/trigger-on-events/
// This function forwards 'contact' form submissions to:
// - Google Chat via incoming webhook (set GOOGLE_CHAT_WEBHOOK_URL)
// - An internal webhook (set INTERNAL_WEBHOOK_URL and optional INTERNAL_WEBHOOK_SECRET for HMAC signature)

const crypto = require("crypto");

/**
 * Safely extracts fields we care about from the Netlify submission payload
 */
function extractSubmissionFields(payload) {
  const d = (payload && (payload.data || payload.body || payload)) || {};
  return {
    firstName: d.firstName || d.first_name || "",
    lastName: d.lastName || d.last_name || "",
    email: d.email || "",
    company: d.company || "",
    role: d.role || "",
    phone: d.phone || "",
    interest: d.interest || d.timeline || "",
    message: d.message || "",
  };
}

function buildPlainText(fields) {
  const lines = [
    "Lendgismo — New contact form submission",
    `Name: ${fields.firstName} ${fields.lastName}`.trim(),
    `Email: ${fields.email}`,
    `Company: ${fields.company}`,
    `Role: ${fields.role}`,
    `Phone: ${fields.phone || '(not provided)'}`,
    `Timeline: ${fields.interest}`,
    fields.message ? "" : undefined,
    fields.message ? "Message:" : undefined,
    fields.message ? fields.message : undefined,
  ].filter(Boolean);
  return lines.join("\n");
}

async function postToGoogleChat({ webhookUrl, text }) {
  if (!webhookUrl) return { ok: false, skipped: true };
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ text }),
  });
  return { ok: res.ok, status: res.status, statusText: res.statusText };
}

function hmacSha256Hex(secret, bodyString) {
  return crypto.createHmac("sha256", secret).update(bodyString, "utf8").digest("hex");
}

async function postToInternal({ url, payload, secret }) {
  if (!url) return { ok: false, skipped: true };
  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };
  if (secret) headers["X-Signature"] = `sha256=${hmacSha256Hex(secret, body)}`;
  const res = await fetch(url, { method: "POST", headers, body });
  return { ok: res.ok, status: res.status, statusText: res.statusText };
}

async function sendEmailViaSendGrid(fields) {
  const { SENDGRID_KEY, SENDGRID_FROM = 'no-reply@lendgismo.com' } = process.env;
  
  if (!SENDGRID_KEY) {
    console.log('SendGrid not configured - skipping email');
    return { ok: false, skipped: true, reason: 'no-sendgrid-key' };
  }

  const emailHtml = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${fields.firstName} ${fields.lastName}</p>
    <p><strong>Email:</strong> ${fields.email}</p>
    <p><strong>Company:</strong> ${fields.company}</p>
    <p><strong>Role:</strong> ${fields.role}</p>
    <p><strong>Phone:</strong> ${fields.phone || '(not provided)'}</p>
    <p><strong>Timeline:</strong> ${fields.interest}</p>
    ${fields.message ? `<p><strong>Message:</strong><br>${fields.message.replace(/\n/g, '<br>')}</p>` : ''}
    <hr>
    <p><small>Submitted: ${new Date().toISOString()}</small></p>
  `;

  const emailText = buildPlainText(fields);

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
          ]
        }],
        from: { email: SENDGRID_FROM, name: 'Lendgismo Contact Form' },
        reply_to: { email: fields.email, name: `${fields.firstName} ${fields.lastName}`.trim() },
        subject: `New Contact: ${fields.firstName} ${fields.lastName} - ${fields.company}`,
        content: [
          { type: 'text/html', value: emailHtml },
          { type: 'text/plain', value: emailText }
        ]
      })
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('SendGrid error:', error);
      return { ok: false, status: res.status, error };
    }

    return { ok: true, status: 202 };
  } catch (err) {
    console.error('SendGrid exception:', err);
    return { ok: false, error: String(err) };
  }
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const payload = body.payload || {};
    const formName = payload.form_name || payload.formName || payload.form || "";

    // Only handle the public contact form
    if (formName.toLowerCase() !== "contact") {
      return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: "non-contact-form" }) };
    }

    const fields = extractSubmissionFields(payload);
    const text = buildPlainText(fields);

    const GOOGLE_CHAT_WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK_URL;
    const INTERNAL_WEBHOOK_URL = process.env.INTERNAL_WEBHOOK_URL;
    const INTERNAL_WEBHOOK_SECRET = process.env.INTERNAL_WEBHOOK_SECRET;

    const internalPayload = {
      event: "contact.submission",
      formName,
      receivedAt: new Date().toISOString(),
      data: fields,
      raw: payload,
    };

    const [emailRes, chatRes, internalRes] = await Promise.allSettled([
      sendEmailViaSendGrid(fields),
      postToGoogleChat({ webhookUrl: GOOGLE_CHAT_WEBHOOK_URL, text }),
      postToInternal({ url: INTERNAL_WEBHOOK_URL, payload: internalPayload, secret: INTERNAL_WEBHOOK_SECRET }),
    ]);

    const result = {
      email: emailRes.status === "fulfilled" ? emailRes.value : { ok: false, error: String(emailRes.reason) },
      chat: chatRes.status === "fulfilled" ? chatRes.value : { ok: false, error: String(chatRes.reason) },
      internal: internalRes.status === "fulfilled" ? internalRes.value : { ok: false, error: String(internalRes.reason) },
    };

    console.log('Contact form processed:', result);

    // Always return 200 so the submission flow doesn't appear broken to users
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    // Never fail the submission, just log
    console.error("submission-created handler error", err);
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: String(err) }) };
  }
};
