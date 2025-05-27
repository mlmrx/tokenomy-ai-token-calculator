
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, DollarSign, Zap, FileText, Info } from "lucide-react";
import { estimateTokens, calculateCost, getModelCategories } from "@/lib/modelData";
import TokenizationInfo from "./TokenizationInfo";

const TokenCalculator: React.FC = () => {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [tokenCount, setTokenCount] = useState(0);
  const [inputCost, setInputCost] = useState(0);
  const [outputCost, setOutputCost] = useState(0);
  const [showTokenizationInfo, setShowTokenizationInfo] = useState(false);

  const modelCategories = getModelCategories();

  const calculateTokensAndCost = (inputText: string, model: string) => {
    const tokens = estimateTokens(inputText, model);
    setTokenCount(tokens);
    
    const inputPrice = calculateCost(tokens, model, false);
    const outputPrice = calculateCost(tokens, model, true);
    setInputCost(inputPrice);
    setOutputCost(outputPrice);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    calculateTokensAndCost(value, selectedModel);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    calculateTokensAndCost(text, model);
  };

  useEffect(() => {
    if (text) {
      calculateTokensAndCost(text, selectedModel);
    }
  }, [selectedModel, text]);

  return (
    <div className="space-y-6">
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
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(modelCategories).map(([category, models]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {category}
                      </div>
                      {models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </div>
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
            <div className="text-sm text-muted-foreground">
              Character count: {text.length.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <p className="text-sm font-medium">Input Cost</p>
                    <p className="text-2xl font-bold">${inputCost.toFixed(6)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Output Cost</p>
                    <p className="text-2xl font-bold">${outputCost.toFixed(6)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Total Cost</p>
                    <p className="text-2xl font-bold">${(inputCost + outputCost).toFixed(6)}</p>
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
            <Button onClick={() => calculateTokensAndCost(text, selectedModel)}>
              Recalculate
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowTokenizationInfo(!showTokenizationInfo)}
            >
              <Info className="h-4 w-4 mr-2" />
              {showTokenizationInfo ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {showTokenizationInfo && (
        <TokenizationInfo model={selectedModel} tokens={tokenCount} />
      )}
    </div>
  );
};

export default TokenCalculator;
