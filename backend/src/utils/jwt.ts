import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtUserPayload = {
  userId: string;
  role: "User" | "Admin";
};

export function signJwt(payload: JwtUserPayload) {
  // jsonwebtoken overloads are a bit strict with TS in some configurations,
  // so we cast options to ensure compilation across versions.
  return jwt.sign(payload as any, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as any);
}

export function verifyJwt(token: string): JwtUserPayload {
  return jwt.verify(token, env.jwtSecret) as JwtUserPayload;
}

