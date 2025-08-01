import { useState } from "react";
import { Languages, Settings, UserCircle } from "lucide-react";
import TextInput from "@/components/text-input";
import ExerciseArea from "@/components/exercise-area";
import ResultsPanel from "@/components/results-panel";
import { type Exercise, type GradingMode } from "@shared/schema";

export default function Home() {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [gradingMode, setGradingMode] = useState<GradingMode>("instant");
  const [showResults, setShowResults] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<any>(null);

  const handleExerciseCreated = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setShowResults(false);
    setExerciseResults(null);
  };

  const handleResultsReady = (results: any) => {
    setExerciseResults(results);
    setShowResults(true);
  };

  const handleNewExercise = () => {
    setCurrentExercise(null);
    setShowResults(false);
    setExerciseResults(null);
  };

  const handleRetryExercise = () => {
    setShowResults(false);
    setExerciseResults(null);
    // Reset answers in the exercise
    if (currentExercise) {
      setCurrentExercise({
        ...currentExercise,
        answers: {},
        results: []
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-korean">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Languages className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">한국어 빈칸 학습</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <UserCircle className="w-4 h-4" />
                <span>학습자</span>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <TextInput onExerciseCreated={handleExerciseCreated} />
        
        {currentExercise && !showResults && (
          <ExerciseArea 
            exercise={currentExercise}
            gradingMode={gradingMode}
            onGradingModeChange={setGradingMode}
            onResultsReady={handleResultsReady}
            onRetry={handleRetryExercise}
          />
        )}

        {showResults && exerciseResults && (
          <ResultsPanel 
            results={exerciseResults}
            onRetry={handleRetryExercise}
            onNewExercise={handleNewExercise}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">사용법</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 한국어 지문을 입력하세요</li>
                <li>• 난이도를 선택하세요</li>
                <li>• 빈칸을 채우며 학습하세요</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">난이도 안내</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-beginner rounded-full mr-2"></div>
                  초급: 기본 단어 20%
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-intermediate rounded-full mr-2"></div>
                  중급: 핵심 단어 50%
                </li>
                <li className="flex items-center">
                  <div className="w-3 h-3 bg-advanced rounded-full mr-2"></div>
                  고급: 대부분 단어 95%
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">학습 팁</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 바로 채점으로 즉시 피드백</li>
                <li>• 오답 노트로 약점 파악</li>
                <li>• 반복 학습으로 실력 향상</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
            © 2024 한국어 빈칸 학습 사이트. 모든 권리 보유.
          </div>
        </div>
      </footer>
    </div>
  );
}
