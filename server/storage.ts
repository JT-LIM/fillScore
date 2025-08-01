import { type Exercise, type InsertExercise, type BlankItem, type ExerciseResult } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercise(id: string): Promise<Exercise | undefined>;
  updateExerciseBlanks(id: string, blanks: BlankItem[]): Promise<Exercise | undefined>;
  updateExerciseAnswers(id: string, answers: { [key: string]: string }): Promise<Exercise | undefined>;
  updateExerciseResults(id: string, results: ExerciseResult[]): Promise<Exercise | undefined>;
}

export class MemStorage implements IStorage {
  private exercises: Map<string, Exercise>;

  constructor() {
    this.exercises = new Map();
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = {
      ...insertExercise,
      id,
      difficulty: 'advanced', // Always advanced difficulty now
      blanks: [],
      answers: {},
      results: [],
      createdAt: new Date(),
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async updateExerciseBlanks(id: string, blanks: BlankItem[]): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (!exercise) return undefined;

    const updatedExercise = { ...exercise, blanks };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }

  async updateExerciseAnswers(id: string, answers: { [key: string]: string }): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (!exercise) return undefined;

    const updatedExercise = { ...exercise, answers };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }

  async updateExerciseResults(id: string, results: ExerciseResult[]): Promise<Exercise | undefined> {
    const exercise = this.exercises.get(id);
    if (!exercise) return undefined;

    const updatedExercise = { ...exercise, results };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }
}

export const storage = new MemStorage();
