import { pgTable, text, integer, timestamp, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const suaraMuscabTable = pgTable("suara_muscab", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  posisi: text("posisi", { enum: ["ketua", "sekjend"] }).notNull(),
  calonIndex: integer("calon_index").notNull(),
  jumlahSuara: integer("jumlah_suara").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (t) => [
  unique("suara_muscab_posisi_calon_idx").on(t.posisi, t.calonIndex),
  check("calon_index_range", sql`${t.calonIndex} >= 0 AND ${t.calonIndex} <= 1`),
]);
