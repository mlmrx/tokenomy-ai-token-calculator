import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { promptTemplates, promptCategories, optimizationStrategies } from "@/lib/promptLibraryData";
import { Button } from "@/components/ui/button";
import { Copy, Download, Lightbulb, Search, Code } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PromptLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredTemplates = promptTemplates.filter(template => {
    const matchesCategory = selectedCategory === "All Categories" || template.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === "All" || template.difficulty === selectedDifficulty;
    
    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  const copyTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
    toast.success("Template copied to clipboard!");
  };

  const exportTemplate = (prompt: typeof promptTemplates[0]) => {
    const exportData = JSON.stringify(prompt, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.id}-template.json`;
    a.click();
    toast.success("Template exported!");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Optimized Prompts
          </CardTitle>
          <CardDescription>
            Browse {promptTemplates.length} curated prompt templates optimized for cost and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search templates, tags, use cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {promptCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                <Badge variant={
                  template.difficulty === "Beginner" ? "default" :
                  template.difficulty === "Intermediate" ? "secondary" : "destructive"
                }>
                  {template.difficulty}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">{template.category}</Badge>
                {template.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{template.avgInputTokens}</div>
                  <div className="text-xs text-muted-foreground">Input Tokens</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{template.avgOutputTokens}</div>
                  <div className="text-xs text-muted-foreground">Output Tokens</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">${template.estimatedCost.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">Est. Cost</div>
                </div>
              </div>

              {/* Template Preview */}
              <div className="bg-muted p-3 rounded-lg text-sm font-mono max-h-32 overflow-y-auto">
                {template.template.split('\n').slice(0, 5).join('\n')}
                {template.template.split('\n').length > 5 && '...'}
              </div>

              {/* Variables */}
              <div>
                <div className="text-sm font-semibold mb-1">Variables:</div>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map(v => (
                    <Badge key={v} variant="outline" className="text-xs">
                      <Code className="h-3 w-3 mr-1" />
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Optimization Tips */}
              <Accordion type="single" collapsible className="border-t pt-2">
                <AccordionItem value="tips" className="border-0">
                  <AccordionTrigger className="text-sm py-2">
                    <span className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Optimization Tips
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      {template.optimizationTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex-1"
                  onClick={() => copyTemplate(template.template)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Template
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportTemplate(template)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optimization Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Universal Optimization Strategies</CardTitle>
          <CardDescription>Apply these strategies to any prompt to reduce costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {optimizationStrategies.map(strategy => (
              <div key={strategy.title} className="space-y-3">
                <div>
                  <h4 className="font-semibold">{strategy.title}</h4>
                  <p className="text-sm text-muted-foreground">{strategy.description}</p>
                </div>
                <ul className="space-y-1">
                  {strategy.techniques.map((technique, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{technique}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptLibrary;
