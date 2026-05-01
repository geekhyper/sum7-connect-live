import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { notifications, users } from "@db/schema";
import { eq, desc, inArray } from "drizzle-orm";

export const notificationRouter = createRouter({
  list: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(notifications)
        .where(eq(notifications.userId, input.userId))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      
      const actorIds = [...new Set(result.map(n => n.actorId))];
      const actors = actorIds.length > 0
        ? await db.select().from(users).where(inArray(users.id, actorIds))
        : [];
      const actorMap = new Map(actors.map(u => [u.id, u]));
      
      return result.map(n => ({
        ...n,
        actor: actorMap.get(n.actorId) ? {
          id: actorMap.get(n.actorId)!.id,
          username: actorMap.get(n.actorId)!.username,
          fullName: actorMap.get(n.actorId)!.fullName,
          avatarUrl: actorMap.get(n.actorId)!.avatarUrl,
        } : null,
      }));
    }),

  unreadCount: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(notifications)
        .where(eq(notifications.userId, input.userId));
      return result.filter(n => !n.isRead).length;
    }),

  markAsRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllAsRead: publicQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, input.userId));
      return { success: true };
    }),
});
