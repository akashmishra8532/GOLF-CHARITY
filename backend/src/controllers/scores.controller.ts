import type { Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware";
import * as scoresService from "../services/scores.service";

export const scoresController = {
  async getLastFive(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const scores = await scoresService.getLastFiveScores(req.user.userId);
    res.json({ scores });
  },

  async add(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const scores = await scoresService.addScore(req.user.userId, req.body);
    res.status(201).json({ scores });
  },

  async update(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const { scoreId } = req.params as { scoreId: string };
    const scores = await scoresService.updateScore({
      userId: req.user.userId,
      scoreId,
      value: req.body.value,
      date: req.body.date,
    });
    res.json({ scores });
  },
};

