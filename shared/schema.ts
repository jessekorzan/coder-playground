import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Preview session schema
export const previewSessions = pgTable("preview_sessions", {
  id: text("id").primaryKey(),
  htmlCode: text("html_code").notNull().default(""),
  cssCode: text("css_code").notNull().default(""),
  jsCode: text("js_code").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertPreviewSessionSchema = createInsertSchema(previewSessions).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertPreviewSession = z.infer<typeof insertPreviewSessionSchema>;
export type PreviewSession = typeof previewSessions.$inferSelect;
