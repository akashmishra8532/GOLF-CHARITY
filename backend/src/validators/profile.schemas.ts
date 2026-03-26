import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  charityId: z.string().min(1).optional(),
  contributionPercent: z.coerce.number().min(10).max(100).optional(),
});

