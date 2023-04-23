/**
 * Specific types tasks can be set to
 */
export enum TaskType {
    Habit = "Habit",
    Daily = "Daily",
    Task = "Task"
}

export enum RecurringType {
    Once = "Once",
    FromDueDate = "From Due Date",
    AfterCompletion = "After Completion"
}

export enum TaskOffsetType {
    Same = "Same",
    Increase = "Increase",
    Decrease = "Decrease",
}