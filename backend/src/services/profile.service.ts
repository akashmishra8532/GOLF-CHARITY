import { User } from "../models/User";
import { Charity } from "../models/Charity";
import { AppError } from "../middlewares/error.middleware";

export async function getProfile(userId: string) {
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function updateProfile(userId: string, input: Partial<{
  name: string;
  email: string;
  charityId: string;
  contributionPercent: number;
}>) {
  const updates: any = {};

  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.email !== undefined) updates.email = input.email.toLowerCase();

  if (input.charityId !== undefined) {
    const charity = await Charity.findById(input.charityId).lean();
    if (!charity) throw new AppError("Invalid charity selected", 400);
    updates.charityId = input.charityId;
  }

  if (input.contributionPercent !== undefined) {
    if (input.contributionPercent < 10 || input.contributionPercent > 100) {
      throw new AppError("Contribution percent must be between 10 and 100", 400);
    }
    updates.contributionPercent = input.contributionPercent;
  }

  if (updates.email) {
    const exists = await User.findOne({ email: updates.email, _id: { $ne: userId } }).lean();
    if (exists) throw new AppError("Email already registered", 409);
  }

  const user = await User.findByIdAndUpdate(userId, updates, { new: true }).lean();
  if (!user) throw new AppError("User not found", 404);
  return user;
}

