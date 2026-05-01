import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq, like } from "drizzle-orm";

export const userRouter = createRouter({
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      if (result.length === 0) return null;
      const user = result[0];
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        phone: user.phone,
        gender: user.gender,
        country: user.country,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
      };
    }),

  getByUsername: publicQuery
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
      if (result.length === 0) return null;
      const user = result[0];
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
        phone: user.phone,
        gender: user.gender,
        country: user.country,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
      };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        fullName: z.string().optional(),
        username: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
        phone: z.string().optional(),
        gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updateData } = input;
      await db.update(users).set(updateData).where(eq(users.id, id));
      return { success: true };
    }),

  search: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(users)
        .where(like(users.username, `%${input.query}%`))
        .limit(20);
      return result.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
      }));
    }),

  list: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select().from(users).limit(50);
    return result.map(user => ({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      isOnline: user.isOnline,
    }));
  }),
});
