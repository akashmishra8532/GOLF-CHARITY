import mongoose from "mongoose";

export type UserRole = "User" | "Admin";

export interface IUser extends mongoose.Document {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  charityId: mongoose.Types.ObjectId;
  contributionPercent: number; // 10-100
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["User", "Admin"], default: "User", index: true },
    charityId: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", required: true },
    contributionPercent: {
      type: Number,
      required: true,
      min: 10,
      max: 100,
    },
    stripeCustomerId: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);

