import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Maximize2, TrendingDown, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const ContextWindowOptimizer: React.FC = () => {
  const [contextText, setContextText] = useState(
    "You are a helpful AI assistant for Acme Corp. Our company values excellent customer service and quick responses.\n\n" +
    "Customer support guidelines:\n" +
    "1. Always greet customers warmly\n" +
    "2. Listen to their concerns carefully\n" +
    "3. Provide clear, actionable solutions\n" +
    "4. Follow up to ensure satisfaction\n\n" +
    "Our products include: Widget A ($99), Widget B ($199), Widget C ($299)\n" +
    "Warranty: 1 year standard, 3 years extended ($49)\n" +
    "Return policy: 30 days, no questions asked\n\n" +
    "Common FAQs:\n" +
    "Q: How do I reset my widget?\n" +
    "A: Hold the power button for 10 seconds...\n\n" +
    "Q: What's the warranty coverage?\n" +
    "A: Our standard warranty covers..."
  );

  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful customer support agent. Be professional, friendly, and concise in your responses."
  );

  const [maxContextTokens, setMaxContextTokens] = useState(2000);

  // Rough token estimation (1 token ~= 4 characters)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const contextTokens = estimateTokens(contextText);
  const systemTokens = estimateTokens(systemPrompt);
  const totalTokens = contextTokens + systemTokens;
  const utilizationPercent = (totalTokens / maxContextTokens) * 100;

  const optimizationSuggestions = useMemo(() => {
    const suggestions = [];

    if (contextText.includes("Common FAQs") && contextText.length > 500) {
      suggestions.push({
        type: "high",
        title: "Move FAQs to Vector Database",
        description: "Store FAQs in a vector DB and retrieve only relevant ones. Reduce context by ~60%.",
        savingsTokens: Math.floor(contextTokens * 0.6),
        complexity: "Medium"
      });
    }

    if (systemPrompt.length > 200) {
      suggestions.push({
        type: "medium",
        title: "Simplify System Prompt",
        description: "Condense instructions without losing meaning. Remove redundant phrases.",
        savingsTokens: Math.floor(systemTokens * 0.3),
        complexity: "Low"
      });
    }

    if (contextText.split('\n').length > 10) {
      suggestions.push({
        type: "medium",
        title: "Use Structured Format",
        description: "Convert context to JSON or compact format. Reduce whitespace and formatting.",
        savingsTokens: Math.floor(contextTokens * 0.2),
        complexity: "Low"
      });
    }

    if (totalTokens > maxContextTokens * 0.8) {
      suggestions.push({
        type: "high",
        title: "Implement Context Caching",
        description: "Cache static context (guidelines, FAQs) and only send dynamic parts each request.",
        savingsTokens: Math.floor(contextTokens * 0.7),
        complexity: "High"
      });
    }

    suggestions.push({
      type: "low",
      title: "Remove Redundant Information",
      description: "Identify and remove duplicate or overly detailed information.",
      savingsTokens: Math.floor(contextTokens * 0.15),
      complexity: "Low"
    });

    return suggestions;
  }, [contextText, systemPrompt, contextTokens, systemTokens, totalTokens, maxContextTokens]);

  const totalPotentialSavings = optimizationSuggestions.reduce(
    (sum, s) => sum + s.savingsTokens,
    0
  );

  const optimizedTokens = totalTokens - totalPotentialSavings;
  const costPerRequest = (totalTokens / 1_000_000) * 3; // $3 per 1M tokens
  const optimizedCost = (optimizedTokens / 1_000_000) * 3;
  const costSavingsPercent = ((costPerRequest - optimizedCost) / costPerRequest) * 100;

  const applyOptimization = (optimization: typeof optimizationSuggestions[0]) => {
    // Simplified example of applying an optimization
    if (optimization.title.includes("System Prompt")) {
      setSystemPrompt(systemPrompt.split('.').slice(0, 2).join('.') + '.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert if context is too large */}
      {utilizationPercent > 90 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your context is using {utilizationPercent.toFixed(0)}% of the maximum window! 
            This may cause truncation or increased costs.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Context Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Maximize2 className="h-5 w-5" />
            Context Window Analysis
          </CardTitle>
          <CardDescription>
            Analyze and optimize your prompt context to reduce token usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>System Prompt</Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="mt-1 font-mono text-sm"
              rows={3}
            />
            <div className="text-xs text-muted-foreground mt-1">
              ~{systemTokens} tokens
            </div>
          </div>

          <div>
            <Label>Context / Instructions</Label>
            <Textarea
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              className="mt-1 font-mono text-sm"
              rows={12}
            />
            <div className="text-xs text-muted-foreground mt-1">
              ~{contextTokens} tokens
            </div>
          </div>

          <div>
            <Label>Maximum Context Window (tokens)</Label>
            <Input
              type="number"
              value={maxContextTokens}
              onChange={(e) => setMaxContextTokens(Number(e.target.value))}
              className="mt-1"
            />
            <Slider
              value={[maxContextTokens]}
              onValueChange={([v]) => setMaxContextTokens(v)}
              min={500}
              max={128000}
              step={500}
              className="mt-2"
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Token Usage</span>
              <span className={utilizationPercent > 90 ? "text-red-600 font-semibold" : ""}>
                {totalTokens} / {maxContextTokens} ({utilizationPercent.toFixed(1)}%)
              </span>
            </div>
            <Progress 
              value={Math.min(utilizationPercent, 100)}
              className={utilizationPercent > 90 ? "bg-red-100 dark:bg-red-950" : ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Current Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTokens}</div>
            <div className="text-xs text-muted-foreground mt-1">
              System: {systemTokens} • Context: {contextTokens}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Cost per Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${costPerRequest.toFixed(4)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              At $3 per 1M tokens
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Optimized Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{optimizedTokens}</div>
            <div className="text-xs text-muted-foreground mt-1">
              -{totalPotentialSavings} tokens possible
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              Potential Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {costSavingsPercent.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ${(costPerRequest - optimizedCost).toFixed(5)}/request
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Optimization Strategies
          </CardTitle>
          <CardDescription>
            Apply these strategies to reduce context size and costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={`p-4 border rounded-lg ${
                  suggestion.type === "high"
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                    : suggestion.type === "medium"
                    ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900"
                    : "bg-gray-50 dark:bg-gray-950/20"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          suggestion.type === "high"
                            ? "bg-green-600"
                            : suggestion.type === "medium"
                            ? "bg-blue-600"
                            : "bg-gray-600"
                        }
                      >
                        {suggestion.type === "high" ? "High Impact" : 
                         suggestion.type === "medium" ? "Medium Impact" : "Low Impact"}
                      </Badge>
                      <Badge variant="outline">{suggestion.complexity} Complexity</Badge>
                    </div>
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="text-sm">
                    <span className="font-semibold text-green-600">
                      -{suggestion.savingsTokens} tokens
                    </span>
                    <span className="text-muted-foreground ml-2">
                      (${((suggestion.savingsTokens / 1_000_000) * 3).toFixed(5)}/request)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyOptimization(suggestion)}
                    disabled={suggestion.complexity === "High"}
                  >
                    {suggestion.complexity === "High" ? "Manual Setup" : "Apply"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Context Optimization Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">Use Vector Databases</div>
                  <p className="text-xs text-muted-foreground">
                    Store large knowledge bases externally and retrieve only relevant chunks
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">Implement Caching</div>
                  <p className="text-xs text-muted-foreground">
                    Cache static context on provider's side (Anthropic, OpenAI support this)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">Compress Information</div>
                  <p className="text-xs text-muted-foreground">
                    Use structured formats (JSON) instead of verbose text
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">Dynamic Context Loading</div>
                  <p className="text-xs text-muted-foreground">
                    Only include context relevant to the current query
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">Summarize Conversations</div>
                  <p className="text-xs text-muted-foreground">
                    Periodically summarize long conversations to reduce context growth
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">Monitor Token Usage</div>
                  <p className="text-xs text-muted-foreground">
                    Track context sizes over time to identify optimization opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContextWindowOptimizer;
