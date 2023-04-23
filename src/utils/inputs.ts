import { z } from "zod";

export const TaskEditInput = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string(),
  complete: z.coerce.boolean(),
  dueDate: z.coerce.date().nullable(),
  groupId: z.string(),
  assignedToId: z.string().nullable(),
  completionValue: z.coerce.number(),
  offsetValue: z.coerce.number(),
  offsetType: z.enum(["Same", "Increase", "Decrease"]),
  recurringType: z.enum(["Once", "From Due Date", "After Completion"]),
  repeatDays: z.coerce.number(),
  currentOffset: z.coerce.number(),
});
