import { createRouter, publicQuery } from "./middleware";
import { authRouter } from "./routers/auth";
import { postRouter } from "./routers/post";
import { likeRouter } from "./routers/like";
import { commentRouter } from "./routers/comment";
import { followRouter } from "./routers/follow";
import { userRouter } from "./routers/user";
import { notificationRouter } from "./routers/notification";
import { chatRouter } from "./routers/chat";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  post: postRouter,
  like: likeRouter,
  comment: commentRouter,
  follow: followRouter,
  user: userRouter,
  notification: notificationRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
