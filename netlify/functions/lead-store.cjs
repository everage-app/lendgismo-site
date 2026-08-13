const crypto = require("crypto");

let neonClientPromise;
let tableReadyPromise;

function clean(value) {
  return String(value || "").trim();
}

function normalizeFormName(value) {
  return clean(value || "contact").toLowerCase();
}

function directDbCaptureEnabled() {
  return process.env.NETLIFY_DIRECT_DB_LEAD_CAPTURE === "true";
}

function normalizeLeadFields(input = {}) {
  const fullName = clean(input.name);
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const firstName = clean(input.firstName || input.first_name || nameParts[0]);
  const lastName = clean(input.lastName || input.last_name || nameParts.slice(1).join(" "));

  return {
    submissionId: clean(input.submissionId || input.submission_id || input.leadId || input.lead_id),
    firstName,
    lastName,
    name: fullName || clean(`${firstName} ${lastName}`),
    email: clean(input.email).toLowerCase(),
    company: clean(input.company),
    role: clean(input.role || input.title),
    phone: clean(input.phone),
    interest: clean(input.interest || input.timeline),
    message: clean(input.message),
  };
}

function buildDedupeKey({ formName, fields }) {
  if (fields.submissionId) {
    return crypto
      .createHash("sha256")
      .update(`${normalizeFormName(formName)}|${fields.submissionId}`)
      .digest("hex");
  }

  const canonical = [
    normalizeFormName(formName),
    fields.email,
    fields.firstName.toLowerCase(),
    fields.lastName.toLowerCase(),
    fields.company.toLowerCase(),
    fields.role.toLowerCase(),
    fields.phone,
    fields.interest.toLowerCase(),
    fields.message,
  ].join("|");

  return crypto.createHash("sha256").update(canonical).digest("hex");
}

async function getSql() {
  if (!directDbCaptureEnabled()) return null;
  if (!process.env.DATABASE_URL) return null;
  if (!neonClientPromise) {
    neonClientPromise = import("@neondatabase/serverless").then(({ neon }) => neon(process.env.DATABASE_URL));
  }
  return neonClientPromise;
}

async function ensureLeadTable(sql) {
  if (!tableReadyPromise) {
    tableReadyPromise = sql`
      CREATE TABLE IF NOT EXISTS marketing_leads (
        id BIGSERIAL PRIMARY KEY,
        dedupe_key TEXT NOT NULL UNIQUE,
        submission_id TEXT,
        form_name TEXT NOT NULL,
        source TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        name TEXT,
        email TEXT NOT NULL,
        company TEXT,
        role TEXT,
        phone TEXT,
        interest TEXT,
        message TEXT,
        raw_payload JSONB,
        received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        seen_count INTEGER NOT NULL DEFAULT 1
      )
    `.then(async () => {
      await sql`ALTER TABLE marketing_leads ADD COLUMN IF NOT EXISTS submission_id TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS marketing_leads_received_at_idx ON marketing_leads (received_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS marketing_leads_form_name_idx ON marketing_leads (form_name)`;
      await sql`CREATE INDEX IF NOT EXISTS marketing_leads_email_idx ON marketing_leads (email)`;
      await sql`CREATE INDEX IF NOT EXISTS marketing_leads_submission_id_idx ON marketing_leads (submission_id)`;
    });
  }
  return tableReadyPromise;
}

async function saveLead({ formName = "contact", source = "unknown", fields = {}, raw = {} }) {
  const sql = await getSql();
  if (!sql) {
    return {
      ok: false,
      skipped: true,
      safe: true,
      reason: directDbCaptureEnabled() ? "missing-database-url" : "direct-db-capture-disabled",
      detail: directDbCaptureEnabled()
        ? "DATABASE_URL is missing, so no website DB write was attempted."
        : "Netlify direct DB writes are disabled by design; Heroku remains the system of record.",
    };
  }

  const normalizedFormName = normalizeFormName(formName);
  const normalizedFields = normalizeLeadFields(fields);
  if (!normalizedFields.email) {
    return { ok: false, skipped: true, reason: "missing-email" };
  }

  await ensureLeadTable(sql);

  const dedupeKey = buildDedupeKey({ formName: normalizedFormName, fields: normalizedFields });
  const rawPayload = JSON.stringify(raw || {});
  const rows = await sql`
    INSERT INTO marketing_leads (
      dedupe_key,
      submission_id,
      form_name,
      source,
      first_name,
      last_name,
      name,
      email,
      company,
      role,
      phone,
      interest,
      message,
      raw_payload
    )
    VALUES (
      ${dedupeKey},
      ${normalizedFields.submissionId},
      ${normalizedFormName},
      ${clean(source)},
      ${normalizedFields.firstName},
      ${normalizedFields.lastName},
      ${normalizedFields.name},
      ${normalizedFields.email},
      ${normalizedFields.company},
      ${normalizedFields.role},
      ${normalizedFields.phone},
      ${normalizedFields.interest},
      ${normalizedFields.message},
      ${rawPayload}::jsonb
    )
    ON CONFLICT (dedupe_key) DO UPDATE SET
      source = CASE
        WHEN marketing_leads.source LIKE '%' || EXCLUDED.source || '%' THEN marketing_leads.source
        ELSE marketing_leads.source || '+' || EXCLUDED.source
      END,
      raw_payload = EXCLUDED.raw_payload,
      updated_at = NOW(),
      seen_count = marketing_leads.seen_count + 1
    RETURNING id, seen_count
  `;

  const row = rows[0] || {};
  return {
    ok: true,
    id: row.id,
    inserted: Number(row.seen_count || 1) === 1,
    seenCount: Number(row.seen_count || 1),
  };
}

async function getLeadStoreHealth() {
  const sql = await getSql();
  if (!sql) {
    return {
      configured: directDbCaptureEnabled() && Boolean(process.env.DATABASE_URL),
      ok: !directDbCaptureEnabled(),
      databaseWrites: false,
      mode: "heroku-system-of-record",
      warning: directDbCaptureEnabled()
        ? "NETLIFY_DIRECT_DB_LEAD_CAPTURE is true, but DATABASE_URL is not configured."
        : "Direct DB writes from Netlify are disabled by design; the Heroku app/database remains the system of record.",
    };
  }

  await ensureLeadTable(sql);
  const rows = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE received_at >= NOW() - INTERVAL '40 days')::int AS last_40_days,
      COUNT(*) FILTER (WHERE received_at >= NOW() - INTERVAL '24 hours')::int AS last_24_hours,
      MAX(received_at) AS latest_received_at
    FROM marketing_leads
  `;

  const byForm = await sql`
    SELECT form_name, COUNT(*)::int AS count
    FROM marketing_leads
    WHERE received_at >= NOW() - INTERVAL '40 days'
    GROUP BY form_name
    ORDER BY form_name
  `;

  return {
    configured: true,
    ok: true,
    databaseWrites: true,
    mode: "netlify-direct-db",
    table: "marketing_leads",
    totals: {
      total: Number(rows[0]?.total || 0),
      last40d: Number(rows[0]?.last_40_days || 0),
      last24h: Number(rows[0]?.last_24_hours || 0),
    },
    latestReceivedAt: rows[0]?.latest_received_at || null,
    countsByFormLast40d: Object.fromEntries(byForm.map((row) => [row.form_name, Number(row.count || 0)])),
  };
}

async function listRecentLeads({ limit = 100 } = {}) {
  const sql = await getSql();
  if (!sql) {
    return {
      ok: !directDbCaptureEnabled(),
      skipped: true,
      safe: true,
      reason: directDbCaptureEnabled() ? "missing-database-url" : "direct-db-capture-disabled",
      rows: [],
    };
  }

  await ensureLeadTable(sql);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 500));
  const rows = await sql`
    SELECT
      id,
      submission_id,
      form_name,
      source,
      first_name,
      last_name,
      name,
      email,
      company,
      role,
      phone,
      interest,
      message,
      received_at,
      updated_at,
      seen_count
    FROM marketing_leads
    ORDER BY received_at DESC
    LIMIT ${safeLimit}
  `;

  return { ok: true, rows };
}

module.exports = {
  getLeadStoreHealth,
  listRecentLeads,
  normalizeLeadFields,
  saveLead,
  directDbCaptureEnabled,
};
