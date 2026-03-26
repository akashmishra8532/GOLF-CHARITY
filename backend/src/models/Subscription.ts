import mongoose from "mongoose";

export type SubscriptionStatus = "active" | "expired" | "cancelled";
export type SubscriptionInterval = "monthly" | "yearly";

export interface ISubscription extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planInterval: SubscriptionInterval;
  status: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  amountPerMonthCents: number;
  updatedAt: Date;
  createdAt: Date;
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    planInterval: { type: String, required: true, enum: ["monthly", "yearly"] },
    status: { type: String, required: true, enum: ["active", "expired", "cancelled"], default: "expired" },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    amountPerMonthCents: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

