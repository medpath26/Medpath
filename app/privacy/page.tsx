import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/PublicInfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy | MedPath",
  description: "Read the MedPath privacy policy."
};

export default function PrivacyPage() {
  return (
    <PublicInfoPage
      eyebrow="Privacy Policy"
      title="Your information should support your path—not complicate it."
      intro="Effective September 29, 2026. This policy explains what MedPath collects, why we use it, and the choices available to you."
    >
      <section>
        <h2>Information we collect</h2>
        <p>
          We may collect account details such as your name, email address, healthcare program, learning
          preferences, saved progress, practice activity, and messages you choose to submit to Atlas.
          We also collect basic technical and usage information needed to operate and secure the service.
        </p>
      </section>
      <section>
        <h2>Payments</h2>
        <p>
          Stripe processes subscription payments. MedPath receives transaction and subscription details
          such as your plan, payment status, and Stripe customer identifier, but does not store your full
          payment-card number.
        </p>
      </section>
      <section>
        <h2>How we use information</h2>
        <p>
          We use information to provide and personalize MedPath, save progress, manage subscriptions,
          respond to support requests, protect accounts, diagnose problems, and improve learning tools.
          We do not sell personal information.
        </p>
      </section>
      <section>
        <h2>Service providers and disclosure</h2>
        <p>
          We may share information with vendors that help us operate MedPath, including hosting,
          authentication, database, and payment providers. We may also disclose information when required
          by law or when reasonably necessary to protect users, MedPath, or the public.
        </p>
      </section>
      <section>
        <h2>Retention and security</h2>
        <p>
          We retain information for as long as reasonably needed to provide the service, meet legal and
          accounting obligations, resolve disputes, and prevent abuse. We use reasonable safeguards, but
          no online service can guarantee absolute security.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>
          You may request access, correction, or deletion of your account information by contacting us.
          Some records may be retained where required for legal, security, or financial purposes.
        </p>
      </section>
      <section>
        <h2>Children and policy updates</h2>
        <p>
          MedPath is not directed to children under 13. We may update this policy as the service evolves;
          the effective date above will change when a revised policy is published.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions about privacy may be sent to <a href="mailto:Medpath.space@gmail.com">Medpath.space@gmail.com</a>.</p>
      </section>
    </PublicInfoPage>
  );
}
