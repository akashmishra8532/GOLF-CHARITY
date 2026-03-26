import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { z } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return function (req: Request, _res: Response, next: NextFunction) {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  };
}

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return function (req: Request, _res: Response, next: NextFunction) {
    const parsed = schema.parse(req.query);
    req.query = parsed;
    next();
  };
}

