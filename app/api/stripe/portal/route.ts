import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient, getRequestUser } from "@/lib/supabase-server";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to manage billing." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!stripe || !supabase || !appUrl) {
    return NextResponse.json({ error: "Billing management is temporarily unavailable." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle<{ stripe_customer_id: string | null }>();

  if (error || !data?.stripe_customer_id) {
    return NextResponse.json({ error: "No active billing account was found." }, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${appUrl}/?view=billing`
    });
    return NextResponse.json({ url: session.url });
  } catch (portalError) {
    console.error("Stripe portal creation failed", portalError);
    return NextResponse.json({ error: "Billing management could not be opened." }, { status: 502 });
  }
}
