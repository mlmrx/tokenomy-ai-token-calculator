import React from "react";
import { Helmet } from "react-helmet-async";
import EnergyUsageEstimator from "../../components/EnergyUsageEstimator";

const EnergyUsageEstimatorPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Energy Usage Estimator",
    "description": "Calculate energy consumption and carbon footprint of AI models. Estimate power usage for ChatGPT, Claude, GPT-4, and other LLMs.",
    "url": "https://tokenomy.app/tools/energy-usage-estimator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser"
  };

  return (
    <>
      <Helmet>
        <title>AI Energy Usage Estimator | Carbon Footprint Calculator for LLMs</title>
        <meta name="description" content="Calculate energy consumption and carbon footprint of AI models. Estimate power usage, environmental impact, and sustainability metrics for ChatGPT, Claude, GPT-4." />
        <meta name="keywords" content="AI energy consumption, LLM carbon footprint, ChatGPT energy usage, Claude power consumption, GPT-4 environmental impact, AI sustainability, green AI, carbon calculator, energy efficient AI" />
        
        <meta property="og:title" content="AI Energy Usage Estimator | Carbon Footprint Calculator" />
        <meta property="og:description" content="Calculate energy consumption and carbon footprint of AI models and LLMs." />
        <meta property="og:url" content="https://tokenomy.app/tools/energy-usage-estimator" />
        
        <link rel="canonical" href="https://tokenomy.app/tools/energy-usage-estimator" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main className="min-h-screen">
        <article>
          <header>
            <h1 className="sr-only">AI Energy Usage Estimator - Calculate Carbon Footprint</h1>
          </header>
          <EnergyUsageEstimator />
        </article>
      </main>
    </>
  );
};

export default EnergyUsageEstimatorPage;