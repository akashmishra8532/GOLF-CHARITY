import type { Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware";
import * as profileService from "../services/profile.service";

function pickUser(user: any) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    charityId: String(user.charityId),
    contributionPercent: user.contributionPercent,
    role: user.role,
  };
}

export const profileController = {
  async get(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const user = await profileService.getProfile(req.user.userId);
    res.json({ user: pickUser(user) });
  },
  async update(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const user = await profileService.updateProfile(req.user.userId, req.body);
    res.json({ user: pickUser(user) });
  },
};

