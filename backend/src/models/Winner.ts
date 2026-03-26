import mongoose from "mongoose";
import type { Tier } from "./Draw";

export type WinnerVerificationStatus = "pending" | "approved" | "rejected";
export type WinnerPaymentStatus = "pending" | "paid";

export interface IWinner extends mongoose.Document {
  drawId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  tier: Tier;
  matchCount: number; // 3-5
  matchNumbers: number[];

  verificationStatus: WinnerVerificationStatus;
  paymentStatus: WinnerPaymentStatus;

  proofImagePath?: string;
  proofMimeType?: string;

  payoutCents: number;

  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WinnerSchema = new mongoose.Schema<IWinner>(
  {
    drawId: { type: mongoose.Schema.Types.ObjectId, ref: "Draw", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tier: { type: Number, required: true, enum: [3, 4, 5] },
    matchCount: { type: Number, required: true, min: 3, max: 5 },
    matchNumbers: { type: [Number], required: true },

    verificationStatus: { type: String, required: true, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    paymentStatus: { type: String, required: true, enum: ["pending", "paid"], default: "pending", index: true },

    proofImagePath: { type: String },
    proofMimeType: { type: String },

    payoutCents: { type: Number, required: true, min: 0 },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

WinnerSchema.index({ drawId: 1, userId: 1 }, { unique: true });

export const Winner = mongoose.model<IWinner>("Winner", WinnerSchema);

