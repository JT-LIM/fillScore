import { useState } from "react";
import {
  Languages,
  Settings,
  UserCircle,
  BookOpen,
  Users,
  Brain,
  FileText,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ExerciseArea from "@/components/exercise-area";
import ResultsPanel from "@/components/results-panel";
import { type Exercise, type GradingMode, type Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

type ContentData = Record<Category, {
  title: string;
  content: string;
}>;

export default function Home() {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [gradingMode, setGradingMode] = useState<GradingMode>("instant");
  const [showResults, setShowResults] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [customText, setCustomText] = useState("");
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);

  // Fetch predefined content
  const { data: contentData } = useQuery({
    queryKey: ["/api/content"],
  });

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
    setSelectedCategory(null);
    setCustomText("");
  };

  const handleRetryExercise = () => {
    setShowResults(false);
    setExerciseResults(null);
    if (currentExercise) {
      setCurrentExercise({
        ...currentExercise,
        answers: {},
        results: [],
      });
    }
  };

  const createExercise = async (text: string, category: Category) => {
    setIsCreatingExercise(true);
    try {
      const response = await apiRequest("POST", "/api/exercises", {
        originalText: text,
        category: category,
      });

      const exercise = (await response.json()) as Exercise;
      handleExerciseCreated(exercise);
    } catch (error) {
      console.error("Failed to create exercise:", error);
    } finally {
      setIsCreatingExercise(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    if (!contentData) return;
    setSelectedCategory(category);
    
    // Check if the category exists in contentData
    const categoryContent = contentData[category];
    if (!categoryContent) {
      console.error(`Category ${category} not found in contentData`);
      return;
    }
    
    createExercise(categoryContent.content, category);
  };

  const handleCustomTextSubmit = () => {
    if (!customText.trim() || !selectedCategory) return;
    createExercise(customText, selectedCategory);
  };

  const categories = [
    {
      id: "middle_school_info" as Category,
      title: "중학교정보",
      description: "성취기준",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      id: "high_school_info" as Category,
      title: "고등학교정보",
      description: "성취기준",
      icon: Users,
      color: "bg-green-500",
    },
    {
      id: "ai_basics" as Category,
      title: "인공지능기초",
      description: "성취기준",
      icon: Brain,
      color: "bg-purple-500",
    },
    {
      id: "middle_school_curriculum" as Category,
      title: "중학교정보",
      description: "내용체계",
      icon: BookOpen,
      color: "bg-blue-400",
    },
    {
      id: "high_school_curriculum" as Category,
      title: "고등학교정보",
      description: "내용체계",
      icon: Users,
      color: "bg-green-400",
    },
    {
      id: "ai_basics_curriculum" as Category,
      title: "인공지능기초",
      description: "내용체계",
      icon: Brain,
      color: "bg-purple-400",
    },
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">
                교육과정 빈칸 인출
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <UserCircle className="w-4 h-4" />
                <span>학습자</span>
              </div> */}
              {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button> */}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!currentExercise && (
          <div className="space-y-8">
            {/* Category Selection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                학습 카테고리 선택
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}
                          >
                            <Icon className="text-white text-xl" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {category.title}
                            </CardTitle>
                            <CardDescription>
                              {category.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => handleCategorySelect(category.id)}
                          disabled={isCreatingExercise}
                          className="w-full"
                        >
                          {isCreatingExercise ? "문제 생성 중..." : "학습 시작"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Custom Text Input */}
            {/* <section>
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <FileText className="text-white text-xl" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">직접 입력</CardTitle>
                      <CardDescription>
                        자신만의 텍스트로 연습하기
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="custom-text">텍스트 입력</Label>
                    <Textarea
                      id="custom-text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="학습하고 싶은 텍스트를 입력하세요..."
                      className="min-h-32 mt-2"
                    />
                  </div>

                  <div>
                    <Label>카테고리 선택</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={
                            selectedCategory === category.id
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.title}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleCustomTextSubmit}
                    disabled={
                      !customText.trim() ||
                      !selectedCategory ||
                      isCreatingExercise
                    }
                    className="w-full"
                  >
                    {isCreatingExercise ? "문제 생성 중..." : "연습 시작"}
                  </Button>
                </CardContent>
              </Card>
            </section> */}
          </div>
        )}

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
    </div>
  );
}
