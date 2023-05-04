import { type Task } from "@prisma/client";
import { TaskOffsetType } from "./enums";
import { DateTime } from "luxon";

export function TaskWorth(task: Task) {
    const noPenalty = {
        total: Number(task.completionValue) || 0,
        operator: "",
        penalty: 0,
    };

    if(task.dueDate == null || (task.offsetType as TaskOffsetType) == TaskOffsetType.Same) {
        return noPenalty
    }

    const dueDate = DateTime.fromMillis(task.dueDate.getTime());
    const diffInDays = Math.ceil(dueDate.until(DateTime.now()).length("days"));

    if(diffInDays < 0) {
        return noPenalty;
    }

    let totalWorth = 0;
    if (task.completionValue != null) {
      const completionValue = Number(task.completionValue);
      totalWorth = completionValue;
    }

    const penalty = diffInDays * Number(task.offsetValue);

    // let totalWorth = task.completionValue != null ? task.completionValue.toNumber() : 0;
    let operator = "+";
    switch (task.offsetType as TaskOffsetType) {
      case TaskOffsetType.Increase:
        totalWorth += penalty;
        break;
      case TaskOffsetType.Decrease:
        totalWorth -= penalty;
        totalWorth = totalWorth < 0 ? 0 : totalWorth;
        operator = "-";
        break;
    }

    return {
        total: totalWorth,
        operator,
        penalty
    }
}