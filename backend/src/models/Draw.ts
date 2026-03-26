import mongoose from "mongoose";

export type DrawStatus = "draft" | "simulated" | "published";
export type DrawMode = "random" | "frequency";
export type Tier = 3 | 4 | 5;

export interface IDraw extends mongoose.Document {
  drawMonth: string; // YYYY-MM
  status: DrawStatus;
  mode?: DrawMode;
  drawnNumbers?: number[];
  eligibleUserIds?: mongoose.Types.ObjectId[];

  // Prize pool (after charity contribution split logic)
  poolCents?: number;

  threeMatchPotCents?: number;
  fourMatchPotCents?: number;
  fiveMatchPotCents?: number;

  // If tier-5 has no winners, its pot rolls over to the next draw.
  jackpotRolloverToNextCents?: number;

  rolloverAppliedCents?: number;

  createdAt: Date;
  updatedAt: Date;
}

const DrawSchema = new mongoose.Schema<IDraw>(
  {
    drawMonth: { type: String, required: true, unique: true, index: true }, // format validated in service
    status: { type: String, required: true, enum: ["draft", "simulated", "published"], default: "draft", index: true },
    mode: { type: String, enum: ["random", "frequency"] },
    drawnNumbers: { type: [Number], default: [] },
    eligibleUserIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] },

    poolCents: { type: Number },
    threeMatchPotCents: { type: Number },
    fourMatchPotCents: { type: Number },
    fiveMatchPotCents: { type: Number },

    jackpotRolloverToNextCents: { type: Number, default: 0 },
    rolloverAppliedCents: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Draw = mongoose.model<IDraw>("Draw", DrawSchema);

