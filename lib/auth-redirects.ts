export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(next = "/") {
  const url = new URL("/auth/callback", getSiteUrl());
  url.searchParams.set("next", next);
  return url.toString();
}
