import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/PublicInfoPage";

export const metadata: Metadata = {
  title: "Terms of Service | MedPath",
  description: "Read the MedPath terms of service."
};

export default function TermsPage() {
  return (
    <PublicInfoPage
      eyebrow="Terms of Service"
      title="Terms for using MedPath."
      intro="Effective September 29, 2026. By creating an account or using MedPath, you agree to these terms."
    >
      <section>
        <h2>Educational service</h2>
        <p>
          MedPath provides educational and career-preparation tools. It is not medical advice, a medical
          device, an accredited school, or a substitute for instructors, clinical policies, official
          certification materials, or licensed healthcare professionals.
        </p>
      </section>
      <section>
        <h2>Accounts</h2>
        <p>
          You are responsible for providing accurate information, protecting your login credentials, and
          activity under your account. Notify us promptly if you believe your account has been compromised.
        </p>
      </section>
      <section>
        <h2>Subscriptions, trials, and cancellation</h2>
        <p>
          Paid subscriptions renew monthly until canceled. Eligible Pro and Founding Member subscriptions
          include a seven-day trial; Elite begins billing immediately. You may cancel through the billing
          controls, and access continues according to the terms shown during checkout. Founding Member
          pricing is limited to the first 20 qualifying subscribers.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>
          You may not misuse the service, attempt unauthorized access, interfere with other users,
          distribute malicious code, scrape the service at scale, or use MedPath to violate law or the
          rights of others.
        </p>
      </section>
      <section>
        <h2>Content and intellectual property</h2>
        <p>
          MedPath and its original software, design, branding, and educational materials are protected by
          applicable intellectual-property laws. You retain ownership of content you submit and grant us
          permission to process it only as needed to operate and improve the service.
        </p>
      </section>
      <section>
        <h2>Availability and disclaimers</h2>
        <p>
          We work to keep MedPath useful and available, but the service is provided on an “as is” and “as
          available” basis. We do not guarantee uninterrupted operation, exam results, certification,
          employment, or that every educational response is complete or error-free.
        </p>
      </section>
      <section>
        <h2>Limitation and changes</h2>
        <p>
          To the extent permitted by law, MedPath is not liable for indirect, incidental, or consequential
          losses arising from use of the service. We may update these terms or the service, and continued
          use after updated terms become effective means you accept them.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions about these terms may be sent to <a href="mailto:Medpath.space@gmail.com">Medpath.space@gmail.com</a>.</p>
      </section>
    </PublicInfoPage>
  );
}
