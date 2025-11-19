// scripts/generate-lp.mjs
// Node 20+
// Generates static SEO landing pages under /public/lp/* and a sitemap at /public/sitemaps/lp.xml
import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");
const LP_DIR = path.join(PUB, "lp");
const SITEMAPS_DIR = path.join(PUB, "sitemaps");
const SPEC_DEFAULT = path.join(ROOT, "scripts", "lp-pages.json");
const SPEC_ENHANCED = path.join(ROOT, "scripts", "lp-pages-enhanced.json");

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function htmlEscape(s = "") {
  return s.replace(/[&<>"']/g, (ch) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[ch]));
}
function nowIso() {
  return new Date().toISOString();
}

const inlineCss = `
  :root { --bg:#0b1220; --card:#0f172a; --ink:#0b1220; --ink-soft:#1f2937; --muted:#5b6477; --muted2:#6b7280; --brand:#2563eb; --brand-2:#1d4ed8; --ring:#93c5fd; }
  *{box-sizing:border-box}
  body{margin:0;background:linear-gradient(180deg,#f8fafc, #eef2ff 50%, #f8fafc);color:var(--ink);font:16px/1.6 Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
  a{text-decoration:none;color:inherit}
  .wrap{max-width:1040px;margin:0 auto;padding:28px}
  .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
  .brand{font-weight:700;font-size:18px;color:#0f172a}
  .nav{display:flex;gap:14px}
  .btn{display:inline-block;border-radius:10px;padding:10px 14px;border:1px solid #e5e7eb;background:#fff;color:#111827}
  .btn:hover{border-color:#d1d5db}
  .btn-primary{background:linear-gradient(180deg, var(--brand), var(--brand-2));color:#fff;border:none}
  .btn-primary:hover{filter:brightness(1.05)}
  .btn-ghost{background:transparent;border:1px solid #e5e7eb}
  .hero{position:relative;background:radial-gradient(1200px 600px at 80% -20%, #dbeafe 0%, transparent 60%), #fff;border-radius:16px;box-shadow:0 12px 50px rgba(2,6,23,.08);padding:28px;border:1px solid #eef2ff}
  h1{font-size:38px;line-height:1.15;margin:0 0 10px;letter-spacing:-0.01em}
  p.lead{font-size:18px;color:#223;opacity:.92;margin:0 0 14px}
  .meta{color:var(--muted2);font-size:13px;margin-bottom:14px}
  .hero-ctas{display:flex;gap:10px;flex-wrap:wrap}
  .trust{margin-top:14px;color:var(--muted);font-size:13px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
  @media(max-width:900px){.grid{grid-template-columns:1fr}}
  .card{background:#fff;border-radius:14px;padding:18px;border:1px solid #eef0f6}
  h2{font-size:22px;margin:6px 0 8px}
  ul{padding-left:18px;margin:8px 0}
  li{margin:4px 0}
  .foot{margin-top:26px;color:var(--muted);font-size:13px}
  .badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#eef2ff;color:#334155;font-size:12px;margin-right:6px}
  .kbd{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:12px; background:#f1f5f9; padding:2px 6px; border-radius:6px; border:1px solid #e2e8f0;}
  .sticky-cta{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);background:#0b1220;color:#fff;padding:10px 14px;border-radius:999px;box-shadow:0 10px 30px rgba(2,6,23,.25);display:flex;gap:8px;align-items:center}
  .sticky-cta a{color:#fff}
`;

function orgJsonLd(brand) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: "https://lendgismo.com",
    email: brand.email,
    telephone: brand.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: "4638 Watery Way",
      addressLocality: "South Jordan",
      addressRegion: "UT",
      postalCode: "84009",
      addressCountry: "US"
    },
    sameAs: [
      "https://lendgismo.com"
    ]
  };
}

function softwareJsonLd(page, brand) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: page.title.replace(/\s*\|\s*Lendgismo/i, ""),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Contact for pricing/licensing" },
    description: page.description,
    provider: { "@type": "Organization", name: brand.name, url: "https://lendgismo.com" },
    url: page.canonical
  };
}

function faqJsonLd(page) {
  const baseQs = [
    `What is ${page.h1}?`,
    `Who uses ${page.h1}?`,
    `How fast can I launch with Lendgismo?`,
    `What integrations are supported (Plaid, QuickBooks, Stripe, DataMerch, DecisionLogic)?`,
    `Can I white-label and customize the workflows?`,
  ];
  const faqs = (page.faq && page.faq.length ? page.faq : baseQs).map((q) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: `${page.h1} with Lendgismo provides lender-grade onboarding, underwriting automation, reporting, and multi-tenant branding. It's white-label, integrates with Plaid, QuickBooks, Stripe, Twilio, SendGrid, DataMerch, DecisionLogic, and more — deployed quickly to match your credit policies and ops.`
    }
  }));
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs };
}

function pageHtml(page, brand) {
  const title = htmlEscape(page.title);
  const desc = htmlEscape(page.description);
  const canon = page.canonical;
  const ogImg = page.ogImage || `${brand.baseUrl}/og-default.jpg`;

  const ld = [
    orgJsonLd(brand),
    softwareJsonLd(page, brand),
    faqJsonLd(page)
  ];

  const features = [
    "Borrower onboarding & document collection",
    "Underwriting workflows (rules, checklists, term sheets)",
    "Reporting & clean exports (CSV/PPTX)",
    "Multi-tenant white-labeling for each lender",
    "Integrations: Plaid, QuickBooks, Stripe, Twilio, SendGrid, DataMerch, DecisionLogic",
    "APIs & webhooks for custom pipelines",
    "Audit trail, roles & permissions"
  ];

  const useCases = [
    "Merchant Cash Advance (MCA) funders & ISOs",
    "Asset-based lenders & working capital providers",
    "Non-bank & fintech lenders",
    "Servicing and collections teams",
    "Credit/risk teams standardizing decisioning"
  ];

  const integrations = [
    "Plaid (bank data & cash flow)",
    "QuickBooks (accounting sync)",
    "Stripe (repayments/ACH/cards)",
    "Twilio (SMS 2FA & notifications)",
    "SendGrid (email OTP & messaging)",
    "DataMerch (alternative data & analytics)",
    "DecisionLogic (credit decisions & fraud detection)",
    "Socure/Alloy (identity verification & KYC)"
  ];

  // UTM tagging for attribution
  const utm = `?utm_source=seo-lp&utm_medium=organic&utm_campaign=lp&utm_content=${encodeURIComponent(page.slug)}`;
  const contactUrl = `${brand.baseUrl}/${utm}#contact`;
  const homeUrl = `${brand.baseUrl}/${utm}`;
  const mailto = `mailto:${encodeURIComponent(brand.email)}?subject=${encodeURIComponent("Lendgismo — "+page.h1)}&body=${encodeURIComponent("Hi Lendgismo team,\n\nI'm interested in "+page.h1+". Let's connect.\n\nThanks!\n")}`;
  const tel = `tel:${brand.phone.replace(/[^0-9+]/g, "")}`;

  // Use provided sections if any; otherwise show defaults
  const sections = Array.isArray(page.sections) && page.sections.length > 0
    ? page.sections
    : [
        { h2: "Key features", body: `<ul>${features.map(f=>`<li>${htmlEscape(f)}</li>`).join("")}</ul>` },
        { h2: "Who it’s for", body: `<ul>${useCases.map(f=>`<li>${htmlEscape(f)}</li>`).join("")}</ul>` },
        { h2: "Integrations", body: `<ul>${integrations.map(f=>`<li>${htmlEscape(f)}</li>`).join("")}</ul>` },
        { h2: "Why Lendgismo", body: `<ul><li>Launch fast with a lender-grade base you can own</li><li>White-label UI, branding per tenant</li><li>Secure, auditable workflows end-to-end</li><li>Exportable reports for investors & ops</li></ul>` },
      ];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${canon}" />
<meta name="robots" content="index,follow" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${canon}" />
<meta property="og:image" content="${ogImg}" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${ogImg}" />

<style>${inlineCss}</style>
<script type="application/ld+json">${JSON.stringify(ld[0])}</script>
<script type="application/ld+json">${JSON.stringify(ld[1])}</script>
<script type="application/ld+json">${JSON.stringify(ld[2])}</script>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <a class="brand" href="${homeUrl}">Lendgismo</a>
      <div class="nav">
        <a class="btn btn-ghost" href="${brand.baseUrl}/overview/${utm}">Overview</a>
        <a class="btn" href="${brand.baseUrl}/docs/${utm}">Docs</a>
        <a class="btn" href="${tel}">Call ${htmlEscape(brand.phone)}</a>
        <a class="btn btn-primary" href="${contactUrl}">Book a demo</a>
      </div>
    </div>
    <div class="hero">
      <span class="badge">Lendgismo</span>
      <h1>${htmlEscape(page.h1)}</h1>
      <p class="lead">${desc}</p>
      <p class="meta">${brand.name} • ${htmlEscape(brand.email)} • ${htmlEscape(brand.phone)}</p>
      <div class="hero-ctas">
        <a class="btn btn-primary" href="${contactUrl}">Book a demo</a>
        <a class="btn" href="${mailto}">Email sales</a>
        <a class="btn" href="${tel}">Call now</a>
      </div>
      <p class="trust">Trusted by alt‑lenders, ISOs & fintech teams</p>
    </div>

    <div class="grid" style="margin-top:16px">
      ${sections.map(sec => `
        <div class="card">
          <h2>${htmlEscape(sec.h2 || "Section")}</h2>
          ${sec.body && /<\/?\w+/.test(sec.body) ? sec.body : `<p>${htmlEscape(sec.body || "")}</p>`}
        </div>
      `).join("")}
    </div>

    <div class="foot">
      <p>
        <a href="${homeUrl}">Home</a> · 
        <a href="${brand.baseUrl}/overview/${utm}">Overview</a> · 
        <a href="${brand.baseUrl}/docs/${utm}">Docs</a> · 
        <a href="${contactUrl}">Contact</a>
      </p>
      <p>Canonical: <span class="kbd">${canon}</span> • Updated: ${nowIso().slice(0,10)}</p>
      <p>© ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
    </div>
  </div>

  <div class="sticky-cta">
    <a class="btn btn-primary" href="${contactUrl}">Book a demo</a>
    <span>or</span>
    <a class="btn" href="${mailto}">Email sales</a>
  </div>
</body>
</html>`;
}

async function ensureDirs() {
  await fs.mkdir(LP_DIR, { recursive: true });
  await fs.mkdir(SITEMAPS_DIR, { recursive: true });
}
async function writeFileSafe(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function loadSpec() {
  // Prefer enhanced spec if present; fall back to default
  try {
    const raw = await fs.readFile(SPEC_ENHANCED, "utf8");
    const spec = JSON.parse(raw);
    return { spec, source: "enhanced" };
  } catch {}
  const raw = await fs.readFile(SPEC_DEFAULT, "utf8");
  const spec = JSON.parse(raw);
  return { spec, source: "default" };
}

async function main() {
  const { spec } = await loadSpec();

  const brand = {
    name: spec.brand?.name || "Lendgismo LLC",
    email: spec.brand?.email || "lendgismo@gmail.com",
    phone: spec.brand?.phone || "801-930-0261",
    baseUrl: spec.baseUrl || "https://lendgismo.com"
  };

  await ensureDirs();

  // Build pages list
  const pages = [];
  for (const p of spec.core) {
    pages.push({
      slug: p.slug,
      title: p.title,
      description: p.description,
      h1: p.h1 || p.title.replace(/\s*\|\s*Lendgismo/i, ""),
      canonical: `${brand.baseUrl}/lp/${p.slug}/`,
      ogImage: p.ogImage || null,
      faq: p.faq || [],
      sections: p.sections || null,
      ctas: p.ctas || null,
      keywords: p.keywords || null,
    });
  }
  // State/geographic pages
  const stateItems = spec.states || [];
  for (const state of stateItems) {
    if (typeof state === "string") {
      const sslug = slugify(state);
      const slug = `alt-lending-software-${sslug}`;
      const title = `Alt-lending software in ${state} | Lendgismo`;
      const description = `Launch an alt-lending / MCA / ABL platform in ${state} with Lendgismo — fast borrower onboarding, underwriting automation, reporting, and white-label multi-tenant branding.`;
      pages.push({
        slug,
        title,
        description,
        h1: `Alt-lending software — ${state}`,
        canonical: `${brand.baseUrl}/lp/${slug}/`,
        ogImage: null,
        faq: [
          `Can Lendgismo handle ${state}-specific lending policies?`,
          `Does Lendgismo support MCA flows in ${state}?`
        ]
      });
    } else if (state && typeof state === "object") {
      const slug = state.slug || slugify(state.h1 || state.title || "state");
      pages.push({
        slug,
        title: state.title || `Alternative Lending Software — ${state.name || "State"}`,
        description: state.description || `Alternative lending platform for ${state.name || "your state"}.`,
        h1: state.h1 || state.title || `Alternative Lending — ${state.name || "State"}`,
        canonical: `${brand.baseUrl}/lp/${slug}/`,
        ogImage: state.ogImage || null,
        faq: state.faq || [],
        sections: state.sections || null,
        ctas: state.ctas || null,
        keywords: state.keywords || null,
      });
    }
  }

  // Write each page
  for (const page of pages) {
    const outDir = path.join(LP_DIR, page.slug);
    const html = pageHtml(page, brand);
    await writeFileSafe(path.join(outDir, "index.html"), html);
  }

  // LP index page (helpful, but not linked from your main nav)
  const indexHtml = `<!doctype html><html lang="en"><head>
  <meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Lendgismo — SEO Landing Pages</title>
  <meta name="robots" content="index,follow"/><style>${inlineCss}</style>
  </head><body><div class="wrap">
  <h1>SEO Landing Pages</h1>
  <p class="lead">Internal index of landing pages. Keep this unlinked in your main nav.</p>
  <ul>${pages.map(p=>`<li><a href="/lp/${p.slug}/">${htmlEscape(p.title)}</a></li>`).join("")}</ul>
  <p class="foot">Updated ${nowIso()}</p>
  </div></body></html>`;
  await writeFileSafe(path.join(LP_DIR, "index.html"), indexHtml);

  // Sitemap
  const urls = pages.map(p => `<url><loc>${htmlEscape(p.canonical)}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;
  await writeFileSafe(path.join(SITEMAPS_DIR, "lp.xml"), xml);

  // JSON manifest for internal management UI
  const manifest = {
    generatedAt: nowIso(),
    baseUrl: brand.baseUrl,
    count: pages.length,
    pages: pages.map(p => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      canonical: p.canonical,
      type: p.slug.startsWith("alt-lending-software-") ? "state" : "core"
    }))
  };
  await writeFileSafe(path.join(LP_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  console.log(`Generated ${pages.length} LP pages, index, and sitemap at /public/sitemaps/lp.xml`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
