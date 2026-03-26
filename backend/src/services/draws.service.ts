import { AppError } from "../middlewares/error.middleware";
import { Draw } from "../models/Draw";
import { Score } from "../models/Score";
import { Subscription } from "../models/Subscription";
import type { DrawMode, Tier } from "../models/Draw";
import { User } from "../models/User";
import { getMonthRange } from "../utils/score";
import { Winner } from "../models/Winner";

function pickUniformUniqueNumbers(count: number, min: number, max: number) {
  const pool: number[] = [];
  for (let i = min; i <= max; i++) pool.push(i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function pickWeightedUniqueNumbers(
  count: number,
  weights: Map<number, number>
) {
  const entries = Array.from(weights.entries());
  // If all weights are 0, fallback to uniform.
  const sum = entries.reduce((acc, [, w]) => acc + Math.max(0, w), 0);
  if (sum <= 0) return pickUniformUniqueNumbers(count, 1, 45);

  const available = entries.map(([n, w]) => ({ n, w: Math.max(0, w) }));
  const picked: number[] = [];
  for (let k = 0; k < count; k++) {
    const totalWeight = available.reduce((acc, x) => acc + x.w, 0);
    if (totalWeight <= 0) break;
    let r = Math.random() * totalWeight;
    let idx = 0;
    for (; idx < available.length; idx++) {
      r -= available[idx].w;
      if (r <= 0) break;
    }
    const chosen = available.splice(idx, 1)[0];
    picked.push(chosen.n);
  }
  // If we couldn't pick enough (e.g., weights collapse), fill uniformly among remaining numbers.
  if (picked.length < count) {
    const remaining = [];
    const used = new Set(picked);
    for (let i = 1; i <= 45; i++) if (!used.has(i)) remaining.push(i);
    while (picked.length < count && remaining.length) {
      const idx = Math.floor(Math.random() * remaining.length);
      picked.push(remaining.splice(idx, 1)[0]);
    }
  }
  return picked.slice(0, count);
}

function determineTierFromMatchCount(matchCount: number): Tier | null {
  if (matchCount === 5) return 5;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 3;
  return null;
}

function splitPotEvenlyCents(totalCents: number, userIds: string[]) {
  const sorted = [...userIds].sort();
  const count = sorted.length;
  if (count === 0) return new Map<string, number>();
  const base = Math.floor(totalCents / count);
  let remainder = totalCents - base * count;
  const payouts = new Map<string, number>();
  for (const uid of sorted) {
    const extra = remainder > 0 ? 1 : 0;
    payouts.set(uid, base + extra);
    remainder -= extra;
  }
  return payouts;
}

export async function createOrGetDraw(drawMonth: string) {
  const existing = await Draw.findOne({ drawMonth }).lean();
  if (existing) return existing;
  const created = await Draw.create({ drawMonth, status: "draft" });
  return created.toObject();
}

async function buildEligibleUsersAndScores(drawMonth: string) {
  // Restrict to active subscriptions overlapping the draw month.
  const { start, end } = getMonthRange(drawMonth);

  const subs = await Subscription.find({
    status: "active",
    currentPeriodEnd: { $gte: start },
    currentPeriodStart: { $lte: end },
  }).lean();

  if (!subs.length) return { eligibleUserIds: [], userScoreSets: new Map<string, number[]>(), prizeBaseCents: 0 };

  const userIds = subs.map((s) => s.userId);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userById = new Map(users.map((u) => [String(u._id), u]));

  // Compute base prize pool from subscription payments (minus charity contribution).
  // prizePoolCents = monthlyChargeCents * (100 - contributionPercent)/100
  let prizeBaseCents = 0;
  for (const sub of subs) {
    const u = userById.get(String(sub.userId));
    if (!u) continue;
    const fraction = (100 - u.contributionPercent) / 100;
    prizeBaseCents += Math.round(sub.amountPerMonthCents * fraction);
  }

  // Fetch stored scores (<=5 per user) and build score sets per user.
  const scores = await Score.find({ userId: { $in: userIds } }).lean();
  const byUser = new Map<string, number[]>();
  for (const s of scores) {
    const key = String(s.userId);
    const arr = byUser.get(key) ?? [];
    arr.push(s.value);
    byUser.set(key, arr);
  }

  // Eligible users must have at least 1 score.
  const eligibleUserIds: any[] = [];
  const userScoreSets = new Map<string, number[]>();
  for (const [uid, values] of byUser.entries()) {
    if (values.length > 0) {
      eligibleUserIds.push(uid);
      // Keep duplicates for frequency-mode weighting.
      // Matching tiers still use distinct drawnNumbers, so duplicates won't inflate match count.
      userScoreSets.set(uid, values);
    }
  }

  return { eligibleUserIds, userScoreSets, prizeBaseCents };
}

export async function simulateDraw(drawId: string, mode: DrawMode) {
  const draw = await Draw.findById(drawId).lean();
  if (!draw) throw new AppError("Draw not found", 404);
  if (draw.status === "published") throw new AppError("Draw already published", 409);

  const { eligibleUserIds, userScoreSets, prizeBaseCents } = await buildEligibleUsersAndScores(draw.drawMonth);
  if (!eligibleUserIds.length) {
    const prev = await Draw.findOne({ drawMonth: { $lt: draw.drawMonth }, status: "published" })
      .sort({ drawMonth: -1 })
      .lean();
    const rolloverAppliedCents = prev?.jackpotRolloverToNextCents ?? 0;
    const threePot = Math.round(prizeBaseCents * 0.25);
    const fourPot = Math.round(prizeBaseCents * 0.35);
    const fivePot = Math.round(prizeBaseCents * 0.40) + rolloverAppliedCents;
    const jackpotRolloverToNextCents = fivePot;

    // still choose a random draw to keep the system moving
    const drawnNumbers = pickUniformUniqueNumbers(5, 1, 45);
    await Draw.findByIdAndUpdate(drawId, { mode, drawnNumbers, status: "simulated" }, { new: true });
    return {
      drawId,
      drawMonth: draw.drawMonth,
      drawnNumbers,
      mode,
      pots: { threePotCents: threePot, fourPotCents: fourPot, fivePotCents: fivePot },
      winnersPreview: [],
      jackpotRolloverToNextCents,
    };
  }

  let drawnNumbers: number[];
  if (mode === "random") {
    drawnNumbers = pickUniformUniqueNumbers(5, 1, 45);
  } else {
    // Frequency mode: weights by how many users have each score value.
    const weights = new Map<number, number>();
    for (const [, scoreSet] of userScoreSets.entries()) {
      for (const v of scoreSet) weights.set(v, (weights.get(v) ?? 0) + 1);
    }
    // Ensure every number has weight key (for stability) though weights can be 0.
    for (let i = 1; i <= 45; i++) if (!weights.has(i)) weights.set(i, 0);
    drawnNumbers = pickWeightedUniqueNumbers(5, weights);
  }

  // Winners preview is based on match count vs drawn numbers.
  const drawnSet = new Set(drawnNumbers);
  const winnersByTier: Record<Tier, string[]> = { 3: [], 4: [], 5: [] };

  for (const [userId, scoreSet] of userScoreSets.entries()) {
    const matchCount = Array.from(drawnSet).filter((n) => scoreSet.includes(n)).length;
    const tier = determineTierFromMatchCount(matchCount);
    if (tier) winnersByTier[tier].push(userId);
  }

  const prev = await Draw.findOne({ drawMonth: { $lt: draw.drawMonth }, status: "published" })
    .sort({ drawMonth: -1 })
    .lean();
  const rolloverAppliedCents = prev?.jackpotRolloverToNextCents ?? 0;

  const threePot = Math.round(prizeBaseCents * 0.25);
  const fourPot = Math.round(prizeBaseCents * 0.35);
  const fivePot = Math.round(prizeBaseCents * 0.40) + rolloverAppliedCents;

  const count5 = winnersByTier[5].length;
  const jackpotRolloverToNextCents = count5 === 0 ? fivePot : 0;
  const fivePotForWinners = count5 === 0 ? 0 : fivePot;

  const payout3 = splitPotEvenlyCents(threePot, winnersByTier[3]);
  const payout4 = splitPotEvenlyCents(fourPot, winnersByTier[4]);
  const payout5 = splitPotEvenlyCents(fivePotForWinners, winnersByTier[5]);

  const winnersPreview: Array<{ userId: string; tier: Tier; matchCount: number; payoutCents: number }> = [];
  for (const uid of winnersByTier[3]) {
    winnersPreview.push({ userId: uid, tier: 3, matchCount: 3, payoutCents: payout3.get(uid) ?? 0 });
  }
  for (const uid of winnersByTier[4]) {
    winnersPreview.push({ userId: uid, tier: 4, matchCount: 4, payoutCents: payout4.get(uid) ?? 0 });
  }
  for (const uid of winnersByTier[5]) {
    winnersPreview.push({ userId: uid, tier: 5, matchCount: 5, payoutCents: payout5.get(uid) ?? 0 });
  }

  await Draw.findByIdAndUpdate(drawId, { mode, drawnNumbers, status: "simulated" }, { new: true });
  return {
    drawId,
    drawMonth: draw.drawMonth,
    drawnNumbers,
    mode,
    pots: { threePotCents: threePot, fourPotCents: fourPot, fivePotCents: fivePot },
    jackpotRolloverToNextCents,
    winnersPreview,
  };
}

export async function publishDraw(drawId: string) {
  const draw = await Draw.findById(drawId);
  if (!draw) throw new AppError("Draw not found", 404);
  if (draw.status === "published") throw new AppError("Draw already published", 409);
  if (!draw.drawnNumbers || draw.drawnNumbers.length !== 5) {
    throw new AppError("Draw must be simulated (5 drawn numbers required) before publishing", 400);
  }

  const mode = draw.mode ?? "random";

  const { eligibleUserIds, userScoreSets, prizeBaseCents } = await buildEligibleUsersAndScores(draw.drawMonth);
  const drawnNumbers = draw.drawnNumbers;
  const drawnSet = new Set(drawnNumbers);

  // Jackpot rollover from previous published draw when no 5-match winners occurred.
  const prev = await Draw.findOne({ drawMonth: { $lt: draw.drawMonth }, status: "published" })
    .sort({ drawMonth: -1 })
    .lean();
  const rolloverAppliedCents = prev?.jackpotRolloverToNextCents ?? 0;

  const threePot = Math.round(prizeBaseCents * 0.25);
  const fourPot = Math.round(prizeBaseCents * 0.35);
  const fivePotBase = Math.round(prizeBaseCents * 0.40);
  const fivePot = fivePotBase + rolloverAppliedCents;

  const winners: Array<{
    userId: string;
    tier: Tier;
    matchCount: number;
  }> = [];

  for (const [userId, scoreSet] of userScoreSets.entries()) {
    const matchCount = Array.from(drawnSet).filter((n) => scoreSet.includes(n)).length;
    const tier = determineTierFromMatchCount(matchCount);
    if (tier) winners.push({ userId, tier, matchCount });
  }

  const winnersByTier = { 3: [] as string[], 4: [] as string[], 5: [] as string[] };
  for (const w of winners) winnersByTier[w.tier].push(w.userId);

  const count5 = winnersByTier[5].length;
  const jackpotRolloverToNextCents = count5 === 0 ? fivePot : 0;
  const fivePotForWinners = count5 === 0 ? 0 : fivePot;

  const payout3 = splitPotEvenlyCents(threePot, winnersByTier[3]);
  const payout4 = splitPotEvenlyCents(fourPot, winnersByTier[4]);
  const payout5 = splitPotEvenlyCents(fivePotForWinners, winnersByTier[5]);

  // Clear any existing winners for this draw (keeps publish deterministic).
  await Winner.deleteMany({ drawId: draw._id });

  // Create winners
  const winnerDocs: any[] = [];
  for (const userId of winnersByTier[5]) {
    winnerDocs.push({
      drawId: draw._id,
      userId,
      tier: 5,
      matchCount: 5,
      matchNumbers: drawnNumbers,
      verificationStatus: "pending",
      paymentStatus: "pending",
      payoutCents: payout5.get(userId) ?? 0,
    });
  }
  for (const userId of winnersByTier[4]) {
    const matchNumbers = drawnNumbers.filter((n) => userScoreSets.get(userId)?.includes(n));
    winnerDocs.push({
      drawId: draw._id,
      userId,
      tier: 4,
      matchCount: 4,
      matchNumbers,
      verificationStatus: "pending",
      paymentStatus: "pending",
      payoutCents: payout4.get(userId) ?? 0,
    });
  }
  for (const userId of winnersByTier[3]) {
    const matchNumbers = drawnNumbers.filter((n) => userScoreSets.get(userId)?.includes(n));
    winnerDocs.push({
      drawId: draw._id,
      userId,
      tier: 3,
      matchCount: 3,
      matchNumbers,
      verificationStatus: "pending",
      paymentStatus: "pending",
      payoutCents: payout3.get(userId) ?? 0,
    });
  }
  await Winner.insertMany(winnerDocs);

  await Draw.findByIdAndUpdate(draw._id, {
    status: "published",
    eligibleUserIds: eligibleUserIds,
    poolCents: prizeBaseCents,
    threeMatchPotCents: threePot,
    fourMatchPotCents: fourPot,
    fiveMatchPotCents: fivePot,
    jackpotRolloverToNextCents,
    rolloverAppliedCents,
  });

  // Return summary
  return {
    drawId: draw._id,
    drawMonth: draw.drawMonth,
    mode,
    drawnNumbers,
    poolCents: prizeBaseCents,
    pots: { threePotCents: threePot, fourPotCents: fourPot, fivePotCents: fivePot },
    winners: {
      "3": winnersByTier[3],
      "4": winnersByTier[4],
      "5": winnersByTier[5],
    },
    jackpotRolloverToNextCents,
  };
}

