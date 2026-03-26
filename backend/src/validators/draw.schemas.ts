import { z } from "zod";

export const createDrawSchema = z.object({
  drawMonth: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "drawMonth must be in YYYY-MM format"),
});

export const simulateDrawSchema = z.object({
  mode: z.enum(["random", "frequency"]),
});

