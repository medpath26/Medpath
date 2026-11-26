import { NextResponse } from "next/server";
import { adminCookie, issueAdminSession, privateHeaders, readForm, sameOrigin, sessionSeconds } from "@/lib/prelaunch";

export async function POST(request: Request) {
  const host = request.headers.get("host") ?? "";
  if (!sameOrigin(request, host)) {
    return new Response("Forbidden", { status: 403, headers: privateHeaders });
  }

  if (request.headers.get("content-type")?.split(";")[0] !== "application/x-www-form-urlencoded") {
    return new Response("Unsupported submission", { status: 415, headers: privateHeaders });
  }

  const form = await readForm(request, 1024);
  const credential = form?.get("token");
  const value = credential ? await issueAdminSession(credential, host) : null;
  if (!value) {
    return new Response("Access denied", { status: 403, headers: privateHeaders });
  }

  const response = new NextResponse(null, { status: 303, headers: { ...privateHeaders, Location: "/" } });
  response.cookies.set(adminCookie, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: sessionSeconds
  });
  return response;
}
