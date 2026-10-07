import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const FOUNDING_LIMIT = 50;

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { count, error } = await supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("plan", "founding_member")
      .in("status", ["active", "trialing"]);

    if (error) {
      console.error("Founding availability error:", error);

      return NextResponse.json(
        { error: "Unable to check Founding Member availability." },
        { status: 500 }
      );
    }

    const claimed = count ?? 0;
    const remaining = Math.max(FOUNDING_LIMIT - claimed, 0);

    return NextResponse.json({
      available: claimed < FOUNDING_LIMIT,
      claimed,
      remaining,
      limit: FOUNDING_LIMIT,
    });
  } catch (error) {
    console.error("Founding availability error:", error);

    return NextResponse.json(
      { error: "Unable to check Founding Member availability." },
      { status: 500 }
    );
  }
}