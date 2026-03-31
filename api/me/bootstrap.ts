import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ok } from "../_lib/json.js";
import { resolveSession } from "../_lib/session.js";
import { getAdminClient } from "../_lib/supabase-admin.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: { code: "METHOD_NOT_ALLOWED", message: "只支持 GET 请求" } });
    return;
  }

  const { user } = await resolveSession(req, res);

  if (!user) {
    return ok(res, { authenticated: false });
  }

  const adminClient = getAdminClient();

  // Fetch or create user profile
  const { data: profile } = await adminClient
    .from("user_profiles")
    .select("email, first_login_completed, nickname, avatar_url")
    .eq("id", user.id)
    .single();

  // Fetch watchlist sorted by sort_order
  const { data: watchlist } = await adminClient
    .from("user_watchlist_items")
    .select("fund_code, num, cost, sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  return ok(res, {
    authenticated: true,
    profile: {
      email: profile?.email ?? user.email,
      isFirstLogin: profile ? !profile.first_login_completed : true,
      nickname: profile?.nickname,
      avatarUrl: profile?.avatar_url,
    },
    watchlist: (watchlist ?? []).map((item) => ({
      fundCode: item.fund_code,
      num: Number(item.num),
      cost: Number(item.cost),
      sortOrder: item.sort_order,
    })),
  });
}
