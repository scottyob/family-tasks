import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

/**
 * Router for anything to do with users and groups
 */
export const usersRouter = createTRPCRouter({
  /**
   * Get and update user properties
   */
  name: publicProcedure.query(({ ctx }) => {
    return ctx.user.name;
  }),
  currentUser: publicProcedure.query(({ ctx }) => ctx.user),
  setUser: publicProcedure.input(z.string()).mutation(({ input, ctx }) => {
    // We need to set the username now via a cookie, for about 10 years
    ctx.setCookie("username", input, "Max-Age=315360000");
  }),
  setFavorites: publicProcedure
    .input(
      z
        .object({
          projectName: z.string(),
          showInHome: z.boolean().optional(),
        })
        .array()
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.user.update({
        where: {
          name: ctx.user.name,
        },
        data: {
          favoriteProjects: JSON.stringify(input),
        },
      });
    }),
});
