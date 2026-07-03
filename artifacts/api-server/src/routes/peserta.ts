import { Router, type IRouter, type Request, type Response } from "express";
import { db, pesertaMuscabTable } from "@workspace/db";
import { checkNiaStatus } from "../lib/niaVerification";
import { count, eq, ilike, or } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

const SubmitPesertaBody = z.object({
  nama: z.string().min(1),
  nia: z.string().min(1),
  alamat: z.string().min(1),
  hp: z.string().min(1),
  email: z.email(),
  selfiePath: z.string().optional().nullable(),
  buktiPath: z.string().optional().nullable(),
  fotoKtaPath: z.string().optional().nullable(),
});

router.post("/peserta", async (req: Request, res: Response) => {
  const parsed = SubmitPesertaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data pendaftaran tidak valid" });
    return;
  }

  try {
    const statusNia = await checkNiaStatus(parsed.data.nia);
    const [created] = await db
      .insert(pesertaMuscabTable)
      .values({ ...parsed.data, statusNia })
      .returning();
    res.status(201).json(created);
  } catch (error) {
    req.log.error({ err: error }, "Error inserting peserta");
    res.status(500).json({ error: "Gagal menyimpan data pendaftaran" });
  }
});

router.get("/peserta/cek", async (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  try {
    const rows = search
      ? await db
          .select({
            id: pesertaMuscabTable.id,
            nama: pesertaMuscabTable.nama,
            nia: pesertaMuscabTable.nia,
            statusNia: pesertaMuscabTable.statusNia,
            statusBayar: pesertaMuscabTable.statusBayar,
            createdAt: pesertaMuscabTable.createdAt,
          })
          .from(pesertaMuscabTable)
          .where(or(
            ilike(pesertaMuscabTable.nama, `%${search}%`),
            ilike(pesertaMuscabTable.nia, `%${search}%`),
          ))
      : [];
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Error cek peserta");
    res.status(500).json({ error: "Gagal mengambil data" });
  }
});

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const [[{ calon }], [{ peserta }]] = await Promise.all([
      db.select({ calon: count() }).from(pesertaMuscabTable),
      db.select({ peserta: count() }).from(pesertaMuscabTable)
        .where(eq(pesertaMuscabTable.statusBayar, "terverifikasi")),
    ]);
    res.json({ calon: Number(calon), peserta: Number(peserta) });
  } catch (error) {
    req.log.error({ err: error }, "Error fetching stats");
    res.status(500).json({ error: "Gagal mengambil statistik" });
  }
});

export default router;
