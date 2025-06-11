
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, CheckCircle, XCircle, Globe, Database, AlertCircle, Key, Shield } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastSync?: string;
  recordsCount?: number;
  icon: string;
  endpoint: string;
  requiredAuth: 'api_key' | 'oauth' | 'bearer' | 'basic';
  documentationUrl: string;
  apiKey?: string;
  healthCheck?: string;
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
      requiredAuth: 'bearer',
      documentationUrl: 'https://platform.openai.com/docs/api-reference/usage',
      healthCheck: 'https://api.openai.com/v1/models'
    },
    {
      id: '2',
      name: 'Google Gemini',
      provider: 'google',
      status: 'disconnected',
      icon: '🔷',
      endpoint: 'https://generativelanguage.googleapis.com/v1/usage',
      requiredAuth: 'api_key',
      documentationUrl: 'https://ai.google.dev/api/rest',
      healthCheck: 'https://generativelanguage.googleapis.com/v1/models'
    },
    {
      id: '3',
      name: 'Azure OpenAI',
      provider: 'azure',
      status: 'connected',
      lastSync: '1 hour ago',
      recordsCount: 8930,
      icon: '☁️',
      endpoint: 'https://YOUR_AZURE_OPENAI_ENDPOINT.openai.azure.com/openai/usage?api-version=2023-05-15',
      requiredAuth: 'api_key',
      documentationUrl: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/reference',
      healthCheck: 'https://YOUR_AZURE_OPENAI_ENDPOINT.openai.azure.com/openai/models?api-version=2023-05-15'
    },
    {
      id: '4',
      name: 'AWS Bedrock',
      provider: 'aws',
      status: 'error',
      lastSync: '1 day ago',
      recordsCount: 3240,
      icon: '🛡️',
      endpoint: 'https://bedrock.us-east-1.amazonaws.com/usage',
      requiredAuth: 'bearer',
      documentationUrl: 'https://docs.aws.amazon.com/bedrock/',
      healthCheck: 'https://bedrock.us-east-1.amazonaws.com/models'
    },
    {
      id: '5',
      name: 'Anthropic',
      provider: 'anthropic',
      status: 'connected',
      lastSync: '30 minutes ago',
      recordsCount: 12150,
      icon: '🧠',
      endpoint: 'https://api.anthropic.com/v1/usage',
      requiredAuth: 'bearer',
      documentationUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
      healthCheck: 'https://api.anthropic.com/v1/models'
    }
  ]);

  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
  const [formData, setFormData] = useState({ endpoint: '', apiKey: '', region: '', resourceGroup: '' });
  const [testInProgress, setTestInProgress] = useState<string | null>(null);
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
      
      // Check for provider-specific URL patterns
      switch (integration.provider) {
        case 'openai':
          return endpoint.includes('api.openai.com');
        case 'google':
          return endpoint.includes('generativelanguage.googleapis.com');
        case 'azure':
          return endpoint.includes('openai.azure.com');
        case 'aws':
          return endpoint.includes('bedrock') && endpoint.includes('amazonaws.com');
        case 'anthropic':
          return endpoint.includes('api.anthropic.com');
        default:
          return endpoint.startsWith('https://');
      }
    } catch {
      return false;
    }
  };

  const validateApiKey = (apiKey: string, integration: Integration): boolean => {
    if (!apiKey) return false;
    
    // Check for provider-specific API key patterns
    switch (integration.provider) {
      case 'openai':
        return apiKey.startsWith('sk-');
      case 'google':
        return apiKey.length > 20;
      case 'azure':
        return apiKey.length > 20;
      case 'anthropic':
        return apiKey.startsWith('sk-ant-');
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
    
    // Validate API key if provided
    if (apiKey && !validateApiKey(apiKey, integration)) {
      toast({
        title: "Invalid API Key",
        description: `The API key format doesn't match the expected pattern for ${integration.name}`,
        variant: "destructive",
      });
      return;
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
    setFormData({ endpoint: '', apiKey: '', region: '', resourceGroup: '' });
    
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
      
      if (!apiKey) {
        throw new Error(`API key is required for ${integration.name}`);
      }

      // For demo purposes, simulate API test with a delay and random success
      await new Promise(resolve => setTimeout(resolve, 2000));
      const success = Math.random() > 0.2; // 80% success rate for demo

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
                placeholder="Enter API key"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            {integration.provider === 'azure' && (
              <>
                <div>
                  <Label htmlFor={`region-${integration.id}`}>Region</Label>
                  <Input
                    id={`region-${integration.id}`}
                    placeholder="e.g. eastus"
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor={`resource-${integration.id}`}>Resource Group</Label>
                  <Input
                    id={`resource-${integration.id}`}
                    placeholder="e.g. my-resources"
                    value={formData.resourceGroup}
                    onChange={(e) => setFormData(prev => ({ ...prev, resourceGroup: e.target.value }))}
                  />
                </div>
              </>
            )}
          </>
        );
      case 'bearer':
        return (
          <div>
            <Label htmlFor={`apikey-${integration.id}`}>Bearer Token</Label>
            <Input
              id={`apikey-${integration.id}`}
              type="password"
              placeholder="Enter bearer token"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
            />
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
                        <h4 className="font-medium">{integration.name}</h4>
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
                              className="text-xs text-blue-500 hover:underline"
                            >
                              API Docs
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
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

                  {editingIntegration === integration.id && (
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <Label htmlFor={`endpoint-${integration.id}`} className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          API Endpoint
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
                        <h5 className="text-sm font-medium mb-1">Security Note</h5>
                        <p className="text-xs text-muted-foreground">
                          All API keys and tokens are encrypted at rest and in transit. We only use your credentials to make authenticated requests on your behalf.
                        </p>
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
