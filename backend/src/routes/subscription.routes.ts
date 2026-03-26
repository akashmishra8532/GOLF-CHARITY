import { Router } from "express";
import express from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { subscriptionController } from "../controllers/subscription.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { createCheckoutSchema } from "../validators/subscription.schemas";

export const subscriptionRouter = Router();

subscriptionRouter.get("/status", requireAuth, subscriptionController.status);
subscriptionRouter.post(
  "/checkout-session",
  requireAuth,
  validateBody(createCheckoutSchema),
  subscriptionController.createCheckout
);

// Stripe webhooks must use raw body.
subscriptionRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.webhook
);

