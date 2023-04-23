import { type Task } from "@prisma/client";
import { TaskOffsetType } from "./enums";

export function TaskWorth(task: Task) {
    const noPenalty = {
        total: Number(task.completionValue) || 0,
        operator: "",
        penalty: 0,
    };

    if(task.dueDate == null || (task.offsetType as TaskOffsetType) == TaskOffsetType.Same) {
        return noPenalty
    }

    // create a new Date object for the current date and time
    const currentDate = new Date();
    
    // get the UTC offset in milliseconds for the America/Los_Angeles time zone
    const offset = -480; // PST (UTC-8) without DST
    
    // create a new Date object for the America/Los_Angeles time zone
    const localDate = new Date(currentDate.getTime() + offset * 60 * 1000);
    localDate.setUTCHours(0, 0, 0, 1);

    const diffInMs: number = localDate.getTime() - task.dueDate.getTime();
    const diffInDays: number = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    console.log("timeDifference: ", {
        diffInMs,
        diffInDays
    })

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