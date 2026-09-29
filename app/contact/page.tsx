import type { Metadata } from "next";
import { PublicInfoPage } from "@/components/PublicInfoPage";

export const metadata: Metadata = {
  title: "Contact | MedPath",
  description: "Contact the MedPath team for account, billing, or product support."
};

export default function ContactPage() {
  return (
    <PublicInfoPage
      eyebrow="Contact"
      title="How can we help?"
      intro="Contact MedPath for account access, billing questions, product feedback, or partnership inquiries."
    >
      <section>
        <h2>Email support</h2>
        <p>
          Send a message to <a href="mailto:Medpath.space@gmail.com">Medpath.space@gmail.com</a>. Include the email
          address connected to your account and a short description of the issue. Never email your
          password or complete payment-card details.
        </p>
      </section>
      <section>
        <h2>Billing help</h2>
        <p>
          For subscription questions, include the plan name and the approximate payment date. Card
          details are handled by Stripe, so MedPath support will never ask for your complete card number.
        </p>
      </section>
      <section>
        <h2>Safety and accuracy feedback</h2>
        <p>
          If you notice educational content that may be inaccurate or unclear, tell us which page or
          lesson you were viewing. We appreciate feedback that helps make MedPath safer and more useful.
        </p>
      </section>
    </PublicInfoPage>
  );
}
