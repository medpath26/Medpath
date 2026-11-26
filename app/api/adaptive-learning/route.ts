import { createClient } from "@supabase/supabase-js";
import { canAccess, type PlanKey } from "@/lib/medpath-data";

const headers = { "Cache-Control": "private, no-store" };
const result = (body: unknown, status: number) => Response.json(body, { status, headers });

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bearer = request.headers.get("authorization");
  if (!url || !key) return result({ error: "Unavailable" }, 503);
  if (!bearer?.startsWith("Bearer ")) return result({ error: "Sign in required" }, 401);
  const token = bearer.slice(7);
  const client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: auth, error: authError } = await client.auth.getUser(token);
  if (authError || !auth.user) return result({ error: "Sign in required" }, 401);
  const { data: profile, error: profileError } = await client.from("profiles")
    .select("role,healthcare_program").eq("id", auth.user.id).maybeSingle();
  if (profileError) return result({ error: "Unable to load profile" }, 503);
  if (!profile || !canAccess(profile.role as PlanKey, "adaptiveLearning")) return result({ error: "Plan access required" }, 403);
  const pathway = profile.healthcare_program?.trim();
  if (!pathway) return result({ attempts: [] }, 200);
  const { data, error } = await client.from("quiz_attempts")
    .select("topic,score,total_questions,correct_answers,created_at")
    .eq("user_id", auth.user.id).eq("pathway", pathway)
    .order("created_at", { ascending: false }).limit(250);
  if (error) return result({ error: "Unable to load quiz history" }, 503);
  return result({ attempts: data ?? [] }, 200);
}
