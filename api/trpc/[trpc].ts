import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const t = initTRPC.create();

const appRouter = t.router({
  auth: t.router({
    login: t.procedure
      .input((val: any) => val)
      .mutation(async ({ input }) => {
        const { email, password } = input;

        // TEMP FAKE LOGIN (we will upgrade later)
        if (email === "test@test.com" && password === "1234") {
          return {
            token: "fake-jwt-token",
          };
        }

        throw new Error("Invalid email or password");
      }),

    me: t.procedure.query(() => {
      return {
        id: "1",
        email: "test@test.com",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;

export default async function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
}
