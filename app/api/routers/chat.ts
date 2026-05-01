import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { chatRooms, messages, conversations, users } from "@db/schema";
import { eq, desc, and, or, inArray } from "drizzle-orm";

export const chatRouter = createRouter({
  getOrCreateRoom: publicQuery
    .input(
      z.object({
        user1Id: z.number(),
        user2Id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // Check if room already exists
      const existing = await db.select().from(chatRooms)
        .where(
          or(
            and(eq(chatRooms.participant1Id, input.user1Id), eq(chatRooms.participant2Id, input.user2Id)),
            and(eq(chatRooms.participant1Id, input.user2Id), eq(chatRooms.participant2Id, input.user1Id))
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        return { roomId: existing[0].id };
      }
      
      const result = await db.insert(chatRooms).values({
        participant1Id: input.user1Id,
        participant2Id: input.user2Id,
      });
      return { roomId: Number(result[0].insertId) };
    }),

  getMessages: publicQuery
    .input(
      z.object({
        roomId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;
      const result = await db.select().from(messages)
        .where(eq(messages.roomId, input.roomId))
        .orderBy(desc(messages.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      const senderIds = [...new Set(result.map(m => m.senderId))];
      const senders = senderIds.length > 0
        ? await db.select().from(users).where(inArray(users.id, senderIds))
        : [];
      const senderMap = new Map(senders.map(u => [u.id, u]));
      
      return result.reverse().map(m => ({
        ...m,
        sender: senderMap.get(m.senderId) ? {
          id: senderMap.get(m.senderId)!.id,
          username: senderMap.get(m.senderId)!.username,
          fullName: senderMap.get(m.senderId)!.fullName,
          avatarUrl: senderMap.get(m.senderId)!.avatarUrl,
        } : null,
      }));
    }),

  sendMessage: publicQuery
    .input(
      z.object({
        roomId: z.number(),
        senderId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(messages).values({
        roomId: input.roomId,
        senderId: input.senderId,
        content: input.content,
      });
      return { id: Number(result[0].insertId) };
    }),

  getConversations: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(conversations)
        .where(or(eq(conversations.user1Id, input.userId), eq(conversations.user2Id, input.userId)))
        .orderBy(desc(conversations.lastMessageAt))
        .limit(50);
      
      const otherUserIds = result.map(c => 
        c.user1Id === input.userId ? c.user2Id : c.user1Id
      );
      const otherUsers = otherUserIds.length > 0
        ? await db.select().from(users).where(inArray(users.id, otherUserIds))
        : [];
      const userMap = new Map(otherUsers.map(u => [u.id, u]));
      
      return result.map(c => {
        const otherUserId = c.user1Id === input.userId ? c.user2Id : c.user1Id;
        const otherUser = userMap.get(otherUserId);
        return {
          ...c,
          otherUser: otherUser ? {
            id: otherUser.id,
            username: otherUser.username,
            fullName: otherUser.fullName,
            avatarUrl: otherUser.avatarUrl,
            isOnline: otherUser.isOnline,
          } : null,
          unreadCount: c.user1Id === input.userId ? c.unreadCount1 : c.unreadCount2,
        };
      });
    }),

  endRoom: publicQuery
    .input(z.object({ roomId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(chatRooms)
        .set({ status: "ended", endedAt: new Date() })
        .where(eq(chatRooms.id, input.roomId));
      return { success: true };
    }),
});
