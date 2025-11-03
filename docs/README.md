# Lendgismo Developer Docs

Welcome to the Lendgismo documentation. This is a concise, consistent entry point for engineers. Everything here follows the same look-and-feel, is skimmable, and links directly to source-of-truth files already in this repo.

---

## Start here

- Local setup in 5 minutes → 60_local-dev.md
- API quick start (session auth) → 50_api-quickstart.md
- Architecture overview (C4 + flows) → 10_architecture.md

---

## What’s in the box

- Repository inventory → 00_repo-inventory.md
- Architecture diagrams (Mermaid) → 11_architecture-diagrams.md
- RBAC matrix (roles, endpoints) → 12_rbac-matrix.md
- Data model and ERD → 20_data-model.md and 21_erd.mmd
- Seeds and migrations (Drizzle) → 22_seed-and-migrations.md
- Configuration and secrets → 30_configuration.md and 31_secrets-and-keys.md
- Features overview → 40_features-overview.md
- API quick start → 50_api-quickstart.md
- Local development → 60_local-dev.md
- Readiness report → 99_docs-readiness-report.md

---

## Conventions (short)

- Use the shared template → _DOC_TEMPLATE.md
- Follow tone, structure, and visuals → _STYLE_GUIDE.md
- Put key facts up top in an “At a glance” block.
- Add a Quick links section with anchor links to main headings.
- Prefer short code samples aligned with the text; move long blocks to “Appendix”.

---

## Quick links by audience

- Frontend:
  - Local dev → 60_local-dev.md
  - UI system → 40_features-overview.md (UI sections), Tailwind tokens in tailwind.config.ts
  - Routes → client/src/App.tsx
- Backend (planned/partial):
  - Data model → 20_data-model.md
  - Seeds & migrations → 22_seed-and-migrations.md
  - RBAC → 12_rbac-matrix.md
- Integrations & Ops:
  - Config → 30_configuration.md
  - Secrets → 31_secrets-and-keys.md
  - API → 50_api-quickstart.md

---

For additions, copy _DOC_TEMPLATE.md, keep sections tight, and add yourself to the “Maintainers” line.
