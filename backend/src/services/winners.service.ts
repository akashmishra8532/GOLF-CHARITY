import { Winner } from "../models/Winner";
import { AppError } from "../middlewares/error.middleware";
import type { Tier } from "../models/Draw";
import { User } from "../models/User";
import { Draw } from "../models/Draw";
import { sendEmail } from "./email.service";

export async function listMyWinners(userId: string) {
  const winners = await Winner.find({ userId })
    .sort({ createdAt: -1 })
    .populate("drawId", "drawMonth status drawnNumbers")
    .lean();

  return winners.map((w: any) => ({
    id: String(w._id),
    drawId: String(w.drawId?._id ?? w.drawId),
    drawMonth: w.drawId?.drawMonth ?? "",
    tier: w.tier as Tier,
    matchCount: w.matchCount,
    verificationStatus: w.verificationStatus,
    paymentStatus: w.paymentStatus,
    proofImageUrl: w.proofImagePath ? w.proofImagePath : undefined,
    payoutCents: w.payoutCents,
    createdAt: w.createdAt,
  }));
}

export async function uploadWinnerProof(params: {
  winnerId: string;
  userId: string;
  proofImagePath: string;
  proofMimeType: string | undefined;
}) {
  const winner = await Winner.findById(params.winnerId);
  if (!winner) throw new AppError("Winner not found", 404);
  if (String(winner.userId) !== params.userId) throw new AppError("Forbidden", 403);
  if (winner.verificationStatus !== "pending" || winner.paymentStatus !== "pending") {
    throw new AppError("Winner not eligible for proof upload", 409);
  }

  winner.proofImagePath = params.proofImagePath;
  winner.proofMimeType = params.proofMimeType;
  await winner.save();
  return winner;
}

export async function getWinnerById(winnerId: string) {
  const winner = await Winner.findById(winnerId);
  if (!winner) throw new AppError("Winner not found", 404);
  return winner;
}

export async function reviewWinner(params: {
  winnerId: string;
  decision: "approve" | "reject";
}) {
  const winner = await Winner.findById(params.winnerId);
  if (!winner) throw new AppError("Winner not found", 404);

  if (winner.verificationStatus !== "pending") {
    throw new AppError("Winner already reviewed", 409);
  }

  if (params.decision === "approve") {
    winner.verificationStatus = "approved";
    winner.paymentStatus = "paid";
  } else {
    winner.verificationStatus = "rejected";
    // Payment remains pending when rejected
    winner.paymentStatus = "pending";
  }

  winner.reviewedAt = new Date();
  await winner.save();

  // Best-effort notifications for admins approving/rejecting.
  try {
    const user = await User.findById(winner.userId).lean();
    const draw = await Draw.findById(winner.drawId).lean();
    if (user?.email && draw?.drawMonth) {
      const amount = (winner.payoutCents / 100).toFixed(2);
      if (params.decision === "approve") {
        await sendEmail({
          to: user.email,
          subject: `You won the ${draw.drawMonth} monthly draw`,
          text: `Congratulations ${user.name || ""}!\n\nYour ${winner.tier}-match winning has been approved. Payout: $${amount}\n`,
        });
      } else {
        await sendEmail({
          to: user.email,
          subject: `Your proof was reviewed for the ${draw.drawMonth} draw`,
          text: `Thanks for submitting proof. The admin has rejected it for the ${draw.drawMonth} draw.\n`,
        });
      }
    }
  } catch {
    // Do not fail the approval flow on email issues.
  }

  return winner;
}

