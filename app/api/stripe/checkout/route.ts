import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getRequestUser } from "@/lib/supabase-server";

const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.stripemedpath_STRIPE_SECRET_KEY;
const stripe = stripeSecret
  ? new Stripe(stripeSecret)
  : null;

const priceEnv: Record<string, string | undefined> = {
  student_plus: process.env.STRIPE_STUDENT_PLUS_PRICE_ID || "price_1UL21U7jTIbt8vqef1yRISSV",
  pro_student: process.env.STRIPE_PRO_STUDENT_PRICE_ID || "price_1UL21q7jTIbt8vqe883zeJGh",
  founding_member: process.env.STRIPE_FOUNDING_MEMBER_PRICE_ID || "price_1UL2267jTIbt8vqesTuaLZzg"
};

const allowedPlans = new Set(Object.keys(priceEnv));
const trialPlans = new Set(["student_plus", "founding_member"]);

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to start checkout." }, { status: 401 });
  }

  let payload: { plan?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const plan = payload.plan ?? "";
  if (!allowedPlans.has(plan)) {
    return NextResponse.json({ error: "Select a valid paid plan." }, { status: 400 });
  }

  const price = priceEnv[plan];

  if (!stripe || !price) {
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  if (plan === "founding_member") {
    try {
      const subscriptions = await stripe.subscriptions.list({
        price,
        status: "all",
        limit: 100
      });
      const claimedSpots = subscriptions.data.filter((subscription) =>
        ["active", "trialing", "past_due", "unpaid"].includes(subscription.status)
      ).length;

      if (claimedSpots >= 20) {
        return NextResponse.json(
          { error: "All 20 Founding Member spots have been claimed." },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("Founding Member availability check failed", error);
      return NextResponse.json(
        { error: "We couldn't confirm Founding Member availability. Please try again." },
        { status: 503 }
      );
    }
  }

  const appUrl = "https://medpathmentor.space";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [{ price, quantity: 1 }],
      success_url: `${appUrl}/?view=billing&checkout=success`,
      cancel_url: `${appUrl}/?view=billing&checkout=cancelled`,
      subscription_data: {
        ...(trialPlans.has(plan) ? { trial_period_days: 7 } : {}),
        metadata: { userId: user.id, plan }
      },
      metadata: { userId: user.id, plan }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed", error);
    return NextResponse.json({ error: "Checkout could not be started. Please try again." }, { status: 502 });
  }
}
