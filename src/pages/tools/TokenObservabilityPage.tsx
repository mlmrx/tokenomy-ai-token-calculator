import React from "react";
import { Helmet } from "react-helmet-async";
import TokenObservability from "../TokenObservability";

const TokenObservabilityPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Token Observability Dashboard",
    "description": "Monitor AI token usage, track LLM performance metrics, and optimize AI costs with real-time observability tools for ChatGPT, Claude, and GPT-4.",
    "url": "https://tokenomy.app/tools/token-observability",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Token Observability Dashboard | LLM Monitoring & Analytics</title>
        <meta name="description" content="Monitor AI token usage, track LLM performance metrics, and optimize costs with real-time observability dashboard for ChatGPT, Claude, GPT-4, and enterprise AI models." />
        <meta name="keywords" content="AI token monitoring, LLM observability, ChatGPT analytics, Claude monitoring, GPT-4 metrics, AI performance tracking, token usage analytics, LLM cost optimization, AI model monitoring, artificial intelligence dashboard" />
        
        <meta property="og:title" content="AI Token Observability Dashboard | LLM Monitoring" />
        <meta property="og:description" content="Monitor AI token usage and track LLM performance with real-time observability tools." />
        <meta property="og:url" content="https://tokenomy.app/tools/token-observability" />
        
        <meta name="twitter:title" content="AI Token Observability Dashboard" />
        <meta name="twitter:description" content="Monitor AI token usage and track LLM performance with real-time observability tools." />
        
        <link rel="canonical" href="https://tokenomy.app/tools/token-observability" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main className="min-h-screen">
        <article>
          <header>
            <h1 className="sr-only">AI Token Observability Dashboard - Monitor LLM Performance</h1>
          </header>
          <TokenObservability />
        </article>
      </main>
    </>
  );
};

export default TokenObservabilityPage;