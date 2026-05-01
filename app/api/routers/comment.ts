import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { comments, posts, notifications, users } from "@db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";

export const commentRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        postId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const result = await db.select().from(comments)
        .where(eq(comments.postId, input.postId))
        .orderBy(desc(comments.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      const userIds = [...new Set(result.map(c => c.userId))];
      const commentUsers = userIds.length > 0
        ? await db.select().from(users).where(inArray(users.id, userIds))
        : [];
      const userMap = new Map(commentUsers.map(u => [u.id, u]));
      
      return result.map(comment => ({
        ...comment,
        user: userMap.get(comment.userId) ? {
          id: userMap.get(comment.userId)!.id,
          username: userMap.get(comment.userId)!.username,
          fullName: userMap.get(comment.userId)!.fullName,
          avatarUrl: userMap.get(comment.userId)!.avatarUrl,
        } : null,
      }));
    }),

  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        postId: z.number(),
        text: z.string().min(1),
        parentId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(comments).values({
        userId: input.userId,
        postId: input.postId,
        text: input.text,
        parentId: input.parentId || null,
      });
      await db.update(posts)
        .set({ commentsCount: sql`${posts.commentsCount} + 1` })
        .where(eq(posts.id, input.postId));
      
      // Create notification
      const post = await db.select().from(posts).where(eq(posts.id, input.postId)).limit(1);
      if (post.length > 0 && post[0].userId !== input.userId) {
        await db.insert(notifications).values({
          userId: post[0].userId,
          actorId: input.userId,
          type: "comment",
          referenceId: input.postId,
        });
      }
      return { id: Number(result[0].insertId) };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(comments).where(eq(comments.id, input.id));
      return { success: true };
    }),
});
