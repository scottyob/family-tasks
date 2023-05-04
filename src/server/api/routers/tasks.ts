import { z } from "zod";
import { RecurringType } from "~/utils/enums";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TaskEditInput } from "~/utils/inputs";
import { TaskWorth } from "~/utils/taskLib";

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
      await ctx.prisma.task.update({
        where: { id: input.id },
        data: {
          title: input.title,
          notes: input.notes,
          complete: input.complete,
          dueDate: input.dueDate == undefined ? null : input.dueDate,
          groupId: input.groupId,
          assignedToId: input.assignedToId ? input.assignedToId : null,
          completionValue: input.completionValue,
          offsetValue: input.offsetValue,
          offsetType: input.offsetType,
          recurringType: input.repeatDays > 0 ? input.recurringType : "Once",
          repeatDays: input.repeatDays || null,
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
        filterToday: z.boolean().default(false),
      })
    )
    .query(({ input, ctx }) => {

      let dueDate: Date | undefined = new Date();
      const offset = -480; // PST (UTC-8) without DST
      dueDate = new Date(dueDate.getTime() + offset)
      // dueDate = undefined;
      // get the UTC offset in milliseconds for the America/Los_Angeles time zone
      // const offset = -480; // PST (UTC-8) without DST
      

      return ctx.prisma.task.findMany({
        where: {
          groupId: input.groupId,
          dueDate: dueDate ? {
            lte: dueDate,
          } : undefined,
        },
        include: {
          assignedTo: true
        }
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get the users in this group
      const groupUsers = await ctx.prisma.usersOnGroups.findMany(
        {
          where: {
            groupId: input.groupId
          }
        }
      );

      // If there's only one user in this group, assign them as the owner
      let owner = null;
      if(groupUsers.length == 1) {
        owner = groupUsers[0]?.userId;
      }

      await ctx.prisma.task.create({
        data: {
          title: input.title,
          groupId: input.groupId,
          assignedToId: owner,
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
      // The user has completed (or unflagged-completed) a task.
      // Load up the task
      const task = await ctx.prisma.task.findUniqueOrThrow({
        where: {
          id: input.taskId
        }
      });
      if (!input.completed) {
        // User is flagging a task as not having been completed
        return await ctx.prisma.task.update({
          where: {
            id: task.id
          },
          data: {
            complete: false
          }
        });
      }

      const recurringType = task.recurringType as RecurringType;
      let complete = false;
      let dueDate = undefined;
      // The task has been complete
      switch (recurringType) {
        case RecurringType.Once:
          complete = true;
          break;
        case RecurringType.AfterCompletion:
          // create a new Date object for the current date and time
          const currentDate = new Date();

          // get the UTC offset in milliseconds for the America/Los_Angeles time zone
          const offset = -480; // PST (UTC-8) without DST

          // create a new Date object for the America/Los_Angeles time zone
          const localDate = new Date(currentDate.getTime() + offset * 60 * 1000);
          localDate.setDate(localDate.getDate() + (task.repeatDays?.toNumber() ?? 0));
          dueDate = localDate;
          break;
        case RecurringType.FromDueDate:
          dueDate = task.dueDate;
          if (dueDate == null) {
            complete = true;
            break;
          }
          dueDate.setDate(dueDate.getDate() + (task?.repeatDays?.toNumber() ?? 0));
      }

      // Update the user's gold
      const worth = TaskWorth(task);
      if (worth.total > 0) {
        await ctx.prisma.user.update({
          where: {
            id: ctx.user.id
          },
          data: {
            gold: { increment: worth.total }
          }
        })
      }

      // Update the task
      return await ctx.prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          complete: complete,
          dueDate: dueDate,
        },
      });
    }),
});
