
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Language {
  name: string;
  code: string;
  flag: string;
}

const languageOptions: Language[] = [
  { name: "English", code: "en", flag: "🇺🇸" },
  { name: "Español", code: "es", flag: "🇪🇸" },
  { name: "Français", code: "fr", flag: "🇫🇷" },
  { name: "Deutsch", code: "de", flag: "🇩🇪" },
  { name: "中文", code: "zh", flag: "🇨🇳" },
  { name: "日本語", code: "ja", flag: "🇯🇵" },
  { name: "Português", code: "pt", flag: "🇵🇹" },
  { name: "Italiano", code: "it", flag: "🇮🇹" },
  { name: "Русский", code: "ru", flag: "🇷🇺" },
  { name: "العربية", code: "ar", flag: "🇸🇦" },
  { name: "हिन्दी", code: "hi", flag: "🇮🇳" },
  { name: "한국어", code: "ko", flag: "🇰🇷" },
];

// Mock translation function that would normally call a translation API
const translateText = async (text: string, targetLang: string): Promise<string> => {
  // In a real implementation, this would call a translation API
  // For demo purposes, we're returning a simple placeholder
  if (targetLang === "en") return text;
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock translated text (in a real app, this would come from the API)
  return `[${targetLang.toUpperCase()}] ${text}`;
};

const LanguageSelector = () => {
  const { toast } = useToast();
  const [currentLang, setCurrentLang] = useState<Language>(languageOptions[0]);
  const [translating, setTranslating] = useState(false);

  const handleLanguageChange = async (language: Language) => {
    if (language.code === currentLang.code) return;
    
    setTranslating(true);
    toast({
      title: "Changing Language",
      description: `Translating content to ${language.name}...`,
    });
    
    try {
      // This would be where we translate all visible text elements in the app
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, button, a, label, span');
      
      // For demo purposes, we're just simulating the translation of headers and some visible elements
      await Promise.all([...textElements].map(async (el) => {
        if (el.textContent && !el.textContent.startsWith('[') && el.textContent.trim().length > 0) {
          const originalText = el.textContent;
          if (originalText.length > 1) {
            const translatedText = await translateText(originalText, language.code);
            el.textContent = translatedText;
            // Store original text for reverting if needed
            el.setAttribute('data-original-text', originalText);
          }
        }
      }));
      
      setCurrentLang(language);
      toast({
        title: "Language Changed",
        description: `The application is now displayed in ${language.name}.`,
      });
    } catch (error) {
      toast({
        title: "Translation Error",
        description: "There was a problem changing the language. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Card id="language-selector" className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          <CardTitle>Change Language</CardTitle>
        </div>
        <CardDescription>
          Select your preferred language for the application interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {languageOptions.map((language) => (
            <Button
              key={language.code}
              variant={currentLang.code === language.code ? "default" : "outline"}
              className="justify-start gap-2 h-auto py-2"
              onClick={() => handleLanguageChange(language)}
              disabled={translating}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </Button>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Translation powered by machine translation. Some elements may not be fully translated.
        </p>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
