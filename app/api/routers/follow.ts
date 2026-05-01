import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { follows, users, notifications } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const followRouter = createRouter({
  toggle: publicQuery
    .input(
      z.object({
        followerId: z.number(),
        followingId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      if (input.followerId === input.followingId) {
        throw new Error("Cannot follow yourself");
      }
      const existing = await db.select().from(follows)
        .where(and(eq(follows.followerId, input.followerId), eq(follows.followingId, input.followingId)))
        .limit(1);
      
      if (existing.length > 0) {
        // Unfollow
        await db.delete(follows).where(eq(follows.id, existing[0].id));
        await db.update(users)
          .set({ followingCount: sql`${users.followingCount} - 1` })
          .where(eq(users.id, input.followerId));
        await db.update(users)
          .set({ followersCount: sql`${users.followersCount} - 1` })
          .where(eq(users.id, input.followingId));
        return { following: false };
      } else {
        // Follow
        await db.insert(follows).values({
          followerId: input.followerId,
          followingId: input.followingId,
        });
        await db.update(users)
          .set({ followingCount: sql`${users.followingCount} + 1` })
          .where(eq(users.id, input.followerId));
        await db.update(users)
          .set({ followersCount: sql`${users.followersCount} + 1` })
          .where(eq(users.id, input.followingId));
        
        // Create notification
        await db.insert(notifications).values({
          userId: input.followingId,
          actorId: input.followerId,
          type: "follow",
        });
        return { following: true };
      }
    }),

  check: publicQuery
    .input(
      z.object({
        followerId: z.number(),
        followingId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(follows)
        .where(and(eq(follows.followerId, input.followerId), eq(follows.followingId, input.followingId)))
        .limit(1);
      return { following: existing.length > 0 };
    }),

  getFollowers: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(follows).where(eq(follows.followingId, input.userId));
      return result;
    }),

  getFollowing: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(follows).where(eq(follows.followerId, input.userId));
      return result;
    }),
});
