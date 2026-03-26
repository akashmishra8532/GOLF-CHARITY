import { z } from "zod";

export const addScoreSchema = z.object({
  value: z.coerce.number().min(1).max(45),
  date: z.coerce.date().optional(),
});

export const updateScoreSchema = z.object({
  value: z.coerce.number().min(1).max(45),
  date: z.coerce.date().optional(),
});

