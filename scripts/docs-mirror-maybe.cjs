#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const allow = process.env.ALLOW_DOCS_MIRROR === 'true';
if (!allow) {
  console.log('Skipping docs mirror: ALLOW_DOCS_MIRROR is not true');
  process.exit(0);
}

const res = spawnSync(process.execPath, ['scripts/generate-docs.cjs'], { stdio: 'inherit' });
process.exit(res.status ?? 0);
