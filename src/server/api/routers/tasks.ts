import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TaskEditInput } from "~/utils/inputs";
import { OwnersFromTwConfig, type Task, TaskFromTwTask } from "~/utils/taskLib";

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
      const rawTasks = taskwarrior.load(filter);
      return rawTasks.map((t) => TaskFromTwTask(t));
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

  getUsers: publicProcedure.query(({}) => {
    // Gets a list of users that we may assign things to from the settings
    const taskwarrior = new TaskwarriorLib();
    const config = taskwarrior.config();
    const owners = OwnersFromTwConfig(config);
    return owners;
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

      const task = tasks.find((t) => t.uuid == input.taskUuid) as Task;
      if (!task) {
        throw Error("Task with given UUID not found");
      }

      task.status = "pending";
      task.completedBy = undefined;
      if (input.complete) {
        task.status = "completed";
        task.end = undefined;
        task.start = undefined;
        task.completedBy = ctx.user.name;
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

      // Also update the owner
      assignTaskTo(input.taskUuid, ctx.user.name);
    }),

  assign: publicProcedure
    .input(
      z.object({
        taskUuid: z.string(),
        owner: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      assignTaskTo(input.taskUuid, input.owner);
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
    .mutation(({ input, ctx }) => {
      // Get the task, delete it
      const taskwarrior = new TaskwarriorLib();
      const tasks = taskwarrior.load() as Task[];
      const task = tasks.find((t) => t.uuid == input.uuid);
      if (!task) throw Error("Task Not Found");

      taskwarrior.del([task]);
    }),
});

function assignTaskTo(taskUuid: string, owner: string | undefined) {
  // Get the task with the given id.  Don't know how to load by UUID :(
  const taskwarrior = new TaskwarriorLib();
  const tasks = taskwarrior.load();

  const task = tasks.find((t) => t.uuid == taskUuid) as Task | undefined;
  if (!task) {
    throw Error("Task with given UUID not found");
  }

  task.assignedTo = owner;
  taskwarrior.update([task]);
}
