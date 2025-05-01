
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import Chart from 'chart.js/auto';
import { getModelCategories } from "@/lib/modelData";

interface ModelComparisonChartProps {
  modelPricing: Record<string, { input: number; output: number }>;
}

const ModelComparisonChart = ({ modelPricing }: ModelComparisonChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [showOutput, setShowOutput] = useState<boolean>(true);
  const [modelCategory, setModelCategory] = useState<string>("all");
  
  const categories = getModelCategories();

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
    
    // Prepare the datasets
    const datasets = [
      {
        label: 'Input Price (per 1K tokens)',
        data: filteredModels.map(model => modelPricing[model].input),
        backgroundColor: 'rgba(142, 68, 173, 0.5)',
        borderColor: 'rgba(142, 68, 173, 1)',
        borderWidth: 1
      }
    ];
    
    if (showOutput) {
      datasets.push({
        label: 'Output Price (per 1K tokens)',
        data: filteredModels.map(model => modelPricing[model].output),
        backgroundColor: 'rgba(155, 89, 182, 0.5)',
        borderColor: 'rgba(155, 89, 182, 1)',
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
                label += '$' + context.parsed.x.toFixed(6);
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

  return (
    <Card className="p-2">
      <div className="flex justify-between mb-2">
        <div>
          <select 
            className="border border-purple-300 rounded px-2 py-1 text-sm"
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
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Show Output Prices</span>
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
