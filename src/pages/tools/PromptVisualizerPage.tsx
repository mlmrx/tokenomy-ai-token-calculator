import React from "react";
import { Helmet } from "react-helmet-async";
import PromptProcessingVisualizer from "../../components/PromptProcessingVisualizer";

const PromptVisualizerPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Prompt Processing Visualizer",
    "description": "Visualize AI prompt processing, tokenization, attention mechanisms, and neural network layers in real-time for ChatGPT, Claude, and GPT-4.",
    "url": "https://tokenomy.app/tools/prompt-visualizer",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser"
  };

  return (
    <>
      <Helmet>
        <title>AI Prompt Processing Visualizer | Neural Network Visualization Tool</title>
        <meta name="description" content="Visualize AI prompt processing, tokenization, attention mechanisms, and neural network layers in real-time. Deep dive into ChatGPT, Claude, and GPT-4 processing." />
        <meta name="keywords" content="AI prompt visualizer, neural network visualization, tokenization visualization, attention mechanism, transformer visualization, AI processing visualization, prompt engineering, LLM architecture" />
        
        <meta property="og:title" content="AI Prompt Processing Visualizer | Neural Network Tool" />
        <meta property="og:description" content="Visualize AI prompt processing and neural network layers in real-time." />
        <meta property="og:url" content="https://tokenomy.app/tools/prompt-visualizer" />
        
        <link rel="canonical" href="https://tokenomy.app/tools/prompt-visualizer" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main className="min-h-screen">
        <article>
          <header>
            <h1 className="sr-only">AI Prompt Processing Visualizer - Neural Network Visualization</h1>
          </header>
          <PromptProcessingVisualizer />
        </article>
      </main>
    </>
  );
};

export default PromptVisualizerPage;