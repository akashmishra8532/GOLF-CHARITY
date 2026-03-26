import type { Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware";
import * as winnersService from "../services/winners.service";

export const winnersController = {
  async my(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const winners = await winnersService.listMyWinners(req.user.userId);
    res.json({ winners });
  },

  async uploadProof(req: Request, res: Response) {
    if (!req.user?.userId) throw new AppError("Unauthorized", 401);
    const { winnerId } = req.params as { winnerId: string };
    const file = req.file;
    if (!file) throw new AppError("Missing proof image", 400);

    const winner = await winnersService.uploadWinnerProof({
      winnerId,
      userId: req.user.userId,
      // Store a public URL path to keep the frontend simple.
      proofImagePath: `/uploads/${file.filename}`,
      proofMimeType: file.mimetype,
    });
    res.json({ winnerId: winner._id, verificationStatus: winner.verificationStatus, paymentStatus: winner.paymentStatus });
  },
};

