import { Router, type IRouter, type Request, type Response } from "express";
import { db, suaraMuscabTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireRole } from "../lib/adminAuth";
import { z } from "zod/v4";

const router: IRouter = Router();

async function ensureSuaraRows() {
  const rows = await db.select().from(suaraMuscabTable);
  if (rows.length === 4) return rows;

  const existing = new Set(rows.map(r => `${r.posisi}-${r.calonIndex}`));
  const needed: Array<{ posisi: "ketua" | "sekjend"; calonIndex: number }> = [
    { posisi: "ketua", calonIndex: 0 },
    { posisi: "ketua", calonIndex: 1 },
    { posisi: "sekjend", calonIndex: 0 },
    { posisi: "sekjend", calonIndex: 1 },
  ];
  for (const n of needed) {
    if (!existing.has(`${n.posisi}-${n.calonIndex}`)) {
      await db.insert(suaraMuscabTable).values({ posisi: n.posisi, calonIndex: n.calonIndex, jumlahSuara: 0 });
    }
  }
  return db.select().from(suaraMuscabTable);
}

function rowsToData(rows: typeof suaraMuscabTable.$inferSelect[]) {
  const ketua = [0, 0];
  const sekjend = [0, 0];
  for (const r of rows) {
    if (r.posisi === "ketua" && r.calonIndex < 2) ketua[r.calonIndex] = r.jumlahSuara;
    if (r.posisi === "sekjend" && r.calonIndex < 2) sekjend[r.calonIndex] = r.jumlahSuara;
  }
  return { ketua, sekjend };
}

router.get("/suara", async (req: Request, res: Response) => {
  try {
    const rows = await ensureSuaraRows();
    res.json(rowsToData(rows));
  } catch (err) {
    req.log.error({ err }, "Error fetching suara");
    res.status(500).json({ error: "Gagal mengambil data suara" });
  }
});

const UpdateSuaraBody = z.object({
  posisi: z.enum(["ketua", "sekjend"]),
  calonIndex: z.number().int().min(0).max(1),
  jumlahSuara: z.number().int().min(0),
});

router.patch("/admin/suara", requireRole("full_access"), async (req: Request, res: Response) => {
  const parsed = UpdateSuaraBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Data tidak valid" });
    return;
  }
  const { posisi, calonIndex, jumlahSuara } = parsed.data;
  try {
    await ensureSuaraRows();
    await db
      .update(suaraMuscabTable)
      .set({ jumlahSuara, updatedAt: new Date() })
      .where(and(
        eq(suaraMuscabTable.posisi, posisi),
        eq(suaraMuscabTable.calonIndex, calonIndex),
      ));
    const rows = await db.select().from(suaraMuscabTable);
    res.json(rowsToData(rows));
  } catch (err) {
    req.log.error({ err }, "Error updating suara");
    res.status(500).json({ error: "Gagal mengupdate data suara" });
  }
});

export default router;
