import type { NextFunction, Request, Response } from "express";
import { AppError } from "./error.middleware";

export function requireRole(...roles: Array<"User" | "Admin">) {
  return function (req: Request, _res: Response, next: NextFunction) {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      throw new AppError("Forbidden", 403);
    }
    next();
  };
}

