import type { Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware";
import { Subscription } from "../models/Subscription";
import { Score } from "../models/Score";
import { Winner } from "../models/Winner";
import { Draw } from "../models/Draw";
import { getSubscriptionStatus } from "../services/subscription.service";
import { Charity } from "../models/Charity";

export const dashboardController = {
  async summary(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const userId = req.user.userId;

    const subscription = req.subscription ?? (await getSubscriptionStatus(userId));

    const scores = await Score.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(5).lean();
    const userDoc = await (await import("../models/User")).User.findById(userId).lean();
    const charity = userDoc?.charityId ? await Charity.findById(userDoc.charityId).lean() : null;

    const winningsAgg = await Winner.aggregate([
      { $match: { userId, paymentStatus: "paid" } },
      { $group: { _id: null, totalPayoutCents: { $sum: "$payoutCents" } } },
    ]);
    const winningsCents = winningsAgg[0]?.totalPayoutCents ?? 0;

    // Participation = draws where the user was eligible (active subscription + had scores) at publish time.
    const participationCount = await Draw.countDocuments({
      status: "published",
      eligibleUserIds: userId,
    });

    res.json({
      subscription: subscription
        ? {
            status: subscription.status,
            planInterval: subscription.planInterval,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : { status: "expired" },
      scores: scores.map((s: any) => ({
        id: String(s._id),
        value: s.value,
        date: s.date,
      })),
      winningsCents,
      participationCount,
      charity: charity
        ? { id: String(charity._id), name: charity.name, slug: charity.slug, description: charity.description ?? "" }
        : null,
      contributionPercent: userDoc?.contributionPercent ?? null,
    });
  },
};

