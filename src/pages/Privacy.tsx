import { LegalPage, P, Section, UL } from '@/components/layout/LegalPage'
import { CONTACT_EMAIL } from '@/config'

export function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="July 2026"
      intro="Vormexa is built privacy-first. Most of the data a normal app would collect simply never exists here, because your files are processed entirely on your own device and are never uploaded to us."
    >
      <Section heading="1. The files you process never leave your device">
        <P>
          When you compress, convert, resize, merge, or otherwise edit a file with Vormexa, that
          processing happens locally in your browser (or in the desktop app) using WebAssembly. Your
          videos, photos, audio and documents are never uploaded to our servers, never transmitted
          to any third party, and are never seen by us. You can verify this yourself in your
          browser's network tab.
        </P>
      </Section>

      <Section heading="2. Information we do not collect">
        <UL>
          <li>We do not require an account or sign-up to use the tools.</li>
          <li>We do not collect, store, or have access to the contents of your files.</li>
          <li>We do not use advertising cookies or cross-site tracking.</li>
        </UL>
      </Section>

      <Section heading="3. Anonymous usage analytics">
        <P>
          To understand which tools are used and how the site is performing, we use
          privacy-friendly, cookieless analytics (Vercel Web Analytics). This collects aggregate,
          anonymized data such as page views and general device/browser type. It does not identify
          you personally and does not track you across other websites.
        </P>
      </Section>

      <Section heading="4. Payments">
        <P>
          Purchases of Vormexa Pro are handled by our payment provider, Lemon Squeezy, who acts as
          the merchant of record. When you buy Pro, Lemon Squeezy collects the billing information
          needed to process your payment under their own privacy policy. We receive limited order
          details (such as your email address and license key) in order to deliver your purchase and
          provide support. We never receive or store your full payment card details.
        </P>
      </Section>

      <Section heading="5. Local storage on your device">
        <P>
          If you activate a Pro license, we store your license key and activation status in your
          browser's local storage — on your device only — so the app remembers that you're a Pro
          user. You can clear this at any time from the app's Account page or your browser settings.
        </P>
      </Section>

      <Section heading="6. Who we share data with">
        <P>
          We do not sell your personal information. We rely on a small number of service providers
          to operate Vormexa:
        </P>
        <UL>
          <li>Vercel — website hosting and anonymous analytics.</li>
          <li>Lemon Squeezy — payment processing and license management.</li>
          <li>Cloudflare — domain registration and DNS.</li>
        </UL>
      </Section>

      <Section heading="7. Your rights">
        <P>
          Because we hold almost no personal data, there is very little about you for us to access
          or delete. If you have purchased Pro and would like us to access, correct, or delete the
          order information associated with your email, contact us and we will help.
        </P>
      </Section>

      <Section heading="8. Children">
        <P>
          Vormexa is not directed to children under 13, and we do not knowingly collect their data.
        </P>
      </Section>

      <Section heading="9. Changes to this policy">
        <P>
          We may update this policy from time to time. Material changes will be reflected by
          updating the “Last updated” date above.
        </P>
      </Section>

      <Section heading="10. Contact">
        <P>
          Questions about this policy? Email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-300 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </P>
      </Section>
    </LegalPage>
  )
}
