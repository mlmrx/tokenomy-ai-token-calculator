
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
import { Upload, Download, Database, FileText, Globe, Settings, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface DataImportPanelProps {
  onDataImported: (data: any) => void;
}

const DataImportPanel: React.FC<DataImportPanelProps> = ({ onDataImported }) => {
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validateEndpoint = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('https://') || url.startsWith('http://');
    } catch {
      return false;
    }
  };

  const validateDataFields = (data: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredFields = ['timestamp', 'provider', 'model', 'tokens_input', 'tokens_output', 'cost_usd'];
    
    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false, errors: ['Data must be a non-empty array'] };
    }

    const sampleRecord = data[0];
    requiredFields.forEach(field => {
      if (!(field in sampleRecord)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate data types
    if (sampleRecord.timestamp && !Date.parse(sampleRecord.timestamp)) {
      errors.push('Invalid timestamp format. Use ISO 8601 format.');
    }

    if (sampleRecord.tokens_input && isNaN(Number(sampleRecord.tokens_input))) {
      errors.push('tokens_input must be a number');
    }

    if (sampleRecord.tokens_output && isNaN(Number(sampleRecord.tokens_output))) {
      errors.push('tokens_output must be a number');
    }

    if (sampleRecord.cost_usd && isNaN(Number(sampleRecord.cost_usd))) {
      errors.push('cost_usd must be a number');
    }

    return { valid: errors.length === 0, errors };
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);
    setValidationErrors([]);

    try {
      const text = await file.text();
      let data;

      // Simulate progress
      for (let i = 0; i <= 50; i += 10) {
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

      setImportProgress(75);

      // Validate data fields
      const validation = validateDataFields(data);
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }

      setImportProgress(100);
      onDataImported(data);
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${Array.isArray(data) ? data.length : 1} valid records`,
      });
    } catch (error) {
      setValidationErrors(prev => [...prev, error instanceof Error ? error.message : "Unknown error occurred"]);
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

  const testConnection = async () => {
    if (!apiEndpoint) {
      toast({
        title: "Missing Endpoint",
        description: "Please enter an API endpoint",
        variant: "destructive",
      });
      return;
    }

    if (!validateEndpoint(apiEndpoint)) {
      toast({
        title: "Invalid Endpoint",
        description: "Please enter a valid HTTPS URL",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus('testing');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(apiEndpoint, { 
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      setConnectionStatus('success');
      toast({
        title: "Connection Successful",
        description: "API endpoint is reachable and responding",
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAPIImport = async () => {
    if (connectionStatus !== 'success') {
      toast({
        title: "Test Connection First",
        description: "Please test the connection before importing data",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setValidationErrors([]);

    try {
      for (let i = 0; i <= 50; i += 20) {
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
      setImportProgress(75);

      // Validate imported data
      const validation = validateDataFields(Array.isArray(data) ? data : [data]);
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }

      setImportProgress(100);
      onDataImported(data);

      toast({
        title: "API Import Successful",
        description: "Successfully imported and validated data from API",
      });
    } catch (error) {
      setValidationErrors(prev => [...prev, error instanceof Error ? error.message : "Unknown error occurred"]);
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

    const templateData = {
      timestamp: '2024-01-01T10:00:00Z',
      provider: 'openai',
      model: 'gpt-4',
      model_version: '0613',
      request_id: 'req_123abc456def',
      tokens_input: 100,
      tokens_output: 150,
      cost_usd: 0.003,
      latency_ms: 1200,
      user_id: 'user123',
      session_id: 'session_456',
      application_name: 'my-ai-app',
      endpoint: '/v1/chat/completions',
      response_status: 200,
      error_code: null,
      error_message: null,
      temperature: 0.7,
      max_tokens: 200,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop_sequences: null,
      prompt_tokens: 100,
      completion_tokens: 150,
      total_tokens: 250,
      cached_tokens: 0,
      rate_limit_remaining: 4999,
      region: 'us-east-1',
      organization_id: 'org_123',
      team_id: 'team_456',
      billing_category: 'api_usage',
      cost_per_input_token: 0.00001,
      cost_per_output_token: 0.00002,
      context_length: 8192,
      request_timestamp: '2024-01-01T10:00:00.123Z',
      response_timestamp: '2024-01-01T10:00:01.323Z',
      user_agent: 'MyApp/1.0',
      ip_address: '192.168.1.1',
      country: 'US',
      tags: 'chat,production,gpt4',
      custom_metadata: '{"feature":"chat","experiment":"A"}',
      content_filter_results: null,
      safety_score: 0.95,
      quality_score: 0.88
    };

    switch (format) {
      case 'csv':
        const headers = Object.keys(templateData).join(',');
        const values = Object.values(templateData).map(v => v === null ? '' : v).join(',');
        content = headers + '\n' + values;
        filename = 'comprehensive_token_data_template.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify([templateData], null, 2);
        filename = 'comprehensive_token_data_template.json';
        mimeType = 'application/json';
        break;
      case 'tsv':
        const tsvHeaders = Object.keys(templateData).join('\t');
        const tsvValues = Object.values(templateData).map(v => v === null ? '' : v).join('\t');
        content = tsvHeaders + '\n' + tsvValues;
        filename = 'comprehensive_token_data_template.tsv';
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
      description: `Downloaded comprehensive ${filename} template with all observability fields`,
    });
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return null;
    }
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
                    Download Comprehensive Template
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

                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Validation Errors:</h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
                  <div className="flex gap-2">
                    <Input
                      id="api-endpoint"
                      placeholder="https://api.example.com/token-usage"
                      value={apiEndpoint}
                      onChange={(e) => {
                        setApiEndpoint(e.target.value);
                        setConnectionStatus('idle');
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={testConnection}
                      disabled={!apiEndpoint || connectionStatus === 'testing'}
                    >
                      {getConnectionStatusIcon()}
                      {connectionStatus === 'testing' ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
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

                {connectionStatus === 'success' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      ✓ Connection verified. Ready to import data.
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleAPIImport} 
                  disabled={isImporting || connectionStatus !== 'success'}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Import from API
                </Button>

                {validationErrors.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Import Errors:</h4>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
                  { name: 'OpenAI', icon: '🤖', status: 'available', endpoint: 'https://api.openai.com/v1/usage' },
                  { name: 'Google Gemini', icon: '🔷', status: 'available', endpoint: 'https://generativelanguage.googleapis.com/v1/usage' },
                  { name: 'Microsoft Azure', icon: '☁️', status: 'available', endpoint: 'https://management.azure.com/subscriptions/{}/providers/Microsoft.CognitiveServices/usage' },
                  { name: 'AWS Bedrock', icon: '🛡️', status: 'available', endpoint: 'https://bedrock.{region}.amazonaws.com/usage' },
                  { name: 'Salesforce', icon: '☁️', status: 'coming-soon', endpoint: 'https://api.salesforce.com/einstein/usage' },
                  { name: 'Anthropic', icon: '🧠', status: 'available', endpoint: 'https://api.anthropic.com/v1/usage' },
                ].map((integration) => (
                  <Card key={integration.name} className="p-4">
                    <div className="flex items-center justify-between mb-3">
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
                      <>
                        <p className="text-xs text-muted-foreground mb-3 font-mono break-all">
                          {integration.endpoint}
                        </p>
                        <Button size="sm" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required Fields</h4>
              <div className="flex flex-wrap gap-2">
                {['timestamp', 'provider', 'model', 'tokens_input', 'tokens_output', 'cost_usd'].map(field => (
                  <Badge key={field} variant="default">{field}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Optional Enhanced Fields</h4>
              <div className="flex flex-wrap gap-2">
                {['latency_ms', 'user_id', 'session_id', 'request_id', 'model_version', 'temperature', 'max_tokens', 'error_code', 'region', 'quality_score'].map(field => (
                  <Badge key={field} variant="outline">{field}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataImportPanel;
