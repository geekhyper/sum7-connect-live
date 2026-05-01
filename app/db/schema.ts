import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
} from "drizzle-orm/mysql-core";

// Users table
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  gender: mysqlEnum("gender", ["male", "female", "other", "prefer_not_to_say"]),
  country: varchar("country", { length: 100 }),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  followersCount: int("followers_count").notNull().default(0),
  followingCount: int("following_count").notNull().default(0),
  postsCount: int("posts_count").notNull().default(0),
  isOnline: boolean("is_online").notNull().default(false),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Posts table
export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  caption: text("caption"),
  mediaUrl: text("media_url").notNull(),
  mediaType: mysqlEnum("media_type", ["image", "video"]).notNull().default("image"),
  likesCount: int("likes_count").notNull().default(0),
  commentsCount: int("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Likes table
export const likes = mysqlTable("likes", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  postId: bigint("post_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Comments table
export const comments = mysqlTable("comments", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  postId: bigint("post_id", { mode: "number", unsigned: true }).notNull(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  text: text("text").notNull(),
  likesCount: int("likes_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Follows table
export const follows = mysqlTable("follows", {
  id: serial("id").primaryKey(),
  followerId: bigint("follower_id", { mode: "number", unsigned: true }).notNull(),
  followingId: bigint("following_id", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Stories table
export const stories = mysqlTable("stories", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: mysqlEnum("media_type", ["image", "video"]).notNull().default("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Story views table
export const storyViews = mysqlTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: bigint("story_id", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  actorId: bigint("actor_id", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["like", "comment", "follow", "mention"]).notNull(),
  referenceId: bigint("reference_id", { mode: "number", unsigned: true }),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Chat rooms table
export const chatRooms = mysqlTable("chat_rooms", {
  id: serial("id").primaryKey(),
  participant1Id: bigint("participant_1_id", { mode: "number", unsigned: true }).notNull(),
  participant2Id: bigint("participant_2_id", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["active", "ended"]).notNull().default("active"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Messages table
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  roomId: bigint("room_id", { mode: "number", unsigned: true }).notNull(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Conversations table (for quick lookup)
export const conversations = mysqlTable("conversations", {
  id: serial("id").primaryKey(),
  user1Id: bigint("user_1_id", { mode: "number", unsigned: true }).notNull(),
  user2Id: bigint("user_2_id", { mode: "number", unsigned: true }).notNull(),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  unreadCount1: int("unread_count_1").notNull().default(0),
  unreadCount2: int("unread_count_2").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
