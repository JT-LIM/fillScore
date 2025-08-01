import { Check, X, RotateCcw, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ResultsPanelProps {
  results: {
    results: Array<{
      blankId: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      feedback?: string;
    }>;
    score: {
      correct: number;
      incorrect: number;
      total: number;
      percentage: number;
    };
  };
  onRetry: () => void;
  onNewExercise: () => void;
}

export default function ResultsPanel({ results, onRetry, onNewExercise }: ResultsPanelProps) {
  const { results: detailedResults, score } = results;
  const wrongAnswers = detailedResults.filter(result => !result.isCorrect && result.feedback);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">채점 결과</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">정답</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">오답</span>
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{score.correct}</div>
            <div className="text-sm text-gray-600">정답</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{score.incorrect}</div>
            <div className="text-sm text-gray-600">오답</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{score.percentage}%</div>
            <div className="text-sm text-gray-600">정답률</div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">상세 결과</h3>
          {detailedResults.map((result, index) => (
            <div key={result.blankId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  result.isCorrect ? "bg-green-500" : "bg-red-500"
                }`}>
                  {result.isCorrect ? (
                    <Check className="text-white text-xs" />
                  ) : (
                    <X className="text-white text-xs" />
                  )}
                </div>
                <span className="font-medium text-gray-900">빈칸 {index + 1}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  입력: <span className="font-medium">{result.userAnswer || "(미입력)"}</span>
                </span>
                <span className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                  정답: <span className="font-medium">{result.correctAnswer}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Wrong Answers Review */}
        {wrongAnswers.length > 0 && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-lg font-medium text-yellow-800 mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              오답 노트
            </h4>
            <div className="space-y-2 text-sm">
              {wrongAnswers.map((result) => (
                <div key={result.blankId} className="flex justify-between">
                  <span className="text-gray-700">
                    {result.userAnswer} → {result.correctAnswer}
                  </span>
                  <span className="text-yellow-700">{result.feedback}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 도전</span>
          </Button>
          <Button
            onClick={onNewExercise}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>새 문제</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
