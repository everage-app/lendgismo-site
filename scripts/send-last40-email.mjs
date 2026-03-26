import { readFileSync } from 'node:fs';

const reportPath = process.argv[2] || 'reports/netlify-submissions-last40d.json';
const to = process.argv[3] || 'brysen@everage.co';
const endpoint = process.argv[4] || 'https://lendgismo.com/api/contact/email';

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const rows = (report.submissionsInWindow || []).filter((r) => r.form === 'contact');

const lines = [];
lines.push('Site: lendgismo.com');
lines.push(`Generated: ${report.generatedAt}`);
lines.push(`Window since: ${report.since}`);
lines.push(`Count: ${rows.length}`);
lines.push('');

rows.forEach((row, index) => {
  let payload = {};
  try {
    payload = row.payload ? JSON.parse(row.payload) : {};
  } catch {
    payload = {};
  }

  lines.push(`[${index + 1}] id=${row.id}`);
  lines.push(`createdAt=${row.createdAt}`);
  lines.push(`name=${row.name || ''}`);
  lines.push(`email=${row.email || ''}`);
  lines.push(`company=${row.company || ''}`);
  lines.push(`phone=${payload.phone || ''}`);
  lines.push(`role=${payload.role || ''}`);
  lines.push(`interest=${payload.interest || ''}`);
  lines.push(`message=${payload.message || ''}`);
  lines.push(`ip=${payload.ip || ''}`);
  lines.push(`referrer=${payload.referrer || ''}`);
  lines.push('');
});

const body = {
  to,
  formName: 'contact',
  firstName: 'Lead',
  lastName: 'Audit',
  email: 'noreply@lendgismo.com',
  company: 'Lendgismo',
  role: 'System',
  phone: '',
  interest: 'last-40-days',
  message: lines.join('\n'),
};

const res = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`status=${res.status}`);
console.log(text);
if (!res.ok) process.exit(1);
