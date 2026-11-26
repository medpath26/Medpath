import { NextRequest, NextResponse } from "next/server";
import { adminCookie, isLaunchApproved, isPrelaunchAdmin, isPublicDeployment, privateHeaders } from "@/lib/prelaunch";
import { comingSoon, previewSignIn } from "@/lib/prelaunch-page";

const publicAssets = new Set(["/medpath-favicon.png", "/prelaunch-atlas.webp", "/prelaunch-social.jpg"]);

function noStore(response: NextResponse) {
  response.headers.set("Cache-Control", privateHeaders["Cache-Control"]);
  return response;
}

function unavailable(status = 404) {
  return NextResponse.json({ error: "Unavailable" }, { status, headers: privateHeaders });
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const host = request.headers.get("host") ?? "";
  const publicDeployment = isPublicDeployment(host, request.nextUrl.host);
  const read = request.method === "GET" || request.method === "HEAD";

  // Keep the prelaunch endpoints out of the launched app.
  if (publicDeployment && await isLaunchApproved()) {
    return path.startsWith("/api/prelaunch/") ? unavailable() : NextResponse.next();
  }

  if (path === "/api/prelaunch/session") return noStore(NextResponse.next());
  if (publicDeployment && path === "/api/prelaunch/waitlist") return noStore(NextResponse.next());

  // Signature verification remains mandatory inside the webhook handler.
  if (publicDeployment && path === "/api/stripe/webhook" && request.method === "POST") {
    return noStore(NextResponse.next());
  }

  if (await isPrelaunchAdmin(request.cookies.get(adminCookie)?.value, host)) {
    if (path.startsWith("/api/prelaunch/")) return unavailable();
    if (["/api/stripe/checkout", "/api/stripe/portal"].includes(path) &&
      (publicDeployment || !process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_"))) {
      return unavailable();
    }
    return noStore(NextResponse.next());
  }

  if (publicDeployment && read && publicAssets.has(path)) return NextResponse.next();
  if (publicDeployment && read && path === "/") return comingSoon(host);
  if (!publicDeployment && read && path === "/") return previewSignIn();
  return unavailable();
}

export const config = { matcher: ["/:path*"] };
