
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import EnergyUsageEstimator from "@/components/EnergyUsageEstimator";

const EnergyEstimatorPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/tools">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tools
          </Link>
        </Button>
      </div>
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Energy Usage Estimator</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate and visualize the environmental impact of AI token processing
        </p>
      </div>
      
      <div className="space-y-8">
        <EnergyUsageEstimator />
        
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-3 text-green-800 dark:text-green-400">Why Energy Consumption Matters</h2>
          <p className="mb-4">
            AI model training and inference consume significant computational resources and energy. Understanding
            the environmental impact of token processing helps organizations make more sustainable choices.
          </p>
          
          <h3 className="font-medium text-green-700 dark:text-green-500 mb-2">Tips to Reduce AI Energy Consumption:</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>Choose smaller, more efficient models when possible</li>
            <li>Optimize prompts to reduce token count</li>
            <li>Batch processing when applicable</li>
            <li>Consider using models hosted in regions with greener energy sources</li>
            <li>Cache frequent requests to avoid redundant processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnergyEstimatorPage;
