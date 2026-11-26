import { createDbClient } from "@/lib/supabase/db";
import { AppError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import { PORTFOLIO_IMAGE_MAX_BYTES, PORTFOLIO_IMAGE_TYPES, type CreatePortfolioItemInput } from "@/lib/validation/portfolio.schema";
import { toDisplayName } from "@/services/provider-service";
import type { DbPortfolioItem } from "@/types/database";
import type { PortfolioCommentDTO, PortfolioItemDTO } from "@/types/domain";

const BUCKET = "portfolio-images";

function mapItem(row: DbPortfolioItem, likeCount: number, commentCount: number, likedByViewer: boolean): PortfolioItemDTO {
  return {
    id: row.id,
    providerId: row.provider_id,
    title: row.title,
    deliveryStory: row.delivery_story,
    beforeImageUrl: row.before_image_url,
    afterImageUrl: row.after_image_url,
    jobLocation: row.job_location,
    completedOn: row.completed_on,
    duration: row.duration,
    extraDetails: row.extra_details,
    shareCount: row.share_count,
    likeCount,
    commentCount,
    likedByViewer,
    createdAt: row.created_at,
  };
}

async function getOwnedProviderId(userId: string): Promise<string> {
  const db = await createDbClient();
  const { data, error } = await db
    .from("provider_profiles")
    .select("id")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new AppError(error.message, 500, "PROVIDER_LOOKUP_ERROR");
  if (!data) throw new ForbiddenError("Complete your service provider profile before adding portfolio work.");
  return data.id as string;
}

async function getActiveItem(itemId: string): Promise<DbPortfolioItem> {
  const db = await createDbClient();
  const { data, error } = await db
    .from("portfolio_items")
    .select("*")
    .eq("id", itemId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new AppError(error.message, 500, "PORTFOLIO_LOOKUP_ERROR");
  if (!data) throw new NotFoundError("Portfolio item not found");
  return data as DbPortfolioItem;
}

function validateImage(file: File | null, label: string): File | null {
  if (!file || file.size === 0) return null;
  if (!(PORTFOLIO_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new ValidationError(`${label} must be a JPG, PNG or WebP image.`);
  }
  if (file.size > PORTFOLIO_IMAGE_MAX_BYTES) {
    throw new ValidationError(`${label} must be 5 MB or smaller.`);
  }
  return file;
}

async function uploadImage(userId: string, file: File, kind: "before" | "after"): Promise<{ path: string; url: string }> {
  const db = await createDbClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${crypto.randomUUID()}-${kind}.${ext}`;
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
  if (error) throw new AppError(`Image upload failed: ${error.message}`, 500, "PORTFOLIO_UPLOAD_ERROR");
  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

function storagePathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length));
}

export const portfolioService = {
  async listByProvider(providerId: string, viewerId?: string | null): Promise<PortfolioItemDTO[]> {
    const db = await createDbClient();
    const { data: rows, error } = await db
      .from("portfolio_items")
      .select("*")
      .eq("provider_id", providerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(60);

    if (error) throw new AppError(error.message, 500, "PORTFOLIO_LIST_ERROR");
    const items = (rows || []) as DbPortfolioItem[];
    if (items.length === 0) return [];

    const ids = items.map((i) => i.id);
    const [{ data: likes }, { data: comments }] = await Promise.all([
      db.from("portfolio_likes").select("item_id, user_id").in("item_id", ids),
      db.from("portfolio_comments").select("item_id").in("item_id", ids),
    ]);

    const likeCounts = new Map<string, number>();
    const likedByViewer = new Set<string>();
    (likes || []).forEach((l: { item_id: string; user_id: string }) => {
      likeCounts.set(l.item_id, (likeCounts.get(l.item_id) || 0) + 1);
      if (viewerId && l.user_id === viewerId) likedByViewer.add(l.item_id);
    });
    const commentCounts = new Map<string, number>();
    (comments || []).forEach((c: { item_id: string }) => {
      commentCounts.set(c.item_id, (commentCounts.get(c.item_id) || 0) + 1);
    });

    return items.map((row) =>
      mapItem(row, likeCounts.get(row.id) || 0, commentCounts.get(row.id) || 0, likedByViewer.has(row.id))
    );
  },

  async createItem(
    userId: string,
    input: CreatePortfolioItemInput,
    images: { before: File | null; after: File | null }
  ): Promise<PortfolioItemDTO> {
    const providerId = await getOwnedProviderId(userId);
    const before = validateImage(images.before, "Before image");
    const after = validateImage(images.after, "After image");
    if (!before && !after) {
      throw new ValidationError("Add at least one image (before or after) so customers can see the result.");
    }

    const uploaded: string[] = [];
    try {
      const beforeUpload = before ? await uploadImage(userId, before, "before") : null;
      if (beforeUpload) uploaded.push(beforeUpload.path);
      const afterUpload = after ? await uploadImage(userId, after, "after") : null;
      if (afterUpload) uploaded.push(afterUpload.path);

      const db = await createDbClient();
      const { data, error } = await db
        .from("portfolio_items")
        .insert({
          provider_id: providerId,
          title: input.title,
          delivery_story: input.deliveryStory,
          before_image_url: beforeUpload?.url ?? null,
          after_image_url: afterUpload?.url ?? null,
          job_location: input.jobLocation,
          completed_on: input.completedOn,
          duration: input.duration,
          extra_details: input.extraDetails,
        })
        .select("*")
        .single();

      if (error || !data) throw new AppError(error?.message || "Could not save portfolio item", 500, "PORTFOLIO_CREATE_ERROR");
      return mapItem(data as DbPortfolioItem, 0, 0, false);
    } catch (err) {
      if (uploaded.length > 0) {
        const db = await createDbClient();
        await db.storage.from(BUCKET).remove(uploaded).catch(() => undefined);
      }
      throw err;
    }
  },

  async deleteItem(userId: string, itemId: string): Promise<void> {
    const providerId = await getOwnedProviderId(userId);
    const item = await getActiveItem(itemId);
    if (item.provider_id !== providerId) throw new ForbiddenError("You can only delete your own portfolio work.");

    const db = await createDbClient();
    const { error } = await db.from("portfolio_items").delete().eq("id", itemId);
    if (error) throw new AppError(error.message, 500, "PORTFOLIO_DELETE_ERROR");

    const paths = [storagePathFromPublicUrl(item.before_image_url), storagePathFromPublicUrl(item.after_image_url)].filter(
      (p): p is string => Boolean(p)
    );
    if (paths.length > 0) await db.storage.from(BUCKET).remove(paths).catch(() => undefined);
  },

  async toggleLike(userId: string, itemId: string): Promise<{ liked: boolean; likeCount: number }> {
    await getActiveItem(itemId);
    const db = await createDbClient();
    const { data: existing } = await db
      .from("portfolio_likes")
      .select("id")
      .eq("item_id", itemId)
      .eq("user_id", userId)
      .maybeSingle();

    let liked: boolean;
    if (existing) {
      const { error } = await db.from("portfolio_likes").delete().eq("id", existing.id);
      if (error) throw new AppError(error.message, 500, "PORTFOLIO_LIKE_ERROR");
      liked = false;
    } else {
      const { error } = await db
        .from("portfolio_likes")
        .upsert({ item_id: itemId, user_id: userId }, { onConflict: "item_id,user_id", ignoreDuplicates: true });
      if (error) throw new AppError(error.message, 500, "PORTFOLIO_LIKE_ERROR");
      liked = true;
    }

    const { count } = await db
      .from("portfolio_likes")
      .select("id", { count: "exact", head: true })
      .eq("item_id", itemId);
    return { liked, likeCount: count || 0 };
  },

  async listComments(itemId: string): Promise<PortfolioCommentDTO[]> {
    await getActiveItem(itemId);
    const db = await createDbClient();
    const { data, error } = await db
      .from("portfolio_comments")
      .select("id, item_id, user_id, body, created_at")
      .eq("item_id", itemId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) throw new AppError(error.message, 500, "PORTFOLIO_COMMENTS_ERROR");

    const rows = data || [];
    const userIds = [...new Set(rows.map((r) => r.user_id as string))];
    const names = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: users } = await db.from("users").select("id, full_name").in("id", userIds);
      (users || []).forEach((u: { id: string; full_name: string }) => names.set(u.id, toDisplayName(u.full_name, "ASSAP member")));
    }

    return rows.map((r) => ({
      id: r.id as string,
      itemId: r.item_id as string,
      authorId: r.user_id as string,
      authorName: names.get(r.user_id as string) || "ASSAP member",
      body: r.body as string,
      createdAt: r.created_at as string,
    }));
  },

  async addComment(userId: string, authorName: string, itemId: string, body: string): Promise<PortfolioCommentDTO> {
    await getActiveItem(itemId);
    const db = await createDbClient();
    const { data, error } = await db
      .from("portfolio_comments")
      .insert({ item_id: itemId, user_id: userId, body })
      .select("id, item_id, user_id, body, created_at")
      .single();
    if (error || !data) throw new AppError(error?.message || "Could not post comment", 500, "PORTFOLIO_COMMENT_ERROR");
    return {
      id: data.id as string,
      itemId: data.item_id as string,
      authorId: data.user_id as string,
      authorName: toDisplayName(authorName, "ASSAP member"),
      body: data.body as string,
      createdAt: data.created_at as string,
    };
  },

  async recordShare(itemId: string): Promise<{ shareCount: number }> {
    const item = await getActiveItem(itemId);
    const next = (item.share_count || 0) + 1;
    const db = await createDbClient();
    const { error } = await db.from("portfolio_items").update({ share_count: next }).eq("id", itemId);
    if (error) throw new AppError(error.message, 500, "PORTFOLIO_SHARE_ERROR");
    return { shareCount: next };
  },
};
