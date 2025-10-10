import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { providerModels, providerCategories, useCaseProfiles } from "@/lib/providerData";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, TrendingDown, Zap, Award } from "lucide-react";

const MultiProviderComparator: React.FC = () => {
  const [inputTokens, setInputTokens] = useState(1000);
  const [outputTokens, setOutputTokens] = useState(500);
  const [requestsPerDay, setRequestsPerDay] = useState(10000);
  const [selectedProvider, setSelectedProvider] = useState("All Providers");
  const [sortBy, setSortBy] = useState<"cost" | "speed" | "quality">("cost");

  const calculations = useMemo(() => {
    const filtered = selectedProvider === "All Providers" 
      ? providerModels 
      : providerModels.filter(m => m.provider === selectedProvider);

    return filtered.map(model => {
      const dailyCost = (
        (inputTokens / 1_000_000) * model.inputCostPer1M +
        (outputTokens / 1_000_000) * model.outputCostPer1M
      ) * requestsPerDay;

      const monthlyCost = dailyCost * 30;
      const yearlyCost = dailyCost * 365;
      const avgLatency = ((inputTokens + outputTokens) / model.speedTokensPerSec);

      return {
        ...model,
        dailyCost,
        monthlyCost,
        yearlyCost,
        avgLatency,
        costPerRequest: dailyCost / requestsPerDay
      };
    }).sort((a, b) => {
      if (sortBy === "cost") return a.monthlyCost - b.monthlyCost;
      if (sortBy === "speed") return a.avgLatency - b.avgLatency;
      return b.qualityScore - a.qualityScore;
    });
  }, [inputTokens, outputTokens, requestsPerDay, selectedProvider, sortBy]);

  const cheapest = calculations[0];
  const savings = calculations.map(c => ({
    model: c.model,
    provider: c.provider,
    savings: ((c.monthlyCost - cheapest.monthlyCost) / c.monthlyCost * 100).toFixed(0)
  }));

  const loadUseCase = (profile: typeof useCaseProfiles[0]) => {
    setInputTokens(profile.inputTokens);
    setOutputTokens(profile.outputTokens);
    setRequestsPerDay(profile.requestsPerDay);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Workload</CardTitle>
          <CardDescription>Enter your expected usage to compare costs across providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Use Case Presets */}
          <div>
            <Label>Quick Start: Load Use Case</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {useCaseProfiles.map(profile => (
                <Badge
                  key={profile.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => loadUseCase(profile)}
                >
                  {profile.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Input Tokens per Request</Label>
              <Input
                type="number"
                value={inputTokens}
                onChange={(e) => setInputTokens(Number(e.target.value))}
                className="mt-1"
              />
              <Slider
                value={[inputTokens]}
                onValueChange={([v]) => setInputTokens(v)}
                min={10}
                max={50000}
                step={10}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Output Tokens per Request</Label>
              <Input
                type="number"
                value={outputTokens}
                onChange={(e) => setOutputTokens(Number(e.target.value))}
                className="mt-1"
              />
              <Slider
                value={[outputTokens]}
                onValueChange={([v]) => setOutputTokens(v)}
                min={10}
                max={10000}
                step={10}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Requests per Day</Label>
              <Input
                type="number"
                value={requestsPerDay}
                onChange={(e) => setRequestsPerDay(Number(e.target.value))}
                className="mt-1"
              />
              <Slider
                value={[requestsPerDay]}
                onValueChange={([v]) => setRequestsPerDay(v)}
                min={100}
                max={100000}
                step={100}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Filter by Provider</Label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providerCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost">Lowest Cost</SelectItem>
                  <SelectItem value="speed">Fastest Speed</SelectItem>
                  <SelectItem value="quality">Highest Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              Cheapest Option
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cheapest?.model}</div>
            <div className="text-sm text-muted-foreground">{cheapest?.provider}</div>
            <div className="text-lg font-semibold text-green-600 mt-2">
              ${cheapest?.monthlyCost.toFixed(2)}/mo
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Fastest Option
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...calculations].sort((a, b) => a.avgLatency - b.avgLatency)[0]?.model}
            </div>
            <div className="text-sm text-muted-foreground">
              {[...calculations].sort((a, b) => a.avgLatency - b.avgLatency)[0]?.provider}
            </div>
            <div className="text-lg font-semibold text-blue-600 mt-2">
              {[...calculations].sort((a, b) => a.avgLatency - b.avgLatency)[0]?.avgLatency.toFixed(1)}s latency
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              Best Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...calculations].sort((a, b) => b.qualityScore - a.qualityScore)[0]?.model}
            </div>
            <div className="text-sm text-muted-foreground">
              {[...calculations].sort((a, b) => b.qualityScore - a.qualityScore)[0]?.provider}
            </div>
            <div className="text-lg font-semibold text-purple-600 mt-2">
              {[...calculations].sort((a, b) => b.qualityScore - a.qualityScore)[0]?.qualityScore}/10 quality
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Detailed Cost Comparison
          </CardTitle>
          <CardDescription>
            All costs shown are estimates. Actual costs may vary based on caching, batching, and provider discounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>Avg Latency</TableHead>
                  <TableHead className="text-right">Daily Cost</TableHead>
                  <TableHead className="text-right">Monthly Cost</TableHead>
                  <TableHead className="text-right">Yearly Cost</TableHead>
                  <TableHead>vs Cheapest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calc) => (
                  <TableRow key={calc.id}>
                    <TableCell className="font-medium">{calc.provider}</TableCell>
                    <TableCell>{calc.model}</TableCell>
                    <TableCell>
                      <Badge variant={calc.qualityScore >= 9 ? "default" : "secondary"}>
                        {calc.qualityScore}/10
                      </Badge>
                    </TableCell>
                    <TableCell>{calc.avgLatency.toFixed(2)}s</TableCell>
                    <TableCell className="text-right">${calc.dailyCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${calc.monthlyCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">${calc.yearlyCost.toFixed(0)}</TableCell>
                    <TableCell>
                      {calc.id === cheapest.id ? (
                        <Badge className="bg-green-600">Cheapest</Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          +{((calc.monthlyCost - cheapest.monthlyCost) / cheapest.monthlyCost * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiProviderComparator;
