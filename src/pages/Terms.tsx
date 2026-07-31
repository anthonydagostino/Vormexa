import { LegalPage, P, Section, UL } from '@/components/layout/LegalPage'
import { CONTACT_EMAIL } from '@/config'

export function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 2026"
      intro="These terms govern your use of Vormexa. By using the app, you agree to them. Please read them carefully."
    >
      <Section heading="1. The service">
        <P>
          Vormexa provides browser-based and desktop tools to edit video, photos, audio and PDF
          files entirely on your own device. A core set of tools is free to use. “Vormexa Pro” is an
          optional paid upgrade that unlocks additional capabilities such as unlimited batch
          processing.
        </P>
      </Section>

      <Section heading="2. Your license to Pro">
        <P>
          Purchasing Vormexa Pro grants you a personal, non-exclusive, non-transferable license to
          use the Pro features. Your purchase includes a license key with a limited number of device
          activations. You may not resell, sublicense, or share your license key, or attempt to
          circumvent activation limits or licensing.
        </P>
      </Section>

      <Section heading="3. Acceptable use">
        <UL>
          <li>
            You are solely responsible for the files you process and for having the rights to them.
          </li>
          <li>Do not use Vormexa to create or process unlawful or infringing content.</li>
          <li>
            Do not attempt to disrupt, reverse-engineer, or abuse the service or its licensing.
          </li>
        </UL>
      </Section>

      <Section heading="4. Payments and refunds">
        <P>
          Prices are shown in U.S. dollars and processed by our payment provider, Lemon Squeezy.
          Vormexa Pro is a one-time purchase. If you are not satisfied, contact us within 14 days of
          purchase and we will provide a refund of your Pro purchase.
        </P>
      </Section>

      <Section heading="5. Intellectual property">
        <P>
          Vormexa, its branding, and its original code are owned by us. The app also incorporates
          third-party open-source software, which remains subject to its respective licenses.
        </P>
      </Section>

      <Section heading="6. Disclaimer of warranties">
        <P>
          Vormexa is provided “as is,” without warranties of any kind. While we work hard to keep it
          reliable, we do not guarantee that every file or format will process perfectly. Always
          keep your own backups of important files — you are responsible for your original media.
        </P>
      </Section>

      <Section heading="7. Limitation of liability">
        <P>
          To the maximum extent permitted by law, Vormexa is not liable for any indirect or
          consequential damages, or for any loss of data. Our total liability for any claim will not
          exceed the amount you paid us in the 12 months before the claim.
        </P>
      </Section>

      <Section heading="8. Changes">
        <P>
          We may update the service and these terms over time. Continued use after changes take
          effect constitutes acceptance of the updated terms.
        </P>
      </Section>

      <Section heading="9. Governing law">
        <P>
          These terms are governed by the laws of the State of New Jersey, United States, without
          regard to its conflict-of-laws principles.
        </P>
      </Section>

      <Section heading="10. Contact">
        <P>
          Questions about these terms? Email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand-300 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </P>
      </Section>
    </LegalPage>
  )
}
