
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, Database, FileText, Globe, Settings } from "lucide-react";

interface DataImportPanelProps {
  onDataImported: (data: any) => void;
}

const DataImportPanel: React.FC<DataImportPanelProps> = ({ onDataImported }) => {
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    try {
      const text = await file.text();
      let data;

      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      switch (selectedFormat) {
        case 'csv':
          data = parseCSV(text);
          break;
        case 'json':
          data = JSON.parse(text);
          break;
        case 'tsv':
          data = parseTSV(text);
          break;
        default:
          throw new Error('Unsupported format');
      }

      onDataImported(data);
      toast({
        title: "Import Successful",
        description: `Successfully imported ${Array.isArray(data) ? data.length : 1} records`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  }, [selectedFormat, onDataImported, toast]);

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    });
  };

  const parseTSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split('\t').map(h => h.trim());
    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split('\t');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    });
  };

  const handleAPIImport = async () => {
    if (!apiEndpoint) {
      toast({
        title: "Missing Endpoint",
        description: "Please enter an API endpoint",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      for (let i = 0; i <= 100; i += 20) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(apiEndpoint, { headers });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      onDataImported(data);

      toast({
        title: "API Import Successful",
        description: "Successfully imported data from API",
      });
    } catch (error) {
      toast({
        title: "API Import Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const downloadTemplate = (format: string) => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = 'timestamp,provider,model,tokens_input,tokens_output,cost_usd,latency_ms,user_id\n2024-01-01T10:00:00Z,openai,gpt-4,100,150,0.003,1200,user123';
        filename = 'token_data_template.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify([{
          timestamp: '2024-01-01T10:00:00Z',
          provider: 'openai',
          model: 'gpt-4',
          tokens_input: 100,
          tokens_output: 150,
          cost_usd: 0.003,
          latency_ms: 1200,
          user_id: 'user123'
        }], null, 2);
        filename = 'token_data_template.json';
        mimeType = 'application/json';
        break;
      case 'tsv':
        content = 'timestamp\tprovider\tmodel\ttokens_input\ttokens_output\tcost_usd\tlatency_ms\tuser_id\n2024-01-01T10:00:00Z\topenai\tgpt-4\t100\t150\t0.003\t1200\tuser123';
        filename = 'token_data_template.tsv';
        mimeType = 'text/tab-separated-values';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: `Downloaded ${filename} template`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Import & Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="file">File Upload</TabsTrigger>
              <TabsTrigger value="api">API Import</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="format">File Format</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="tsv">TSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => downloadTemplate(selectedFormat)}
                    className="mt-6"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div>
                  <Label htmlFor="file-upload">Upload File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json,.tsv"
                    onChange={handleFileUpload}
                    disabled={isImporting}
                  />
                </div>

                {isImporting && (
                  <div className="space-y-2">
                    <Label>Import Progress</Label>
                    <Progress value={importProgress} />
                    <p className="text-sm text-muted-foreground">{importProgress}% complete</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input
                    id="api-endpoint"
                    placeholder="https://api.example.com/token-data"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter API key if required"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                <Button onClick={handleAPIImport} disabled={isImporting || !apiEndpoint}>
                  <Globe className="h-4 w-4 mr-2" />
                  Import from API
                </Button>

                {isImporting && (
                  <div className="space-y-2">
                    <Label>Import Progress</Label>
                    <Progress value={importProgress} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'OpenAI', icon: '🤖', status: 'available' },
                  { name: 'Google Gemini', icon: '🔷', status: 'available' },
                  { name: 'Microsoft Azure', icon: '☁️', status: 'available' },
                  { name: 'AWS Bedrock', icon: '🛡️', status: 'available' },
                  { name: 'Salesforce', icon: '☁️', status: 'coming-soon' },
                  { name: 'Anthropic', icon: '🧠', status: 'available' },
                ].map((integration) => (
                  <Card key={integration.name} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">Direct integration</p>
                        </div>
                      </div>
                      <Badge variant={integration.status === 'available' ? 'default' : 'secondary'}>
                        {integration.status === 'available' ? 'Available' : 'Coming Soon'}
                      </Badge>
                    </div>
                    {integration.status === 'available' && (
                      <Button size="sm" className="w-full mt-3">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImportPanel;
