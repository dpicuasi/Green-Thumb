import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";
export * from "./models/chat";

// === TABLE DEFINITIONS ===

export const plants = pgTable("plants", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id), // Link to Replit Auth user
  name: text("name").notNull(),
  species: text("species"),
  location: text("location").notNull(), // 'indoor' | 'outdoor'
  photoUrl: text("photo_url"),
  healthStatus: text("health_status").default("healthy"), // 'healthy', 'needs_attention', 'sick'
  wateringFrequency: integer("watering_frequency"), // in days
  lastWatered: timestamp("last_watered"),
  nextWatering: timestamp("next_watering"),
  notes: text("notes"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const careLogs = pgTable("care_logs", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull().references(() => plants.id),
  type: text("type").notNull(), // 'water', 'fertilize', 'prune', 'repot', 'pest_control', 'other'
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  photoUrl: text("photo_url"),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  plantId: integer("plant_id").notNull().references(() => plants.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'water', 'fertilize', etc.
  dueDate: timestamp("due_date").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  tier: text("tier").default("free"), // 'free', 'premium'
  isActive: boolean("is_active").default(false),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
});

// === SCHEMAS ===

export const insertPlantSchema = createInsertSchema(plants).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  lastWatered: true, 
  nextWatering: true 
});

export const insertCareLogSchema = createInsertSchema(careLogs).omit({ 
  id: true,
  date: true 
});

export const insertReminderSchema = createInsertSchema(reminders).omit({ 
  id: true, 
  userId: true,
  createdAt: true,
  isCompleted: true
});

// === TYPES ===

export type Plant = typeof plants.$inferSelect;
export type InsertPlant = z.infer<typeof insertPlantSchema>;

export type CareLog = typeof careLogs.$inferSelect;
export type InsertCareLog = z.infer<typeof insertCareLogSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export type Subscription = typeof subscriptions.$inferSelect;

// Request/Response Types
export type CreatePlantRequest = InsertPlant;
export type UpdatePlantRequest = Partial<InsertPlant> & {
  lastWatered?: string; // ISO date string from frontend
};

export type CreateCareLogRequest = InsertCareLog & {
  date?: string; // ISO date string
};

// Enums for frontend usage
export const PLANT_LOCATIONS = ['indoor', 'outdoor'] as const;
export const HEALTH_STATUSES = ['healthy', 'needs_attention', 'sick'] as const;
export const CARE_TYPES = ['water', 'fertilize', 'prune', 'repot', 'pest_control', 'other'] as const;
