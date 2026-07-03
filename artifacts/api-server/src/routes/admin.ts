import { Router, type IRouter, type Request, type Response } from "express";
import { db, pesertaMuscabTable, adminUsersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { loginAdmin, requireAdmin, requireRole, type AdminRole } from "../lib/adminAuth";
import { z } from "zod/v4";

const router: IRouter = Router();

// ─── Auth ───────────────────────────────────────────────────────────────────

router.post("/admin/login", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "Username dan password wajib diisi" });
    return;
  }
  try {
    const session = await loginAdmin(username, password);
    if (!session) {
      res.status(401).json({ error: "Username atau password salah" });
      return;
    }
    res.cookie("adminSession", JSON.stringify(session), {
      signed: true,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.json({ username: session.username, role: session.role });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/logout", requireAdmin, (req: Request, res: Response) => {
  res.clearCookie("adminSession");
  res.json({ ok: true });
});

router.get("/admin/me", requireAdmin, (req: Request, res: Response) => {
  res.json(req.admin);
});

// ─── Peserta management ─────────────────────────────────────────────────────

router.get("/admin/peserta", requireAdmin, async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const rows = search
      ? await db.select().from(pesertaMuscabTable)
          .where(or(
            ilike(pesertaMuscabTable.nama, `%${search}%`),
            ilike(pesertaMuscabTable.nia, `%${search}%`),
          ))
      : await db.select().from(pesertaMuscabTable);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error fetching peserta");
    res.status(500).json({ error: "Gagal mengambil data peserta" });
  }
});

const UpdatePesertaBody = z.object({
  statusNia: z.enum(["pending", "aktif", "tidak_aktif"]).optional(),
  statusBayar: z.enum(["menunggu", "terverifikasi", "ditolak"]).optional(),
  hadir: z.boolean().optional(),
  catatanAdmin: z.string().optional().nullable(),
});

router.patch("/admin/peserta/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const parsed = UpdatePesertaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data tidak valid" });
    return;
  }

  const role = req.admin!.role;
  const data = parsed.data;

  if (data.statusNia !== undefined && role !== "full_access" && role !== "registrasi") {
    res.status(403).json({ error: "Forbidden: tidak bisa ubah statusNia" });
    return;
  }
  if (data.statusBayar !== undefined && role !== "full_access" && role !== "keuangan") {
    res.status(403).json({ error: "Forbidden: tidak bisa ubah statusBayar" });
    return;
  }
  if (data.hadir !== undefined && role !== "full_access" && role !== "registrasi") {
    res.status(403).json({ error: "Forbidden: tidak bisa ubah hadir" });
    return;
  }

  try {
    const [updated] = await db
      .update(pesertaMuscabTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pesertaMuscabTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Peserta tidak ditemukan" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating peserta");
    res.status(500).json({ error: "Gagal mengupdate data peserta" });
  }
});

router.delete("/admin/peserta/:id", requireRole("full_access"), async (req: Request, res: Response) => {
  try {
    const [deleted] = await db
      .delete(pesertaMuscabTable)
      .where(eq(pesertaMuscabTable.id, String(req.params.id)))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Peserta tidak ditemukan" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting peserta");
    res.status(500).json({ error: "Gagal menghapus peserta" });
  }
});

// ─── CSV Export ─────────────────────────────────────────────────────────────

router.get("/admin/peserta/export", requireAdmin, async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(pesertaMuscabTable);
    const header = ["ID", "Nama", "NIA", "Alamat", "HP", "Email", "Status NIA", "Status Bayar", "Hadir", "Catatan Admin", "Terdaftar"];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      header.join(","),
      ...rows.map(r => [r.id, r.nama, r.nia, r.alamat, r.hp, r.email, r.statusNia, r.statusBayar, r.hadir ? "Ya" : "Tidak", r.catatanAdmin, r.createdAt ? new Date(r.createdAt).toLocaleString("id-ID") : ""].map(esc).join(",")),
    ];
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="peserta-muscab-${Date.now()}.csv"`);
    res.send("\uFEFF" + lines.join("\r\n"));
  } catch (err) {
    req.log.error({ err }, "Error exporting peserta");
    res.status(500).json({ error: "Gagal export data" });
  }
});

// ─── Admin user management (full_access only) ────────────────────────────────

router.get("/admin/users", requireRole("full_access"), async (req: Request, res: Response) => {
  try {
    const users = await db.select({
      id: adminUsersTable.id,
      username: adminUsersTable.username,
      role: adminUsersTable.role,
      createdAt: adminUsersTable.createdAt,
    }).from(adminUsersTable);
    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Error fetching admin users");
    res.status(500).json({ error: "Gagal mengambil data admin" });
  }
});

const CreateAdminBody = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["full_access", "registrasi", "keuangan", "spectator"]),
});

router.post("/admin/users", requireRole("full_access"), async (req: Request, res: Response) => {
  const parsed = CreateAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data tidak valid" });
    return;
  }
  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const [created] = await db.insert(adminUsersTable).values({
      username: parsed.data.username,
      passwordHash,
      role: parsed.data.role,
    }).returning({
      id: adminUsersTable.id,
      username: adminUsersTable.username,
      role: adminUsersTable.role,
    });
    res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "Username sudah digunakan" });
      return;
    }
    req.log.error({ err }, "Error creating admin user");
    res.status(500).json({ error: "Gagal membuat admin" });
  }
});

const UpdateAdminBody = z.object({
  password: z.string().min(6).optional(),
  role: z.enum(["full_access", "registrasi", "keuangan", "spectator"]).optional(),
});

router.patch("/admin/users/:id", requireRole("full_access"), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (id === req.admin!.userId) {
    res.status(403).json({ error: "Tidak bisa mengubah akun sendiri" });
    return;
  }
  const parsed = UpdateAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data tidak valid" });
    return;
  }
  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.role) updates.role = parsed.data.role;
    if (parsed.data.password) updates.passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const [updated] = await db.update(adminUsersTable)
      .set(updates)
      .where(eq(adminUsersTable.id, id))
      .returning({ id: adminUsersTable.id, username: adminUsersTable.username, role: adminUsersTable.role });

    if (!updated) {
      res.status(404).json({ error: "Admin tidak ditemukan" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating admin user");
    res.status(500).json({ error: "Gagal mengupdate admin" });
  }
});

router.delete("/admin/users/:id", requireRole("full_access"), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (id === req.admin!.userId) {
    res.status(403).json({ error: "Tidak bisa menghapus akun sendiri" });
    return;
  }
  try {
    const [deleted] = await db.delete(adminUsersTable)
      .where(eq(adminUsersTable.id, id))
      .returning({ id: adminUsersTable.id });
    if (!deleted) {
      res.status(404).json({ error: "Admin tidak ditemukan" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting admin user");
    res.status(500).json({ error: "Gagal menghapus admin" });
  }
});

export default router;
