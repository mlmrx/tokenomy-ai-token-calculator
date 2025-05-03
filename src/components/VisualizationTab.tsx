
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart3 } from "lucide-react";
import { getModelTheme } from "@/lib/modelThemes";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  ChartTooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Filler
);

interface VisualizationTabProps {
  text: string;
  tokens: number;
  costs: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
}

// Enhanced text analysis function to categorize content with more metrics
const analyzeContent = (text: string) => {
  if (!text) return {
    characterBreakdown: { labels: [], data: [] },
    contentStructure: { labels: [], data: [] },
    complexityMetrics: { labels: [], data: [] }
  };
  
  const punctuation = (text.match(/[.,!?;:]/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  const numbers = (text.match(/[0-9]/g) || []).length;
  const specialChars = (text.match(/[^A-Za-z0-9.,!?;: ]/g) || []).length;
  const letters = text.length - punctuation - spaces - numbers - specialChars;
  
  // Break down content into basic grammar components
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
  const longestWordLength = Math.max(...text.split(/\s+/).map(word => word.length), 0);
  
  // Calculate complexity metrics
  const uniqueWords = new Set(text.toLowerCase().match(/[a-z]+/g) || []).size;
  const wordDiversity = uniqueWords / words || 0;
  const avgWordLength = words > 0 ? 
    text.replace(/[^\w]/g, '').length / words : 0;
  const complexWords = text.split(/\s+/)
    .filter(word => word.length > 6).length;
  const complexityRatio = words > 0 ? complexWords / words : 0;
  
  return {
    characterBreakdown: {
      labels: ['Letters', 'Spaces', 'Punctuation', 'Numbers', 'Special'],
      data: [letters, spaces, punctuation, numbers, specialChars]
    },
    contentStructure: {
      labels: ['Paragraphs', 'Sentences', 'Words', 'Avg Words/Sent', 'Longest Word'],
      data: [paragraphs, sentences, words, Math.round(avgWordsPerSentence), longestWordLength]
    },
    complexityMetrics: {
      labels: ['Word Diversity', 'Avg Word Length', 'Complex Words', 'Readability', 'Text Density'],
      data: [
        Math.min(wordDiversity * 100, 100),  // 0-100
        Math.min(avgWordLength * 10, 100),   // 0-100
        Math.min(complexityRatio * 100, 100), // 0-100
        Math.max(100 - (avgWordsPerSentence * 5), 0), // 0-100 (inverse - shorter sentences are more readable)
        Math.min((words / (paragraphs || 1)) / 5, 100) // 0-100 (words per paragraph / 5, capped at 100)
      ]
    }
  };
};

const VisualizationTab: React.FC<VisualizationTabProps> = ({ text, tokens, costs, model }) => {
  const modelTheme = getModelTheme(model);
  const contentAnalysis = useMemo(() => analyzeContent(text), [text]);
  
  // Prepare chart data using model theme colors
  const charBreakdownData = {
    labels: contentAnalysis.characterBreakdown.labels,
    datasets: [{
      data: contentAnalysis.characterBreakdown.data,
      backgroundColor: [
        modelTheme.primary,
        modelTheme.secondary,
        `${modelTheme.primary}99`,
        `${modelTheme.primary}77`,
        `${modelTheme.primary}55`
      ],
      borderColor: [
        modelTheme.primary,
        modelTheme.secondary,
        modelTheme.primary,
        modelTheme.primary,
        modelTheme.primary
      ],
      borderWidth: 1
    }]
  };

  const structureData = {
    labels: contentAnalysis.contentStructure.labels,
    datasets: [{
      label: 'Content Structure',
      data: contentAnalysis.contentStructure.data,
      backgroundColor: `${modelTheme.primary}88`,
      borderColor: modelTheme.primary,
      borderWidth: 1
    }]
  };
  
  const complexityData = {
    labels: contentAnalysis.complexityMetrics.labels,
    datasets: [{
      label: 'Text Complexity Metrics',
      data: contentAnalysis.complexityMetrics.data,
      backgroundColor: `${modelTheme.primary}40`,
      borderColor: modelTheme.primary,
      borderWidth: 1,
      pointBackgroundColor: modelTheme.primary,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: modelTheme.primary
    }]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" style={{color: modelTheme.primary}} />
              Character Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <div style={{width: '240px', height: '240px'}}>
              <Doughnut 
                data={charBreakdownData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw;
                          const percentage = ((value as number) / (text?.length || 1) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" style={{color: modelTheme.primary}} />
              Content Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Bar 
              data={structureData} 
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Add a new radar chart for text complexity metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: modelTheme.primary}}>
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              <path d="M2 12h20"></path>
            </svg>
            Text Complexity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
          <div style={{maxWidth: '500px', margin: '0 auto'}}>
            <Radar
              data={complexityData}
              options={{
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      stepSize: 20
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${context.raw}/100`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualizationTab;
