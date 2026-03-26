import type { Express } from "express";
import { Router } from "express";
import { validateBody } from "../middlewares/validate.middleware";
import { loginSchema, signupSchema } from "../validators/auth.schemas";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), authController.signup);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.get("/me", requireAuth, authController.me);

