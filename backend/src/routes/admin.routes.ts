import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { charityCreateSchema, charityUpdateSchema } from "../validators/charity.schemas";
import { updateUserRoleSchema, reviewWinnerSchema, activateSubscriptionSchema } from "../validators/admin.schemas";
import { updateScoreSchema } from "../validators/scores.schemas";
import { adminController } from "../controllers/admin.controller";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("Admin"));

adminRouter.get("/users", adminController.listUsers);
adminRouter.patch("/users/:userId/role", validateBody(updateUserRoleSchema), adminController.updateUserRole);

adminRouter.get("/subscriptions", adminController.listSubscriptions);
adminRouter.post(
  "/subscriptions/:userId/activate",
  validateBody(activateSubscriptionSchema),
  adminController.activateSubscription
);

adminRouter.get("/charities", adminController.listCharities);
adminRouter.post("/charities", validateBody(charityCreateSchema), adminController.createCharity);
adminRouter.put("/charities/:charityId", validateBody(charityUpdateSchema), adminController.updateCharity);
adminRouter.delete("/charities/:charityId", adminController.deleteCharity);

adminRouter.get("/winners", adminController.listWinners);
adminRouter.post("/winners/:winnerId/review", validateBody(reviewWinnerSchema), adminController.reviewWinner);

// Admin can view/edit scores (PRD requirement: edit golf scores).
adminRouter.get("/scores", adminController.listScores);
adminRouter.put("/scores/:scoreId", validateBody(updateScoreSchema), adminController.adminUpdateScore);

adminRouter.get("/analytics", adminController.analytics);

