import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
const guestCounts = new Map<string, { count: number; expires: number }>();

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Atlas is not configured yet." }, { status: 503 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question || question.length > 2000) return NextResponse.json({ error: "Enter a question of up to 2,000 characters." }, { status: 400 });
  const program = typeof body.program === "string" ? body.program.slice(0, 100) : "Healthcare";
  const bearer = req.headers.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : null;
  let free = false;
  let userId = "";
  let db: ReturnType<typeof createClient> | undefined;
  if (token) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anon) return NextResponse.json({ error: "Authentication is unavailable." }, { status: 503 });
    db = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
    const { data: auth, error } = await db.auth.getUser(token);
    if (error || !auth.user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    userId = auth.user.id;
    const { data: profile, error: profileError } = await db.from("profiles").select("role").eq("id", userId).single();
    if (profileError || !profile) return NextResponse.json({ error: "Unable to verify subscription." }, { status: 403 });
    free = !["student_plus", "pro_student", "founding_member", "administrator"].includes(profile.role);
    if (free) {
      const { count, error: countError } = await db.from("atlas_questions").select("*", { head: true, count: "exact" }).eq("user_id", userId);
      if (countError) return NextResponse.json({ error: "Unable to verify free questions." }, { status: 503 });
      if ((count ?? 0) >= 3) return NextResponse.json({ error: "You've reached your three free Atlas questions." }, { status: 429 });
    }
  } else {
    // Temporary best-effort guest limit; replace with durable rate limiting before public launch.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now(), previous = guestCounts.get(ip);
    if (previous && previous.expires > now && previous.count >= 3) return NextResponse.json({ error: "Guest trial limit reached. Sign up to continue." }, { status: 429 });
    guestCounts.set(ip, previous && previous.expires > now ? { ...previous, count: previous.count + 1 } : { count: 1, expires: now + 86400000 });
  }
  const history = Array.isArray(body.history) ? body.history.slice(-10).filter((m): m is { role: string; text: string } => m && typeof m === "object" && (m.role === "user" || m.role === "atlas") && typeof m.text === "string").map(m => ({ role: m.role === "atlas" ? "assistant" : "user", content: m.text.slice(0, 1500) })) : [];
  try {
    const result = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: process.env.OPENAI_ATLAS_MODEL || "gpt-4o-mini", max_tokens: 600, messages: [
        { role: "system", content: `You are Atlas Tutor, a supportive healthcare study tutor. Student pathway: ${program}. Respond directly and specifically to the student's actual question, using conversation context. Explain clearly and accurately, with examples when useful. Never invent the student's achievements, history or scores. For clinical and medication questions, stress supervised scope, patient safety and facility policy. Do not provide personal diagnoses or treatment instructions.` },
        ...history, { role: "user", content: question }
      ] }), signal: AbortSignal.timeout(25000)
    });
    if (!result.ok) return NextResponse.json({ error: result.status === 429 ? "Atlas has no API credits or quota available. Add credits to activate AI responses." : "Atlas AI is temporarily unavailable." }, { status: 503 });
    const json = await result.json();
    const answer = json?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) throw Error("Empty answer");
    if (free && db) {
      const { error } = await db.from("atlas_questions").insert({ user_id: userId, question });
      if (error) return NextResponse.json({ error: "Unable to record the free question." }, { status: 503 });
    }
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "Atlas is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
