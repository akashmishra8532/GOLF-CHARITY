import { AppError } from "../middlewares/error.middleware";
import { Score } from "../models/Score";
import { validateStablefordScore } from "../utils/score";

export async function getLastFiveScores(userId: string) {
  const scores = await Score.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(5).lean();
  return scores.map((s: any) => ({
    id: String(s._id),
    value: s.value,
    date: s.date,
  }));
}

export async function addScore(userId: string, input: { value: number; date?: Date }) {
  validateStablefordScore(input.value);

  const scoreDate = input.date ?? new Date();
  const doc = await Score.create({
    userId,
    value: input.value,
    date: scoreDate,
  });

  // Keep only last 5 scores (by date desc, then createdAt desc)
  const all = await Score.find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .select({ _id: 1 })
    .lean();
  if (all.length > 5) {
    const toDelete = all.slice(5).map((d: any) => d._id);
    await Score.deleteMany({ _id: { $in: toDelete } });
  }

  // Return latest-first
  return getLastFiveScores(userId);
}

export async function updateScore(params: { userId: string; scoreId: string; value: number; date?: Date }) {
  validateStablefordScore(params.value);
  const score = await Score.findById(params.scoreId);
  if (!score) throw new AppError("Score not found", 404);
  if (String(score.userId) !== params.userId) throw new AppError("Forbidden", 403);

  score.value = params.value;
  if (params.date !== undefined) score.date = params.date;
  await score.save();

  // Keep only last 5 based on date (oldest removed)
  const all = await Score.find({ userId: params.userId })
    // Newest first, so anything after index 4 is the "oldest kept" overflow.
    .sort({ date: -1, createdAt: -1 })
    .select({ _id: 1 })
    .lean();
  if (all.length > 5) {
    const toDelete = all.slice(5).map((d: any) => d._id);
    await Score.deleteMany({ _id: { $in: toDelete } });
  }

  return getLastFiveScores(params.userId);
}

