import { Router, type IRouter, type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import { requireAdmin } from "../lib/adminAuth";
import { upload, uploadsDir, filenameFromObjectPath } from "../lib/objectStorage";

const router: IRouter = Router();

/**
 * POST /storage/upload
 *
 * Direct multipart file upload. Accepts a single file in the `file` field.
 * Returns { path: "/objects/<filename>" } for storing in DB.
 * No auth required — public registration uploads selfie + bukti transfer.
 */
router.post("/storage/upload", upload.single("file"), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "Tidak ada file yang diupload" });
    return;
  }
  const objectPath = `/objects/${req.file.filename}`;
  res.json({ path: objectPath, filename: req.file.filename });
});

/**
 * GET /storage/objects/:filename
 *
 * Serve uploaded files. Admin-only — contains sensitive documents.
 */
router.get("/storage/objects/:filename", requireAdmin, (req: Request, res: Response) => {
  const filename = String(req.params.filename ?? "");
  if (!filename || filename.includes("..") || filename.includes("/")) {
    res.status(400).json({ error: "Invalid filename" });
    return;
  }
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File tidak ditemukan" });
    return;
  }
  res.sendFile(filePath);
});

/**
 * GET /storage/objects/*path (legacy path support)
 *
 * Supports old /objects/<uuid>.<ext> format stored in DB from old system.
 */
router.get("/storage/objects/*path", requireAdmin, (req: Request, res: Response) => {
  const raw = (req.params as Record<string, string>).path || "";
  const filename = filenameFromObjectPath(`/objects/${raw}`);
  if (!filename || filename.includes("..")) {
    res.status(400).json({ error: "Invalid path" });
    return;
  }
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File tidak ditemukan" });
    return;
  }
  res.sendFile(filePath);
});

export default router;
