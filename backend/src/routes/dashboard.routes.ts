import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { verifySubscription } from "../middlewares/subscription.middleware";
import { dashboardController } from "../controllers/dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", requireAuth, verifySubscription, dashboardController.summary);

