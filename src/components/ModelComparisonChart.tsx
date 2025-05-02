
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import Chart from 'chart.js/auto';
import { getModelCategories, estimateTokens, calculateCost } from "@/lib/modelData";
import { getCompanyFromModel, modelThemes } from "@/lib/modelThemes";

interface ModelComparisonChartProps {
  selectedModel: string;
}

const ModelComparisonChart = ({ selectedModel }: ModelComparisonChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [showOutput, setShowOutput] = useState<boolean>(true);
  const [modelCategory, setModelCategory] = useState<string>("all");
  
  const categories = getModelCategories();
  
  // Calculate model pricing data
  const modelPricing: Record<string, { input: number; output: number }> = {};
  
  // Prepare pricing data for all models
  Object.keys(categories).forEach(category => {
    categories[category].forEach((model: string) => {
      try {
        const tokens = estimateTokens("Sample text for pricing");
        const inputCost = calculateCost(tokens, model);
        const outputCost = calculateCost(tokens, model, true);
        modelPricing[model] = {
          input: inputCost,
          output: outputCost
        };
      } catch (error) {
        console.error(`Error calculating pricing for ${model}:`, error);
        modelPricing[model] = { input: 0, output: 0 };
      }
    });
  });

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Filter models based on selected category
    let filteredModels = Object.keys(modelPricing);
    if (modelCategory !== "all") {
      filteredModels = categories[modelCategory] || [];
    }
    
    // Sort models by input price
    filteredModels.sort((a, b) => modelPricing[a].input - modelPricing[b].input);

    // Get the theme for the selected category
    const theme = modelCategory !== "all" ? modelThemes[modelCategory] || modelThemes.default : modelThemes.default;
    
    // Prepare the datasets
    const datasets = [
      {
        label: 'Input Price (per 1K tokens)',
        data: filteredModels.map(model => modelPricing[model].input),
        backgroundColor: theme.chart?.input || 'rgba(75, 192, 192, 0.2)',
        borderColor: theme.chart?.inputBorder || 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ];
    
    if (showOutput) {
      datasets.push({
        label: 'Output Price (per 1K tokens)',
        data: filteredModels.map(model => modelPricing[model].output),
        backgroundColor: theme.chart?.output || 'rgba(153, 102, 255, 0.2)',
        borderColor: theme.chart?.outputBorder || 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      });
    }
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: filteredModels,
        datasets: datasets
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Price per 1K tokens ($)'
            },
            ticks: {
              callback: function(value) {
                return '$' + value;
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (typeof context.parsed.x === 'number') {
                  label += '$' + context.parsed.x.toFixed(6);
                }
                return label;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [modelPricing, showOutput, modelCategory, categories]);

  // Get theme color for UI elements
  const theme = modelCategory !== "all" ? modelThemes[modelCategory] || modelThemes.default : modelThemes.default;

  return (
    <Card className="p-4">
      <div className="flex justify-between mb-4">
        <div>
          <select 
            className="border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2"
            style={{ 
              borderColor: theme.border || '#ccc',
              color: theme.primary || '#333'
            }}
            value={modelCategory}
            onChange={(e) => setModelCategory(e.target.value)}
          >
            <option value="all">All Models</option>
            {Object.keys(categories).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={showOutput}
              onChange={() => setShowOutput(!showOutput)}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-opacity-50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600"
              style={{ backgroundColor: showOutput ? theme.primary || '#333' : 'rgba(0,0,0,0.1)', 
                       borderColor: theme.border || '#ccc' }}></div>
            <span className="ms-3 text-sm font-medium" 
                  style={{ color: theme.primary || '#333' }}>Show Output Prices</span>
          </label>
        </div>
      </div>
      <div style={{ height: '400px' }}>
        <canvas ref={chartRef} />
      </div>
    </Card>
  );
};

export default ModelComparisonChart;
