import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const priceEnv: Record<string, string | undefined> = {
  explorer: process.env.STRIPE_EXPLORER_PRICE_ID,
  student_plus: process.env.STRIPE_STUDENT_PLUS_PRICE_ID,
  pro_student: process.env.STRIPE_PRO_STUDENT_PRICE_ID,
  founding_member: process.env.STRIPE_FOUNDING_MEMBER_PRICE_ID
};

export async function POST(request: Request) {
  const { plan, userId, email } = await request.json();
  const price = priceEnv[plan];

  if (!stripe || !price) {
    return NextResponse.json(
      {
        mode: "demo",
        message:
          "Stripe credentials are not configured. Add STRIPE_SECRET_KEY and plan price IDs to enable Checkout."
      },
      { status: 202 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?checkout=cancelled`,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId, plan }
    },
    metadata: { userId, plan }
  });

  return NextResponse.json({ url: session.url });
}
