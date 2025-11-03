import LegalLayout from "./LegalLayout";
import Meta from "./_components/Meta";
import { DownloadPdf } from "@/components/legal/DownloadPdf";
import { COMPANY_NAME, SITE_DOMAIN, CONTACT_EMAIL, GOVERNING_LAW, VENUE } from "./_components/constants";

const sections = [
  { id: "intro", title: "Intro" },
  { id: "grant", title: "1. Grant" },
  { id: "restrictions", title: "2. Restrictions (No Resale)" },
  { id: "ownership", title: "3. Ownership" },
  { id: "third-party", title: "4. Third-Party Components" },
  { id: "services", title: "5. Support & Services" },
  { id: "confidentiality", title: "6. Confidentiality" },
  { id: "warranty", title: "7. Warranty Disclaimer" },
  { id: "liability", title: "8. Limitation of Liability" },
  { id: "audit", title: "9. Audit" },
  { id: "termination", title: "10. Termination" },
  { id: "general", title: "11. General" },
  { id: "notices", title: "12. Notices" },
];

export default function License() {
  return (
    <LegalLayout>
      <Meta
        title={`Software License — ${COMPANY_NAME}`}
        description={`License terms for ${SITE_DOMAIN} source code handoff — rights, restrictions, ownership, and limitations.`}
        canonical={`https://${SITE_DOMAIN}/legal/license`}
      />

      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl md:text-5xl font-bold text-white">Software License Agreement</h1>
        <DownloadPdf filename="Software-License" />
      </header>

      <nav className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4">
        <ol className="grid sm:grid-cols-2 gap-2 text-sm text-zinc-300">
          {sections.map((s) => (
            <li key={s.id}>
              <a className="hover:text-white" href={`#${s.id}`}>{s.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <section id="intro">
          <p>
            This Software License Agreement ("Agreement") is between {COMPANY_NAME} ("Licensor") and the customer identified in the
            applicable order ("Licensee").
          </p>
        </section>

        <section id="grant">
          <h2>1. Grant</h2>
          <p>
            Upon full payment, Licensor grants Licensee a perpetual, worldwide, non-transferable license to use, host, modify,
            and create derivative works of the {SITE_DOMAIN} source code and related materials provided by Licensor (the "Software")
            solely for Licensee’s own business and its owned/controlled brands and affiliates.
          </p>
        </section>

        <section id="restrictions">
          <h2>2. Restrictions (No Resale)</h2>
          <ul>
            <li>No resale, relicensing, distribution, white-labeling, or offering the Software as a product to third parties.</li>
            <li>No open-sourcing or public posting of the source code.</li>
            <li>Contractors may access the Software solely to support Licensee and must be bound by written obligations no less protective than this Agreement.</li>
          </ul>
        </section>

        <section id="ownership">
          <h2>3. Ownership</h2>
          <p>
            The Software is licensed, not sold. {COMPANY_NAME} retains all intellectual property rights in the underlying Software and
            generic know-how. Licensee owns its data, configurations, and derivative works it creates, subject to Section 2.
          </p>
        </section>

        <section id="third-party">
          <h2>4. Third-Party Components</h2>
          <p>The Software may include third-party code (open source or commercial) subject to their respective licenses, which govern that code.</p>
        </section>

        <section id="services">
          <h2>5. Support &amp; Services</h2>
          <p>Any services, SLAs, or onboarding are provided only if agreed in a separate order or SOW.</p>
        </section>

        <section id="confidentiality">
          <h2>6. Confidentiality</h2>
          <p>Each party will protect the other’s confidential information and use it only to perform under this Agreement.</p>
        </section>

        <section id="warranty">
          <h2>7. Warranty Disclaimer</h2>
          <p>THE SOFTWARE IS PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND.</p>
        </section>

        <section id="liability">
          <h2>8. Limitation of Liability</h2>
          <p>
            EXCEPT FOR BREACHES OF SECTION 2 OR MISUSE OF CONFIDENTIAL INFORMATION, NEITHER PARTY IS LIABLE FOR INDIRECT OR
            CONSEQUENTIAL DAMAGES. LICENSOR’S TOTAL LIABILITY IS LIMITED TO AMOUNTS PAID FOR THE SOFTWARE.
          </p>
        </section>

        <section id="audit">
          <h2>9. Audit</h2>
          <p>During the term and for one year thereafter, Licensor may request reasonable information to confirm compliance with this Agreement.</p>
        </section>

        <section id="termination">
          <h2>10. Termination</h2>
          <p>
            Licensor may terminate for material breach not cured within 30 days of notice. Upon termination, Licensee will cease any
            distribution and retain internal copies only as allowed by Section 1.
          </p>
        </section>

        <section id="general">
          <h2>11. General</h2>
          <p>This Agreement is governed by the laws of {GOVERNING_LAW}. Venue lies in {VENUE}. This is the entire agreement; amendments must be in a signed writing.</p>
        </section>

        <section id="notices">
          <h2>12. Notices</h2>
          <p>
            All notices to: {COMPANY_NAME}, Attn: Legal, <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>
      </article>
    </LegalLayout>
  );
}
