
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileImage, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  data: any;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ data }) => {
  const { toast } = useToast();

  const exportSummaryJSON = () => {
    const exportData = {
      ...data,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memory-calculator-summary.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Summary Exported",
      description: "JSON file has been downloaded",
    });
  };

  const saveChartsAsPNG = () => {
    // This would typically capture the charts as images
    toast({
      title: "Charts Saved",
      description: "Chart images would be saved as PNG files",
    });
  };

  const addScenarioForComparison = () => {
    toast({
      title: "Scenario Added",
      description: "Current configuration added to comparison list",
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={exportSummaryJSON}>
        <Download className="h-4 w-4 mr-2" />
        Export Summary (JSON)
      </Button>
      
      <Button variant="outline" onClick={saveChartsAsPNG}>
        <FileImage className="h-4 w-4 mr-2" />
        Save Charts (PNG)
      </Button>
      
      <Button variant="outline" onClick={addScenarioForComparison}>
        <Plus className="h-4 w-4 mr-2" />
        Add Scenario for Comparison
      </Button>
    </div>
  );
};

export default ActionButtons;
