import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { ok, fail } from "../../_lib/json.js";
import { requireAuth } from "../../_lib/session.js";
import { getAdminClient } from "../../_lib/supabase-admin.js";

const watchlistItemSchema = z.object({
  fundCode: z.string().min(1),
  num: z.number().default(0),
  cost: z.number().default(0),
  sortOrder: z.number().int().default(0),
});

const bodySchema = z.object({
  watchlist: z.array(watchlistItemSchema),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return fail(res, 405, "METHOD_NOT_ALLOWED", "只支持 POST 请求");
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "请求参数无效";
    return fail(res, 400, "VALIDATION_ERROR", message);
  }

  const { watchlist } = parsed.data;
  const adminClient = getAdminClient();

  // Check that this is indeed a first-login scenario
  const { data: profile } = await adminClient
    .from("user_profiles")
    .select("first_login_completed")
    .eq("id", user.id)
    .single();

  if (profile?.first_login_completed) {
    return fail(res, 409, "ALREADY_IMPORTED", "只能在首次登录时导入游客自选");
  }

  // Check that cloud watchlist is currently empty
  const { count } = await adminClient
    .from("user_watchlist_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count && count > 0) {
    return fail(res, 409, "WATCHLIST_NOT_EMPTY", "云端自选非空，不可导入");
  }

  // Insert guest watchlist items
  if (watchlist.length > 0) {
    const rows = watchlist.map((item, index) => ({
      user_id: user.id,
      fund_code: item.fundCode,
      num: item.num,
      cost: item.cost,
      sort_order: item.sortOrder ?? index,
    }));

    const { error } = await adminClient
      .from("user_watchlist_items")
      .insert(rows);

    if (error) {
      return fail(res, 500, "DB_ERROR", "导入自选基金失败");
    }
  }

  // Mark first login as completed
  await adminClient
    .from("user_profiles")
    .update({ first_login_completed: true })
    .eq("id", user.id);

  return ok(res, { ok: true });
}
