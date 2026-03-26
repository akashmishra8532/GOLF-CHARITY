import type { Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware";
import * as charityServiceModule from "../services/charity.service";
import { User } from "../models/User";
import { Subscription } from "../models/Subscription";
import * as winnersService from "../services/winners.service";
import { Draw } from "../models/Draw";
import { getMonthRange, validateStablefordScore } from "../utils/score";
import { env } from "../config/env";
import { Score } from "../models/Score";
import { Winner } from "../models/Winner";

const charityService: any = charityServiceModule.charityService;

export const adminController = {
  async listUsers(_req: Request, res: Response) {
    const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 }).lean();
    res.json({ users });
  },

  async updateUserRole(req: Request, res: Response) {
    const { userId } = req.params as { userId: string };
    const { role } = req.body as { role: "User" | "Admin" };
    if (!role || !["User", "Admin"].includes(role)) throw new AppError("Invalid role", 400);
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-passwordHash").lean();
    if (!user) throw new AppError("User not found", 404);
    res.json({ user });
  },

  async listSubscriptions(_req: Request, res: Response) {
    const subs = await Subscription.find({}).sort({ updatedAt: -1 }).lean();
    res.json({ subscriptions: subs });
  },

  // Admin helper: view and edit scores across all users.
  async listScores(req: Request, res: Response) {
    const limitRaw = req.query.limit as string | undefined;
    const limit = limitRaw ? Math.max(1, Math.min(200, Number(limitRaw))) : 50;

    const scores = await Score.find({})
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .populate("userId", "email name")
      .lean();

    res.json({
      scores: scores.map((s: any) => ({
        id: String(s._id),
        userId: String(s.userId?._id ?? s.userId),
        userName: s.userId?.name ?? "",
        userEmail: s.userId?.email ?? "",
        value: s.value,
        date: s.date,
      })),
    });
  },

  async adminUpdateScore(req: Request, res: Response) {
    const { scoreId } = req.params as { scoreId: string };
    const { value, date } = req.body as { value: number; date?: Date };

    // Reuse the same Stableford validation as the normal score flow.
    // (Admin bypasses subscription gating but not the score rules.)
    validateStablefordScore(value);

    const score = await Score.findById(scoreId);
    if (!score) throw new AppError("Score not found", 404);

    score.value = value;
    if (date !== undefined) score.date = date;
    await score.save();

    res.json({
      score: { id: String(score._id), value: score.value, date: score.date, userId: String(score.userId) },
    });
  },

  // Admin helper for local/testing: force a user's subscription to "active".
  // In production, Stripe webhooks should manage subscription lifecycle.
  async activateSubscription(req: Request, res: Response) {
    const { userId } = req.params as { userId: string };
    const { interval } = req.body as { interval: "monthly" | "yearly" };

    const now = new Date();
    const end = new Date(now);
    if (interval === "monthly") {
      end.setUTCMonth(end.getUTCMonth() + 1);
    } else {
      end.setUTCFullYear(end.getUTCFullYear() + 1);
    }

    const amountPerMonthCents =
      interval === "monthly" ? env.priceMonthlyAmountCents : Math.round(env.priceYearlyAmountCents / 12);

    const updated = await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        planInterval: interval,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: end,
        amountPerMonthCents,
      },
      { upsert: true, new: true }
    ).lean();

    if (!updated) throw new AppError("Failed to activate subscription", 500);
    res.json({ subscription: updated });
  },

  async listCharities(_req: Request, res: Response) {
    const charities = await charityService.listCharities();
    res.json({ charities });
  },

  async createCharity(req: Request, res: Response) {
    const charity = await charityService.createCharity(req.body);
    res.status(201).json({ charity });
  },

  async updateCharity(req: Request, res: Response) {
    const { charityId } = req.params as { charityId: string };
    const charity = await charityService.updateCharity(charityId, req.body);
    res.json({ charity });
  },

  async deleteCharity(req: Request, res: Response) {
    const { charityId } = req.params as { charityId: string };
    const result = await charityService.deleteCharity(charityId);
    res.json(result);
  },

  async listWinners(req: Request, res: Response) {
    const { status } = req.query as { status?: "pending" | "approved" | "rejected" };
    const filter: any = {};
    if (status) filter.verificationStatus = status;
    const winners = await (await import("../models/Winner")).Winner.find(filter)
      .sort({ createdAt: -1 })
      .populate("drawId", "drawMonth status")
      .populate("userId", "email name")
      .lean();
    res.json({ winners });
  },

  async reviewWinner(req: Request, res: Response) {
    const { winnerId } = req.params as { winnerId: string };
    const { decision } = req.body as { decision: "approve" | "reject" };
    if (!decision || !["approve", "reject"].includes(decision)) throw new AppError("Invalid decision", 400);
    const winner = await winnersService.reviewWinner({ winnerId, decision });
    res.json({ winnerId: winner._id, verificationStatus: winner.verificationStatus, paymentStatus: winner.paymentStatus });
  },

  async analytics(_req: Request, res: Response) {
    const now = new Date();
    const drawMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const { start, end } = getMonthRange(drawMonth);

    const [totalUsers, subsActive, lastDraw, publishedDrawCount] = await Promise.all([
      User.countDocuments({}),
      Subscription.find({
        status: "active",
        currentPeriodEnd: { $gte: start },
        currentPeriodStart: { $lte: end },
      }).lean(),
      Draw.findOne({ drawMonth }).lean(),
      Draw.countDocuments({ status: "published" }),
    ]);

    const userIds = subsActive.map((s) => s.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userById = new Map(users.map((u) => [String(u._id), u]));

    let revenueCents = 0;
    let prizePoolCents = 0;
    let charityContributionCents = 0;
    for (const sub of subsActive) {
      revenueCents += sub.amountPerMonthCents;
      const u = userById.get(String(sub.userId));
      if (!u) continue;
      prizePoolCents += Math.round(sub.amountPerMonthCents * (100 - u.contributionPercent) / 100);
      charityContributionCents += Math.round(sub.amountPerMonthCents * u.contributionPercent / 100);
    }

    // Draw statistics for the whole dataset (winners are created at publish time).
    const winnersByTier = await Winner.aggregate([
      { $group: { _id: "$tier", count: { $sum: 1 } } },
    ]);
    const winnersTierCounts: Record<string, number> = winnersByTier.reduce((acc: any, row: any) => {
      acc[String(row._id)] = row.count;
      return acc;
    }, {});

    res.json({
      metrics: {
        totalUsers,
        activeSubscribers: subsActive.length,
        revenueCents,
        prizePoolCents,
        charityContributionCents,
        publishedDrawCount,
        winnersTierCounts,
        lastDraw: lastDraw ? { drawMonth: lastDraw.drawMonth, status: lastDraw.status } : null,
      },
    });
  },
};

