import assert from "assert";
import { TaskOffsetType } from "./enums";
import { DateTime } from "luxon";
import { type Task as TaskWarriorTask } from "taskwarrior-lib";

export interface Task extends TaskWarriorTask {
  notes?: string;
  assignedTo?: string;
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
  projectName: string,
  showInHome?: boolean
}

export function TaskWorth(task: Task) {
  return 0;
  // const noPenalty = {
  //     total: Number(task.completionValue) || 0,
  //     operator: "",
  //     penalty: 0,
  // };

  // if(task.dueDate == null || (task.offsetType as TaskOffsetType) == TaskOffsetType.Same) {
  //     return noPenalty
  // }

  // const dueDate = DateTime.fromMillis(task.dueDate.getTime());
  // const diffInDays = Math.ceil(dueDate.until(DateTime.now()).length("days"));

  // if(diffInDays < 0) {
  //     return noPenalty;
  // }

  // let totalWorth = 0;
  // if (task.completionValue != null) {
  //   const completionValue = Number(task.completionValue);
  //   totalWorth = completionValue;
  // }

  // const penalty = diffInDays * Number(task.offsetValue);

  // // let totalWorth = task.completionValue != null ? task.completionValue.toNumber() : 0;
  // let operator = "+";
  // switch (task.offsetType as TaskOffsetType) {
  //   case TaskOffsetType.Increase:
  //     totalWorth += penalty;
  //     break;
  //   case TaskOffsetType.Decrease:
  //     totalWorth -= penalty;
  //     totalWorth = totalWorth < 0 ? 0 : totalWorth;
  //     operator = "-";
  //     break;
  // }

  // return {
  //     total: totalWorth,
  //     operator,
  //     penalty
  // }
}
