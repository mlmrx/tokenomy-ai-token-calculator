
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Bell, Settings, Plus, Trash2, Filter } from "lucide-react";

interface Alert {
  id: string;
  type: 'cost' | 'latency' | 'error' | 'throughput';
  condition: string;
  threshold: number;
  isEnabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'cost',
      condition: 'Daily spend exceeds',
      threshold: 500,
      isEnabled: true,
      lastTriggered: '2 hours ago',
      triggerCount: 3
    },
    {
      id: '2',
      type: 'latency',
      condition: 'P95 latency above',
      threshold: 2000,
      isEnabled: true,
      lastTriggered: '1 day ago',
      triggerCount: 1
    },
    {
      id: '3',
      type: 'error',
      condition: 'Error rate exceeds',
      threshold: 1,
      isEnabled: false,
      triggerCount: 0
    },
    {
      id: '4',
      type: 'throughput',
      condition: 'Throughput below',
      threshold: 5000,
      isEnabled: true,
      lastTriggered: '3 hours ago',
      triggerCount: 2
    }
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const recentAlerts = [
    {
      id: 'r1',
      type: 'cost',
      message: 'Daily spending limit exceeded: $520 / $500',
      severity: 'high',
      timestamp: '2 hours ago',
      provider: 'OpenAI'
    },
    {
      id: 'r2',
      type: 'latency',
      message: 'High latency detected: 2.1s average response time',
      severity: 'medium',
      timestamp: '4 hours ago',
      provider: 'Google'
    },
    {
      id: 'r3',
      type: 'throughput',
      message: 'Low throughput warning: 4.2K tokens/sec',
      severity: 'medium',
      timestamp: '6 hours ago',
      provider: 'Anthropic'
    },
    {
      id: 'r4',
      type: 'cost',
      message: 'Monthly budget 80% consumed',
      severity: 'low',
      timestamp: '1 day ago',
      provider: 'All'
    }
  ];

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isEnabled: !alert.isEnabled } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'cost': return '💰';
      case 'latency': return '⏱️';
      case 'error': return '⚠️';
      case 'throughput': return '⚡';
      default: return '🔔';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200';
      case 'low': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200';
    }
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filter);

  return (
    <div className="space-y-6">
      {/* Alert Configuration Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Management</h2>
          <p className="text-muted-foreground">Configure and manage monitoring alerts</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getAlertIcon(alert.type)}</span>
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{alert.provider}</span>
                        <span>•</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    alert.severity === 'high' ? 'destructive' : 
                    alert.severity === 'medium' ? 'secondary' : 
                    'outline'
                  }>
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Alert Rules
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="latency">Latency</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="throughput">Throughput</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-lg">{getAlertIcon(alert.type)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{alert.condition}</p>
                      <Badge variant="outline">{alert.threshold}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>Triggered {alert.triggerCount} times</span>
                      {alert.lastTriggered && (
                        <>
                          <span>•</span>
                          <span>Last: {alert.lastTriggered}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Switch 
                    checked={alert.isEnabled}
                    onCheckedChange={() => toggleAlert(alert.id)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Alert Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Alert Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="latency">Latency</SelectItem>
                    <SelectItem value="error">Error Rate</SelectItem>
                    <SelectItem value="throughput">Throughput</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Condition</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exceeds">Exceeds</SelectItem>
                    <SelectItem value="below">Below</SelectItem>
                    <SelectItem value="equals">Equals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Threshold</label>
                <Input placeholder="Enter threshold value" type="number" />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button>Create Alert</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AlertsPanel;
