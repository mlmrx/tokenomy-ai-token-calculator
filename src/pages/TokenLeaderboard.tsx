
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaderboardGrid from "@/components/leaderboard/LeaderboardGrid";
import LiveTicker from "@/components/leaderboard/LiveTicker";
import EnhancedComparePanel from "@/components/leaderboard/EnhancedComparePanel";
import UserDataUpload from "@/components/leaderboard/UserDataUpload";
import TrendsTab from "@/components/leaderboard/TrendsTab";
import { Trophy, TrendingUp, Zap, DollarSign } from "lucide-react";

const TokenLeaderboard = () => {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const handleVendorSelect = (vendorId: string) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter(id => id !== vendorId));
    } else if (selectedVendors.length < 3) {
      setSelectedVendors([...selectedVendors, vendorId]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              AI Token Leaderboard
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time comparison of AI providers' token processing capabilities, costs, and environmental impact
          </p>
          <Badge variant="secondary" className="text-sm">
            Live Data • Updated Every 6 Hours
          </Badge>
        </div>

        {/* Live Ticker */}
        <LiveTicker />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Leaderboard Table */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="leaderboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trends & Analytics
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  My App vs Giants
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard">
                <LeaderboardGrid 
                  onVendorSelect={handleVendorSelect}
                  selectedVendors={selectedVendors}
                />
              </TabsContent>

              <TabsContent value="trends">
                <TrendsTab />
              </TabsContent>

              <TabsContent value="upload">
                <UserDataUpload />
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Compare Panel */}
          <div className="lg:col-span-1">
            <EnhancedComparePanel 
              selectedVendors={selectedVendors}
              onClearSelection={() => setSelectedVendors([])}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">$3.20</div>
              <div className="text-sm text-muted-foreground">Avg Cost/Million</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">9,125</div>
              <div className="text-sm text-muted-foreground">Avg TPS</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">2.25T</div>
              <div className="text-sm text-muted-foreground">Avg Tokens/Month</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">4</div>
              <div className="text-sm text-muted-foreground">Active Vendors</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenLeaderboard;
