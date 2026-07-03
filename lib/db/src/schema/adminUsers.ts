import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const adminUsersTable = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", {
    enum: ["full_access", "registrasi", "keuangan", "spectator"],
  })
    .notNull()
    .default("spectator"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
