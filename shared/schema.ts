import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Hospital schema
export const hospitals = pgTable("hospitals", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  type: text("type").notNull(), // multi_specialty, government, private
  emergency_level: text("emergency_level").notNull(), // level_1_trauma, level_2, basic
  capacity: text("capacity").notNull(), // very_high, high, medium, low
  specialties: jsonb("specialties").$type<string[]>().default([]),
  cost: text("cost"), // free, moderate, expensive
  phone: text("phone"),
  available: boolean("available").default(true),
  last_updated: timestamp("last_updated").default(sql`now()`),
});

// Emergency calls schema
export const emergencyCalls = pgTable("emergency_calls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  emergency_type: text("emergency_type").notNull(), // medical, trauma
  priority: text("priority").notNull(), // critical, high, medium
  status: text("status").notNull().default('active'), // active, dispatched, completed, cancelled
  selected_hospital_id: varchar("selected_hospital_id").references(() => hospitals.id),
  estimated_time: integer("estimated_time"), // in minutes
  distance: real("distance"), // in kilometers
  created_at: timestamp("created_at").default(sql`now()`),
  updated_at: timestamp("updated_at").default(sql`now()`),
});

// Ambulance tracking schema
export const ambulances = pgTable("ambulances", {
  id: varchar("id").primaryKey(),
  status: text("status").notNull(), // available, en_route, maintenance
  current_latitude: real("current_latitude"),
  current_longitude: real("current_longitude"),
  emergency_call_id: varchar("emergency_call_id").references(() => emergencyCalls.id),
  last_updated: timestamp("last_updated").default(sql`now()`),
});

// Insert schemas
export const insertHospitalSchema = createInsertSchema(hospitals);
export const insertEmergencyCallSchema = createInsertSchema(emergencyCalls).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const insertAmbulanceSchema = createInsertSchema(ambulances);

// Types
export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type EmergencyCall = typeof emergencyCalls.$inferSelect;
export type InsertEmergencyCall = z.infer<typeof insertEmergencyCallSchema>;
export type Ambulance = typeof ambulances.$inferSelect;
export type InsertAmbulance = z.infer<typeof insertAmbulanceSchema>;

// Hospital ranking result type
export type HospitalWithRoute = Hospital & {
  estimated_time: number;
  distance: number;
  route_coordinates?: [number, number][];
  traffic_factor: number;
};
