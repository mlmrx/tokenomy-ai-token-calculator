
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" }
];

const LanguageSelector = () => {
  const { toast } = useToast();
  const [language, setLanguage] = useState("en");

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: "Language Changed",
      description: `Interface language changed to ${languages.find(lang => lang.code === value)?.name}.`,
    });
  };

  return (
    <Card id="language-selector" className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Choose Your Language</CardTitle>
        <CardDescription>
          Select your preferred interface language
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default LanguageSelector;
