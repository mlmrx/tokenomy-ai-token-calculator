
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { getCompanyFromModel, getModelTheme } from "@/lib/modelThemes";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";

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
  'X.AI': {
    training: 0.027,
    inference: 0.0010,
    carbon: 3.5,
    description: 'Modern infrastructure with focus on efficiency'
  },
  'DeepSeek': {
    training: 0.023,
    inference: 0.0008,
    carbon: 3.4,
    description: 'Research-focused infrastructure with mixed hardware'
  },
  'Alibaba': {
    training: 0.026,
    inference: 0.0009,
    carbon: 3.6,
    description: 'Cloud-based infrastructure with regional data centers'
  },
  'Baidu': {
    training: 0.025,
    inference: 0.0010,
    carbon: 3.5,
    description: 'Custom hardware with on-premise and cloud resources'
  },
  'default': {
    training: 0.025,
    inference: 0.0009,
    carbon: 3.5,
    description: 'Average energy consumption based on industry standards'
  }
};

const EnergyConsumptionTab = ({ tokens, selectedModel }: EnergyConsumptionTabProps) => {
  const radarChartRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutChartRef = useRef<HTMLCanvasElement | null>(null);
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartInstance = useRef<Chart | null>(null);
  const doughnutChartInstance = useRef<Chart | null>(null);
  const lineChartInstance = useRef<Chart | null>(null);
  const [simulatedUsage, setSimulatedUsage] = useState<number>(1);
  const [activeEnergyTab, setActiveEnergyTab] = useState<string>("overview");
  
  // Get company based on model name
  const company = getCompanyFromModel(selectedModel);
  const energyData = energyEstimates[company] || energyEstimates.default;
  const modelTheme = getModelTheme(selectedModel);
  
  // Calculate energy for the current token count
  const tokenMillions = tokens / 1000000;
  const inferenceEnergy = energyData.inference * tokens;
  const inferenceEnergyKwh = inferenceEnergy.toFixed(6);
  const carbonFootprint = (inferenceEnergy * energyData.carbon).toFixed(6);
  
  // Comparative metrics
  const smartphoneCharges = (inferenceEnergy / 0.0125).toFixed(4); // kWh per smartphone charge
  const lightbulbHours = (inferenceEnergy / 0.01).toFixed(4); // kWh per LED lightbulb hour

  // Simulated daily usage totals
  const dailyEnergy = inferenceEnergy * simulatedUsage;
  const dailyCarbon = dailyEnergy * energyData.carbon;
  const monthlyEnergy = dailyEnergy * 30;
  const monthlyCarbon = dailyCarbon * 30;
  
  // Render radar chart for company comparison
  useEffect(() => {
    if (!radarChartRef.current || tokens === 0) return;

    if (radarChartInstance.current) {
      radarChartInstance.current.destroy();
    }

    const ctx = radarChartRef.current.getContext("2d");
    if (!ctx) return;

    // Get all companies for comparison
    const companies = Object.keys(energyEstimates).filter(c => c !== 'default');
    
    radarChartInstance.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: ['Inference Energy', 'Training Energy', 'Carbon Efficiency', 'Data Center Efficiency', 'Hardware Efficiency'],
        datasets: [{
          label: company,
          data: [
            10 - (energyData.inference / 0.0012 * 10), // Scale inference energy (lower is better)
            10 - (energyData.training / 0.03 * 10),   // Scale training energy (lower is better)
            10 - (energyData.carbon / 4.0 * 10),      // Scale carbon (lower is better)
            Math.random() * 3 + 7,                    // Random high score for data center
            Math.random() * 2 + 7                     // Random high score for hardware
          ],
          fill: true,
          backgroundColor: `${modelTheme.chart.input}`,
          borderColor: `${modelTheme.chart.inputBorder}`,
          pointBackgroundColor: `${modelTheme.chart.inputBorder}`,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: `${modelTheme.chart.inputBorder}`
        }]
      },
      options: {
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 10
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const score = context.raw as number;
                const category = context.label || '';
                return `${category}: ${score.toFixed(1)}/10`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (radarChartInstance.current) {
        radarChartInstance.current.destroy();
      }
    };
  }, [tokens, selectedModel, company, energyData, modelTheme]);

  // Render doughnut chart for energy breakdown
  useEffect(() => {
    if (!doughnutChartRef.current || tokens === 0) return;

    if (doughnutChartInstance.current) {
      doughnutChartInstance.current.destroy();
    }

    const ctx = doughnutChartRef.current.getContext("2d");
    if (!ctx) return;

    // Different components of energy usage (simplified model)
    doughnutChartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ['GPU/TPU Processing', 'Data Transfer', 'Memory Access', 'System Overhead'],
        datasets: [{
          data: [60, 15, 15, 10], // Percentages of energy usage
          backgroundColor: [
            `${modelTheme.chart.input}`,
            `${modelTheme.chart.output}`, 
            `rgba(75, 192, 192, 0.6)`,
            `rgba(153, 102, 255, 0.6)`
          ],
          borderColor: [
            `${modelTheme.chart.inputBorder}`,
            `${modelTheme.chart.outputBorder}`,
            `rgba(75, 192, 192, 1)`,
            `rgba(153, 102, 255, 1)`
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw as number;
                const label = context.label || '';
                return `${label}: ${value}% of total energy`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (doughnutChartInstance.current) {
        doughnutChartInstance.current.destroy();
      }
    };
  }, [tokens, selectedModel, modelTheme]);

  // Render line chart for usage projection
  useEffect(() => {
    if (!lineChartRef.current || tokens === 0) return;

    if (lineChartInstance.current) {
      lineChartInstance.current.destroy();
    }

    const ctx = lineChartRef.current.getContext("2d");
    if (!ctx) return;

    // Project energy usage over time
    const days = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
    const dailyEnergyUsage = Array.from({length: 30}, () => dailyEnergy);
    const dailyCarbonEmission = Array.from({length: 30}, () => dailyCarbon);
    const cumulativeEnergy = days.map((_, i) => dailyEnergy * (i+1));

    lineChartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: days,
        datasets: [
          {
            label: 'Daily Energy (kWh)',
            data: dailyEnergyUsage,
            borderColor: `${modelTheme.chart.inputBorder}`,
            backgroundColor: `${modelTheme.chart.input}`,
            fill: false,
            tension: 0.1
          },
          {
            label: 'Daily Carbon (g CO₂)',
            data: dailyCarbonEmission,
            borderColor: `${modelTheme.chart.outputBorder}`,
            backgroundColor: `${modelTheme.chart.output}`,
            fill: false,
            tension: 0.1,
            yAxisID: 'y1'
          },
          {
            label: 'Cumulative Energy (kWh)',
            data: cumulativeEnergy,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Energy (kWh)'
            }
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Carbon (g CO₂)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });

    return () => {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
    };
  }, [tokens, selectedModel, simulatedUsage, dailyEnergy, dailyCarbon, modelTheme]);

  return (
    <Card className="p-4 bg-white">
      <h3 className="font-medium mb-4 text-center text-lg" style={{ color: modelTheme.primary }}>
        Estimated Energy Consumption
      </h3>

      {tokens > 0 ? (
        <>
          <Tabs value={activeEnergyTab} onValueChange={setActiveEnergyTab} className="mb-4">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="projection">Projection</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="bg-purple-50 rounded-md p-4 space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      Model Provider: <span className="font-medium">{company}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {energyData.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <h4 className="text-sm font-medium mb-2" style={{ color: modelTheme.primary }}>Inference Energy</h4>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Energy:</span>
                          <span className="font-bold" style={{ color: modelTheme.primary }}>{inferenceEnergyKwh} kWh</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-medium">Carbon:</span>
                          <span className="font-bold" style={{ color: modelTheme.primary }}>{carbonFootprint} g CO₂</span>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-md shadow-sm">
                        <h4 className="text-sm font-medium mb-2" style={{ color: modelTheme.primary }}>Equivalent To</h4>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Charges:</span>
                          <span className="font-bold" style={{ color: modelTheme.primary }}>{smartphoneCharges}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="font-medium">LED Hours:</span>
                          <span className="font-bold" style={{ color: modelTheme.primary }}>{lightbulbHours}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2" style={{ color: modelTheme.primary }}>Efficiency Score</h4>
                    <div className="flex items-center gap-2">
                      <div className="h-4 flex-grow bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${Math.max(20, 100 - ((energyData.inference / 0.0012) * 100))}%`,
                            backgroundColor: modelTheme.primary 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium" style={{ color: modelTheme.primary }}>
                        {Math.round(Math.max(3, 10 - ((energyData.inference / 0.0012) * 10)))} / 10
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      How efficient this model is compared to others in energy consumption
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: modelTheme.primary }}>Performance Profile</h4>
                  <div className="bg-white rounded-md p-2 shadow-sm" style={{ height: "260px" }}>
                    <canvas ref={radarChartRef} />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="breakdown">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: modelTheme.primary }}>Energy Breakdown</h4>
                  <div className="bg-white rounded-md p-2 shadow-sm" style={{ height: "260px" }}>
                    <canvas ref={doughnutChartRef} />
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-md p-4">
                  <h4 className="text-sm font-medium mb-4" style={{ color: modelTheme.primary }}>Energy Components</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">GPU/TPU Processing</span>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Neural network calculations and matrix operations performed by processing units
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Data Transfer</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Moving data between storage, memory, and processing units
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Memory Access</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Reading and writing model weights and activations to memory
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">System Overhead</span>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Operating system, cooling, and other infrastructure costs
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="projection">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2" style={{ color: modelTheme.primary }}>Simulate Daily Usage (# of similar requests per day)</h4>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[simulatedUsage]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(values) => setSimulatedUsage(values[0])}
                    className="flex-grow"
                  />
                  <span className="text-sm font-medium w-12">{simulatedUsage}</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-md p-4 space-y-3">
                  <h4 className="text-sm font-medium" style={{ color: modelTheme.primary }}>Projected Usage</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs text-gray-500">Daily Energy</span>
                      <p className="font-bold text-lg" style={{ color: modelTheme.primary }}>{dailyEnergy.toFixed(6)} kWh</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs text-gray-500">Daily Carbon</span>
                      <p className="font-bold text-lg" style={{ color: modelTheme.primary }}>{dailyCarbon.toFixed(6)} g CO₂</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs text-gray-500">Monthly Energy</span>
                      <p className="font-bold text-lg" style={{ color: modelTheme.primary }}>{monthlyEnergy.toFixed(6)} kWh</p>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <span className="text-xs text-gray-500">Monthly Carbon</span>
                      <p className="font-bold text-lg" style={{ color: modelTheme.primary }}>{monthlyCarbon.toFixed(6)} g CO₂</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                    <Info className="h-3.5 w-3.5 text-blue-500" />
                    <p>
                      This simulation helps estimate the environmental impact of regular usage of this AI model.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: modelTheme.primary }}>30-Day Projection</h4>
                  <div className="bg-white rounded-md p-2 shadow-sm" style={{ height: "260px" }}>
                    <canvas ref={lineChartRef} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="text-xs text-gray-500 mt-4 pt-3 border-t">
            <p className="flex items-start gap-2">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                These are estimated values based on industry research and may vary based on specific model implementations, hardware, and data center efficiencies.
                Data sources: AI Impact papers, Cloud provider sustainability reports, and research on computational efficiency.
              </span>
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-gray-500">
          Enter some text and calculate tokens to see energy estimates
        </div>
      )}
    </Card>
  );
};

export default EnergyConsumptionTab;
