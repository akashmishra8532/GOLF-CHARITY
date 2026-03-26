import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["User", "Admin"]),
});

export const reviewWinnerSchema = z.object({
  decision: z.enum(["approve", "reject"]),
});

export const activateSubscriptionSchema = z.object({
  interval: z.enum(["monthly", "yearly"]),
});

