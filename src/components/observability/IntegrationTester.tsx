
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Play, Settings, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  authHeaders: Record<string, string>;
  validationRules?: {
    endpoint?: RegExp[];
    apiKey?: RegExp[];
    requiredParams?: string[];
  };
}

interface IntegrationTesterProps {
  integration: Integration;
}

const IntegrationTester: React.FC<IntegrationTesterProps> = ({ integration }) => {
  const [testConfig, setTestConfig] = useState({
    endpoint: integration.endpoint,
    method: 'GET',
    apiKey: '',
    customHeaders: '',
    requestBody: '',
    subscriptionId: '',
    location: ''
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');
  const { toast } = useToast();

  const getDefaultRequestBody = () => {
    switch (integration.provider) {
      case 'openai':
        return JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{"role": "user", "content": "Hello, test message"}],
          max_tokens: 50
        }, null, 2);
      case 'google':
        return JSON.stringify({
          contents: [{
            parts: [{ text: "Hello, test message" }]
          }]
        }, null, 2);
      case 'anthropic':
        return JSON.stringify({
          model: "claude-3-sonnet-20240229",
          max_tokens: 50,
          messages: [{"role": "user", "content": "Hello, test message"}]
        }, null, 2);
      case 'mistral':
        return JSON.stringify({
          model: "mistral-tiny",
          messages: [{"role": "user", "content": "Hello, test message"}],
          max_tokens: 50
        }, null, 2);
      case 'cohere':
        return JSON.stringify({
          message: "Hello, test message",
          model: "command"
        }, null, 2);
      case 'ai21':
        return JSON.stringify({
          messages: [{"role": "user", "content": "Hello, test message"}],
          system: "You are a helpful assistant."
        }, null, 2);
      default:
        return '{}';
    }
  };

  const getTestEndpoint = () => {
    switch (integration.provider) {
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      case 'google':
        return `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${testConfig.apiKey}`;
      case 'azure':
        return testConfig.endpoint.replace('{subscriptionId}', testConfig.subscriptionId).replace('{location}', testConfig.location);
      case 'anthropic':
        return 'https://api.anthropic.com/v1/messages';
      case 'mistral':
        return 'https://api.mistral.ai/v1/chat/completions';
      case 'cohere':
        return 'https://api.cohere.com/v1/chat';
      case 'ai21':
        return 'https://api.ai21.com/studio/v1/j2-ultra/chat';
      default:
        return testConfig.endpoint;
    }
  };

  const buildHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add authentication headers based on provider
    switch (integration.provider) {
      case 'openai':
      case 'anthropic':
      case 'mistral':
      case 'cohere':
      case 'ai21':
        if (testConfig.apiKey) {
          headers['Authorization'] = `Bearer ${testConfig.apiKey}`;
        }
        break;
      case 'google':
        if (testConfig.apiKey) {
          headers['x-goog-api-key'] = testConfig.apiKey;
        }
        break;
      case 'azure':
        if (testConfig.apiKey) {
          headers['Authorization'] = `Bearer ${testConfig.apiKey}`;
        }
        break;
    }

    // Add provider-specific headers
    if (integration.provider === 'anthropic') {
      headers['anthropic-version'] = '2023-06-01';
    }

    // Add custom headers
    if (testConfig.customHeaders) {
      try {
        const customHeaders = JSON.parse(testConfig.customHeaders);
        Object.assign(headers, customHeaders);
      } catch (e) {
        console.error('Invalid custom headers JSON');
      }
    }

    return headers;
  };

  const runTest = async () => {
    setTestStatus('testing');
    setTestResult('');

    try {
      // Validate required fields
      if (!testConfig.apiKey && integration.provider !== 'aws') {
        throw new Error('API key is required');
      }

      if (integration.provider === 'azure' && (!testConfig.subscriptionId || !testConfig.location)) {
        throw new Error('Subscription ID and location are required for Azure');
      }

      const endpoint = getTestEndpoint();
      const headers = buildHeaders();
      const method = testConfig.method === 'GET' ? 'GET' : 'POST';
      const body = method === 'POST' ? testConfig.requestBody || getDefaultRequestBody() : undefined;

      console.log('Testing endpoint:', endpoint);
      console.log('Headers:', headers);
      console.log('Body:', body);

      // For demo purposes, simulate API calls
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate different responses based on provider
      let mockResponse = '';
      switch (integration.provider) {
        case 'openai':
          mockResponse = JSON.stringify({
            id: "chatcmpl-test123",
            object: "chat.completion",
            created: Date.now(),
            model: "gpt-3.5-turbo",
            usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
            choices: [{ message: { role: "assistant", content: "Test response from OpenAI" } }]
          }, null, 2);
          break;
        case 'google':
          mockResponse = JSON.stringify({
            candidates: [{ content: { parts: [{ text: "Test response from Gemini" }] } }],
            usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 10, totalTokenCount: 15 }
          }, null, 2);
          break;
        case 'anthropic':
          mockResponse = JSON.stringify({
            id: "msg_test123",
            type: "message",
            role: "assistant",
            content: [{ type: "text", text: "Test response from Claude" }],
            usage: { input_tokens: 8, output_tokens: 12 }
          }, null, 2);
          break;
        case 'azure':
          mockResponse = JSON.stringify({
            value: [{
              unit: "Count",
              name: { value: "OpenAI.Tokens", localizedValue: "OpenAI Tokens" },
              currentValue: 15000,
              limit: 1000000
            }]
          }, null, 2);
          break;
        default:
          mockResponse = JSON.stringify({
            status: "success",
            message: "Test connection successful",
            timestamp: new Date().toISOString()
          }, null, 2);
      }

      setTestResult(mockResponse);
      setTestStatus('success');
      
      toast({
        title: "Test Successful",
        description: `Successfully connected to ${integration.name}`,
      });

    } catch (error) {
      setTestStatus('error');
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'testing':
        return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (testStatus) {
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          API Tester - {integration.name}
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{testStatus}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="test-endpoint">Endpoint</Label>
            <Input
              id="test-endpoint"
              value={testConfig.endpoint}
              onChange={(e) => setTestConfig(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder="API endpoint URL"
            />
          </div>
          
          <div>
            <Label htmlFor="test-method">Method</Label>
            <Select value={testConfig.method} onValueChange={(value) => setTestConfig(prev => ({ ...prev, method: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="test-apikey">API Key</Label>
          <Input
            id="test-apikey"
            type="password"
            value={testConfig.apiKey}
            onChange={(e) => setTestConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder={`Enter ${integration.name} API key`}
          />
        </div>

        {integration.provider === 'azure' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-subscription">Subscription ID</Label>
              <Input
                id="test-subscription"
                value={testConfig.subscriptionId}
                onChange={(e) => setTestConfig(prev => ({ ...prev, subscriptionId: e.target.value }))}
                placeholder="Azure subscription ID"
              />
            </div>
            <div>
              <Label htmlFor="test-location">Location</Label>
              <Input
                id="test-location"
                value={testConfig.location}
                onChange={(e) => setTestConfig(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. westus, eastus"
              />
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="test-headers">Custom Headers (JSON)</Label>
          <Textarea
            id="test-headers"
            value={testConfig.customHeaders}
            onChange={(e) => setTestConfig(prev => ({ ...prev, customHeaders: e.target.value }))}
            placeholder='{"Custom-Header": "value"}'
            rows={2}
          />
        </div>

        {testConfig.method === 'POST' && (
          <div>
            <Label htmlFor="test-body">Request Body (JSON)</Label>
            <Textarea
              id="test-body"
              value={testConfig.requestBody}
              onChange={(e) => setTestConfig(prev => ({ ...prev, requestBody: e.target.value }))}
              placeholder="Request body JSON"
              rows={6}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setTestConfig(prev => ({ ...prev, requestBody: getDefaultRequestBody() }))}
            >
              Load Default Request
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={runTest} 
            disabled={testStatus === 'testing'}
            className="flex items-center gap-2"
          >
            {getStatusIcon()}
            {testStatus === 'testing' ? 'Testing...' : 'Run Test'}
          </Button>
        </div>

        {testResult && (
          <div>
            <Label>Test Result</Label>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96">
              <pre className="text-xs">
                <code>{testResult}</code>
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationTester;
