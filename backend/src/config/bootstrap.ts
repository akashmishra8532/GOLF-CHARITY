import bcrypt from "bcryptjs";
import { env } from "./env";
import { User } from "../models/User";
import { Charity } from "../models/Charity";

export async function ensureDefaultCharityExists() {
  const existing = await Charity.findOne({ slug: "general-charity-fund" }).lean();
  if (existing) return String(existing._id);
  const created = await Charity.create({
    name: "General Charity Fund",
    slug: "general-charity-fund",
    description: "Default charity created for first-run setup.",
  });
  return String(created._id);
}

function getSeedCharityId(): Promise<string> {
  // Admin bootstrap requires a charityId due to schema.
  // We reuse ensureDefaultCharityExists for first-run usability.
  return ensureDefaultCharityExists();
}

export async function bootstrapAdminIfMissing() {
  const devFallbackAdminEmail = env.nodeEnv !== "production" ? "admin@local.dev" : undefined;
  const devFallbackAdminPassword = env.nodeEnv !== "production" ? "Admin12345!" : undefined;

  const adminEmail = env.adminBootstrapEmail ?? devFallbackAdminEmail;
  const adminPassword = env.adminBootstrapPassword ?? devFallbackAdminPassword;

  if (!adminEmail || !adminPassword) return;

  const existing = await User.findOne({ email: adminEmail.toLowerCase(), role: "Admin" }).lean();
  if (existing) return;

  const charityId = await getSeedCharityId();
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await User.create({
    email: adminEmail.toLowerCase(),
    name: "Admin",
    passwordHash,
    role: "Admin",
    charityId,
    contributionPercent: 10,
  });
}

