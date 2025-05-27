
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import EnhancedTokenSpeedSimulator from "./EnhancedTokenSpeedSimulator";

const TokenSpeedSimulator: React.FC = () => {
  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <EnhancedTokenSpeedSimulator />
      </CardContent>
    </Card>
  );
};

export default TokenSpeedSimulator;
