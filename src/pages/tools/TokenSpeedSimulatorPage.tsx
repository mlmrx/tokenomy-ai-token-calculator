import React from "react";
import { Helmet } from "react-helmet-async";
import TokenSpeedSimulator from "../../components/TokenSpeedSimulator";

const TokenSpeedSimulatorPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Token Speed Simulator",
    "description": "Simulate and compare AI token processing speeds across ChatGPT, Claude, GPT-4, and other LLMs. Optimize response times and throughput.",
    "url": "https://tokenomy.app/tools/token-speed-simulator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser"
  };

  return (
    <>
      <Helmet>
        <title>AI Token Speed Simulator | LLM Performance Comparison Tool</title>
        <meta name="description" content="Simulate AI token processing speeds for ChatGPT, Claude, GPT-4, and 50+ LLM models. Compare response times, throughput, and optimize AI performance." />
        <meta name="keywords" content="AI token speed, LLM performance simulator, ChatGPT speed test, Claude performance, GPT-4 throughput, AI response time, token processing speed, LLM benchmark, artificial intelligence speed test" />
        
        <meta property="og:title" content="AI Token Speed Simulator | LLM Performance Tool" />
        <meta property="og:description" content="Simulate and compare AI token processing speeds across multiple LLM models." />
        <meta property="og:url" content="https://tokenomy.app/tools/token-speed-simulator" />
        
        <link rel="canonical" href="https://tokenomy.app/tools/token-speed-simulator" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main className="min-h-screen">
        <article>
          <header>
            <h1 className="sr-only">AI Token Speed Simulator - Compare LLM Performance</h1>
          </header>
          <TokenSpeedSimulator />
        </article>
      </main>
    </>
  );
};

export default TokenSpeedSimulatorPage;