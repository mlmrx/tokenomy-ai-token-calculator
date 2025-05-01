
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import Chart from 'chart.js/auto';

interface TokenizationChartProps {
  userInputs: Array<{
    text: string;
    tokens: number;
    chars: number;
    inputCost: number;
    outputCost: number;
  }>;
}

const TokenizationChart = ({ userInputs }: TokenizationChartProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || userInputs.length === 0) return;

    // Destroy previous chart if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: userInputs.map((_, index) => `Input ${index + 1}`),
        datasets: [
          {
            label: 'Tokens',
            data: userInputs.map(input => input.tokens),
            backgroundColor: 'rgba(142, 68, 173, 0.5)',
            borderColor: 'rgba(142, 68, 173, 1)',
            borderWidth: 1
          },
          {
            label: 'Characters',
            data: userInputs.map(input => input.chars),
            backgroundColor: 'rgba(155, 89, 182, 0.5)',
            borderColor: 'rgba(155, 89, 182, 1)',
            borderWidth: 1
          },
          {
            label: 'Input Cost ($)',
            data: userInputs.map(input => input.inputCost),
            backgroundColor: 'rgba(165, 105, 189, 0.5)', 
            borderColor: 'rgba(165, 105, 189, 1)',
            borderWidth: 1,
            // Use a secondary y-axis for cost since it's on a different scale
            yAxisID: 'y1',
          },
          {
            label: 'Output Cost ($)',
            data: userInputs.map(input => input.outputCost),
            backgroundColor: 'rgba(133, 193, 233, 0.5)', 
            borderColor: 'rgba(133, 193, 233, 1)',
            borderWidth: 1,
            // Use a secondary y-axis for cost since it's on a different scale
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            }
          },
          y1: {
            beginAtZero: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            title: {
              display: true,
              text: 'Cost ($)'
            },
            ticks: {
              // Format cost to 6 decimal places
              callback: function(value) {
                return '$' + Number(value).toFixed(6);
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (label.includes('Cost')) {
                  label += '$' + context.parsed.y.toFixed(6);
                } else {
                  label += context.parsed.y;
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
  }, [userInputs]);

  return (
    <Card className="p-2">
      {userInputs.length > 0 ? (
        <div style={{ height: '200px' }}>
          <canvas ref={chartRef} />
        </div>
      ) : (
        <div className="h-[200px] flex items-center justify-center text-gray-500">
          No data to display. Calculate some inputs first.
        </div>
      )}
    </Card>
  );
};

export default TokenizationChart;
