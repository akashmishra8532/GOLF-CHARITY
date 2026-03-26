import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireActiveSubscription, verifySubscription } from "../middlewares/subscription.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { updateProfileSchema } from "../validators/profile.schemas";
import { profileController } from "../controllers/profile.controller";

export const profileRouter = Router();

profileRouter.get("/", requireAuth, verifySubscription, profileController.get);
profileRouter.put(
  "/",
  requireAuth,
  requireActiveSubscription,
  validateBody(updateProfileSchema),
  profileController.update
);

