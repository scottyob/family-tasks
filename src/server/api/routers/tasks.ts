import { z } from "zod";
import { TaskType } from "~/utils/enums";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TaskEditInput } from "~/utils/inputs";

/**
 * Router for anything to do with users and groups
 */
export const tasksRouter = createTRPCRouter({
  /**
   * Edit task form
   */
  edit: publicProcedure
    .input(TaskEditInput)
    .mutation(async ({ input, ctx }) => {
        console.log(input);
        await ctx.prisma.task.update({
            where: {id: input.id},
            data: {
                title: input.title,
                notes: input.notes,
                complete: input.complete,
                dueDate: input.dueDate == undefined ? null : input.dueDate,
                groupId: input.groupId,
                assignedToId: input.assignedToId,
                completionValue: input.completionValue,
                offsetValue: input.offsetValue,
                offsetType: input.offsetType,
            }
        })
    }),

  /**
   * Selecting tasks
   */
  tasksForGroupByType: publicProcedure
    .input(
      z.object({
        groupId: z.string().optional(),
        type: z.nativeEnum(TaskType),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.task.findMany({
        where: {
          groupId: input.groupId,
          type: input.type,
        },
      });
    }),

  /**
   * Creating
   */
  addTaskWithTitle: publicProcedure
    .input(
      z.object({
        title: z.string(),
        groupId: z.string(),
        type: z.nativeEnum(TaskType),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.task.create({
        data: {
          title: input.title,
          groupId: input.groupId,
          type: input.type.toString(),
        },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.task.delete({
        where: {
          id: input.id,
        },
      });
    }),

  /**
   * Modifying
   */
  setCompleted: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ret = await ctx.prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          complete: input.completed,
        },
      });
      return ret;
    }),
});
