import { z } from "zod";

export const createCheckoutSchema = z.object({
  interval: z.enum(["monthly", "yearly"]),
});

