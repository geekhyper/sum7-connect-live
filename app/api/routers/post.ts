import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { posts, users, comments } from "@db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";

export const postRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(10),
        userId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const query = input.userId
        ? db.select().from(posts).where(eq(posts.userId, input.userId)).orderBy(desc(posts.createdAt)).limit(input.limit).offset(offset)
        : db.select().from(posts).orderBy(desc(posts.createdAt)).limit(input.limit).offset(offset);
      const result = await query;
      
      // Get user info for each post
      const userIds = [...new Set(result.map(p => p.userId))];
      const postUsers = userIds.length > 0 
        ? await db.select().from(users).where(inArray(users.id, userIds))
        : [];
      const userMap = new Map(postUsers.map(u => [u.id, u]));
      
      return result.map(post => ({
        ...post,
        user: userMap.get(post.userId) ? {
          id: userMap.get(post.userId)!.id,
          username: userMap.get(post.userId)!.username,
          fullName: userMap.get(post.userId)!.fullName,
          avatarUrl: userMap.get(post.userId)!.avatarUrl,
        } : null,
      }));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(posts).where(eq(posts.id, input.id)).limit(1);
      if (result.length === 0) return null;
      const post = result[0];
      const postUser = await db.select().from(users).where(eq(users.id, post.userId)).limit(1);
      const postComments = await db.select().from(comments).where(eq(comments.postId, post.id)).orderBy(desc(comments.createdAt)).limit(10);
      
      const commentUserIds = [...new Set(postComments.map(c => c.userId))];
      const commentUsers = commentUserIds.length > 0
        ? await db.select().from(users).where(inArray(users.id, commentUserIds))
        : [];
      const commentUserMap = new Map(commentUsers.map(u => [u.id, u]));
      
      return {
        ...post,
        user: postUser[0] ? {
          id: postUser[0].id,
          username: postUser[0].username,
          fullName: postUser[0].fullName,
          avatarUrl: postUser[0].avatarUrl,
        } : null,
        commentsList: postComments.map(c => ({
          ...c,
          user: commentUserMap.get(c.userId) ? {
            id: commentUserMap.get(c.userId)!.id,
            username: commentUserMap.get(c.userId)!.username,
            fullName: commentUserMap.get(c.userId)!.fullName,
            avatarUrl: commentUserMap.get(c.userId)!.avatarUrl,
          } : null,
        })),
      };
    }),

  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        caption: z.string().optional(),
        mediaUrl: z.string(),
        mediaType: z.enum(["image", "video"]).default("image"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(posts).values({
        userId: input.userId,
        caption: input.caption || null,
        mediaUrl: input.mediaUrl,
        mediaType: input.mediaType,
      });
      // Increment user's post count
      await db.update(users)
        .set({ postsCount: sql`${users.postsCount} + 1` })
        .where(eq(users.id, input.userId));
      return { id: Number(result[0].insertId) };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});
