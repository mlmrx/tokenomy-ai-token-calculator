
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, FileDown, FileJson } from "lucide-react";

interface ExportDataProps {
  data: any;
}

const ExportData = ({ data }: ExportDataProps) => {
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
          <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => handleExport('json')}>
            <FileJson size={24} />
            <span>JSON</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => handleExport('csv')}>
            <FileDown size={24} />
            <span>CSV</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4" onClick={() => handleExport('pdf')}>
            <FileText size={24} />
            <span>PDF</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportData;
