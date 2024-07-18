import { z } from "zod";

export const TaskEditInput = z.object({
  uuid: z.string(),
  description: z.string().optional(),
  notes: z.string(),
  project: z.string().optional(),
  tags: z.string().array().optional(),
  // due: z.string().datetime().optional(),
});

export const RewardEditInput = z.object({
  id: z.string(),
  title: z.string(),
  purchaseValue: z.coerce.number(),
})