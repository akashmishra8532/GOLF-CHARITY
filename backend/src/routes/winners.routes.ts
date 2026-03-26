import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireActiveSubscription, verifySubscription } from "../middlewares/subscription.middleware";
import { winnerProofUpload } from "../middlewares/multer.middleware";
import { winnersController } from "../controllers/winners.controller";

export const winnersRouter = Router();

winnersRouter.get("/my", requireAuth, verifySubscription, winnersController.my);
winnersRouter.post(
  "/:winnerId/upload",
  requireAuth,
  requireActiveSubscription,
  winnerProofUpload.single("proof"),
  winnersController.uploadProof
);

