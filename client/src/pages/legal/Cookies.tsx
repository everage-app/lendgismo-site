import LegalLayout from "./LegalLayout";
import Meta from "./_components/Meta";
import { COMPANY_NAME, SITE_DOMAIN } from "./_components/constants";

export default function Cookies() {
  return (
    <LegalLayout>
      <Meta
        title={`Cookie Policy — ${COMPANY_NAME}`}
        description={`Learn about cookies and similar technologies used on ${SITE_DOMAIN}, with a link to manage preferences.`}
        canonical={`https://${SITE_DOMAIN}/legal/cookies`}
      />

      <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Cookie Policy</h1>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <p>
          We use cookies and similar technologies to operate and improve our site. Categories include:
        </p>
        <ul>
          <li><strong>Strictly Necessary</strong>: required for core functionality and security.</li>
          <li><strong>Functional</strong>: remember preferences and improve experience.</li>
          <li><strong>Analytics</strong>: help us understand usage to enhance the product.</li>
          <li><strong>Marketing</strong>: measure reach and support limited retargeting.</li>
        </ul>
        <p>
          Manage your preferences anytime on <a href="/legal/privacy-choices">Your Privacy Choices</a>. We honor Global Privacy Control (GPC) for CPRA sale/share opt-outs.
        </p>
        <p>
          For more details, see our <a href="/legal/privacy">Privacy Policy</a>.
        </p>
      </article>
    </LegalLayout>
  );
}
