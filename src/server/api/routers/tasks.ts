import { z } from "zod";
import { RecurringType } from "~/utils/enums";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TaskEditInput } from "~/utils/inputs";
import { Task, TaskFromTwTask, TaskWorth } from "~/utils/taskLib";
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
      let filter = "";
      if (input.filter) {
        filter = input.filter;
      }

      const taskwarrior = new TaskwarriorLib();
      return taskwarrior.load(filter).map((t) => TaskFromTwTask(t));
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
    .input(
      z.object({
        taskUuid: z.string(),
        complete: z.boolean(),
      })
    )
    .mutation(({ input, ctx }) => {
      // Get the task with the given id.  Don't know how to load by UUID :(
      const taskwarrior = new TaskwarriorLib();
      const tasks = taskwarrior.load();

      const task = tasks.find((t) => t.uuid == input.taskUuid);
      if (!task) {
        throw Error("Task with given UUID not found");
      }

      task.status = "pending";
      if (input.complete) {
        task.status = "completed";
        task.end = undefined;
        task.start = undefined;
      }

      taskwarrior.update([task]);
    }),

  setStart: publicProcedure
    .input(
      z.object({
        taskUuid: z.string(),
        started: z.boolean().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const taskwarrior = new TaskwarriorLib();

      let cmd = input.taskUuid + " stop";
      if (input.started) {
        cmd = input.taskUuid + " start";
      }
      console.log(cmd);
      console.log(taskwarrior.executeCommand(cmd));
    }),

  /**
   * Add a new Task, simplistic API
   */
  add: publicProcedure
    .input(
      z.object({
        project: z.string().optional(),
        title: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const taskwarrior = new TaskwarriorLib();
      taskwarrior.update([
        {
          description: input.title,
          project: input.project,
        },
      ]);
    }),

  /**
   * Edit task form
   */
  edit: publicProcedure
    .input(TaskEditInput)
    .mutation(async ({ input, ctx }) => {
      // Get the task, override from form properties, re-save
      const taskwarrior = new TaskwarriorLib();
      const tasks = taskwarrior.load() as Task[];
      const task = tasks.find((t) => t.uuid == input.uuid);
      if (!task) throw Error("Task Not Found");

      // Update from input
      const newTask: Task = {
        ...task,
        ...input,
        due: input?.due || undefined,
        wait: input?.wait || undefined,
      };

      console.log("Updating Task: ", newTask);
      taskwarrior.update([newTask]);
    }),

  delete: publicProcedure
    .input(z.object({ uuid: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Get the task, delete it
      const taskwarrior = new TaskwarriorLib();
      const tasks = taskwarrior.load() as Task[];
      const task = tasks.find((t) => t.uuid == input.uuid);
      if (!task) throw Error("Task Not Found");

      taskwarrior.del([task]);
    }),
});
