export const launchAt = "2027-02-01T05:00:00.000Z";
export const adminCookie = "__Host-medpath-preview";
export const sessionSeconds = 60 * 60 * 4;
export const privateHeaders = { "Cache-Control": "private, no-store, max-age=0" };

export function canConsiderLaunch(mode: string | undefined, now = Date.now()) {
  return mode === "false" && now >= Date.parse(launchAt);
}

export function isPublicDeployment(host: string, frameworkHost: string) {
  // Use the project's public Vercel alias until a canonical hostname is configured.
  const authority = process.env.PRELAUNCH_PUBLIC_HOST?.trim() ||
    (process.env.VERCEL_ENV === "production" ? "medpath-nine-zeta.vercel.app" : undefined);
  return Boolean(authority && host === authority && frameworkHost === authority &&
    process.env.VERCEL_ENV !== "preview" && process.env.PRELAUNCH_PREVIEW !== "true");
}

export async function isLaunchApproved() {
  if (!process.env.PRELAUNCH_PUBLIC_HOST?.trim() || !canConsiderLaunch(process.env.PRELAUNCH_MODE)) return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  try {
    const response = await fetch(new URL("/rest/v1/rpc/medpath_public_access_open", url), {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(2500)
    });
    return response.ok && await response.json() === true;
  } catch {
    return false;
  }
}

async function sign(message: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature), value => value.toString(16).padStart(2, "0")).join("");
}

export async function issueAdminSession(credential: string, host: string) {
  const password = process.env.PRELAUNCH_ADMIN_TOKEN;
  const signingKey = process.env.PRELAUNCH_SESSION_SECRET;
  if (!password || password.length < 43 || !signingKey || signingKey.length < 43 ||
    password === signingKey || credential.length !== password.length) return null;

  const provided = await sign(credential, signingKey);
  const expected = await sign(password, signingKey);
  if (!sameSignature(provided, expected)) return null;

  const expiry = Math.floor(Date.now() / 1000) + sessionSeconds;
  const key = await sign(password, signingKey);
  return `${expiry}.${await sign(`${host}:${expiry}`, key)}`;
}

function sameSignature(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

export async function isPrelaunchAdmin(cookie: string | undefined, host: string) {
  const password = process.env.PRELAUNCH_ADMIN_TOKEN;
  const signingKey = process.env.PRELAUNCH_SESSION_SECRET;
  if (!cookie || !password || password.length < 43 || !signingKey || signingKey.length < 43 ||
    password === signingKey) return false;
  const match = /^(\d{10})\.([a-f0-9]{64})$/.exec(cookie);
  if (!match || Number(match[1]) <= Math.floor(Date.now() / 1000)) return false;
  const key = await sign(password, signingKey);
  return sameSignature(match[2], await sign(`${host}:${match[1]}`, key));
}

export function sameOrigin(request: Request, host: string) {
  const origin = request.headers.get("origin");
  if (origin === `https://${host}`) return true;
  return process.env.NODE_ENV === "development" &&
    /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) && origin === `http://${host}`;
}

export async function readForm(request: Request, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) return new URLSearchParams();
  const decoder = new TextDecoder();
  let body = "";
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return new URLSearchParams(body + decoder.decode());
    bytes += value.byteLength;
    if (bytes > limit) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
}
