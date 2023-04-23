import { z } from "zod";
import { RecurringType, TaskOffsetType, TaskType } from "~/utils/enums";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TaskEditInput } from "~/utils/inputs";
import moment from "moment";

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
        type: z.nativeEnum(TaskType),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.task.findMany({
        where: {
          groupId: input.groupId,
          type: input.type,
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
          if(dueDate == null) {
            complete = true;
            break;
          }
          dueDate.setDate(dueDate.getDate() + (task?.repeatDays?.toNumber() ?? 0));
      }

      // Find out the task's worth
      let worth = task.completionValue?.toNumber() ?? 0;
      let offset = task.currentOffset.toNumber();
      if(task.offsetType as TaskOffsetType == TaskOffsetType.Decrease) {
        offset = offset * -1;
      }
      worth += offset;
      worth = worth > 0 ? worth : 0;

      // Update the user's gold
      await ctx.prisma.user.update({
        where: {
          id: ctx.user.id
        },
        data: {
          gold: { increment: worth }
        }
      })

      // Update the task
      return await ctx.prisma.task.update({
        where: {
          id: input.taskId,
        },
        data: {
          complete: complete,
          currentOffset: 0,
          dueDate: dueDate,
        },
      });
    }),
});
