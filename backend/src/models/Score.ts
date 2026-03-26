import mongoose from "mongoose";

export interface IScore extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  value: number; // 1-45
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema = new mongoose.Schema<IScore>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    value: { type: Number, required: true, min: 1, max: 45 },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

ScoreSchema.index({ userId: 1, date: -1 });

export const Score = mongoose.model<IScore>("Score", ScoreSchema);

