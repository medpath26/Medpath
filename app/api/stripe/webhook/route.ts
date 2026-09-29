import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !signature) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    console.error("Stripe webhook cannot sync because Supabase admin credentials are missing");
    return NextResponse.json({ error: "Subscription sync is not configured." }, { status: 503 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId || session.client_reference_id;
      const plan = session.metadata?.plan;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

      if (userId && plan && subscriptionId) {
        await syncSubscription(supabase, { userId, plan, subscriptionId, customerId, status: "active" });
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const userId = subscription.metadata.userId;
      const plan = subscription.metadata.plan;
      if (userId && plan) {
        await syncSubscription(supabase, {
          userId,
          plan,
          subscriptionId: subscription.id,
          customerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
          status: subscription.status,
          currentPeriodEnd: getCurrentPeriodEnd(subscription)
        });
      }
    }
  } catch (error) {
    console.error(`Stripe webhook sync failed for ${event.id}`, error);
    return NextResponse.json({ error: "Subscription sync failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  return subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;
}

async function syncSubscription(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  values: {
    userId: string;
    plan: string;
    subscriptionId: string;
    customerId?: string | null;
    status: string;
    currentPeriodEnd?: string | null;
  }
) {
  const active = ["active", "trialing", "past_due"].includes(values.status);
  const role = active ? values.plan : "explorer";
  const { error: subscriptionError } = await supabase.from("subscriptions").upsert(
    {
      user_id: values.userId,
      stripe_customer_id: values.customerId ?? null,
      stripe_subscription_id: values.subscriptionId,
      plan: values.plan,
      status: values.status,
      current_period_end: values.currentPeriodEnd ?? null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "stripe_subscription_id" }
  );
  if (subscriptionError) throw subscriptionError;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", values.userId);
  if (profileError) throw profileError;
}
