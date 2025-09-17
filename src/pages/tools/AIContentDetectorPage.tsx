import React from "react";
import { Helmet } from "react-helmet-async";
import AIContentDetector from "../../components/AIContentDetector";

const AIContentDetectorPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Content Detector",
    "description": "Detect AI-generated content from ChatGPT, Claude, GPT-4, and other AI models. Free AI detection tool for text analysis and content verification.",
    "url": "https://tokenomy.app/tools/ai-content-detector",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser"
  };

  return (
    <>
      <Helmet>
        <title>AI Content Detector | Free ChatGPT & Claude Detection Tool</title>
        <meta name="description" content="Detect AI-generated content from ChatGPT, Claude, GPT-4, and other AI models. Free AI detection tool for educators, writers, and content creators." />
        <meta name="keywords" content="AI content detector, ChatGPT detector, Claude detection, GPT-4 detector, AI generated text, AI content checker, plagiarism detector, artificial intelligence detection, AI writing detector" />
        
        <meta property="og:title" content="AI Content Detector | Free AI Detection Tool" />
        <meta property="og:description" content="Detect AI-generated content from ChatGPT, Claude, GPT-4, and other AI models." />
        <meta property="og:url" content="https://tokenomy.app/tools/ai-content-detector" />
        
        <link rel="canonical" href="https://tokenomy.app/tools/ai-content-detector" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main className="min-h-screen">
        <article>
          <header>
            <h1 className="sr-only">AI Content Detector - Detect ChatGPT and Claude Generated Text</h1>
          </header>
          <AIContentDetector />
        </article>
      </main>
    </>
  );
};

export default AIContentDetectorPage;