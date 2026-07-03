import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pesertaMuscabTable = pgTable("peserta_muscab", {
  id: uuid("id").primaryKey().defaultRandom(),
  nama: text("nama").notNull(),
  nia: text("nia").notNull(),
  alamat: text("alamat").notNull(),
  hp: text("hp").notNull(),
  email: text("email").notNull(),
  statusNia: text("status_nia", {
    enum: ["pending", "aktif", "tidak_aktif"],
  })
    .notNull()
    .default("pending"),
  statusBayar: text("status_bayar", {
    enum: ["menunggu", "terverifikasi", "ditolak"],
  })
    .notNull()
    .default("menunggu"),
  hadir: boolean("hadir").notNull().default(false),
  selfiePath: text("selfie_path"),
  buktiPath: text("bukti_path"),
  fotoKtaPath: text("foto_kta_path"),
  catatanAdmin: text("catatan_admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const insertPesertaSchema = createInsertSchema(pesertaMuscabTable, {
  nama: z.string().min(1),
  nia: z.string().min(1),
  alamat: z.string().min(1),
  hp: z.string().min(1),
  email: z.email(),
}).omit({
  id: true,
  statusNia: true,
  statusBayar: true,
  hadir: true,
  catatanAdmin: true,
  createdAt: true,
  updatedAt: true,
});

export const selectPesertaSchema = createSelectSchema(pesertaMuscabTable);
