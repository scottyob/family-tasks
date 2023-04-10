import { z } from "zod";

export const TaskEditInput = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string(),
  complete: z.coerce.boolean(),
  dueDate: z.coerce.date().nullable(),
  groupId: z.string(),
  userId: z.string().nullable(),
});
