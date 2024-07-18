import { DateTime } from "luxon";
import { TaskRc, type Task as TaskWarriorTask } from "taskwarrior-lib";

export interface Task extends TaskWarriorTask {
  notes?: string;
  assignedTo?: string;
  completedBy?: string;
  completeRecurDue?: string;
  completeRecurWait?: string;
}

export function TaskFromTwTask(task: TaskWarriorTask): Task {
  const t = task as Task;

  // There seems to be a bug where the task status doesn't change to waiting.  Just munge this from
  // the 'Wait' attribute instead
  if (!t.wait || t.status != "pending") {
    return t;
  }
  const dt = DateTime.fromISO(t.wait);
  if (dt.diffNow().toMillis() > 0) {
    t.status = "waiting";
  }

  return t;
}

export interface FavoriteProject {
  projectName: string;
  showInHome?: boolean;
}

export function OwnersFromTwConfig(config: TaskRc): string[] {
  const owners =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Suppress implicit any type error for this line
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ((config?.["uda."]?.["assignedTo."]?.["values"] ?? "") as string).split(
      ","
    );
  return owners;
}
