import { createSupabaseAdminClient, getRequestUser } from "@/lib/supabase-server";
const headers = { "Cache-Control": "private, no-store" };
const result = (body: unknown, status: number) => Response.json(body, { status, headers });
export async function POST(request: Request) {
  const admin = createSupabaseAdminClient();
  if (!admin) return result({ error: "Atlas is temporarily unavailable." }, 503);
  const user = await getRequestUser(request);
  if (!user) return result({ error: "Please sign in to use Atlas." }, 401);
  const { data, error } = await admin.rpc("reserve_atlas_tutor_question", { p_user_id: user.id });
  if (error) return result({ error: "Could not check Atlas usage. Please try again." }, 503);
  if (data === "limit") return result({ error: "Your free Atlas questions have been used." }, 429);
  if (data !== "ok") return result({ error: "Your account cannot use Atlas." }, 403);
  return result({ ok: true }, 200);
}
