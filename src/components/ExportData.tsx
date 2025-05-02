
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, FileDown, FileJson } from "lucide-react";

interface ExportDataProps {
  data: any;
  colorTheme?: any;
}

const ExportData = ({ data, colorTheme }: ExportDataProps) => {
  const { toast } = useToast();

  const handleExport = (format: string) => {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = 'token-calculator-data.json';
      mimeType = 'application/json';
    } else if (format === 'csv') {
      // Simple CSV conversion (would need improvement for complex data)
      const headers = Object.keys(data).join(',');
      const values = Object.values(data).join(',');
      content = `${headers}\n${values}`;
      filename = 'token-calculator-data.csv';
      mimeType = 'text/csv';
    } else { // pdf
      toast({
        title: "PDF Export",
        description: "PDF export would generate a formatted document.",
      });
      return;
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Data has been exported as ${format.toUpperCase()}.`,
    });
  };

  // Default theme colors if none provided
  const themeColors = colorTheme || {
    primary: "#8b5cf6",
    secondary: "#a78bfa",
    border: "#c4b5fd"
  };

  return (
    <Card id="export" className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Export your calculation results in various formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            className="flex flex-col items-center gap-2 h-auto py-4 transition-all hover:scale-105" 
            onClick={() => handleExport('json')}
            style={{
              borderColor: themeColors.border,
              color: themeColors.primary,
              background: `${themeColors.primary}10`
            }}
          >
            <FileJson size={24} />
            <span>JSON</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center gap-2 h-auto py-4 transition-all hover:scale-105" 
            onClick={() => handleExport('csv')}
            style={{
              borderColor: themeColors.border,
              color: themeColors.primary,
              background: `${themeColors.primary}10`
            }}
          >
            <FileDown size={24} />
            <span>CSV</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex flex-col items-center gap-2 h-auto py-4 transition-all hover:scale-105" 
            onClick={() => handleExport('pdf')}
            style={{
              borderColor: themeColors.border,
              color: themeColors.primary,
              background: `${themeColors.primary}10`
            }}
          >
            <FileText size={24} />
            <span>PDF</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportData;
