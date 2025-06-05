
import React, { useState, useEffect } from "react";
import { Rss } from "lucide-react";

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

const AINewsMarquee = () => {
  const [news, setNews] = useState<NewsItem[]>([]);

  const apiUrl = import.meta.env.VITE_NEWS_API_URL ?? "/ai-news.json";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const items: NewsItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data.news)
            ? data.news
            : [];
        if (items.length > 0) {
          setNews(items);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 3600000);

    return () => clearInterval(interval);
  }, [apiUrl]);

  return (
    <div className="w-full bg-gradient-to-r from-blue-900/90 via-indigo-800/80 to-purple-900/90 text-white py-1 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 px-3 flex items-center border-r border-white/30">
          <Rss className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs font-medium">AI NEWS</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-marquee-slow inline-block">
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
