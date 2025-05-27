
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, DollarSign, Zap } from "lucide-react";

const TokenCalculator: React.FC = () => {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [tokenCount, setTokenCount] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const models = [
    { id: "gpt-4", name: "GPT-4", inputPrice: 0.03, outputPrice: 0.06 },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", inputPrice: 0.001, outputPrice: 0.002 },
    { id: "claude-3", name: "Claude 3", inputPrice: 0.015, outputPrice: 0.075 },
    { id: "gemini-pro", name: "Gemini Pro", inputPrice: 0.0005, outputPrice: 0.0015 }
  ];

  const calculateTokens = (inputText: string) => {
    // Simple token estimation: ~4 characters per token for English text
    const estimatedTokens = Math.ceil(inputText.length / 4);
    setTokenCount(estimatedTokens);
    
    const model = models.find(m => m.id === selectedModel);
    if (model) {
      const cost = (estimatedTokens * model.inputPrice) / 1000;
      setEstimatedCost(cost);
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    calculateTokens(value);
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Token Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model-select">AI Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-input">Input Text</Label>
          <Textarea
            id="text-input"
            placeholder="Enter your text here to calculate tokens..."
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Token Count</p>
                  <p className="text-2xl font-bold">{tokenCount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-2xl font-bold">${estimatedCost.toFixed(4)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Characters</p>
                  <p className="text-2xl font-bold">{text.length.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => handleTextChange("")}
            variant="outline"
          >
            Clear
          </Button>
          <Button onClick={() => calculateTokens(text)}>
            Recalculate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCalculator;
