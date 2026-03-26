import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const siteId = process.argv[2] || '994b8415-34bd-4987-b8f4-078e0e2327e7';
const days = Number(process.argv[3] || 40);
const outJson = process.argv[4] || 'reports/netlify-submissions-last40d.json';
const outCsv = process.argv[5] || 'reports/netlify-submissions-last40d.csv';

function callApi(method, payload) {
  const jsonArg = JSON.stringify(payload).replace(/"/g, '\\"');
  const cmd = `npx netlify api ${method} --data "${jsonArg}"`;
  const stdout = execSync(cmd, { encoding: 'utf8', shell: true });
  return JSON.parse(stdout);
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const forms = callApi('listSiteForms', { site_id: siteId });
const subs = callApi('listSiteSubmissions', { site_id: siteId });

const normalized = (Array.isArray(subs) ? subs : []).map((s) => {
  const createdRaw = s.created_at || s.createdAt || null;
  const createdAt = createdRaw ? new Date(createdRaw) : null;
  const form = s.form_name || s.formName || s.form?.name || null;
  const data = s.data || {};
  const email = data.email || null;
  const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || null;
  return {
    id: s.id || null,
    form,
    createdAt: createdAt ? createdAt.toISOString() : null,
    email,
    name,
    company: data.company || null,
    payload: JSON.stringify(data),
  };
});

const inWindow = normalized
  .filter((s) => s.createdAt && new Date(s.createdAt) >= since)
  .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

const counts = Object.entries(
  inWindow.reduce((acc, row) => {
    const key = row.form || '(unknown)';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})
)
  .map(([form, count]) => ({ form, count }))
  .sort((a, b) => b.count - a.count);

const summary = {
  siteId,
  generatedAt: new Date().toISOString(),
  windowDays: days,
  since: since.toISOString(),
  totalForms: Array.isArray(forms) ? forms.length : 0,
  totalSubmissionsAllTime: normalized.length,
  totalSubmissionsInWindow: inWindow.length,
  countsByFormInWindow: counts,
  forms,
  submissionsInWindow: inWindow,
};

mkdirSync(dirname(outJson), { recursive: true });
writeFileSync(outJson, JSON.stringify(summary, null, 2), 'utf8');

const csvRows = [
  ['id', 'form', 'createdAt', 'email', 'name', 'company', 'payload'],
  ...inWindow.map((r) => [r.id, r.form, r.createdAt, r.email, r.name, r.company, r.payload]),
];
writeFileSync(outCsv, csvRows.map((row) => row.map(csvEscape).join(',')).join('\n'), 'utf8');

console.log(`Report written: ${outJson}`);
console.log(`CSV written: ${outCsv}`);
console.log(`Submissions in last ${days} days: ${inWindow.length}`);
for (const item of counts) {
  console.log(`- ${item.form}: ${item.count}`);
}
