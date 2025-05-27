
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, Trash2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserAppData {
  app_name: string;
  tokens_per_month: number;
  max_tokens_per_second: number;
  tokens_per_query_avg: number;
  cost_per_million_tokens: number;
  kwh_per_million_tokens: number;
  co2_grams_per_million_tokens: number;
}

const UserDataUpload = () => {
  const [appData, setAppData] = useState<UserAppData>({
    app_name: '',
    tokens_per_month: 0,
    max_tokens_per_second: 0,
    tokens_per_query_avg: 0,
    cost_per_million_tokens: 0,
    kwh_per_million_tokens: 0,
    co2_grams_per_million_tokens: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [ranking, setRanking] = useState<number | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof UserAppData, value: string) => {
    setAppData(prev => ({
      ...prev,
      [field]: field === 'app_name' ? value : parseFloat(value) || 0
    }));
  };

  const calculateRanking = () => {
    if (!appData.app_name || appData.tokens_per_month <= 0) {
      toast({
        title: "Incomplete Data",
        description: "Please fill in at least the app name and tokens per month.",
        variant: "destructive",
      });
      return;
    }

    // Simulate ranking calculation based on tokens per month
    const baseRanking = appData.tokens_per_month >= 1e12 ? 1 : 
                       appData.tokens_per_month >= 1e11 ? 2 :
                       appData.tokens_per_month >= 1e10 ? 3 :
                       appData.tokens_per_month >= 1e9 ? 4 : 5;
    
    setRanking(baseRanking);
    
    toast({
      title: "Ranking Calculated!",
      description: `${appData.app_name} would rank #${baseRanking} in the leaderboard.`,
    });
  };

  const exportEmbedCode = () => {
    const embedCode = `<iframe 
  src="https://tokenomy.ai/embed/leaderboard?app=${encodeURIComponent(appData.app_name)}" 
  width="400" 
  height="300" 
  frameborder="0">
</iframe>`;

    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed Code Copied!",
      description: "The embed code has been copied to your clipboard.",
    });
  };

  const formatNumber = (num: number, decimals = 1) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(decimals)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const clearData = () => {
    setAppData({
      app_name: '',
      tokens_per_month: 0,
      max_tokens_per_second: 0,
      tokens_per_query_avg: 0,
      cost_per_million_tokens: 0,
      kwh_per_million_tokens: 0,
      co2_grams_per_million_tokens: 0,
    });
    setRanking(null);
    setShowForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          My App vs AI Giants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Enter your app's token usage data to see how it compares with industry leaders. 
            Data is processed locally and not stored permanently.
          </AlertDescription>
        </Alert>

        {!showForm ? (
          <div className="text-center space-y-4">
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Add My App Data
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="app_name">App Name</Label>
                <Input
                  id="app_name"
                  value={appData.app_name}
                  onChange={(e) => handleInputChange('app_name', e.target.value)}
                  placeholder="My AI App"
                />
              </div>
              
              <div>
                <Label htmlFor="tokens_per_month">Tokens per Month</Label>
                <Input
                  id="tokens_per_month"
                  type="number"
                  value={appData.tokens_per_month || ''}
                  onChange={(e) => handleInputChange('tokens_per_month', e.target.value)}
                  placeholder="1000000000"
                />
              </div>
              
              <div>
                <Label htmlFor="max_tokens_per_second">Max TPS</Label>
                <Input
                  id="max_tokens_per_second"
                  type="number"
                  value={appData.max_tokens_per_second || ''}
                  onChange={(e) => handleInputChange('max_tokens_per_second', e.target.value)}
                  placeholder="100"
                />
              </div>
              
              <div>
                <Label htmlFor="cost_per_million_tokens">Cost per Million Tokens ($)</Label>
                <Input
                  id="cost_per_million_tokens"
                  type="number"
                  step="0.01"
                  value={appData.cost_per_million_tokens || ''}
                  onChange={(e) => handleInputChange('cost_per_million_tokens', e.target.value)}
                  placeholder="5.00"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateRanking} className="flex-1">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Ranking
              </Button>
              <Button variant="outline" onClick={clearData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {ranking && appData.app_name && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <Badge variant="default" className="text-lg px-3 py-1">
                  Rank #{ranking}
                </Badge>
                <h3 className="font-semibold">{appData.app_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatNumber(appData.tokens_per_month)} tokens/month • 
                  {appData.max_tokens_per_second > 0 && ` ${formatNumber(appData.max_tokens_per_second, 0)} TPS • `}
                  ${appData.cost_per_million_tokens}/1M tokens
                </p>
                
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={exportEmbedCode}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Embed Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default UserDataUpload;
