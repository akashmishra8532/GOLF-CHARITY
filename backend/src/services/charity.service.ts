import { Charity } from "../models/Charity";
import { AppError } from "../middlewares/error.middleware";

export async function listCharities() {
  const charities = await Charity.find({}).sort({ createdAt: 1 }).lean();
  return charities.map((c: any) => ({
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    imageUrl: c.imageUrl ?? "",
  }));
}

export async function getCharityById(id: string) {
  const charity = await Charity.findById(id).lean();
  if (!charity) throw new AppError("Charity not found", 404);
  return charity;
}

export async function createCharity(input: { name: string; slug: string; description?: string; imageUrl?: string }) {
  if (!input.slug) {
    throw new AppError("slug is required", 400);
  }
  const charity = await Charity.create({
    name: input.name.trim(),
    slug: input.slug.trim(),
    description: input.description ?? "",
    imageUrl: input.imageUrl,
  });
  return charity;
}

export async function updateCharity(id: string, input: Partial<{ name: string; slug: string; description: string; imageUrl: string }>) {
  const charity = await Charity.findByIdAndUpdate(
    id,
    {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.slug ? { slug: input.slug.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
    },
    { new: true }
  ).lean();
  if (!charity) throw new AppError("Charity not found", 404);
  return charity;
}

export async function deleteCharity(id: string) {
  const res = await Charity.findByIdAndDelete(id);
  if (!res) throw new AppError("Charity not found", 404);
  return { deleted: true };
}

export const charityService = {
  listCharities,
  getCharityById,
  createCharity,
  updateCharity,
  deleteCharity,
};

