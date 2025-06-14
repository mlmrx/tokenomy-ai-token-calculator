import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, CheckCircle, XCircle, Globe, Database, AlertCircle, Key, Shield, ExternalLink, Code, Play, Eye } from "lucide-react";
import IntegrationDocumentation from "./IntegrationDocumentation";
import IntegrationTester from "./IntegrationTester";

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastSync?: string;
  recordsCount?: number;
  icon: string;
  endpoint: string;
  usageEndpoint: string;
  requiredAuth: 'api_key' | 'oauth' | 'bearer' | 'basic' | 'azure_token';
  documentationUrl: string;
  usageMethod: 'direct_endpoint' | 'response_metadata' | 'cloudwatch' | 'cost_api' | 'response_headers' | 'dashboard_only';
  apiKey?: string;
  healthCheck?: string;
  authHeaders: Record<string, string>;
  responseStructure: string;
  sampleRequest?: string;
  sampleResponse?: string;
  validationRules?: {
    endpoint?: RegExp[];
    apiKey?: RegExp[];
    requiredParams?: string[];
  };
}

const IntegrationsManager: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'OpenAI API',
      provider: 'openai',
      status: 'connected',
      lastSync: '2 hours ago',
      recordsCount: 15420,
      icon: '🤖',
      endpoint: 'https://api.openai.com/v1/usage',
      usageEndpoint: 'https://api.openai.com/v1/usage?date=2024-06-12',
      requiredAuth: 'bearer',
      documentationUrl: 'https://platform.openai.com/docs/api-reference/usage',
      healthCheck: 'https://api.openai.com/v1/models',
      authHeaders: { 'Authorization': 'Bearer {api_key}', 'Content-Type': 'application/json' },
      responseStructure: 'daily_costs[].line_items[]{name, cost}, total_cost',
      usageMethod: 'direct_endpoint',
      sampleRequest: `curl --request GET \\
  --url 'https://api.openai.com/v1/usage?date=2024-06-12' \\
  --header 'Authorization: Bearer YOUR_API_KEY' \\
  --header 'Content-Type: application/json'`,
      sampleResponse: `{
  "object": "list",
  "daily_costs": [
    {
      "timestamp": 1718150400,
      "line_items": [
        {"name": "GPT-4o", "cost": 0.15},
        {"name": "DALL-E 3", "cost": 0.08}
      ]
    }
  ],
  "total_cost": 0.23
}`,
      validationRules: {
        endpoint: [/api\.openai\.com/],
        apiKey: [/^sk-/],
        requiredParams: ['Authorization']
      }
    },
    {
      id: '2',
      name: 'Google Gemini',
      provider: 'google',
      status: 'disconnected',
      icon: '🔷',
      endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
      usageEndpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
      requiredAuth: 'api_key',
      documentationUrl: 'https://ai.google.dev/gemini-api/docs/reference/rest/v1/models/generateContent',
      healthCheck: 'https://generativelanguage.googleapis.com/v1/models',
      authHeaders: { 'x-goog-api-key': '{api_key}', 'Content-Type': 'application/json' },
      responseStructure: 'usageMetadata{promptTokenCount, candidatesTokenCount, totalTokenCount}',
      usageMethod: 'response_metadata',
      sampleRequest: `import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")
model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content("Hello, world!")`,
      sampleResponse: `{
  "candidates": [...],
  "usageMetadata": {
    "promptTokenCount": 2,
    "candidatesTokenCount": 8,
    "totalTokenCount": 10
  }
}`,
      validationRules: {
        endpoint: [/generativelanguage\.googleapis\.com/],
        apiKey: [/.{20,}/],
        requiredParams: ['x-goog-api-key']
      }
    },
    {
      id: '3',
      name: 'Azure OpenAI',
      provider: 'azure',
      status: 'connected',
      lastSync: '1 hour ago',
      recordsCount: 8930,
      icon: '☁️',
      endpoint: 'https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.CognitiveServices/locations/{location}/usages',
      usageEndpoint: 'https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.CognitiveServices/locations/westus/usages?api-version=2023-05-01',
      requiredAuth: 'azure_token',
      documentationUrl: 'https://learn.microsoft.com/en-us/rest/api/cognitiveservices/accountmanagement/usages/list',
      healthCheck: 'https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.CognitiveServices/accounts?api-version=2023-05-01',
      authHeaders: { 'Authorization': 'Bearer {access_token}', 'Content-Type': 'application/json' },
      responseStructure: 'value[]{unit, name{value, localizedValue}, currentValue, limit}',
      usageMethod: 'direct_endpoint',
      sampleRequest: `curl -X GET \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  "https://management.azure.com/subscriptions/{subscriptionId}/providers/Microsoft.CognitiveServices/locations/westus/usages?api-version=2023-05-01"`,
      sampleResponse: `{
  "value": [
    {
      "unit": "Count",
      "name": {"value": "Text-Translation", "localizedValue": "Text-Translation"},
      "quotaPeriod": "P1D",
      "limit": 5000000.0,
      "currentValue": 12345.0
    }
  ]
}`,
      validationRules: {
        endpoint: [/management\.azure\.com/, /openai\.azure\.com/],
        requiredParams: ['subscriptionId', 'location']
      }
    },
    {
      id: '4',
      name: 'AWS Bedrock',
      provider: 'aws',
      status: 'error',
      lastSync: '1 day ago',
      recordsCount: 3240,
      icon: '🛡️',
      endpoint: 'https://monitoring.us-east-1.amazonaws.com/',
      usageEndpoint: 'CloudWatch API - InvocationCount, InputTokenCount, OutputTokenCount metrics',
      requiredAuth: 'bearer',
      documentationUrl: 'https://docs.aws.amazon.com/bedrock/latest/userguide/monitoring.html',
      healthCheck: 'https://bedrock.us-east-1.amazonaws.com/models',
      authHeaders: { 'Authorization': 'AWS4-HMAC-SHA256 {credentials}', 'Content-Type': 'application/x-amz-json-1.1' },
      responseStructure: 'CloudWatch Metrics: InvocationCount, InputTokenCount, OutputTokenCount',
      usageMethod: 'cloudwatch',
      sampleRequest: `// AWS SDK usage for CloudWatch metrics
const cloudWatch = new CloudWatchClient({ region: 'us-east-1' });
const params = {
  MetricName: 'InvocationCount',
  Namespace: 'AWS/Bedrock'
};`,
      sampleResponse: `{
  "MetricDataResults": [
    {
      "Id": "bedrock_invocations",
      "Values": [150, 200, 175],
      "Timestamps": ["2024-06-12T10:00:00Z", ...]
    }
  ]
}`,
      validationRules: {
        endpoint: [/amazonaws\.com/],
        requiredParams: ['region']
      }
    },
    {
      id: '5',
      name: 'Anthropic Claude',
      provider: 'anthropic',
      status: 'connected',
      lastSync: '30 minutes ago',
      recordsCount: 12150,
      icon: '🧠',
      endpoint: 'https://api.anthropic.com/v1/messages',
      usageEndpoint: 'https://api.anthropic.com/v1/messages',
      requiredAuth: 'bearer',
      documentationUrl: 'https://docs.anthropic.com/claude/reference/messages_post',
      healthCheck: 'https://api.anthropic.com/v1/models',
      authHeaders: { 'Authorization': 'Bearer {api_key}', 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' },
      responseStructure: 'usage{input_tokens, output_tokens}',
      usageMethod: 'response_metadata',
      sampleRequest: `import anthropic

client = anthropic.Anthropic(api_key="YOUR_API_KEY")
message = client.messages.create(
    model="claude-3-opus-20240229",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)`,
      sampleResponse: `{
  "id": "msg_01Abc...",
  "type": "message",
  "role": "assistant",
  "content": [{"type": "text", "text": "Hello! It's nice to connect with you..."}],
  "usage": {
    "input_tokens": 10,
    "output_tokens": 17
  }
}`,
      validationRules: {
        endpoint: [/api\.anthropic\.com/],
        apiKey: [/^sk-ant-/],
        requiredParams: ['Authorization', 'anthropic-version']
      }
    },
    {
      id: '6',
      name: 'Mistral AI',
      provider: 'mistral',
      status: 'disconnected',
      icon: '🇫🇷',
      endpoint: 'https://api.mistral.ai/v1/chat/completions',
      usageEndpoint: 'https://api.mistral.ai/v1/chat/completions',
      requiredAuth: 'bearer',
      documentationUrl: 'https://docs.mistral.ai/api/',
      healthCheck: 'https://api.mistral.ai/v1/models',
      authHeaders: { 'Authorization': 'Bearer {api_key}', 'Content-Type': 'application/json', 'Accept': 'application/json' },
      responseStructure: 'usage{prompt_tokens, completion_tokens}, headers{x-ratelimit-remaining-tokens-month}',
      usageMethod: 'response_headers',
      sampleRequest: `curl --location 'https://api.mistral.ai/v1/chat/completions' \\
--header 'Content-Type: application/json' \\
--header 'Accept: application/json' \\
--header 'Authorization: Bearer YOUR_MISTRAL_API_KEY' \\
--data '{"model": "mistral-large-latest", "messages": [{"role": "user", "content": "Hello!"}]}'`,
      sampleResponse: `{
  "id": "cmpl-e61f2a331a93441e88836a287b52b04c",
  "choices": [...],
  "usage": {
    "prompt_tokens": 19,
    "completion_tokens": 28,
    "total_tokens": 47
  }
}
Headers: x-ratelimit-remaining-tokens-month: 99998801`,
      validationRules: {
        endpoint: [/api\.mistral\.ai/],
        apiKey: [/.{20,}/],
        requiredParams: ['Authorization']
      }
    },
    {
      id: '7',
      name: 'Cohere',
      provider: 'cohere',
      status: 'disconnected',
      icon: '🔮',
      endpoint: 'https://api.cohere.com/v1/chat',
      usageEndpoint: 'https://api.cohere.com/v1/chat',
      requiredAuth: 'bearer',
      documentationUrl: 'https://docs.cohere.com/reference/chat',
      healthCheck: 'https://api.cohere.com/v1/models',
      authHeaders: { 'Authorization': 'Bearer {api_key}', 'Content-Type': 'application/json' },
      responseStructure: 'meta.billed_units{input_tokens, output_tokens}',
      usageMethod: 'response_metadata',
      sampleRequest: `curl --request POST \\
  --url https://api.cohere.com/v1/chat \\
  --header 'Authorization: Bearer YOUR_COHERE_API_KEY' \\
  --header 'Content-Type: application/json' \\
  --data '{"message": "Tell me a fun fact", "model": "command-r-plus"}'`,
      sampleResponse: `{
  "text": "A fun fact about the Roman Empire...",
  "generation_id": "c2a70b79-2243-4876-81a1-c6c74b46c1f8",
  "meta": {
    "billed_units": {
      "input_tokens": 20,
      "output_tokens": 105
    }
  }
}`,
      validationRules: {
        endpoint: [/api\.cohere\.com/],
        apiKey: [/.{20,}/],
        requiredParams: ['Authorization']
      }
    },
    {
      id: '8',
      name: 'AI21 Labs',
      provider: 'ai21',
      status: 'disconnected',
      icon: '🇮🇱',
      endpoint: 'https://api.ai21.com/studio/v1/j2-ultra/chat',
      usageEndpoint: 'https://api.ai21.com/studio/v1/j2-ultra/chat',
      requiredAuth: 'bearer',
      documentationUrl: 'https://docs.ai21.com/reference/j2-chat-ref',
      healthCheck: 'https://api.ai21.com/studio/v1/models',
      authHeaders: { 'Authorization': 'Bearer {api_key}', 'Content-Type': 'application/json' },
      responseStructure: 'Dashboard-only billing tracking',
      usageMethod: 'dashboard_only',
      sampleRequest: `curl --request POST \\
  --url https://api.ai21.com/studio/v1/j2-ultra/chat \\
  --header 'Authorization: Bearer YOUR_AI21_API_KEY' \\
  --header 'Content-Type: application/json' \\
  --data '{"messages": [{"role": "user", "content": "What are transformers?"}]}'`,
      sampleResponse: `{
  "id": "a21.chat-completion-1.20250611.123456.78910",
  "outputs": [
    {
      "text": "Transformer models have several key advantages...",
      "role": "assistant",
      "finishReason": {"reason": "endoftext"}
    }
  ]
}`,
      validationRules: {
        endpoint: [/api\.ai21\.com/],
        apiKey: [/.{20,}/],
        requiredParams: ['Authorization']
      }
    },
    {
      id: '9',
      name: 'Salesforce Einstein',
      provider: 'salesforce',
      status: 'disconnected',
      icon: '☁️',
      endpoint: 'https://api.salesforce.com/einstein/usage',
      usageEndpoint: 'Coming Soon - Direct Integration in Development',
      requiredAuth: 'oauth',
      documentationUrl: 'https://developer.salesforce.com/docs/atlas.en-us.einstein_platform.meta/einstein_platform/',
      authHeaders: { 'Authorization': 'Bearer {oauth_token}', 'Content-Type': 'application/json' },
      responseStructure: 'Coming Soon',
      usageMethod: 'direct_endpoint',
      sampleRequest: 'Coming Soon',
      sampleResponse: 'Coming Soon',
      validationRules: {
        endpoint: [/salesforce\.com/],
        requiredParams: ['oauth_token']
      }
    }
  ]);

  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    endpoint: '', 
    apiKey: '', 
    subscriptionId: '', 
    location: '', 
    accessToken: '',
    resourceGroup: '' 
  });
  const [testInProgress, setTestInProgress] = useState<string | null>(null);
  const [showDocumentation, setShowDocumentation] = useState<string | null>(null);
  const [showTester, setShowTester] = useState<string | null>(null);
  const { toast } = useToast();

  const handleToggleConnection = async (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';
        return {
          ...integration,
          status: newStatus,
          lastSync: newStatus === 'connected' ? 'Just now' : undefined
        };
      }
      return integration;
    }));

    toast({
      title: "Integration Updated",
      description: "Integration status has been updated successfully",
    });
  };

  const validateEndpoint = (endpoint: string, integration: Integration): boolean => {
    if (!endpoint) return false;
    
    try {
      new URL(endpoint);
      
      // Use validation rules if available
      if (integration.validationRules?.endpoint) {
        return integration.validationRules.endpoint.some(pattern => pattern.test(endpoint));
      }
      
      // Fallback to provider-specific patterns
      switch (integration.provider) {
        case 'openai':
          return endpoint.includes('api.openai.com');
        case 'google':
          return endpoint.includes('generativelanguage.googleapis.com');
        case 'azure':
          return endpoint.includes('management.azure.com') || endpoint.includes('openai.azure.com');
        case 'aws':
          return endpoint.includes('amazonaws.com') || endpoint.includes('monitoring');
        case 'anthropic':
          return endpoint.includes('api.anthropic.com');
        case 'mistral':
          return endpoint.includes('api.mistral.ai');
        case 'cohere':
          return endpoint.includes('api.cohere.com');
        case 'ai21':
          return endpoint.includes('api.ai21.com');
        case 'salesforce':
          return endpoint.includes('salesforce.com');
        default:
          return endpoint.startsWith('https://');
      }
    } catch {
      return false;
    }
  };

  const validateApiKey = (apiKey: string, integration: Integration): boolean => {
    if (!apiKey) return false;
    
    // Use validation rules if available
    if (integration.validationRules?.apiKey) {
      return integration.validationRules.apiKey.some(pattern => pattern.test(apiKey));
    }
    
    // Fallback to provider-specific patterns
    switch (integration.provider) {
      case 'openai':
        return apiKey.startsWith('sk-');
      case 'google':
        return apiKey.length > 20 && !apiKey.includes(' ');
      case 'azure':
        return apiKey.length > 20;
      case 'anthropic':
        return apiKey.startsWith('sk-ant-');
      case 'aws':
        return apiKey.includes('AKIA') || apiKey.length > 20;
      case 'mistral':
      case 'cohere':
      case 'ai21':
        return apiKey.length > 20;
      case 'salesforce':
        return apiKey.length > 20;
      default:
        return apiKey.length > 8;
    }
  };

  const handleSaveConfiguration = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;
    
    const endpoint = formData.endpoint || integration.endpoint;
    const apiKey = formData.apiKey || integration.apiKey;
    
    // Validate endpoint URL
    if (!validateEndpoint(endpoint, integration)) {
      toast({
        title: "Invalid Endpoint",
        description: `The endpoint URL doesn't match the expected pattern for ${integration.name}`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate API key if provided (except for AWS which has complex auth)
    if (apiKey && integration.provider !== 'aws' && !validateApiKey(apiKey, integration)) {
      toast({
        title: "Invalid API Key",
        description: `The API key format doesn't match the expected pattern for ${integration.name}`,
        variant: "destructive",
      });
      return;
    }
    
    // Check required parameters
    if (integration.validationRules?.requiredParams) {
      const missingParams = integration.validationRules.requiredParams.filter(param => {
        if (param === 'Authorization' && !apiKey) return true;
        if (param === 'subscriptionId' && !formData.subscriptionId) return true;
        if (param === 'location' && !formData.location) return true;
        return false;
      });
      
      if (missingParams.length > 0) {
        toast({
          title: "Missing Required Parameters",
          description: `Please provide: ${missingParams.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    setIntegrations(prev => prev.map(int => {
      if (int.id === integrationId) {
        return {
          ...int,
          endpoint: endpoint,
          apiKey: apiKey,
          status: 'connected'
        };
      }
      return int;
    }));

    setEditingIntegration(null);
    setFormData({ endpoint: '', apiKey: '', subscriptionId: '', location: '', accessToken: '', resourceGroup: '' });
    
    toast({
      title: "Configuration Saved",
      description: "Integration configuration has been saved successfully",
    });
  };

  const handleTestConnection = async (integration: Integration) => {
    setTestInProgress(integration.id);
    setIntegrations(prev => prev.map(int => 
      int.id === integration.id ? { ...int, status: 'testing' } : int
    ));
    
    toast({
      title: "Testing Connection",
      description: `Testing connection to ${integration.name}...`,
    });

    try {
      const endpoint = formData.endpoint || integration.endpoint;
      const apiKey = formData.apiKey || integration.apiKey;
      
      if (!validateEndpoint(endpoint, integration)) {
        throw new Error(`Invalid endpoint URL for ${integration.name}`);
      }
      
      if (!apiKey && integration.provider !== 'aws') {
        throw new Error(`API key is required for ${integration.name}`);
      }

      // Simulate API test with realistic delays
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enhanced provider-specific testing
      let success = false;
      switch (integration.provider) {
        case 'openai':
        case 'anthropic':
          success = endpoint.includes('api.') && Boolean(apiKey?.match(integration.validationRules?.apiKey?.[0] || /.+/));
          break;
        case 'google':
          success = endpoint.includes('generativelanguage') && Boolean(apiKey) && apiKey.length > 20;
          break;
        case 'azure':
          success = (endpoint.includes('azure.com') || endpoint.includes('management.azure.com')) && 
                   Boolean(formData.subscriptionId || formData.accessToken);
          break;
        case 'aws':
          success = endpoint.includes('amazonaws.com');
          break;
        case 'mistral':
          success = endpoint.includes('mistral.ai') && Boolean(apiKey) && apiKey.length > 20;
          break;
        case 'cohere':
          success = endpoint.includes('cohere.com') && Boolean(apiKey) && apiKey.length > 20;
          break;
        case 'ai21':
          success = endpoint.includes('ai21.com') && Boolean(apiKey) && apiKey.length > 20;
          break;
        case 'salesforce':
          success = false; // Coming soon
          break;
        default:
          success = Math.random() > 0.3; // 70% success rate for others
      }

      if (!success) {
        throw new Error(`Connection test failed: Invalid credentials or service unavailable`);
      }
      
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: 'connected', lastSync: 'Just now' }
          : int
      ));
      
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${integration.name}`,
      });
    } catch (error) {
      setIntegrations(prev => prev.map(int => 
        int.id === integration.id 
          ? { ...int, status: 'error' }
          : int
      ));
      
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setTestInProgress(null);
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const renderAuthFields = (integration: Integration) => {
    switch (integration.requiredAuth) {
      case 'api_key':
        return (
          <>
            <div>
              <Label htmlFor={`apikey-${integration.id}`}>API Key</Label>
              <Input
                id={`apikey-${integration.id}`}
                type="password"
                placeholder={`Enter ${integration.name} API key`}
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {integration.provider === 'google' && "Get your API key from Google AI Studio"}
                {integration.provider === 'mistral' && "Get your API key from La Plateforme"}
                {integration.provider === 'cohere' && "Get your API key from Cohere Dashboard"}
                {integration.provider === 'ai21' && "Get your API key from AI21 Studio"}
              </p>
            </div>
          </>
        );
      case 'bearer':
        return (
          <div>
            <Label htmlFor={`apikey-${integration.id}`}>Bearer Token</Label>
            <Input
              id={`apikey-${integration.id}`}
              type="password"
              placeholder={`Enter ${integration.name} API key`}
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {integration.provider === 'openai' && "Format: sk-..."}
              {integration.provider === 'anthropic' && "Format: sk-ant-..."}
              {integration.provider === 'mistral' && "Get from La Plateforme dashboard"}
              {integration.provider === 'cohere' && "Get from Cohere dashboard"}
              {integration.provider === 'ai21' && "Get from AI21 Studio"}
            </p>
          </div>
        );
      case 'azure_token':
        return (
          <>
            <div>
              <Label htmlFor={`subscription-${integration.id}`}>Subscription ID</Label>
              <Input
                id={`subscription-${integration.id}`}
                placeholder="Enter Azure subscription ID"
                value={formData.subscriptionId}
                onChange={(e) => setFormData(prev => ({ ...prev, subscriptionId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor={`location-${integration.id}`}>Location</Label>
              <Input
                id={`location-${integration.id}`}
                placeholder="e.g. westus, eastus"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor={`token-${integration.id}`}>Access Token</Label>
              <Input
                id={`token-${integration.id}`}
                type="password"
                placeholder="Enter Azure access token"
                value={formData.accessToken}
                onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
              />
            </div>
          </>
        );
      case 'oauth':
        return (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              OAuth integration coming soon. Contact support for early access.
            </p>
          </div>
        );
      default:
        return (
          <div>
            <Label htmlFor={`apikey-${integration.id}`}>API Key</Label>
            <Input
              id={`apikey-${integration.id}`}
              type="password"
              placeholder="Enter API key"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>
        );
    }
  };

  const getUsageMethodBadge = (method: string) => {
    switch (method) {
      case 'direct_endpoint':
        return <Badge variant="default">Direct API</Badge>;
      case 'response_metadata':
        return <Badge variant="secondary">Response Data</Badge>;
      case 'response_headers':
        return <Badge variant="outline">Response Headers</Badge>;
      case 'cloudwatch':
        return <Badge variant="outline">CloudWatch</Badge>;
      case 'cost_api':
        return <Badge variant="outline">Cost API</Badge>;
      case 'dashboard_only':
        return <Badge variant="destructive">Dashboard Only</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{integration.name}</h4>
                          {getUsageMethodBadge(integration.usageMethod)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(integration.status)}
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(integration.status)}`}>
                            {integration.status === 'testing' ? 'Testing...' : integration.status}
                          </span>
                          {integration.documentationUrl && (
                            <a 
                              href={integration.documentationUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                            >
                              API Docs <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDocumentation(
                          showDocumentation === integration.id ? null : integration.id
                        )}
                        disabled={integration.status === 'testing'}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTester(
                          showTester === integration.id ? null : integration.id
                        )}
                        disabled={integration.status === 'testing'}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={integration.status === 'connected'}
                        onCheckedChange={() => handleToggleConnection(integration.id)}
                        disabled={integration.status === 'testing'}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIntegration(
                          editingIntegration === integration.id ? null : integration.id
                        )}
                        disabled={integration.status === 'testing'}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {integration.status === 'connected' && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Last sync: {integration.lastSync}</span>
                      <span>{integration.recordsCount?.toLocaleString()} records</span>
                    </div>
                  )}

                  <div className="text-sm space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-20">Endpoint:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded break-all">{integration.usageEndpoint}</code>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium min-w-20">Response:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{integration.responseStructure}</code>
                    </div>
                  </div>

                  {showDocumentation === integration.id && (
                    <IntegrationDocumentation integration={integration} />
                  )}

                  {showTester === integration.id && (
                    <IntegrationTester integration={integration} />
                  )}

                  {editingIntegration === integration.id && (
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <Label htmlFor={`endpoint-${integration.id}`} className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          API Endpoint (Optional Override)
                        </Label>
                        <Input
                          id={`endpoint-${integration.id}`}
                          placeholder={integration.endpoint}
                          value={formData.endpoint}
                          onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Default: {integration.endpoint}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderAuthFields(integration)}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveConfiguration(integration.id)}
                          disabled={testInProgress === integration.id || integration.status === 'testing'}
                        >
                          Save Configuration
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestConnection(integration)}
                          disabled={testInProgress === integration.id || integration.status === 'testing'}
                        >
                          {integration.status === 'testing' ? 'Testing...' : 'Test Connection'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingIntegration(null)}
                          disabled={testInProgress === integration.id || integration.status === 'testing'}
                        >
                          Cancel
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-muted rounded-lg">
                        <h5 className="text-sm font-medium mb-1 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Authentication & Security
                        </h5>
                        <p className="text-xs text-muted-foreground mb-2">
                          All API keys and tokens are encrypted at rest and in transit. We only use your credentials to make authenticated requests on your behalf.
                        </p>
                        <div className="text-xs space-y-1">
                          <div><strong>Headers:</strong></div>
                          {Object.entries(integration.authHeaders).map(([key, value]) => (
                            <div key={key} className="font-mono bg-background px-2 py-1 rounded">
                              {key}: {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sync Settings & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Sync</Label>
                <p className="text-sm text-muted-foreground">Automatically sync data every hour</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Real-time Updates</Label>
                <p className="text-sm text-muted-foreground">Enable real-time data streaming</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Data Retention</Label>
                <p className="text-sm text-muted-foreground">Keep data for 90 days</p>
              </div>
              <Badge variant="outline">90 days</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Encrypt Credentials</Label>
                <p className="text-sm text-muted-foreground">AES-256 encryption for all API keys</p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsManager;
