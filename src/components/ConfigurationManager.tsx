
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGpuConfigurations } from '@/hooks/useGpuConfigurations';
import { useApiKeys } from '@/hooks/useApiKeys';
import { Settings, Plus, Key, Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import type { GpuConfigurationInsert } from '@/hooks/useGpuConfigurations';

export function ConfigurationManager() {
  const { configurations, loading, createConfiguration, deleteConfiguration } = useGpuConfigurations();
  const { apiKeys, createApiKey, revokeApiKey, deleteApiKey } = useApiKeys();
  const [showDialog, setShowDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<GpuConfigurationInsert>>({
    gpu_uuid: '',
    gpu_sku: 'A100',
    display_name: '',
    hourly_cost_usd: '2.50',
    max_power_draw_watts: 400,
    max_temperature_c: 83,
    max_memory_mb: 81920,
    efficiency_threshold: 80.0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createConfiguration({
        ...formData,
        hourly_cost_usd: formData.hourly_cost_usd?.toString(),
      } as GpuConfigurationInsert);
      setShowDialog(false);
      setFormData({
        gpu_uuid: '',
        gpu_sku: 'A100',
        display_name: '',
        hourly_cost_usd: '2.50',
        max_power_draw_watts: 400,
        max_temperature_c: 83,
        max_memory_mb: 81920,
        efficiency_threshold: 80.0,
      });
    } catch (error) {
      console.error('Failed to create configuration:', error);
    }
  };

  const handleCreateApiKey = async (keyName: string) => {
    try {
      const result = await createApiKey({
        key_name: keyName,
        permissions: ['read', 'write'],
        rate_limit_per_hour: 1000,
      });
      setNewApiKey(result?.api_key || null);
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading configurations...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            GPU Monitor Configuration
          </h1>
          <p className="text-muted-foreground">
            Manage GPU configurations, API keys, and integration settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="configurations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="configurations">GPU Configurations</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="file-upload">File Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>GPU Configurations</CardTitle>
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add GPU
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add GPU Configuration</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="gpu_uuid">GPU UUID</Label>
                        <Input
                          id="gpu_uuid"
                          value={formData.gpu_uuid}
                          onChange={(e) => setFormData(prev => ({ ...prev, gpu_uuid: e.target.value }))}
                          placeholder="gpu-001-abc123"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          value={formData.display_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                          placeholder="Production GPU #1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="gpu_sku">GPU SKU</Label>
                        <Select 
                          value={formData.gpu_sku} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, gpu_sku: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A100">NVIDIA A100</SelectItem>
                            <SelectItem value="V100">NVIDIA V100</SelectItem>
                            <SelectItem value="H100">NVIDIA H100</SelectItem>
                            <SelectItem value="RTX4090">RTX 4090</SelectItem>
                            <SelectItem value="RTX3090">RTX 3090</SelectItem>
                            <SelectItem value="A6000">NVIDIA A6000</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hourly_cost">Hourly Cost (USD)</Label>
                          <Input
                            id="hourly_cost"
                            type="number"
                            step="0.01"
                            value={formData.hourly_cost_usd}
                            onChange={(e) => setFormData(prev => ({ ...prev, hourly_cost_usd: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="efficiency_threshold">Efficiency Threshold (%)</Label>
                          <Input
                            id="efficiency_threshold"
                            type="number"
                            value={formData.efficiency_threshold}
                            onChange={(e) => setFormData(prev => ({ ...prev, efficiency_threshold: parseFloat(e.target.value) }))}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full">Create Configuration</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configurations.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{config.display_name || config.gpu_uuid}</div>
                      <div className="text-sm text-muted-foreground">
                        {config.gpu_sku} • ${config.hourly_cost_usd}/hr • {config.efficiency_threshold}% efficiency
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.is_active ? "default" : "secondary"}>
                        {config.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteConfiguration(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {configurations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No GPU configurations found. Add your first GPU to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>API Keys</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Key className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New API Key</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="key_name">Key Name</Label>
                        <Input
                          id="key_name"
                          placeholder="Production API Key"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              handleCreateApiKey(target.value);
                            }
                          }}
                        />
                      </div>
                      <Button 
                        onClick={() => {
                          const input = document.getElementById('key_name') as HTMLInputElement;
                          handleCreateApiKey(input.value);
                        }}
                        className="w-full"
                      >
                        Generate API Key
                      </Button>
                      {newApiKey && (
                        <div className="p-4 bg-muted rounded-lg">
                          <Label>Your new API key (copy it now!):</Label>
                          <code className="block mt-2 p-2 bg-background rounded text-sm break-all">
                            {newApiKey}
                          </code>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{key.key_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {key.api_key_prefix}••••••••••••••••
                        <span className="ml-2">
                          Rate limit: {key.rate_limit_per_hour}/hour
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "Active" : "Revoked"}
                      </Badge>
                      {key.is_active && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => revokeApiKey(key.id)}
                        >
                          Revoke
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteApiKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No API keys found. Create your first API key to start integrating.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file-upload">
          <Card>
            <CardHeader>
              <CardTitle>Configuration File Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Upload Configuration File</h3>
                <p className="text-muted-foreground mb-4">
                  Upload JSON or YAML files containing GPU configurations, pricing models, or alert thresholds
                </p>
                <Button>
                  Select File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
