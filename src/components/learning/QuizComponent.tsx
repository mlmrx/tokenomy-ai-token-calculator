import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";

interface QuizComponentProps {
  module: any;
  onComplete: () => void;
  isCompleted: boolean;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ 
  module, 
  onComplete, 
  isCompleted 
}) => {
  const questions = module.content?.questions || [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizComplete(true);
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setQuizComplete(false);
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index]?.correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Quiz content is being prepared...</p>
      </Card>
    );
  }

  if (quizComplete) {
    const score = calculateScore();
    const passed = score >= 70;

    return (
      <Card className={`p-8 text-center ${passed ? 'bg-green-50 dark:bg-green-950/20' : 'bg-orange-50 dark:bg-orange-950/20'}`}>
        <div className="space-y-6">
          <div className="flex justify-center">
            {passed ? (
              <Trophy className="h-20 w-20 text-green-500" />
            ) : (
              <RotateCcw className="h-20 w-20 text-orange-500" />
            )}
          </div>
          
          <div>
            <h3 className="text-3xl font-bold mb-2">Your Score: {score}%</h3>
            <p className="text-lg text-muted-foreground">
              {passed 
                ? '🎉 Congratulations! You passed the quiz.' 
                : 'You need 70% to pass. Try again!'}
            </p>
          </div>

          <div className="flex flex-col gap-3 max-w-md mx-auto">
            {passed && !isCompleted && (
              <Button size="lg" onClick={onComplete} className="w-full">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Complete Module
              </Button>
            )}
            {isCompleted && (
              <Badge className="bg-green-500 text-white py-3 text-base">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Module Completed
              </Badge>
            )}
            <Button variant="outline" size="lg" onClick={handleReset} className="w-full">
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isCorrect = showResult && selectedAnswer === question.correct;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <h3 className="text-xl font-semibold mb-6">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option: string, index: number) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === question.correct;
            
            let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
            
            if (showResult) {
              if (isCorrectAnswer) {
                buttonClass += "border-green-500 bg-green-50 dark:bg-green-950/20";
              } else if (isSelected && !isCorrect) {
                buttonClass += "border-red-500 bg-red-50 dark:bg-red-950/20";
              } else {
                buttonClass += "border-muted opacity-50";
              }
            } else {
              buttonClass += isSelected 
                ? "border-primary bg-primary/10" 
                : "border-muted hover:border-primary/50 hover:bg-muted";
            }

            return (
              <button
                key={index}
                onClick={() => !showResult && handleAnswerSelect(index)}
                disabled={showResult}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showResult && isCorrectAnswer && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-950/30' : 'bg-red-100 dark:bg-red-950/30'}`}>
            <p className={`font-medium ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {!isCorrect && question.explanation && (
              <p className="text-sm mt-2 text-muted-foreground">
                {question.explanation}
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext}
          disabled={!showResult}
          size="lg"
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </div>
    </div>
  );
};

export default QuizComponent;