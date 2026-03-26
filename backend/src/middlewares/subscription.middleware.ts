import type { NextFunction, Request, Response } from "express";
import { AppError } from "./error.middleware";
import { Subscription } from "../models/Subscription";

async function computeEffectiveSubscription(userId: string) {
  const sub = await Subscription.findOne({ userId }).lean();
  const now = new Date();
  if (!sub) {
    return { status: "expired" as const };
  }
  const isActive =
    sub.status === "active" && (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > now);
  const effectiveStatus = isActive ? "active" : sub.status === "cancelled" ? "cancelled" : "expired";
  return {
    status: effectiveStatus as "active" | "expired" | "cancelled",
    planInterval: sub.planInterval as "monthly" | "yearly",
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}

// Non-blocking subscription verification for authenticated routes.
export async function verifySubscription(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role === "Admin") return next();
  const userId = req.user?.userId;
  if (!userId) return next();
  if (req.subscription) return next();
  req.subscription = await computeEffectiveSubscription(userId);
  next();
}

export async function requireActiveSubscription(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role === "Admin") return next();
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const effective = req.subscription ?? (await computeEffectiveSubscription(userId));
  req.subscription = effective;
  if (effective.status !== "active") throw new AppError(`Subscription inactive (${effective.status})`, 402);

  next();
}

