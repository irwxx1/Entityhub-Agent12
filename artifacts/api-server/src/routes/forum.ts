import { Router, type IRouter, type Request, type Response } from "express";
import { db, forumTopicsTable, forumRepliesTable, membersTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { requireMember } from "../lib/memberAuth";
import { z } from "zod/v4";

const router: IRouter = Router();

router.get("/forum/topics", async (req: Request, res: Response) => {
  try {
    const topics = await db
      .select({
        id: forumTopicsTable.id,
        judul: forumTopicsTable.judul,
        isi: forumTopicsTable.isi,
        createdAt: forumTopicsTable.createdAt,
        namaPenulis: membersTable.nama,
      })
      .from(forumTopicsTable)
      .innerJoin(membersTable, eq(forumTopicsTable.memberId, membersTable.id))
      .orderBy(desc(forumTopicsTable.createdAt));

    const withCounts = await Promise.all(
      topics.map(async (t) => {
        const [{ jumlahBalasan }] = await db
          .select({ jumlahBalasan: count() })
          .from(forumRepliesTable)
          .where(eq(forumRepliesTable.topicId, t.id));
        return { ...t, jumlahBalasan: Number(jumlahBalasan) };
      })
    );
    res.json(withCounts);
  } catch (err) {
    req.log.error({ err }, "Error fetching forum topics");
    res.status(500).json({ error: "Gagal mengambil topik forum" });
  }
});

const CreateTopicBody = z.object({
  judul: z.string().min(3),
  isi: z.string().min(1),
});

router.post("/forum/topics", requireMember, async (req: Request, res: Response) => {
  const parsed = CreateTopicBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Judul dan isi wajib diisi" });
    return;
  }
  try {
    const [created] = await db
      .insert(forumTopicsTable)
      .values({
        memberId: req.member!.memberId,
        judul: parsed.data.judul,
        isi: parsed.data.isi,
      })
      .returning();
    res.status(201).json({ ...created, namaPenulis: req.member!.nama, jumlahBalasan: 0 });
  } catch (err) {
    req.log.error({ err }, "Error creating forum topic");
    res.status(500).json({ error: "Gagal membuat topik" });
  }
});

router.get("/forum/topics/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const [topic] = await db
      .select({
        id: forumTopicsTable.id,
        judul: forumTopicsTable.judul,
        isi: forumTopicsTable.isi,
        createdAt: forumTopicsTable.createdAt,
        namaPenulis: membersTable.nama,
      })
      .from(forumTopicsTable)
      .innerJoin(membersTable, eq(forumTopicsTable.memberId, membersTable.id))
      .where(eq(forumTopicsTable.id, id))
      .limit(1);
    if (!topic) {
      res.status(404).json({ error: "Topik tidak ditemukan" });
      return;
    }
    const replies = await db
      .select({
        id: forumRepliesTable.id,
        isi: forumRepliesTable.isi,
        createdAt: forumRepliesTable.createdAt,
        namaPenulis: membersTable.nama,
      })
      .from(forumRepliesTable)
      .innerJoin(membersTable, eq(forumRepliesTable.memberId, membersTable.id))
      .where(eq(forumRepliesTable.topicId, id))
      .orderBy(forumRepliesTable.createdAt);
    res.json({ ...topic, replies });
  } catch (err) {
    req.log.error({ err }, "Error fetching forum topic");
    res.status(500).json({ error: "Gagal mengambil topik" });
  }
});

const CreateReplyBody = z.object({
  isi: z.string().min(1),
});

router.post("/forum/topics/:id/replies", requireMember, async (req: Request, res: Response) => {
  const parsed = CreateReplyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Isi balasan wajib diisi" });
    return;
  }
  try {
    const [created] = await db
      .insert(forumRepliesTable)
      .values({
        topicId: String(req.params.id),
        memberId: req.member!.memberId,
        isi: parsed.data.isi,
      })
      .returning();
    res.status(201).json({ ...created, namaPenulis: req.member!.nama });
  } catch (err) {
    req.log.error({ err }, "Error creating forum reply");
    res.status(500).json({ error: "Gagal mengirim balasan" });
  }
});

export default router;
