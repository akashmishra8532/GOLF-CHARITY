import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { simulateDrawSchema, createDrawSchema } from "../validators/draw.schemas";
import { drawsController } from "../controllers/draws.controller";

export const drawsRouter = Router();

// Admin draw management (monthly).
drawsRouter.post("/create", requireAuth, requireRole("Admin"), validateBody(createDrawSchema), drawsController.create);
drawsRouter.post(
  "/:drawId/simulate",
  requireAuth,
  requireRole("Admin"),
  validateBody(simulateDrawSchema),
  drawsController.simulate
);
drawsRouter.post(
  "/:drawId/publish",
  requireAuth,
  requireRole("Admin"),
  drawsController.publish
);

