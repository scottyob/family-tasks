import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

/**
 * Router for anything to do with users and groups
 */
export const usersRouter = createTRPCRouter({
    /**
     * Get and update user properties
     */
    name: publicProcedure
        .query(({ ctx }) => {
            return ctx.user.name;
        }),
    currentUser: publicProcedure
        .query(({ctx}) => ctx.user),
    setName: publicProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input, ctx }) =>  {
            return await ctx.prisma.user.update({
                where: {
                    id: ctx.user.id
                },
                data: {
                    name: input.name
                }
            })
        }),
    
    /**
     * Get and update group properties
     */
    // All the groups the user belongs to
    groups: publicProcedure
        .query(async ({ctx}) => {
            return await ctx.prisma.group.findMany({
                where: {
                  users: {
                    some: {
                      user: {
                        id: ctx.user.id
                      }
                    }
                  }
                }
              })
        }),
    createGroup: publicProcedure
        .input(z.object({name: z.string()}))
        .mutation(async ({input, ctx}) => {
          // await ctx.prisma.usersOnGroups.deleteMany();
          // await ctx.prisma.group.deleteMany();

          // Create a new group, connect it to the user, and return
          return await ctx.prisma.group.create({
            data: {
              name: input.name,
              users: {
                create: {
                  userId: ctx.user.id,
                }
              }
            },
          })
        }),
    groupMembers: publicProcedure
        .input(z.object({id: z.string()}))
        .query(async ({input, ctx}) => {
          // TODO:  Should secure endpoint
          return await ctx.prisma.user.findMany({
            where: {
              groups: {
                some: {
                  groupId: input.id
                }
              }
            }
          });
        }),
    addMemberToGroup: publicProcedure
        .input(z.object({
          userId: z.string(),
          groupId: z.string()
        }))
        .mutation(async ({input, ctx}) => {
          // TODO:  Secure endpoint
          return await ctx.prisma.usersOnGroups.create({
            data: {
              groupId: input.groupId,
              userId: input.userId,
            }
          })
        }),
    removeMemberFromGroup: publicProcedure
        .input(z.object({
          userId: z.string(),
          groupId: z.string()
        }))
        .mutation(async ({input, ctx}) => {
          await ctx.prisma.usersOnGroups.delete({
            where: {
              userId_groupId: {
                groupId: input.groupId,
                userId: input.userId
              }
            }
          })
        })
})
