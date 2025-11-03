import LegalLayout from "./LegalLayout";
import Meta from "./_components/Meta";
import { DownloadPdf } from "@/components/legal/DownloadPdf";
import { COMPANY_NAME, SITE_DOMAIN, CONTACT_EMAIL, GOVERNING_LAW, VENUE } from "./_components/constants";

const sections = [
  { id: "agreement", title: "1. Agreement" },
  { id: "accounts", title: "2. Accounts & Access" },
  { id: "acceptable-use", title: "3. Acceptable Use" },
  { id: "customer-data", title: "4. Customer Data" },
  { id: "ip", title: "5. Intellectual Property" },
  { id: "fees", title: "6. Fees & Taxes" },
  { id: "third-party", title: "7. Third-Party Services" },
  { id: "confidentiality", title: "8. Confidentiality" },
  { id: "disclaimers", title: "9. Disclaimers" },
  { id: "limitation", title: "10. Limitation of Liability" },
  { id: "indemnity", title: "11. Indemnity" },
  { id: "termination", title: "12. Termination" },
  { id: "law", title: "13. Governing Law; Disputes" },
  { id: "contact", title: "14. Contact" },
  { id: "changes", title: "15. Changes" },
];

export default function Terms() {
  return (
    <LegalLayout>
      <Meta
        title={`Terms of Service — ${COMPANY_NAME}`}
        description={`Terms for using ${SITE_DOMAIN}. Accounts, acceptable use, IP, liability limits, and dispute resolution.`}
        canonical={`https://${SITE_DOMAIN}/legal/terms`}
      />

      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl md:text-5xl font-bold text-white">Terms of Service</h1>
        <DownloadPdf filename="Terms-of-Service" />
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
        <section id="agreement">
          <h2>1. Agreement</h2>
          <p>
            By accessing or using {SITE_DOMAIN} (the "Service"), you agree to these Terms. If you use the Service on behalf
            of an organization, you represent you have authority to bind that organization.
          </p>
        </section>

        <section id="accounts">
          <h2>2. Accounts &amp; Access</h2>
          <ul>
            <li>You must keep credentials confidential and are responsible for activities under your account.</li>
            <li>We may suspend access for security, non-payment, or violations.</li>
          </ul>
        </section>

        <section id="acceptable-use">
          <h2>3. Acceptable Use</h2>
          <ul>
            <li>No illegal activity, infringement, or abuse (including attempts to bypass security or rate limits).</li>
            <li>No reverse engineering except where permitted by law.</li>
            <li>Respect third-party data rights when you connect integrations.</li>
          </ul>
        </section>

        <section id="customer-data">
          <h2>4. Customer Data</h2>
          <p>You own your data. You grant us a limited license to process it to provide the services and as described in the Privacy Policy.</p>
        </section>

        <section id="ip">
          <h2>5. Intellectual Property</h2>
          <p>The Service (excluding your data) is owned by {COMPANY_NAME} and its licensors. These Terms do not transfer ownership.</p>
        </section>

        <section id="fees">
          <h2>6. Fees &amp; Taxes</h2>
          <p>Fees (if any) are specified in an order form or plan selection. You are responsible for applicable taxes.</p>
        </section>

        <section id="third-party">
          <h2>7. Third-Party Services</h2>
          <p>Integrations are governed by their own terms; we are not responsible for third-party services.</p>
        </section>

        <section id="confidentiality">
          <h2>8. Confidentiality</h2>
          <p>Each party will protect the other’s confidential information with reasonable care and use it only as necessary to perform under these Terms.</p>
        </section>

        <section id="disclaimers">
          <h2>9. Disclaimers</h2>
          <p>THE SERVICES ARE PROVIDED “AS IS” WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</p>
        </section>

        <section id="limitation">
          <h2>10. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER PARTY WILL BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY IS LIMITED TO AMOUNTS PAID FOR THE 12 MONTHS PRECEDING THE CLAIM.</p>
        </section>

        <section id="indemnity">
          <h2>11. Indemnity</h2>
          <p>You will indemnify {COMPANY_NAME} against claims arising from your misuse of the services or breach of these Terms.</p>
        </section>

        <section id="termination">
          <h2>12. Termination</h2>
          <p>You may stop using the services at any time. We may suspend or terminate for cause. Sections intended to survive will survive.</p>
        </section>

        <section id="law">
          <h2>13. Governing Law; Disputes</h2>
          <p>These Terms are governed by the laws of {GOVERNING_LAW}. Venue and jurisdiction lie in {VENUE}.</p>
        </section>

        <section id="contact">
          <h2>14. Contact</h2>
          <p>
            Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </section>

        <section id="changes">
          <h2>15. Changes</h2>
          <p>We may update these Terms by posting a new version with an updated effective date.</p>
        </section>
      </article>
    </LegalLayout>
  );
}
