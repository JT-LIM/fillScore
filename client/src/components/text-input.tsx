import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Exercise, type Difficulty } from "@shared/schema";

interface TextInputProps {
  onExerciseCreated: (exercise: Exercise) => void;
}

export default function TextInput({ onExerciseCreated }: TextInputProps) {
  const [inputText, setInputText] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("beginner");
  const { toast } = useToast();

  const createExerciseMutation = useMutation({
    mutationFn: async ({ originalText, difficulty }: { originalText: string; difficulty: Difficulty }) => {
      const response = await apiRequest("POST", "/api/exercises", { originalText, difficulty });
      return response.json();
    },
    onSuccess: (exercise: Exercise) => {
      onExerciseCreated(exercise);
      toast({
        title: "빈칸 생성 완료",
        description: `${exercise.blanks.length}개의 빈칸이 생성되었습니다.`,
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "빈칸 생성 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateBlanks = () => {
    if (!inputText.trim()) {
      toast({
        title: "입력 오류",
        description: "지문을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createExerciseMutation.mutate({
      originalText: inputText.trim(),
      difficulty: selectedDifficulty,
    });
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "beginner": return "text-beginner";
      case "intermediate": return "text-intermediate";
      case "advanced": return "text-advanced";
      default: return "text-gray-600";
    }
  };

  const getDifficultyText = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "beginner": return "초급 (20% 빈칸)";
      case "intermediate": return "중급 (50% 빈칸)";
      case "advanced": return "고급 (95% 빈칸)";
      default: return "";
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">지문 입력</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">난이도:</span>
            <Select value={selectedDifficulty} onValueChange={(value: Difficulty) => setSelectedDifficulty(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner" className={getDifficultyColor("beginner")}>
                  {getDifficultyText("beginner")}
                </SelectItem>
                <SelectItem value="intermediate" className={getDifficultyColor("intermediate")}>
                  {getDifficultyText("intermediate")}
                </SelectItem>
                <SelectItem value="advanced" className={getDifficultyColor("advanced")}>
                  {getDifficultyText("advanced")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="한국어 지문을 입력하세요. 조사를 제외한 단어 위주로 빈칸이 생성됩니다."
          className="h-40 resize-none"
        />
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {inputText.length}자 입력됨
          </div>
          <Button 
            onClick={handleGenerateBlanks}
            disabled={createExerciseMutation.isPending || !inputText.trim()}
            className="flex items-center space-x-2"
          >
            <Wand2 className="w-4 h-4" />
            <span>{createExerciseMutation.isPending ? "생성 중..." : "빈칸 생성"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
