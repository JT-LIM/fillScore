import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Exercise, type GradingMode, type ExerciseResult } from "@shared/schema";

interface ExerciseAreaProps {
  exercise: Exercise;
  gradingMode: GradingMode;
  onGradingModeChange: (mode: GradingMode) => void;
  onResultsReady: (results: any) => void;
  onRetry: () => void;
}

export default function ExerciseArea({ 
  exercise, 
  gradingMode, 
  onGradingModeChange, 
  onResultsReady,
  onRetry 
}: ExerciseAreaProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [instantResults, setInstantResults] = useState<{ [key: string]: ExerciseResult }>({});
  const { toast } = useToast();

  const getDifficultyColor = () => {
    switch (exercise.difficulty) {
      case "beginner": return "beginner";
      case "intermediate": return "intermediate";
      case "advanced": return "advanced";
      default: return "primary";
    }
  };

  const getDifficultyLabel = () => {
    switch (exercise.difficulty) {
      case "beginner": return "초급";
      case "intermediate": return "중급";
      case "advanced": return "고급";
      default: return "";
    }
  };

  // Calculate progress
  const answeredCount = Object.keys(answers).filter(key => answers[key]?.trim()).length;
  const totalBlanks = exercise.blanks.length;
  const progress = totalBlanks > 0 ? (answeredCount / totalBlanks) * 100 : 0;

  // Instant grading mutation
  const instantGradeMutation = useMutation({
    mutationFn: async ({ blankId, answer }: { blankId: string; answer: string }) => {
      const response = await apiRequest("POST", `/api/exercises/${exercise.id}/answer`, { blankId, answer });
      return response.json();
    },
    onSuccess: (result: ExerciseResult) => {
      setInstantResults(prev => ({ ...prev, [result.blankId]: result }));
    },
  });

  // Batch grading mutation
  const batchGradeMutation = useMutation({
    mutationFn: async (allAnswers: { [key: string]: string }) => {
      const response = await apiRequest("POST", `/api/exercises/${exercise.id}/grade`, { answers: allAnswers });
      return response.json();
    },
    onSuccess: (results) => {
      onResultsReady(results);
    },
    onError: () => {
      toast({
        title: "채점 오류",
        description: "채점 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleAnswerChange = (blankId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const handleAnswerBlur = (blankId: string, value: string) => {
    if (gradingMode === "instant" && value.trim()) {
      instantGradeMutation.mutate({ blankId, answer: value.trim() });
    }
  };

  const handleBatchGrade = () => {
    batchGradeMutation.mutate(answers);
  };

  const handleReset = () => {
    setAnswers({});
    setInstantResults({});
    onRetry();
  };

  // Generate text with blanks
  const generateTextWithBlanks = () => {
    // Split text by lines first to preserve line breaks
    const lines = exercise.originalText.split('\n');
    const elements: JSX.Element[] = [];
    let currentPosition = 0;
    let globalWordIndex = 0;

    lines.forEach((line, lineIndex) => {
      if (line.trim() === '') {
        // Empty line - add a line break
        elements.push(<br key={`br-${lineIndex}`} />);
        currentPosition += 1; // Account for the newline character
        return;
      }

      const words = line.split(/\s+/).filter(word => word.length > 0);
      
      words.forEach((word, wordIndex) => {
        const blank = exercise.blanks.find(b => b.position === currentPosition);
        
        if (blank) {
          const result = instantResults[blank.id];
          const hasResult = gradingMode === "instant" && result;
          const isCorrect = hasResult && result.isCorrect;
          const isIncorrect = hasResult && !result.isCorrect;

          elements.push(
            <input
              key={blank.id}
              type="text"
              value={answers[blank.id] || ""}
              onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
              onBlur={(e) => handleAnswerBlur(blank.id, e.target.value)}
              className={`inline-block px-2 py-1 text-center border-b-2 bg-transparent focus:outline-none transition-colors ${
                isCorrect ? "border-green-500 text-green-700" :
                isIncorrect ? "border-red-500 text-red-700" :
                `border-gray-300 focus:border-${getDifficultyColor()}`
              }`}
              style={{ width: `${Math.max(blank.length * 0.8, 3)}rem` }}
            />
          );
        } else {
          elements.push(
            <span key={`word-${globalWordIndex}`} className="text-lg">
              {word}
            </span>
          );
        }
        
        // Add space after word (except for last word in line)
        if (wordIndex < words.length - 1) {
          elements.push(<span key={`space-${globalWordIndex}`}> </span>);
        }
        
        currentPosition += word.length + 1; // +1 for space
        globalWordIndex++;
      });

      // Add line break after each line (except the last one)
      if (lineIndex < lines.length - 1) {
        elements.push(<br key={`line-br-${lineIndex}`} />);
      }
    });

    return elements;
  };

  // Show instant feedback
  const instantFeedback = Object.values(instantResults).filter(result => result.feedback);

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">빈칸 채우기</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 bg-${getDifficultyColor()} rounded-full`}></div>
              <span className="text-sm text-gray-600">{getDifficultyLabel()}</span>
            </div>
          </div>
          
          {/* Grading Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <Button
              variant={gradingMode === "instant" ? "default" : "ghost"}
              size="sm"
              onClick={() => onGradingModeChange("instant")}
              className="text-sm"
            >
              바로 채점
            </Button>
            <Button
              variant={gradingMode === "batch" ? "default" : "ghost"}
              size="sm"
              onClick={() => onGradingModeChange("batch")}
              className="text-sm"
            >
              한번에 채점
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">진행률</span>
            <span className="text-sm font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className={`h-2 bg-${getDifficultyColor()}`} />
        </div>

        {/* Exercise Content */}
        <div className="p-4 bg-gray-50 rounded-lg mb-6">
          <div className="text-lg leading-relaxed space-x-1">
            {generateTextWithBlanks()}
          </div>
          
          {/* Instant Feedback */}
          {gradingMode === "instant" && instantFeedback.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {instantFeedback.map((result) => (
                <div key={result.blankId} className="flex items-center space-x-1 text-sm">
                  <span className={result.isCorrect ? "text-green-700" : "text-red-700"}>
                    {result.userAnswer} → {result.feedback}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 풀기</span>
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Lightbulb className="w-4 h-4" />
              <span>힌트 보기</span>
            </Button>
            {gradingMode === "batch" && (
              <Button
                onClick={handleBatchGrade}
                disabled={batchGradeMutation.isPending || answeredCount === 0}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{batchGradeMutation.isPending ? "채점 중..." : "전체 채점"}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
