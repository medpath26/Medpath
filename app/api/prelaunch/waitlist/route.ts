import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";
import { isPublicDeployment, privateHeaders, readForm, sameOrigin } from "@/lib/prelaunch";

const consentVersion = "launch-and-founding-2026-11";
const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

export async function POST(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (!isPublicDeployment(host, request.nextUrl.host) || !sameOrigin(request, host)) {
    return new Response("Forbidden", { status: 403, headers: privateHeaders });
  }

  if (request.headers.get("content-type")?.split(";")[0] !== "application/x-www-form-urlencoded") {
    return new Response("Unsupported submission", { status: 415, headers: privateHeaders });
  }
  const form = await readForm(request, 2048);
  if (!form) return new Response("Submission is too large", { status: 413, headers: privateHeaders });

  const redirect = (result: string) => new NextResponse(null, {
    status: 303, headers: { ...privateHeaders, Location: `/?waitlist=${result}#waitlist` }
  });

  const email = (form.get("email") ?? "").trim().toLowerCase();
  if (form.get("website")) return redirect("joined");
  if (form.get("consent") !== "yes" || email.length > 254 || !emailPattern.test(email)) {
    return redirect("invalid");
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return redirect("unavailable");
  const { error } = await supabase.from("prelaunch_waitlist").insert({ email, consent_version: consentVersion });
  return redirect(error && error.code !== "23505" ? "unavailable" : "joined");
}
