#!/usr/bin/env node
/**
 * Quick docs security scanner.
 * - Flags potential secret exposures and risky patterns inside docs.
 * - Outputs a concise report and an exit code 0 (informational).
 */
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.resolve(__dirname, '..', 'docs');

const RULES = [
  { id: 'secret-env-like', desc: 'ENV var assignment with possible secret value', regex: /(secret|key|token|password)\s*=\s*['\"][A-Za-z0-9_\-\/+=]{12,}['\"]/ig },
  { id: 'aws-key', desc: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { id: 'private-key', desc: 'Private key block', regex: /-----BEGIN (?:RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/g },
  { id: 'json-web-token', desc: 'JWT-like token', regex: /eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/g },
  { id: 'slack-webhook', desc: 'Slack webhook URL', regex: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/]+/g },
  { id: 'generic-http-keys', desc: 'HTTP URL with key param', regex: /https?:\/\/[^\s]+(?:key|secret|token)=[A-Za-z0-9_\-]{12,}/ig },
  { id: 'ssh-passphrase-hint', desc: 'SSH passphrase shown', regex: /ssh-keygen[^\n]*-P\s+"?[A-Za-z0-9]{6,}"?/ig },
  { id: 'plaid-sample-secret', desc: 'Plaid secret appearing literal', regex: /PLAID_SECRET\s*=\s*['\"][A-Za-z0-9\-]{20,}['\"]/g },
];

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (st.isFile() && name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const findings = [];
  const MAX_PER_RULE = 100;
  RULES.forEach((rule) => {
    let count = 0;
    for (const m of content.matchAll(rule.regex)) {
      const idx = m.index ?? 0;
      const snippet = content.slice(Math.max(0, idx - 48), Math.min(content.length, idx + 96)).replace(/\s+/g, ' ');
      findings.push({ rule: rule.id, desc: rule.desc, index: idx, snippet });
      count += 1;
      if (count >= MAX_PER_RULE) break;
    }
  });
  return findings;
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.log('No docs directory found, skipping scan.');
    process.exit(0);
  }
  const files = walk(DOCS_DIR);
  const report = [];
  files.forEach((f) => {
    const findings = scanFile(f);
    if (findings.length) report.push({ file: path.relative(DOCS_DIR, f).replace(/\\/g, '/'), findings });
  });
  const outPath = path.resolve(__dirname, '..', 'docs', 'security-scan-report.json');
  fs.writeFileSync(outPath, JSON.stringify({ when: new Date().toISOString(), files: report }, null, 2));
  console.log(`Docs security scan complete. Findings: ${report.reduce((a, b) => a + b.findings.length, 0)}. Report: ${outPath}`);
  process.exit(0);
}

main();
