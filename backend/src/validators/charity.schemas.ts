import { z } from "zod";

export const charityCreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.string().min(1)),
});

export const charityUpdateSchema = charityCreateSchema.partial();

