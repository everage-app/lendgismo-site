// scripts/generate-lp.mjs
// Node 20+
// Generates static SEO landing pages under /public/lp/* and a sitemap at /public/sitemaps/lp.xml
import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");
const LP_DIR = path.join(PUB, "lp");
const SITEMAPS_DIR = path.join(PUB, "sitemaps");
const SPEC_PATH = path.join(ROOT, "scripts", "lp-pages.json");

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
  :root { --bg:#0b1220; --card:#fff; --ink:#0b1220; --muted:#5b6477; --brand:#2563eb; }
  *{box-sizing:border-box} body{margin:0;background:#f7f8fb;color:var(--ink);font:16px/1.6 Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
  .wrap{max-width:960px;margin:0 auto;padding:32px}
  .hero{background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(2,6,23,.06);padding:32px}
  h1{font-size:36px;line-height:1.2;margin:0 0 12px}
  p.lead{font-size:18px;color:#223;opacity:.9;margin:0 0 16px}
  .meta{color:var(--muted);font-size:13px;margin-bottom:16px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  @media(max-width:800px){.grid{grid-template-columns:1fr}}
  .card{background:#fff;border-radius:14px;padding:20px;border:1px solid #eef0f6}
  h2{font-size:22px;margin:8px 0 8px}
  ul{padding-left:18px;margin:8px 0}
  li{margin:4px 0}
  .cta{display:inline-block;background:var(--brand);color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;margin-top:12px}
  .foot{margin-top:24px;color:var(--muted);font-size:13px}
  .badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#eef2ff;color:#334155;font-size:12px;margin-right:6px}
  .kbd{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:12px; background:#f1f5f9; padding:2px 6px; border-radius:6px; border:1px solid #e2e8f0;}
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
    <div class="hero">
      <span class="badge">Lendgismo</span>
      <h1>${htmlEscape(page.h1)}</h1>
      <p class="lead">${desc}</p>
      <p class="meta">${brand.name} • ${htmlEscape(brand.email)} • ${htmlEscape(brand.phone)}</p>
      <a class="cta" href="https://lendgismo.com/${utm}">Book a walkthrough</a>
    </div>

    <div class="grid" style="margin-top:16px">
      <div class="card">
        <h2>Key features</h2>
        <ul>${features.map(f=>`<li>${htmlEscape(f)}</li>`).join("")}</ul>
      </div>
      <div class="card">
        <h2>Who it’s for</h2>
        <ul>${useCases.map(f=>`<li>${htmlEscape(f)}</li>`).join("")}</ul>
      </div>
      <div class="card">
        <h2>Integrations</h2>
        <ul>${integrations.map(f=>`<li>${htmlEscape(f)}</li>`).join("")}</ul>
      </div>
      <div class="card">
        <h2>Why Lendgismo</h2>
        <ul>
          <li>Launch fast with a lender-grade base you can own</li>
          <li>White-label UI, branding per tenant</li>
          <li>Secure, auditable workflows end-to-end</li>
          <li>Exportable reports for investors & ops</li>
        </ul>
      </div>
    </div>

    <div class="foot">
      <p>
        <a href="https://lendgismo.com/${utm}">Home</a> · 
        <a href="https://lendgismo.com/overview/${utm}">Overview</a> · 
        <a href="https://lendgismo.com/docs/${utm}">Docs</a> · 
        <a href="https://lendgismo.com/#contact${utm}">Contact</a>
      </p>
      <p>Canonical: <span class="kbd">${canon}</span> • Updated: ${nowIso().slice(0,10)}</p>
      <p>© ${new Date().getFullYear()} ${brand.name}. All rights reserved.</p>
    </div>
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

async function main() {
  const specRaw = await fs.readFile(SPEC_PATH, "utf8");
  const spec = JSON.parse(specRaw);

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
      faq: p.faq || []
    });
  }
  // State/geographic pages
  const stateNames = spec.states || [];
  for (const state of stateNames) {
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
