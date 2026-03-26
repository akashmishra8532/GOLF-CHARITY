import express from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

import { env } from "./config/env";
import { connectDb } from "./config/database";
import { bootstrapAdminIfMissing, ensureDefaultCharityExists } from "./config/bootstrap";
import { registerRoutes } from "./routes";
import healthRoutes from "./routes/health.routes";
import { errorHandler } from "./middlewares/error.middleware";

export const app = express();

// Basic hardening + observability
app.use(helmet());

// Dynamic CORS configuration for development
const corsOrigins = env.nodeEnv === 'production' 
  ? env.corsOrigin.split(",").map((s) => s.trim())
  : [
      env.corsOrigin,
      'http://localhost:5173',
      'http://10.103.95.39:5173',
      'http://127.0.0.1:5173',
      // Allow any localhost port for development
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/10\..*:\d+$/
    ];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(morgan("dev"));

// Rate limiting (helpful for auth endpoints)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Parse JSON for all non-webhook routes.
// Stripe webhooks require the raw request body for signature verification.
app.use((req, res, next) => {
  const isStripeWebhook = req.originalUrl.includes("/api/subscription/webhook");
  if (isStripeWebhook) return next();
  return express.json({ limit: "1mb" })(req, res, next);
});

// Attach health check routes (before other routes for monitoring)
app.use("/api", healthRoutes);

// Attach all REST routes
registerRoutes(app);

// Serve uploaded winner proofs (used by frontend to show images).
const uploadDir = path.isAbsolute(env.winnerProofUploadDir)
  ? env.winnerProofUploadDir
  : path.join(process.cwd(), env.winnerProofUploadDir);
app.use("/uploads", express.static(uploadDir));

app.use(errorHandler);

// Connect DB and bootstrap first-run essentials
connectDb()
  .then(async () => {
    try {
      await ensureDefaultCharityExists();
      await bootstrapAdminIfMissing();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Bootstrap skipped:", err);
    }
  })
  .catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Mongo connection failed:", err);
  process.exit(1);
  });

