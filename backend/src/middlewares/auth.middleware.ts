import type { NextFunction, Request, Response } from "express";
import { AppError } from "./error.middleware";
import { verifyJwt } from "../utils/jwt";
import { Subscription } from "../models/Subscription";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid authorization header", 401);
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyJwt(token);
    req.user = payload;
    // Real-time subscription status check on every authenticated request (PRD).
    if (payload.role !== "Admin") {
      const sub = await Subscription.findOne({ userId: payload.userId }).lean();
      const now = new Date();
      const isActive =
        sub?.status === "active" && (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > now);
      const effectiveStatus = isActive ? "active" : sub?.status === "cancelled" ? "cancelled" : "expired";
      req.subscription = {
        status: effectiveStatus,
        planInterval: sub?.planInterval,
        currentPeriodEnd: sub?.currentPeriodEnd,
      };
    }
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
}

