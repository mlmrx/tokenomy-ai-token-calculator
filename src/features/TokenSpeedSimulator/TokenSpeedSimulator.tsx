import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, FileText, MessageSquare, User, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, icon: Icon, color }) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">
          {unit}
        </p>
      </CardContent>
    </Card>
  );
};

const TokenSpeedSimulator = () => {
  const [tokensPerSecond, setTokensPerSecond] = useState(25);
  const [textLength, setTextLength] = useState(1000);
  const [timeToProcess, setTimeToProcess] = useState(0);

  useEffect(() => {
    // Calculate time to process based on tokens per second and text length
    setTimeToProcess(textLength / tokensPerSecond);
  }, [tokensPerSecond, textLength]);

  return (
    <div className="space-y-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Simulator Controls</CardTitle>
          <CardDescription>Adjust the parameters to simulate token processing speed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <div className="text-sm font-medium">Tokens per Second</div>
              <div className="flex items-center space-x-2">
                <Slider
                  defaultValue={[tokensPerSecond]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setTokensPerSecond(value[0])}
                />
                <Badge variant="secondary">{tokensPerSecond} tokens/sec</Badge>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Text Length (Tokens)</div>
              <div className="flex items-center space-x-2">
                <Slider
                  defaultValue={[textLength]}
                  max={5000}
                  step={100}
                  onValueChange={(value) => setTextLength(value[0])}
                />
                <Badge variant="secondary">{textLength} tokens</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Processing Time"
          value={timeToProcess.toFixed(2) as any}
          unit="seconds"
          icon={Timer}
        />
        <MetricCard
          title="Estimated Characters"
          value={(textLength * 3.5).toFixed(0) as any}
          unit="characters"
          icon={FileText}
        />
        <MetricCard
          title="Simulated Users"
          value={Math.floor(tokensPerSecond / 5) as any}
          unit="users"
          icon={User}
        />
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Progress Visualization</CardTitle>
          <CardDescription>Real-time simulation of token processing.</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(timeToProcess > 0 ? Math.min(100, (1 / timeToProcess) * 20) : 0)} />
          <p className="text-sm mt-2 text-muted-foreground">
            {timeToProcess > 0 ? `Estimated completion in ${timeToProcess.toFixed(2)} seconds.` : "Adjust parameters to start simulation."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export { TokenSpeedSimulator };
export default TokenSpeedSimulator;
