
import React from "react";
import Layout from "@/components/Layout";
import { EnergyUsageEstimator } from "@/components/EnergyUsageEstimator";

const EnergyEstimatorPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
          AI Energy Consumption Estimator
        </h1>
        <EnergyUsageEstimator />
      </div>
    </Layout>
  );
};

export default EnergyEstimatorPage;
