import LegalLayout from "./LegalLayout";
import Meta from "./_components/Meta";
import { COMPANY_NAME, SITE_DOMAIN, CONTACT_EMAIL } from "./_components/constants";

export default function DPA() {
  return (
    <LegalLayout>
      <Meta
        title={`Data Processing Addendum (DPA) — ${COMPANY_NAME}`}
        description={`Standard DPA terms for customers acting as controllers. Contact us to obtain a signed copy.`}
        canonical={`https://${SITE_DOMAIN}/legal/dpa`}
      />

      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Data Processing Addendum</h1>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <p>
          This DPA supplements our Terms and applies when {COMPANY_NAME} processes personal data on behalf of a customer
          acting as a controller. To receive a countersigned DPA tailored to your order, please contact
          {" "}<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>Scope</h2>
        <p>
          We will process personal data solely to provide the services, in accordance with documented instructions, implement
          appropriate technical and organizational measures, and support data subject requests.
        </p>

        <h2>Subprocessors</h2>
        <p>
          We may engage subprocessors with appropriate data protection commitments. Upon request, we will provide a list of
          current subprocessors.
        </p>

        <h2>Security</h2>
        <p>
          We maintain safeguards to protect personal data against accidental or unlawful destruction, loss, alteration,
          unauthorized disclosure, or access.
        </p>

        <h2>International Transfers</h2>
        <p>
          Where required, we rely on appropriate transfer mechanisms (e.g., SCCs) for cross-border data transfers.
        </p>

        <h2>Term</h2>
        <p>
          This DPA remains in effect for the duration of the services and as otherwise required by law.
        </p>
      </article>
    </LegalLayout>
  );
}
