import React from "react";
import { Helmet } from "react-helmet-async";
import TokenCalculator from "../../components/TokenCalculator";

const TokenCalculatorPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Token Calculator",
    "description": "Free online AI token calculator for ChatGPT, Claude, GPT-4, and other LLM models. Calculate costs, estimate usage, and optimize AI expenses.",
    "url": "https://tokenomy.app/tools/token-calculator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "Tokenomy"
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Token Calculator | Free LLM Cost Calculator for ChatGPT, Claude, GPT-4</title>
        <meta name="description" content="Calculate AI token costs for ChatGPT, Claude, GPT-4, and 50+ LLM models. Free token counter, cost estimator, and usage optimizer for developers and businesses." />
        <meta name="keywords" content="AI token calculator, LLM cost calculator, ChatGPT token counter, Claude token calculator, GPT-4 pricing, OpenAI cost estimator, AI model pricing, token cost analysis, LLM usage calculator, artificial intelligence pricing tool" />
        
        {/* Open Graph */}
        <meta property="og:title" content="AI Token Calculator | Free LLM Cost Calculator" />
        <meta property="og:description" content="Calculate AI token costs for ChatGPT, Claude, GPT-4, and 50+ LLM models. Free token counter and cost estimator." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tokenomy.app/tools/token-calculator" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Token Calculator | Free LLM Cost Calculator" />
        <meta name="twitter:description" content="Calculate AI token costs for ChatGPT, Claude, GPT-4, and 50+ LLM models." />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://tokenomy.app/tools/token-calculator" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main className="min-h-screen">
        <article>
          <header>
            <h1 className="sr-only">AI Token Calculator - Calculate LLM Costs for ChatGPT, Claude, GPT-4</h1>
          </header>
          <TokenCalculator />
        </article>
      </main>
    </>
  );
};

export default TokenCalculatorPage;