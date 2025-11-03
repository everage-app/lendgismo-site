# Docs Style Guide (Engineers)

This guide keeps docs clean, consistent, and fast to scan. No heavy tooling required.

## Tone
- Write for seasoned engineers. Concise, direct, and specific.
- Prefer facts over marketing. Use bullets and tables.
- Keep paragraphs short (1–3 sentences).

## Structure
- Start with “At a glance” (bullets with Version, Status, Owners, Updated, Scope).
- Follow with “Quick links” to major headings in the file.
- Use H2 for main sections, H3 for subsections. Avoid deep nesting.
- End with “References” or “Appendix” for long samples.

## Formatting
- Use fenced code blocks with language tags.
- Prefer tables for matrices (RBAC, configs).
- Use Mermaid for diagrams when helpful.
- Keep line length reasonable (~100 chars); wrap naturally.

## Cross-links
- Link to actual files (schema, routes, pages) using repo paths in backticks.
- When describing UI routes, reference `client/src/App.tsx` entries.

## Checklists
- Put actionable checklists near the relevant section (e.g., Deployment Checklist).

## Naming
- File names: lowercase with dashes (e.g., `local-dev.md`). Numbers prefix only for ordered sections.

## Examples
- Keep inline examples short and runnable (curl, TypeScript snippets).
- Move long code to an Appendix at bottom.

## Review
- Every edit updates the “Last Updated” line.
- Keep “Owners” with team or DRI for each doc.
