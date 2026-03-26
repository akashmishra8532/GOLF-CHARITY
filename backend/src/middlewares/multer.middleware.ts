import multer from "multer";
import fs from "fs";
import path from "path";
import { env } from "../config/env";

// Ensure upload directory exists at startup.
const uploadDir = path.isAbsolute(env.winnerProofUploadDir)
  ? env.winnerProofUploadDir
  : path.join(process.cwd(), env.winnerProofUploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${safeName}`);
  },
});

export const winnerProofUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

