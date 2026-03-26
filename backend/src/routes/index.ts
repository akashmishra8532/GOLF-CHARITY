import type { Express } from "express";

import { authRouter } from "./auth.routes";
import { profileRouter } from "./profile.routes";
import { scoresRouter } from "./scores.routes";
import { subscriptionRouter } from "./subscription.routes";
import { charitiesRouter } from "./charity.routes";
import { drawsRouter } from "./draws.routes";
import { winnersRouter } from "./winners.routes";
import { adminRouter } from "./admin.routes";
import { dashboardRouter } from "./dashboard.routes";

export function registerRoutes(app: Express) {
  app.get("/health", (_, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/scores", scoresRouter);
  app.use("/api/subscription", subscriptionRouter);
  app.use("/api/charities", charitiesRouter);

  app.use("/api/draws", drawsRouter);
  app.use("/api/winners", winnersRouter);
  app.use("/api/dashboard", dashboardRouter);

  app.use("/api/admin", adminRouter);
}

