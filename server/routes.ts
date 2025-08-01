import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExerciseSchema, type Difficulty, type BlankItem, type ExerciseResult } from "@shared/schema";
import { z } from "zod";

// Simple Korean morphological analysis
function analyzeKoreanText(text: string, difficulty: Difficulty): BlankItem[] {
  // Korean particles (조사) that should not be made into blanks
  const particles = ['은', '는', '이', '가', '을', '를', '에', '에서', '으로', '로', '와', '과', '의', '도', '만', '까지', '부터', '에게', '한테'];
  
  // Split text by lines first to handle line breaks properly
  const lines = text.split('\n');
  const blanks: BlankItem[] = [];
  let currentPosition = 0;
  let globalWordIndex = 0;
  
  // Determine blank percentage based on difficulty
  const blankPercentages = {
    beginner: 0.2,
    intermediate: 0.5,
    advanced: 0.95
  };
  
  // Count total words across all lines
  const totalWords = lines.reduce((count, line) => {
    return count + line.split(/\s+/).filter(word => word.trim().length > 0).length;
  }, 0);
  
  const targetBlankCount = Math.floor(totalWords * blankPercentages[difficulty]);
  let blankCount = 0;
  
  lines.forEach((line, lineIndex) => {
    if (line.trim() === '') {
      // Empty line - just account for the newline character
      currentPosition += 1;
      return;
    }
    
    const words = line.split(/\s+/).filter(word => word.trim().length > 0);
    
    words.forEach((word, wordIndex) => {
      const position = currentPosition;
      
      // Skip particles and very short words
      const isParticle = particles.some(particle => word.endsWith(particle));
      const isShortWord = word.length < 2;
      
      if (!isParticle && !isShortWord && blankCount < targetBlankCount) {
        // For advanced level, make almost all non-particle words into blanks
        // For lower levels, use some randomization
        const shouldMakeBlank = difficulty === 'advanced' || 
          (difficulty === 'intermediate' && Math.random() < 0.6) ||
          (difficulty === 'beginner' && Math.random() < 0.3);
        
        if (shouldMakeBlank) {
          blanks.push({
            id: `blank_${globalWordIndex}`,
            position,
            word,
            length: word.length
          });
          blankCount++;
        }
      }
      
      currentPosition += word.length + 1; // +1 for space
      globalWordIndex++;
    });
    
    // Don't add extra position for the last line
    if (lineIndex < lines.length - 1) {
      currentPosition -= 1; // Remove the last space and account for newline instead
    }
  });
  
  return blanks;
}

function gradeExercise(blanks: BlankItem[], answers: { [key: string]: string }): ExerciseResult[] {
  return blanks.map(blank => {
    const userAnswer = answers[blank.id]?.trim() || '';
    const correctAnswer = blank.word;
    const isCorrect = userAnswer === correctAnswer;
    
    let feedback = '';
    if (!isCorrect && userAnswer) {
      if (userAnswer.length !== correctAnswer.length) {
        feedback = '단어 길이를 확인해보세요';
      } else if (userAnswer.includes(correctAnswer.slice(0, -1))) {
        feedback = '조사 구분 주의';
      } else {
        feedback = '다시 한번 확인해보세요';
      }
    }
    
    return {
      blankId: blank.id,
      userAnswer,
      correctAnswer,
      isCorrect,
      feedback: isCorrect ? undefined : feedback
    };
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create exercise with blanks
  app.post("/api/exercises", async (req, res) => {
    try {
      const { originalText, difficulty } = insertExerciseSchema.parse(req.body);
      
      const exercise = await storage.createExercise({ originalText, difficulty });
      
      // Generate blanks based on difficulty
      const blanks = analyzeKoreanText(originalText, difficulty as Difficulty);
      exercise.blanks = blanks;
      
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise data" });
    }
  });

  // Get exercise
  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.getExercise(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to get exercise" });
    }
  });

  // Submit answer for single blank (instant grading)
  app.post("/api/exercises/:id/answer", async (req, res) => {
    try {
      const { blankId, answer } = z.object({
        blankId: z.string(),
        answer: z.string()
      }).parse(req.body);

      const exercise = await storage.getExercise(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      const updatedAnswers = { ...exercise.answers, [blankId]: answer };
      await storage.updateExerciseAnswers(req.params.id, updatedAnswers);

      // Grade this specific blank
      const blank = exercise.blanks.find(b => b.id === blankId);
      if (blank) {
        const result = gradeExercise([blank], updatedAnswers)[0];
        res.json(result);
      } else {
        res.status(400).json({ message: "Blank not found" });
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid answer data" });
    }
  });

  // Submit all answers (batch grading)
  app.post("/api/exercises/:id/grade", async (req, res) => {
    try {
      const { answers } = z.object({
        answers: z.record(z.string())
      }).parse(req.body);

      const exercise = await storage.getExercise(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      await storage.updateExerciseAnswers(req.params.id, answers);
      
      // Grade all blanks
      const results = gradeExercise(exercise.blanks, answers);
      await storage.updateExerciseResults(req.params.id, results);

      const correctCount = results.filter(r => r.isCorrect).length;
      const totalCount = results.length;
      const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

      res.json({
        results,
        score: {
          correct: correctCount,
          incorrect: totalCount - correctCount,
          total: totalCount,
          percentage
        }
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid grading data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
