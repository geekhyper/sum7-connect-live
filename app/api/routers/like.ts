import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { likes, posts, notifications } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const likeRouter = createRouter({
  toggle: publicQuery
    .input(
      z.object({
        userId: z.number(),
        postId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(likes)
        .where(and(eq(likes.userId, input.userId), eq(likes.postId, input.postId)))
        .limit(1);
      
      if (existing.length > 0) {
        // Unlike
        await db.delete(likes).where(eq(likes.id, existing[0].id));
        await db.update(posts)
          .set({ likesCount: sql`${posts.likesCount} - 1` })
          .where(eq(posts.id, input.postId));
        return { liked: false };
      } else {
        // Like
        await db.insert(likes).values({
          userId: input.userId,
          postId: input.postId,
        });
        await db.update(posts)
          .set({ likesCount: sql`${posts.likesCount} + 1` })
          .where(eq(posts.id, input.postId));
        
        // Create notification
        const post = await db.select().from(posts).where(eq(posts.id, input.postId)).limit(1);
        if (post.length > 0 && post[0].userId !== input.userId) {
          await db.insert(notifications).values({
            userId: post[0].userId,
            actorId: input.userId,
            type: "like",
            referenceId: input.postId,
          });
        }
        return { liked: true };
      }
    }),

  check: publicQuery
    .input(
      z.object({
        userId: z.number(),
        postId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(likes)
        .where(and(eq(likes.userId, input.userId), eq(likes.postId, input.postId)))
        .limit(1);
      return { liked: existing.length > 0 };
    }),

  getLikers: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(likes).where(eq(likes.postId, input.postId));
      return result;
    }),
});
