import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.APP_SECRET || "sum7-connect-live-secret";

export const authRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        fullName: z.string().min(2),
        username: z.string().min(3).max(50),
        phone: z.string().optional(),
        gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
        country: z.string().optional(),
        avatarUrl: z.string().optional(),
        bio: z.string().optional(),
        dateOfBirth: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existingUser = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (existingUser.length > 0) {
        throw new Error("Email already registered");
      }
      const existingUsername = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
      if (existingUsername.length > 0) {
        throw new Error("Username already taken");
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      const result = await db.insert(users).values({
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        username: input.username,
        phone: input.phone || null,
        gender: input.gender || null,
        country: input.country || null,
        avatarUrl: input.avatarUrl || null,
        bio: input.bio || null,
        dateOfBirth: input.dateOfBirth || null,
      });
      const userId = Number(result[0].insertId);
      const token = jwt.sign({ userId, email: input.email }, JWT_SECRET, { expiresIn: "7d" });
      return { token, userId };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const foundUsers = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (foundUsers.length === 0) {
        throw new Error("Invalid email or password");
      }
      const user = foundUsers[0];
      const validPassword = await bcrypt.compare(input.password, user.passwordHash);
      if (!validPassword) {
        throw new Error("Invalid email or password");
      }
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      return { token, userId: user.id };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const db = getDb();
      const foundUsers = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (foundUsers.length === 0) return null;
      const user = foundUsers[0];
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
    } catch {
      return null;
    }
  }),
});
