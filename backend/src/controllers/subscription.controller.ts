import type { Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware";
import { getSubscriptionStatus, createCheckoutSession, handleStripeWebhook } from "../services/subscription.service";
import { stripe } from "../config/stripe";
import { env } from "../config/env";

export const subscriptionController = {
  async status(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const status = await getSubscriptionStatus(req.user.userId);
    res.json({ status });
  },

  async createCheckout(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const { interval } = req.body as { interval: "monthly" | "yearly" };
    const session = await createCheckoutSession(req.user.userId, interval);
    res.json(session);
  },

  async webhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") throw new AppError("Missing Stripe signature", 400);

    const event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);

    await handleStripeWebhook(event, signature);
    res.json({ received: true });
  },
};

