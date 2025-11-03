import Meta from "./_components/Meta";
import LegalLayout from "./LegalLayout";
import { COMPANY_NAME, SITE_DOMAIN, CONTACT_EMAIL, COMPANY_PHONE, COMPANY_POSTAL_ADDRESS } from "./_components/constants";

const sections = [
  { id: "overview", title: "1. Overview & Scope" },
  { id: "data", title: "2. Personal Data We Collect" },
  { id: "purposes", title: "3. Purposes & Lawful Bases" },
  { id: "sharing", title: "4. Sharing" },
  { id: "cookies", title: "5. Cookies & Analytics" },
  { id: "rights", title: "6. Regional Rights" },
  { id: "transfers", title: "7. International Transfers" },
  { id: "security", title: "8. Security & Retention" },
  { id: "children", title: "9. Children’s Privacy" },
  { id: "contact", title: "10. Contact" },
  { id: "changes", title: "11. Changes" },
];

export default function Privacy() {
  return (
    <LegalLayout>
      <Meta
        title={`Privacy Policy — ${COMPANY_NAME}`}
        description={`${COMPANY_NAME} Privacy Policy for ${SITE_DOMAIN}. What we collect, how we use it, your rights (CPRA/GDPR), cookies, and contact.`}
        canonical={`https://${SITE_DOMAIN}/legal/privacy`}
      />
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>

      <nav className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4">
        <ol className="grid sm:grid-cols-2 gap-2 text-sm text-zinc-300">
          {sections.map((s) => (
            <li key={s.id}>
              <a className="hover:text-white" href={`#${s.id}`}>{s.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <section id="overview" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">1. Overview & Scope</h2>
        <p>
          This Privacy Policy explains how {COMPANY_NAME} ("we", "us") collects, uses, and shares Personal Data when you
          visit or interact with {SITE_DOMAIN}, contact us, or evaluate our software. We act as a controller for the site.
          We do not direct the site to children under 13.
        </p>
      </section>

      <section id="data" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">2. Personal Data We Collect</h2>
        <ul className="list-disc pl-6 text-zinc-300">
          <li><strong>Identifiers</strong>: name, email, organization, phone.</li>
          <li><strong>Device/usage</strong>: IP address, device/browser, pages viewed, referrer/UTM, timestamps.</li>
          <li><strong>Account/logs</strong>: authentication, session, activity and error logs.</li>
          <li><strong>Commercial</strong>: purchase/license details and invoicing data.</li>
          <li><strong>Support</strong>: messages and attachments you send us.</li>
          <li><strong>Cookies/SDKs</strong>: see Cookies & Analytics below.</li>
        </ul>
      </section>

      <section id="purposes" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">3. Purposes & Lawful Bases</h2>
        <p>
          We process Personal Data to provide and secure the site (contract/legitimate interests), respond to requests,
          improve and protect our services (legitimate interests), perform marketing with consent where required, and
          comply with legal obligations.
        </p>
      </section>

      <section id="sharing" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">4. Sharing</h2>
        <p>
          We share Personal Data with service providers (hosting, analytics, email/SMS, payments), professional advisors,
          legal authorities when required, and in corporate transactions. We do not sell Personal Data in the common-sense
          meaning. Where CPRA definitions of "sale" or "sharing" may apply, you can opt out via <a className="text-brand-400" href="/legal/privacy-choices">Your Privacy Choices</a>.
        </p>
      </section>

      <section id="cookies" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">5. Cookies & Analytics</h2>
        <p>
          We use necessary, functional, analytics, and limited marketing cookies. You can manage preferences at
          <a className="text-brand-400" href="/legal/privacy-choices"> /legal/privacy-choices</a>.
          We honor Global Privacy Control (GPC) signals as a valid opt‑out for CPRA‑covered activity.
        </p>
      </section>

      <section id="rights" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">6. Regional Rights</h2>
        <p className="text-zinc-300"><strong>California (CPRA):</strong> right to know/access, delete, correct, limit sensitive personal information (if used), and opt out of sale/share; no discrimination. Exercise your rights via <a className="text-brand-400" href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a> or visit <a className="text-brand-400" href="/legal/privacy-choices">Your Privacy Choices</a>.</p>
        <p className="text-zinc-300"><strong>GDPR/UK:</strong> access, rectification, erasure, portability, restriction, objection, and withdrawal of consent; lodge a complaint with a supervisory authority.</p>
      </section>

      <section id="transfers" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">7. International Transfers</h2>
        <p>Where required, we use Standard Contractual Clauses (SCCs) or other safeguards for cross‑border transfers.</p>
      </section>

      <section id="security" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">8. Security & Retention</h2>
        <p>We employ reasonable technical and organizational measures and retain Personal Data only as long as necessary for the purposes above or as required by law.</p>
      </section>

      <section id="children" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">9. Children’s Privacy</h2>
        <p>{SITE_DOMAIN} is not directed to children under 13; we do not knowingly collect children’s data.</p>
      </section>

      <section id="contact" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">10. Contact</h2>
        <p>
          {CONTACT_EMAIL} · {COMPANY_PHONE} · {COMPANY_POSTAL_ADDRESS}
        </p>
      </section>

      <section id="changes" className="prose-invert prose-h2:mt-8">
        <h2 className="text-2xl font-semibold text-white">11. Changes</h2>
        <p>We will post updates here and revise the Effective Date.</p>
      </section>
    </LegalLayout>
  );
}
 
