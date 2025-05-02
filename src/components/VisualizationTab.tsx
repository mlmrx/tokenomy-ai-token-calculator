
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut, Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip as ChartTooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { PieChart, BarChart3 } from "lucide-react";
import { getModelTheme } from "@/lib/modelThemes";

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  ChartTooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
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

// Simple text analysis function to categorize content
const analyzeContent = (text: string) => {
  const punctuation = (text.match(/[.,!?;:]/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  const numbers = (text.match(/[0-9]/g) || []).length;
  const specialChars = (text.match(/[^A-Za-z0-9.,!?;: ]/g) || []).length;
  const letters = text.length - punctuation - spaces - numbers - specialChars;
  
  // Break down content into basic grammar components (very simplified)
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
  
  return {
    characterBreakdown: {
      labels: ['Letters', 'Spaces', 'Punctuation', 'Numbers', 'Special'],
      data: [letters, spaces, punctuation, numbers, specialChars]
    },
    contentStructure: {
      labels: ['Paragraphs', 'Sentences', 'Avg Words/Sent'],
      data: [paragraphs, sentences, Math.round(avgWordsPerSentence)]
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

  return (
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
                        const percentage = ((value as number) / text.length * 100).toFixed(1);
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
  );
};

export default VisualizationTab;
