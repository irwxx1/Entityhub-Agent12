import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export type AdminRole = "full_access" | "registrasi" | "keuangan" | "spectator";

export interface AdminSession {
  userId: string;
  username: string;
  role: AdminRole;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminSession;
    }
  }
}

export async function ensureSeedAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    logger.warn("ADMIN_USERNAME or ADMIN_PASSWORD not set — skipping seed admin");
    return;
  }
  try {
    const existing = await db
      .select()
      .from(adminUsersTable)
      .limit(1);
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash(password, 12);
      await db.insert(adminUsersTable).values({
        username,
        passwordHash,
        role: "full_access",
      });
      logger.info({ username }, "Seed admin created");
    }
  } catch (err) {
    logger.error({ err }, "Failed to ensure seed admin");
  }
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<AdminSession | null> {
  try {
    const [admin] = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.username, username))
      .limit(1);
    if (!admin) return null;
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return null;
    return { userId: admin.id, username: admin.username, role: admin.role as AdminRole };
  } catch (err) {
    logger.error({ err }, "Error during admin login");
    return null;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.signedCookies?.adminSession;
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const parsed: AdminSession = JSON.parse(session);
    req.admin = parsed;
    next();
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
}

export function requireRole(...roles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAdmin(req, res, () => {
      if (!req.admin || !roles.includes(req.admin.role)) {
        res.status(403).json({ error: "Forbidden: insufficient role" });
        return;
      }
      next();
    });
  };
}

export { cookieParser };
