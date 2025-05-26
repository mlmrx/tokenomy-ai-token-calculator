
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface EnhancedSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
  unit?: string;
  formatValue?: (value: number) => string;
}

const EnhancedSlider: React.FC<EnhancedSliderProps> = ({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  tooltip,
  unit = "",
  formatValue
}) => {
  const displayValue = formatValue ? formatValue(value) : value.toLocaleString();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{label}</Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="text-sm font-semibold text-primary">
          {displayValue} {unit}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([newValue]) => onValueChange(newValue)}
        max={max}
        min={min}
        step={step}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default EnhancedSlider;
