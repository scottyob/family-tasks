import { z } from "zod";
import { RecurringType } from "~/utils/enums";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TaskEditInput } from "~/utils/inputs";
import { TaskWorth } from "~/utils/taskLib";
import { DateTime } from "luxon";

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
          availableInDays: input.availableIn,
        },
      });
    }),

  /**
   * Selecting tasks
   */
  tasksForGroupByType: publicProcedure
    .input(
      z.object({
        groupId: z.string().optional(),
        before: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // For user if no group specified.
      let userId = undefined;
      if (input.groupId == undefined) {
        userId = ctx.user.id;
      }

      const tasks = await ctx.prisma.task.findMany({
        where: {
          groupId: input.groupId,
          dueDate: {
            lte: input.before,
          },
          assignedToId: userId,
        },
        include: {
          assignedTo: true,
        },
      });

      // Check if any tasks are due to become available again
      const madeAvailable = tasks.filter(t => t.availableOn != null && t.availableOn.getTime() < Date.now());
      madeAvailable.forEach(t => {
        t.availableOn = null;
        t.complete = false;
      })

      // Update the database
      await ctx.prisma.task.updateMany({
        where: {
          id: {
            in: madeAvailable.map(t => t.id)
          }
        },
        data: {
          complete: false,
          availableOn: null,
        }
      });

      return tasks;

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
      const groupUsers = await ctx.prisma.usersOnGroups.findMany({
        where: {
          groupId: input.groupId,
        },
      });

      // If there's only one user in this group, assign them as the owner
      let owner = null;
      if (groupUsers.length == 1) {
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
        availableOn: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // The user has completed (or unflagged-completed) a task.
      // Load up the task
      const task = await ctx.prisma.task.findUniqueOrThrow({
        where: {
          id: input.taskId,
        },
      });
      if (!input.completed) {
        // User is flagging a task as not having been completed
        return await ctx.prisma.task.update({
          where: {
            id: task.id,
          },
          data: {
            complete: false,
          },
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
          dueDate = new Date(
            DateTime.now()
              .plus({ days: task.repeatDays?.toNumber() })
              .toMillis()
          );
          break;
        case RecurringType.FromDueDate:
          dueDate = task.dueDate;
          if (dueDate == null) {
            complete = true;
            break;
          }
          dueDate.setDate(
            dueDate.getDate() + (task?.repeatDays?.toNumber() ?? 0)
          );
      }

      // Update the user's gold
      const worth = TaskWorth(task);
      if (worth.total > 0) {
        await ctx.prisma.user.update({
          where: {
            id: ctx.user.id,
          },
          data: {
            gold: { increment: worth.total },
          },
        });
      }

      // Account for uncomplete tasks that have availableOn
      if(input.availableOn && input.completed && !complete) {
        complete = true;
      }

      // Update the task
      return await ctx.prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          complete: complete,
          dueDate: dueDate,
          availableOn: input.availableOn || null,
        },
      });
    }),
});
