
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrendsChart from "./TrendsChart";
import { TrendingUp, BarChart3, DollarSign, Leaf, Calendar } from "lucide-react";

const TrendsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historical Performance Trends
            </CardTitle>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-700">+12.5%</div>
              <div className="text-sm text-blue-600">Avg Volume Growth</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-700">+8.3%</div>
              <div className="text-sm text-green-600">Speed Improvements</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold text-amber-700">-5.2%</div>
              <div className="text-sm text-amber-600">Cost Reduction</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
              <Leaf className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold text-emerald-700">-3.8%</div>
              <div className="text-sm text-emerald-600">Energy Efficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Volume
          </TabsTrigger>
          <TabsTrigger value="tps" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Speed
          </TabsTrigger>
          <TabsTrigger value="cost" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cost
          </TabsTrigger>
          <TabsTrigger value="efficiency" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Efficiency
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tokens">
          <TrendsChart metric="tokens" timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="tps">
          <TrendsChart metric="tps" timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="cost">
          <TrendsChart metric="cost" timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="efficiency">
          <TrendsChart metric="efficiency" timeRange={timeRange} />
        </TabsContent>
      </Tabs>

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">Trending</Badge>
              <div>
                <h4 className="font-medium text-blue-900">Google leads in processing volume</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Google has maintained the highest token processing volume for the past 30 days, 
                  with consistent growth in their Gemini model usage.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <Badge variant="secondary" className="bg-green-100 text-green-700">Efficiency</Badge>
              <div>
                <h4 className="font-medium text-green-900">Meta shows best cost efficiency</h4>
                <p className="text-sm text-green-700 mt-1">
                  Meta's LLaMA models continue to offer the most cost-effective solutions, 
                  with 15% lower costs compared to the market average.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">Innovation</Badge>
              <div>
                <h4 className="font-medium text-purple-900">Speed improvements across the board</h4>
                <p className="text-sm text-purple-700 mt-1">
                  All major providers have increased their token processing speeds by an average of 8.3% 
                  over the last quarter through infrastructure optimizations.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrendsTab;
