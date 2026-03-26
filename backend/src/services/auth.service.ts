import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Charity } from "../models/Charity";
import { AppError } from "../middlewares/error.middleware";
import { signJwt } from "../utils/jwt";
import { sendEmail } from "./email.service";

export async function signup(params: {
  email: string;
  password: string;
  name: string;
  charityId: string;
  contributionPercent: number;
}) {
  const exists = await User.findOne({ email: params.email.toLowerCase() });
  if (exists) throw new AppError("Email already registered", 409);

  const charity = await Charity.findById(params.charityId).lean();
  if (!charity) throw new AppError("Invalid charity selected", 400);

  const passwordHash = await bcrypt.hash(params.password, 12);

  const user = await User.create({
    email: params.email.toLowerCase(),
    name: params.name.trim(),
    passwordHash,
    role: "User",
    charityId: params.charityId,
    contributionPercent: params.contributionPercent,
  });

  await sendEmail({
    to: user.email,
    subject: "Welcome to Golf Charity Subscription Platform",
    text: `Hi ${user.name},\n\nYour account has been created. Please subscribe to start participating in monthly draws.\n`,
  });

  return user;
}

export async function login(params: { email: string; password: string }) {
  const user = await User.findOne({ email: params.email.toLowerCase() });
  if (!user) throw new AppError("Invalid credentials", 401);

  const ok = await bcrypt.compare(params.password, user.passwordHash);
  if (!ok) throw new AppError("Invalid credentials", 401);

  const token = signJwt({ userId: String(user._id), role: user.role });
  return { token, user };
}

