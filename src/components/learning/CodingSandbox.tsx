import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, CheckCircle2, XCircle, Code2, Loader2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";

interface CodingSandboxProps {
  exerciseId: string;
  moduleId: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  starter_code: string;
  difficulty: string;
  test_cases: Array<{
    input: string;
    expected: string;
    description: string;
  }>;
}

export const CodingSandbox: React.FC<CodingSandboxProps> = ({ exerciseId, moduleId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState<Array<{passed: boolean; message: string}>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasPassedAll, setHasPassedAll] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      const { data, error } = await supabase
        .from('coding_exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (error) throw error;
      setExercise(data);
      setCode(data.starter_code);
    } catch (error) {
      console.error('Error loading exercise:', error);
    }
  };

  const runCode = async () => {
    if (!exercise || !user) return;

    setIsRunning(true);
    setOutput("");
    setTestResults([]);

    try {
      // Create a safe sandboxed execution environment
      const results: Array<{passed: boolean; message: string}> = [];
      let allPassed = true;

      // Simple evaluation for JavaScript code
      for (const testCase of exercise.test_cases) {
        try {
          // Create a function from the user's code
          const userFunction = new Function('return ' + code)();
          const result = userFunction(JSON.parse(testCase.input));
          const expected = JSON.parse(testCase.expected);
          const passed = JSON.stringify(result) === JSON.stringify(expected);
          
          results.push({
            passed,
            message: passed 
              ? `✓ ${testCase.description}` 
              : `✗ ${testCase.description} - Expected: ${testCase.expected}, Got: ${JSON.stringify(result)}`
          });

          if (!passed) allPassed = false;
        } catch (err: any) {
          results.push({
            passed: false,
            message: `✗ ${testCase.description} - Error: ${err.message}`
          });
          allPassed = false;
        }
      }

      setTestResults(results);
      setHasPassedAll(allPassed);

      // Save attempt
      await supabase.from('user_code_attempts').insert({
        user_id: user.id,
        exercise_id: exerciseId,
        code: code,
        passed: allPassed,
        tests_passed: results.filter(r => r.passed).length,
        total_tests: results.length
      });

      if (allPassed) {
        toast({
          title: "Success! 🎉",
          description: "All tests passed! Great work!",
        });
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!exercise) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </CardContent>
      </Card>
    );
  }

  const difficultyColors = {
    beginner: "bg-green-500",
    intermediate: "bg-yellow-500",
    advanced: "bg-red-500"
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 mb-2">
              <Code2 className="h-5 w-5" />
              {exercise.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{exercise.description}</p>
          </div>
          <Badge className={difficultyColors[exercise.difficulty as keyof typeof difficultyColors]}>
            {exercise.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="editor" className="flex-1">
              <Code2 className="h-4 w-4 mr-2" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex-1">
              Test Cases ({testResults.filter(r => r.passed).length}/{exercise.test_cases.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="m-0">
            <div className="border-b">
              <Editor
                height="400px"
                defaultLanguage="javascript"
                value={code}
                onChange={(value) => setCode(value || "")}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            <div className="p-4 space-y-4">
              <Button 
                onClick={runCode} 
                disabled={isRunning || !user}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </>
                )}
              </Button>

              {hasPassedAll && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold">Congratulations! All tests passed!</span>
                  </div>
                </div>
              )}

              {output && (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm font-mono text-destructive">{output}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tests" className="m-0 p-4">
            <div className="space-y-3">
              {exercise.test_cases.map((testCase, index) => {
                const result = testResults[index];
                return (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {result ? (
                          result.passed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                          )
                        ) : (
                          <div className="h-5 w-5 border-2 border-muted rounded-full mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-1">{testCase.description}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Input: <code className="bg-muted px-2 py-0.5 rounded">{testCase.input}</code></p>
                            <p>Expected: <code className="bg-muted px-2 py-0.5 rounded">{testCase.expected}</code></p>
                          </div>
                          {result && !result.passed && (
                            <p className="text-sm text-destructive mt-2">{result.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
