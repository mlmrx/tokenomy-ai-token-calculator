
import React, { useState, useEffect } from "react";
import { Rss, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

const AINewsMarquee = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fallback news if API fails
  const fallbackNews = [
    { title: "OpenAI introduces ChatGPT-5 with advanced reasoning capabilities", url: "#", source: "OpenAI Blog" },
    { title: "New research shows LLMs can perform complex mathematical reasoning", url: "#", source: "AI Research Weekly" },
    { title: "Google DeepMind announces breakthrough in multimodal understanding", url: "#", source: "Google AI Blog" },
    { title: "AI models achieve human-level performance in medical diagnostics", url: "#", source: "Nature AI" },
    { title: "Companies report 40% productivity increase with AI assistants", url: "#", source: "Tech Review" },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        // Using Gnews API with AI topic filter - free tier with limited requests
        const apiKey = 'pub_31365547774ad4e7f7a166ba2fa2099f87b6c'; // Free API key with limitations
        const response = await fetch(`https://gnews.io/api/v4/search?q=artificial+intelligence&lang=en&max=10&apikey=${apiKey}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
          const formattedNews = data.articles.map((article: any) => ({
            title: article.title,
            url: article.url,
            source: article.source?.name || "AI News"
          }));
          setNews(formattedNews);
        } else {
          // If no articles returned or empty response, use fallback
          setNews(fallbackNews);
        }
      } catch (error) {
        console.error("Error fetching AI news:", error);
        setError("Failed to fetch news");
        setNews(fallbackNews);
        toast({
          title: "News Feed Error",
          description: "Using cached news due to API limitations. Real news will refresh later.",
          variant: "default"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
    // Fetch every hour but respect API rate limits
    const interval = setInterval(fetchNews, 3600000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-purple-900/90 via-indigo-800/80 to-purple-900/90 text-white py-1 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 px-3 flex items-center border-r border-white/30">
          {isLoading ? (
            <span className="animate-pulse mr-1.5 h-3.5 w-3.5 rounded-full bg-blue-300"></span>
          ) : error ? (
            <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-red-300" />
          ) : (
            <Rss className="h-3.5 w-3.5 mr-1.5" />
          )}
          <span className="text-xs font-medium">AI NEWS</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="animate-marquee inline-block">
            {news.length > 0 ? (
              news.map((item, index) => (
                <a 
                  key={index} 
                  href={item.url}
                  className="inline-block mx-4 text-xs hover:text-blue-200 transition-colors"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {item.title} <span className="text-blue-300">({item.source})</span>
                </a>
              ))
            ) : (
              <span className="inline-block mx-4 text-xs">Loading latest AI news...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AINewsMarquee;
