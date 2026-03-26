const REQUIRED_FORMS = ['contact', 'roi-calculator'];

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function netlifyApi({ method, siteId, token }) {
  const endpoint = `https://api.netlify.com/api/v1/${method}`;
  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Netlify API ${method} failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function evaluateLeadHealth() {
  const siteId = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;
  const sendgridConfigured = Boolean(process.env.SENDGRID_KEY);

  const base = {
    generatedAt: new Date().toISOString(),
    siteId: siteId || null,
    requiredForms: REQUIRED_FORMS,
    sendgridConfigured,
  };

  if (!siteId || !token) {
    return {
      status: 'degraded',
      ok: false,
      checks: {
        apiAccess: false,
        formsRegistered: null,
        submissionsLast40d: null,
      },
      warning: 'Missing NETLIFY_SITE_ID/SITE_ID or NETLIFY_AUTH_TOKEN. Set both to enable full health checks.',
      ...base,
    };
  }

  const forms = await netlifyApi({ method: `sites/${siteId}/forms`, siteId, token });
  const submissions = await netlifyApi({ method: `sites/${siteId}/submissions`, siteId, token });

  const formNames = new Set((Array.isArray(forms) ? forms : []).map((f) => String(f.name || '').trim()).filter(Boolean));
  const missingForms = REQUIRED_FORMS.filter((name) => !formNames.has(name));

  const since = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
  const rows = (Array.isArray(submissions) ? submissions : []).map((s) => {
    const createdAt = parseDate(s.created_at || s.createdAt);
    const form = s.form_name || s.formName || s.form?.name || '(unknown)';
    return { createdAt, form };
  });

  const last40 = rows.filter((r) => r.createdAt && r.createdAt >= since);
  const byForm = {};
  for (const row of last40) {
    byForm[row.form] = (byForm[row.form] || 0) + 1;
  }

  const formsRegistered = missingForms.length === 0;
  const status = formsRegistered ? 'healthy' : 'unhealthy';

  return {
    status,
    ok: status === 'healthy',
    checks: {
      apiAccess: true,
      formsRegistered,
      submissionsLast40d: last40.length,
    },
    missingForms,
    totals: {
      submissionsAllTime: rows.length,
      submissionsLast40d: last40.length,
    },
    countsByFormLast40d: byForm,
    ...base,
  };
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const report = await evaluateLeadHealth();
    const code = report.status === 'healthy' ? 200 : 503;
    return {
      statusCode: code,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(report),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      body: JSON.stringify({
        status: 'error',
        ok: false,
        generatedAt: new Date().toISOString(),
        error: String(error),
      }),
    };
  }
}
