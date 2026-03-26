import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/error.middleware";
import * as authService from "../services/auth.service";
import { User } from "../models/User";
import { signJwt } from "../utils/jwt";

function pickUser(user: any) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
    charityId: String(user.charityId),
    contributionPercent: user.contributionPercent,
  };
}

export const authController = {
  async signup(req: Request, res: Response, _next: NextFunction) {
    const user = await authService.signup(req.body);
    const token = signJwt({ userId: String(user._id), role: user.role });
    res.status(201).json({ token, user: pickUser(user) });
  },

  async login(req: Request, res: Response, _next: NextFunction) {
    const { token, user } = await authService.login(req.body);
    res.json({ token, user: pickUser(user) });
  },

  async me(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const user = await User.findById(req.user.userId).lean();
    if (!user) throw new AppError("User not found", 404);
    res.json({ user: pickUser(user) });
  },
};

