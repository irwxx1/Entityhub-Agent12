import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { logger } from "./logger";

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

export const uploadsDir = path.resolve(workspaceRoot, "artifacts/api-server/uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info({ uploadsDir }, "Created uploads directory");
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".bin";
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipe file tidak diizinkan: ${file.mimetype}`));
    }
  },
});

export function getFilePath(filename: string): string {
  return path.join(uploadsDir, filename);
}

export function deleteFile(filename: string): void {
  try {
    const fullPath = path.join(uploadsDir, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    logger.warn({ err, filename }, "Failed to delete file");
  }
}

export function filenameFromObjectPath(objectPath: string): string | null {
  const parts = objectPath.replace(/^\/objects\//, "").split("/");
  return parts[parts.length - 1] || null;
}
