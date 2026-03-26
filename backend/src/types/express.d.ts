import type { JwtUserPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
      subscription?: {
        status: "active" | "expired" | "cancelled";
        planInterval?: "monthly" | "yearly";
        currentPeriodEnd?: Date;
      };
    }
  }
}

export {};

