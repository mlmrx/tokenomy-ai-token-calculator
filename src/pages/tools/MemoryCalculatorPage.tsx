import React from "react";
import { Helmet } from "react-helmet-async";
import MemoryCalculator from "../../components/MemoryCalculator";

const MemoryCalculatorPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Memory Calculator",
    "description": "Calculate memory requirements for AI model inference and training. Optimize GPU memory usage for ChatGPT, Claude, LLaMA, and custom models.",
    "url": "https://tokenomy.app/tools/memory-calculator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser"
  };

  return (
    <>
      <Helmet>
        <title>AI Memory Calculator | GPU Memory Requirements for LLM Models</title>
        <meta name="description" content="Calculate memory requirements for AI model inference and training. Optimize GPU memory usage for ChatGPT, Claude, LLaMA, and custom LLM models." />
        <meta name="keywords" content="AI memory calculator, GPU memory requirements, LLM memory usage, ChatGPT memory, Claude memory, AI model memory, GPU optimization, VRAM calculator, machine learning memory, AI hardware requirements" />
        
        <meta property="og:title" content="AI Memory Calculator | GPU Memory Requirements" />
        <meta property="og:description" content="Calculate memory requirements for AI model inference and training across different configurations." />
        <meta property="og:url" content="https://tokenomy.app/tools/memory-calculator" />
        
        <link rel="canonical" href="https://tokenomy.app/tools/memory-calculator" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main className="min-h-screen">
        <article>
          <header>
            <h1 className="sr-only">AI Memory Calculator - Calculate GPU Memory Requirements</h1>
          </header>
          <MemoryCalculator />
        </article>
      </main>
    </>
  );
};

export default MemoryCalculatorPage;