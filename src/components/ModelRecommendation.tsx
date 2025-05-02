
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ThumbsUp, Zap, BarChart2, DollarSign } from "lucide-react";
import { getModelTheme, getCompanyFromModel } from "@/lib/modelThemes";

interface ModelRecommendationProps {
  text: string;
  tokens: number;
  onSelectModel: (model: string) => void;
}

interface ModelSuggestion {
  id: string;
  name: string;
  company: string;
  score: number;
  reasons: string[];
  tags: string[];
}

const ModelRecommendation: React.FC<ModelRecommendationProps> = ({ text, tokens, onSelectModel }) => {
  // Function to determine recommended models based on input text and token count
  const getRecommendedModels = (text: string, tokenCount: number): ModelSuggestion[] => {
    // This would ideally use more sophisticated logic with ML-based recommendations
    // For demo, we'll use simple rules
    const contentLength = tokenCount || 0;
    const hasCode = text.includes('```') || text.includes('def ') || text.includes('function') || text.includes('{');
    const isTechnical = hasCode || text.includes('algorithm') || text.includes('technical') || text.includes('code');
    const isCreative = text.includes('story') || text.includes('creative') || text.includes('imagine');
    
    // Base suggestions
    const suggestions: ModelSuggestion[] = [
      {
        id: "gpt-4",
        name: "GPT-4",
        company: "OpenAI",
        score: 92,
        reasons: ["Best overall performance", "Handles complex tasks well"],
        tags: ["Premium", "Powerful"]
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        company: "OpenAI",
        score: 86,
        reasons: ["Good balance of speed and quality", "Cost-effective"],
        tags: ["Fast", "Value"]
      },
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        company: "Anthropic",
        score: 90,
        reasons: ["High accuracy", "Strong reasoning abilities"],
        tags: ["Reliable", "Thoughtful"]
      }
    ];
    
    // Adjust scores based on content
    if (contentLength > 2000) {
      // Boost models that handle long content well
      suggestions.find(s => s.id === "claude-3-opus")!.score += 5;
      suggestions.find(s => s.id === "gpt-4")!.score += 3;
    }
    
    if (hasCode || isTechnical) {
      // Boost models that handle code well
      suggestions.find(s => s.id === "gpt-4")!.score += 6;
      suggestions.find(s => s.id === "claude-3-opus")!.score += 4;
      
      // Add code-specific models
      suggestions.push({
        id: "gemini-pro",
        name: "Gemini Pro",
        company: "Google",
        score: 88,
        reasons: ["Good code generation", "Technical accuracy"],
        tags: ["Technical", "Efficient"]
      });
    }
    
    if (isCreative) {
      // Add creative-focused models
      suggestions.push({
        id: "llama-3",
        name: "Llama 3",
        company: "Meta",
        score: 85,
        reasons: ["Creative outputs", "Open-source flexibility"],
        tags: ["Creative", "Open"]
      });
    }
    
    // If very short content, suggest faster models
    if (contentLength < 100) {
      suggestions.push({
        id: "gpt-3.5-turbo-instruct",
        name: "GPT-3.5 Turbo Instruct",
        company: "OpenAI",
        score: 82,
        reasons: ["Very fast response time", "Efficient for short queries"],
        tags: ["Quick", "Efficient"]
      });
    }
    
    // Sort by score descending
    return suggestions.sort((a, b) => b.score - a.score);
  };

  const recommendations = getRecommendedModels(text, tokens);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ThumbsUp className="h-5 w-5 text-primary" /> 
          Model Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.slice(0, 3).map((model) => {
            const theme = getModelTheme(model.id);
            return (
              <div 
                key={model.id} 
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-lg border hover:shadow-md transition-shadow"
                style={{borderColor: theme.border}}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{model.name}</h3>
                    <Badge 
                      variant="outline"
                      style={{
                        backgroundColor: `${theme.primary}20`,
                        color: theme.primary,
                        borderColor: theme.border
                      }}
                    >
                      {model.company}
                    </Badge>
                  </div>
                  
                  <div className="mt-1 text-xs flex items-center gap-1 text-muted-foreground">
                    <div className="flex items-center">
                      <BarChart2 className="h-3 w-3 mr-1" />
                      <span>Match Score: {model.score}%</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {model.id.includes("gpt-4") ? "Higher cost" : "Cost-effective"}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {model.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-0.5 text-xs rounded-full" 
                        style={{
                          backgroundColor: `${theme.primary}15`,
                          color: theme.primary
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={() => onSelectModel(model.id)}
                  className="whitespace-nowrap text-white"
                  style={{
                    backgroundColor: theme.primary,
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> 
                  Select
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelRecommendation;
