import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalText: text("original_text").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // middle_school_info, high_school_info, ai_basics
  difficulty: varchar("difficulty", { length: 20 }).notNull().default('advanced'), // only advanced now
  blanks: json("blanks").$type<BlankItem[]>().notNull(),
  answers: json("answers").$type<{ [key: string]: string }>().default({}),
  results: json("results").$type<ExerciseResult[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  originalText: true,
  category: true,
});

export type BlankItem = {
  id: string;
  position: number;
  word: string;
  length: number;
};

export type ExerciseResult = {
  blankId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  feedback?: string;
};

export type GradingMode = 'instant' | 'batch';

export type Difficulty = 'advanced'; // Only advanced difficulty

export type Category = 'middle_school_info' | 'high_school_info' | 'ai_basics' | 'middle_school_curriculum' | 'high_school_curriculum' | 'ai_basics_curriculum';

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;
