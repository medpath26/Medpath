import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient, getRequestUser } from "@/lib/supabase-server";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const priceEnv: Record<string, string | undefined> = {
  student_plus: process.env.STRIPE_STUDENT_PLUS_PRICE_ID,
  pro_student: process.env.STRIPE_PRO_STUDENT_PRICE_ID,
  founding_member: process.env.STRIPE_FOUNDING_MEMBER_PRICE_ID
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
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Founding Member checkout is temporarily unavailable." },
        { status: 503 }
      );
    }

    const { count, error } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("plan", "founding_member");

    if (error) {
      console.error("Founding Member availability check failed", error);
      return NextResponse.json(
        { error: "We couldn't confirm Founding Member availability. Please try again." },
        { status: 503 }
      );
    }

    if ((count ?? 0) >= 20) {
      return NextResponse.json(
        { error: "All 20 Founding Member spots have been claimed." },
        { status: 409 }
      );
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!appUrl) {
    return NextResponse.json({ error: "Checkout is not configured for this site." }, { status: 503 });
  }

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
