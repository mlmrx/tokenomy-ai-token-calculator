import React from "react";
import { Helmet } from "react-helmet-async";
import TokenLeaderboard from "../TokenLeaderboard";

const TokenLeaderboardPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Token Leaderboard",
    "description": "Compare AI providers' token processing capabilities, costs, and performance. Real-time leaderboard for ChatGPT, Claude, GPT-4, and other LLMs.",
    "url": "https://tokenomy.app/tools/token-leaderboard",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser"
  };

  return (
    <>
      <Helmet>
        <title>AI Token Leaderboard | Compare ChatGPT vs Claude vs GPT-4 Performance</title>
        <meta name="description" content="Compare AI providers' token processing capabilities, costs, and performance. Real-time leaderboard ranking ChatGPT, Claude, GPT-4, and 50+ LLM models." />
        <meta name="keywords" content="AI leaderboard, LLM comparison, ChatGPT vs Claude, GPT-4 ranking, AI model comparison, token processing ranking, LLM performance comparison, AI provider comparison" />
        
        <meta property="og:title" content="AI Token Leaderboard | LLM Performance Comparison" />
        <meta property="og:description" content="Compare AI providers' token processing capabilities and performance in real-time." />
        <meta property="og:url" content="https://tokenomy.app/tools/token-leaderboard" />
        
        <link rel="canonical" href="https://tokenomy.app/tools/token-leaderboard" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <main className="min-h-screen">
        <article>
          <header>
            <h1 className="sr-only">AI Token Leaderboard - Compare LLM Performance</h1>
          </header>
          <TokenLeaderboard />
        </article>
      </main>
    </>
  );
};

export default TokenLeaderboardPage;