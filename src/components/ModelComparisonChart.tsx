
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import Chart from 'chart.js/auto';

interface ModelComparisonChartProps {
  modelPricing: Record<string, { input: number; output: number }>;
}

const ModelComparisonChart = ({ modelPricing }: ModelComparisonChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(modelPricing),
        datasets: [
          {
            label: 'Input Price (per 1K tokens)',
            data: Object.values(modelPricing).map(price => price.input),
            backgroundColor: 'rgba(142, 68, 173, 0.5)',
            borderColor: 'rgba(142, 68, 173, 1)',
            borderWidth: 1
          },
          {
            label: 'Output Price (per 1K tokens)',
            data: Object.values(modelPricing).map(price => price.output),
            backgroundColor: 'rgba(155, 89, 182, 0.5)',
            borderColor: 'rgba(155, 89, 182, 1)',
            borderWidth: 1
          }
        ]
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
  }, [modelPricing]);

  return (
    <Card className="p-2">
      <div style={{ height: '300px' }}>
        <canvas ref={chartRef} />
      </div>
    </Card>
  );
};

export default ModelComparisonChart;
