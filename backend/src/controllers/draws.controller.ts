import type { Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware";
import * as drawsService from "../services/draws.service";

export const drawsController = {
  async create(req: Request, res: Response) {
    const { drawMonth } = req.body as { drawMonth: string };
    if (!drawMonth) throw new AppError("drawMonth required", 400);
    const draw = await drawsService.createOrGetDraw(drawMonth);
    res.status(201).json({ draw });
  },

  async simulate(req: Request, res: Response) {
    const { drawId } = req.params;
    const { mode } = req.body as { mode: "random" | "frequency" };
    const result = await drawsService.simulateDraw(drawId, mode);
    res.json(result);
  },

  async publish(req: Request, res: Response) {
    const { drawId } = req.params;
    const result = await drawsService.publishDraw(drawId);
    res.json(result);
  },
};

