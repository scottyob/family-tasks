import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const rewardsRouter = createTRPCRouter({
  // Finds all saved rewards
  all: publicProcedure.query(async ({ ctx }) => {
    const rewards = await ctx.prisma.reward.findMany();

    // Add a flag if it's affordable, and return the rewards
    // sorted cheapest to most expensive.
    return rewards
      .map((r) => {
        return {
          ...r,
          affordable: ctx.user.gold >= Number(r.purchaseValue),
        };
      })
      .sort(function (a, b) {
        return Number(a.purchaseValue) - Number(b.purchaseValue);
      });
  }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        value: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.reward.create({
        data: {
          title: input.title,
          purchaseValue: input.value,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        purchaseValue: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.reward.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          purchaseValue: input.purchaseValue,
        },
      });
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.prisma.reward.delete({
        where: {
          id: input.id,
        },
      });
    }),

  purchase: publicProcedure
    .input(
      z.object({
        title: z.string(),
        cost: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // The player wants to purchase a reward

      // Check they have enough cold
      if (input.cost > ctx.user.gold) {
        throw new Error("Not enough gold for this purchase");
      }

      // Reduce the gold the player has by the cost of the reward
      await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          gold: {
            decrement: input.cost,
          },
        },
      });
    }),
});
