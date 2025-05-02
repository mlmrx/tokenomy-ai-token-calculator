
import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { getCompanyFromModel } from "@/lib/modelThemes";

interface EnergyConsumptionTabProps {
  tokens: number;
  selectedModel: string;
}

// Energy consumption estimates in kWh per 1M tokens
// Based on research and estimations - these are approximate values
const energyEstimates = {
  'OpenAI': {
    training: 0.025,
    inference: 0.0009,
    carbon: 3.5, // g CO2 per kWh
    description: 'Uses a mix of GPUs and TPUs with optimized datacenter efficiency'
  },
  'Anthropic': {
    training: 0.029,
    inference: 0.0011,
    carbon: 3.8,
    description: 'Focuses on sustainable AI training with significant efficiency improvements'
  },
  'Meta': {
    training: 0.018,
    inference: 0.0006,
    carbon: 2.8,
    description: 'Open source models with optimized inference on consumer hardware'
  },
  'Google': {
    training: 0.021,
    inference: 0.0008,
    carbon: 3.2,
    description: 'Uses efficient TPUs and carbon-neutral data centers'
  },
  'Microsoft': {
    training: 0.027,
    inference: 0.0010,
    carbon: 3.6,
    description: 'Mixed hardware infrastructure with cloud optimization'
  },
  'Amazon': {
    training: 0.028,
    inference: 0.0011,
    carbon: 3.7,
    description: 'AWS infrastructure with variable renewable energy percentages'
  },
  'Mistral': {
    training: 0.020,
    inference: 0.0007,
    carbon: 3.0,
    description: 'European cloud infrastructure with higher renewable percentage'
  },
  'default': {
    training: 0.025,
    inference: 0.0009,
    carbon: 3.5,
    description: 'Average energy consumption based on industry standards'
  }
};

const EnergyConsumptionTab = ({ tokens, selectedModel }: EnergyConsumptionTabProps) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Get company based on model name
  const company = getCompanyFromModel(selectedModel);
  const energyData = energyEstimates[company] || energyEstimates.default;
  
  // Calculate energy for the current token count
  const tokenMillions = tokens / 1000000;
  const inferenceEnergy = energyData.inference * tokens;
  const inferenceEnergyKwh = inferenceEnergy.toFixed(6);
  const carbonFootprint = (inferenceEnergy * energyData.carbon).toFixed(6);
  
  // Comparative metrics
  const smartphoneCharges = (inferenceEnergy / 0.0125).toFixed(4); // kWh per smartphone charge
  const lightbulbHours = (inferenceEnergy / 0.01).toFixed(4); // kWh per LED lightbulb hour
  
  useEffect(() => {
    if (!chartRef.current || tokens === 0) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Get comparison data for all companies
    const companies = Object.keys(energyEstimates).filter(c => c !== 'default');
    const inferenceValues = companies.map(c => energyEstimates[c].inference * tokens);
    const carbonValues = companies.map(c => energyEstimates[c].inference * tokens * energyEstimates[c].carbon);

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: companies,
        datasets: [
          {
            label: "Energy (kWh)",
            data: inferenceValues,
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "Carbon (g CO2)",
            data: carbonValues,
            backgroundColor: "rgba(153, 102, 255, 0.5)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Energy (kWh)",
            },
          },
          y1: {
            position: "right",
            beginAtZero: true,
            title: {
              display: true,
              text: "Carbon (g CO2)",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [tokens, selectedModel]);

  return (
    <Card className="p-4 bg-white">
      <h3 className="font-medium text-purple-800 mb-2 text-center">Estimated Energy Consumption</h3>
      {tokens > 0 ? (
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-md p-4 space-y-2">
            <p className="text-sm text-gray-600">
              Model Provider: <span className="font-medium">{company}</span>
            </p>
            <p className="text-sm text-gray-600">
              {energyData.description}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <h4 className="text-sm font-medium text-purple-700 mb-2">Inference Energy</h4>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Energy Usage:</span>
                  <span className="text-purple-800 font-bold">{inferenceEnergyKwh} kWh</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-medium">Carbon Footprint:</span>
                  <span className="text-purple-800 font-bold">{carbonFootprint} g CO₂</span>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-md shadow-sm">
                <h4 className="text-sm font-medium text-purple-700 mb-2">Equivalent To</h4>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Smartphone Charges:</span>
                  <span className="text-purple-800 font-bold">{smartphoneCharges}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-medium">LED Light Hours:</span>
                  <span className="text-purple-800 font-bold">{lightbulbHours}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ height: "250px" }}>
            <h4 className="text-sm font-medium text-purple-700 mb-2">Model Provider Comparison</h4>
            <canvas ref={chartRef} />
          </div>
          
          <div className="text-xs text-gray-500 mt-2">
            <p>Note: These are estimated values based on industry research and may vary based on specific model implementations, hardware, and data center efficiencies.</p>
            <p>Data sources: AI Impact papers, Cloud provider sustainability reports, and research on computational efficiency.</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Enter some text and calculate tokens to see energy estimates
        </div>
      )}
    </Card>
  );
};

export default EnergyConsumptionTab;
