import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { membersTable } from "./members";

export const forumTopicsTable = pgTable("forum_topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => membersTable.id, { onDelete: "cascade" }),
  judul: text("judul").notNull(),
  isi: text("isi").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const forumRepliesTable = pgTable("forum_replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => forumTopicsTable.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => membersTable.id, { onDelete: "cascade" }),
  isi: text("isi").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
