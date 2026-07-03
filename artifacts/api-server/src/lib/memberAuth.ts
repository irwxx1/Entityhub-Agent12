import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export interface MemberSession {
  memberId: string;
  nama: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      member?: MemberSession;
    }
  }
}

export async function registerMember(
  nama: string,
  email: string,
  password: string
): Promise<MemberSession | { error: string }> {
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [created] = await db
      .insert(membersTable)
      .values({ nama, email, passwordHash })
      .returning();
    return { memberId: created.id, nama: created.nama, email: created.email };
  } catch (err: any) {
    if (err?.code === "23505") {
      return { error: "Email sudah terdaftar" };
    }
    logger.error({ err }, "Error registering member");
    return { error: "Gagal mendaftar" };
  }
}

export async function loginMember(
  email: string,
  password: string
): Promise<MemberSession | null> {
  try {
    const [member] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.email, email))
      .limit(1);
    if (!member) return null;
    const valid = await bcrypt.compare(password, member.passwordHash);
    if (!valid) return null;
    return { memberId: member.id, nama: member.nama, email: member.email };
  } catch (err) {
    logger.error({ err }, "Error during member login");
    return null;
  }
}

export function requireMember(req: Request, res: Response, next: NextFunction) {
  const session = req.signedCookies?.memberSession;
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const parsed: MemberSession = JSON.parse(session);
    req.member = parsed;
    next();
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
}
