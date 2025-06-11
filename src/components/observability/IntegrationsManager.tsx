
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Check, X, Key, Globe, Database } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  recordsCount?: number;
  icon: string;
  endpoint?: string;
  apiKey?: string;
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
      endpoint: 'https://api.openai.com/v1/usage'
    },
    {
      id: '2',
      name: 'Google Gemini',
      provider: 'google',
      status: 'disconnected',
      icon: '🔷',
      endpoint: 'https://generativelanguage.googleapis.com/v1/usage'
    },
    {
      id: '3',
      name: 'Azure OpenAI',
      provider: 'azure',
      status: 'connected',
      lastSync: '1 hour ago',
      recordsCount: 8930,
      icon: '☁️'
    },
    {
      id: '4',
      name: 'AWS Bedrock',
      provider: 'aws',
      status: 'error',
      lastSync: '1 day ago',
      recordsCount: 3240,
      icon: '🛡️'
    },
    {
      id: '5',
      name: 'Anthropic',
      provider: 'anthropic',
      status: 'connected',
      lastSync: '30 minutes ago',
      recordsCount: 12150,
      icon: '🧠'
    }
  ]);

  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
  const [formData, setFormData] = useState({ endpoint: '', apiKey: '' });
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

  const handleSaveConfiguration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === integrationId) {
        return {
          ...integration,
          endpoint: formData.endpoint || integration.endpoint,
          apiKey: formData.apiKey || integration.apiKey,
          status: 'connected'
        };
      }
      return integration;
    }));

    setEditingIntegration(null);
    setFormData({ endpoint: '', apiKey: '' });
    
    toast({
      title: "Configuration Saved",
      description: "Integration configuration has been saved successfully",
    });
  };

  const handleTestConnection = async (integration: Integration) => {
    toast({
      title: "Testing Connection",
      description: `Testing connection to ${integration.name}...`,
    });

    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        setIntegrations(prev => prev.map(int => 
          int.id === integration.id 
            ? { ...int, status: 'connected', lastSync: 'Just now' }
            : int
        ));
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${integration.name}`,
        });
      } else {
        setIntegrations(prev => prev.map(int => 
          int.id === integration.id 
            ? { ...int, status: 'error' }
            : int
        ));
        toast({
          title: "Connection Failed",
          description: `Failed to connect to ${integration.name}`,
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <X className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
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
                            {integration.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.status === 'connected'}
                        onCheckedChange={() => handleToggleConnection(integration.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIntegration(
                          editingIntegration === integration.id ? null : integration.id
                        )}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`endpoint-${integration.id}`}>API Endpoint</Label>
                          <Input
                            id={`endpoint-${integration.id}`}
                            placeholder={integration.endpoint || "Enter API endpoint"}
                            value={formData.endpoint}
                            onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                          />
                        </div>
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
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveConfiguration(integration.id)}
                        >
                          Save Configuration
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestConnection(integration)}
                        >
                          Test Connection
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingIntegration(null)}
                        >
                          Cancel
                        </Button>
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
          <CardTitle>Sync Settings</CardTitle>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsManager;
