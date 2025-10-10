import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface ComparisonCardProps {
  title: string;
  description?: string;
  metrics: Array<{
    label: string;
    value: string;
    highlight?: boolean;
  }>;
  pros: string[];
  cons: string[];
  badges?: Array<{
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }>;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  description,
  metrics,
  pros,
  cons,
  badges = []
}) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((badge, idx) => (
              <Badge key={idx} variant={badge.variant || "secondary"}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                metric.highlight
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted"
              }`}
            >
              <div className="text-xs text-muted-foreground">{metric.label}</div>
              <div className="font-semibold mt-1">{metric.value}</div>
            </div>
          ))}
        </div>

        {/* Pros */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
            Advantages
          </h4>
          <ul className="space-y-1">
            {pros.slice(0, 3).map((pro, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">
            Limitations
          </h4>
          <ul className="space-y-1">
            {cons.slice(0, 3).map((con, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonCard;
