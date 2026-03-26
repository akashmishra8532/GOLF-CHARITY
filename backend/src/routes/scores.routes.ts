import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireActiveSubscription } from "../middlewares/subscription.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { addScoreSchema, updateScoreSchema } from "../validators/scores.schemas";
import { scoresController } from "../controllers/scores.controller";

export const scoresRouter = Router();

scoresRouter.get("/last5", requireAuth, requireActiveSubscription, scoresController.getLastFive);
scoresRouter.post("/", requireAuth, requireActiveSubscription, validateBody(addScoreSchema), scoresController.add);

// Edit an existing score (keeps the rolling last-5 logic enforced by the service).
scoresRouter.put(
  "/:scoreId",
  requireAuth,
  requireActiveSubscription,
  validateBody(updateScoreSchema),
  scoresController.update
);

