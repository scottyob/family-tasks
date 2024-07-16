import { z } from "zod";
import { RecurringType } from "~/utils/enums";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TaskEditInput } from "~/utils/inputs";
import { TaskFromTwTask, TaskWorth } from "~/utils/taskLib";
import { DateTime } from "luxon";
import { type PrismaClient } from "@prisma/client";

import { TaskwarriorLib } from "taskwarrior-lib";

/**
 * Router for anything to do with users and groups
 */
export const tasksRouter = createTRPCRouter({
  get: publicProcedure
    .input(
      z.object({
        filter: z.string().optional(),
      })
    )
    .query(({ input, ctx }) => {
      let filter = "'(status:pending and (+ACTIVE or due or -PROJECT))'";
      if(input.filter) {
        filter = input.filter;
      }

      const taskwarrior = new TaskwarriorLib();
      return taskwarrior.load(filter).map(t => TaskFromTwTask(t));
    }),

  getProjects: publicProcedure.query(({}) => {
    const taskwarrior = new TaskwarriorLib();
    
    // Return a list of projects from all of the found tasks in our db
    return [
      ...new Set(
        taskwarrior
          .load()
          .filter((t) => t.project)
          .map((t) => t.project)
      ),
    ] as string[];
  }),

  /**
   * Update Complete
   */
  setComplete: publicProcedure
    .input(z.object({
      taskUuid: z.string(),
      complete: z.boolean(),
    }))
    .mutation(({ input, ctx}) => {
      // Get the task with the given id.  Don't know how to load by UUID :(
      const taskwarrior = new TaskwarriorLib();
      const tasks = taskwarrior.load();

      const task = tasks.find(t => t.uuid == input.taskUuid);
      if(!task) {
        throw Error("Task with given UUID not found");
      }

      task.status = "pending";
      if(input.complete) {
        task.status = "completed";
        task.end = undefined;
        task.start = undefined;
      }

      taskwarrior.update([task]);
    }),

  /**
   * Add a new Task, simplistic API
   */
  add: publicProcedure
    .input(z.object({
      project: z.string().optional(),
      title: z.string(),
    }))
    .mutation(({input, ctx}) => {
      const taskwarrior = new TaskwarriorLib();
      taskwarrior.update([
        {
          description: input.title,
          project: input.project,
        }
      ]);
    }),

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
          availableInDays: input.availableIn || null,
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
        allAvailable: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      // For user if no group specified.
      let userId = undefined;
      if (input.groupId == undefined) {
        userId = ctx.user.id;
      }

      const tasks = input.allAvailable
        ? await tasksAvailable(ctx.prisma, userId, input.before)
        : await tasksForUser(ctx.prisma, userId, input.groupId, input.before);

      // Check if any tasks are due to become available again
      const madeAvailable = tasks.filter(
        (t) => t.availableOn != null && t.availableOn.getTime() < Date.now()
      );
      madeAvailable.forEach((t) => {
        t.availableOn = null;
        t.complete = false;
      });

      // Update the database
      await ctx.prisma.task.updateMany({
        where: {
          id: {
            in: madeAvailable.map((t) => t.id),
          },
        },
        data: {
          complete: false,
          availableOn: null,
        },
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

});
