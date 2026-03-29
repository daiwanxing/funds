import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { ok, fail } from "../_lib/json.js";
import { requireAuth } from "../_lib/session.js";
import { getAdminClient } from "../_lib/supabase-admin.js";

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
  if (req.method !== "PUT") {
    return fail(res, 405, "METHOD_NOT_ALLOWED", "只支持 PUT 请求");
  }

  const user = await requireAuth(req, res);
  if (!user) return; // 401 already sent

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "请求参数无效";
    return fail(res, 400, "VALIDATION_ERROR", message);
  }

  const { watchlist } = parsed.data;
  const adminClient = getAdminClient();

  // Delete all existing rows for this user
  await adminClient
    .from("user_watchlist_items")
    .delete()
    .eq("user_id", user.id);

  // Insert replacement rows
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
      return fail(res, 500, "DB_ERROR", "保存自选基金失败");
    }
  }

  return ok(res, { ok: true });
}
