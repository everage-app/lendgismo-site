import LegalLayout from "./LegalLayout";
import Meta from "./_components/Meta";
import { COMPANY_NAME, SITE_DOMAIN, CONTACT_EMAIL, COMPANY_POSTAL_ADDRESS } from "./_components/constants";

export default function DMCA() {
  return (
    <LegalLayout>
      <Meta
        title={`DMCA — ${COMPANY_NAME}`}
        description={`How to submit a DMCA takedown notice or counter-notice to ${COMPANY_NAME}.`}
        canonical={`https://${SITE_DOMAIN}/legal/dmca`}
      />

      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">DMCA Policy</h1>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <p>
          {COMPANY_NAME} respects intellectual property rights. If you believe content on {SITE_DOMAIN} infringes your
          copyright, please send a DMCA takedown notice containing the elements below.
        </p>

        <h2>Submit a Takedown Notice</h2>
        <ol>
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>Identification of the material that is claimed to be infringing and information reasonably sufficient to locate it.</li>
          <li>Your contact information (name, mailing address, telephone, and email).</li>
          <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner.</li>
          <li>A physical or electronic signature of a person authorized to act on behalf of the owner.</li>
        </ol>

        <p>
          Send notices to: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or by mail to {COMPANY_POSTAL_ADDRESS}.
        </p>

        <h2>Counter-Notice</h2>
        <p>
          If you believe your material was removed by mistake or misidentification, you may send a counter-notice with:
        </p>
        <ol>
          <li>Identification of the removed or disabled material and its prior location.</li>
          <li>A statement under penalty of perjury that you have a good faith belief the material was removed or disabled as a result of mistake or misidentification.</li>
          <li>Your name, address, phone number, and a statement that you consent to the jurisdiction of the courts at your address, and that you will accept service of process from the person who provided the original notice.</li>
          <li>Your physical or electronic signature.</li>
        </ol>

        <p>
          Upon receiving a valid counter-notice, we may restore the material in accordance with applicable law.
        </p>
      </article>
    </LegalLayout>
  );
}
