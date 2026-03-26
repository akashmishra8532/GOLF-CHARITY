import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details ?? undefined,
    });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation error", details: err.flatten() });
    return;
  }

  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}

