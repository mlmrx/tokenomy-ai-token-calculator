
import React, { useState, useEffect } from "react";
import { Rss } from "lucide-react";

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

const AINewsMarquee = () => {
  const [news, setNews] = useState<NewsItem[]>([
    { title: "OpenAI introduces ChatGPT-5 with advanced reasoning capabilities", url: "#", source: "OpenAI Blog" },
    { title: "New research shows LLMs can perform complex mathematical reasoning", url: "#", source: "AI Research Weekly" },
    { title: "Google DeepMind announces breakthrough in multimodal understanding", url: "#", source: "Google AI Blog" },
    { title: "AI models achieve human-level performance in medical diagnostics", url: "#", source: "Nature AI" },
    { title: "Companies report 40% productivity increase with AI assistants", url: "#", source: "Tech Review" },
    { title: "Anthropic releases new Claude model with improved coding abilities", url: "#", source: "Anthropic" },
    { title: "Researchers develop new method to reduce hallucinations in LLMs", url: "#", source: "arXiv" },
  ]);
  
  // In a real app, this would fetch news from an API
  // useEffect(() => {
  //   const fetchNews = async () => {
  //     try {
  //       const response = await fetch('https://api.example.com/ai-news');
  //       const data = await response.json();
  //       setNews(data.news);
  //     } catch (error) {
  //       console.error('Error fetching news:', error);
  //     }
  //   };
  //   
  //   fetchNews();
  //   const interval = setInterval(fetchNews, 3600000); // Refresh every hour
  //   
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className="w-full bg-gradient-to-r from-purple-900/90 via-indigo-800/80 to-purple-900/90 text-white py-1 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 px-3 flex items-center border-r border-white/30">
          <Rss className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium">AI NEWS</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-marquee inline-block">
            {news.map((item, index) => (
              <a 
                key={index} 
                href={item.url}
                className="inline-block mx-4 text-xs hover:text-blue-200 transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                {item.title} <span className="text-blue-300">({item.source})</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AINewsMarquee;
