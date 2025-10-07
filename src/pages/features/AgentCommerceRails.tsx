import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Receipt, Users, TrendingUp, Download, FileText, CreditCard, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GlassmorphicTheme from "@/components/GlassmorphicTheme";

const AgentCommerceRails = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Usage ledger data
  const ledgerData = [
    {
      id: 'li_7f2a8d',
      timestamp: '2025-10-07 17:31:22',
      user: 'u_12873',
      agent: 'coding_assistant',
      workflow: 'fn_extract_icd10_v3',
      provider: 'groq',
      model: 'llama-4-70b',
      tu_in: 812,
      tu_out: 276,
      amount: 0.00184,
      status: 'settled'
    },
    {
      id: 'li_8e3b9f',
      timestamp: '2025-10-07 17:28:15',
      user: 'u_45612',
      agent: 'medical_coder',
      workflow: 'fn_diagnosis_mapper',
      provider: 'openai',
      model: 'o4-mini',
      tu_in: 624,
      tu_out: 198,
      amount: 0.00156,
      status: 'settled'
    }
  ];

  // Revenue data
  const revenueData = [
    { month: 'Jan', revenue: 12400, cost: 4200, margin: 8200 },
    { month: 'Feb', revenue: 14800, cost: 4800, margin: 10000 },
    { month: 'Mar', revenue: 16200, cost: 5100, margin: 11100 },
    { month: 'Apr', revenue: 18900, cost: 5700, margin: 13200 },
    { month: 'May', revenue: 21400, cost: 6300, margin: 15100 },
    { month: 'Jun', revenue: 24700, cost: 7100, margin: 17600 }
  ];

  // Revenue sharing splits
  const revShareData = [
    { party: 'Agent Vendor', share: 60, amount: 14820 },
    { party: 'Platform', share: 30, amount: 7410 },
    { party: 'Reseller', share: 10, amount: 2470 }
  ];

  const revSharePie = [
    { name: 'Agent Vendor', value: 60, color: '#10b981' },
    { name: 'Platform', value: 30, color: '#3b82f6' },
    { name: 'Reseller', value: 10, color: '#8b5cf6' }
  ];

  // Plans & pricing
  const plans = [
    {
      name: 'Starter',
      price: 99,
      type: 'per-month',
      features: ['10K TU/month', 'Basic analytics', 'Email support'],
      users: 124
    },
    {
      name: 'Professional',
      price: 499,
      type: 'per-month',
      features: ['100K TU/month', 'Advanced analytics', 'Priority support', 'Custom policies'],
      users: 67
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      type: 'contact-sales',
      features: ['Unlimited TU', 'White-label', 'Dedicated support', 'SLA guarantees'],
      users: 12
    }
  ];

  // Entitlements & quotas
  const entitlements = [
    { user: 'u_12873', plan: 'Professional', quota: 100000, used: 67420, limit_type: 'soft', status: 'active' },
    { user: 'u_45612', plan: 'Starter', quota: 10000, used: 9834, limit_type: 'hard', status: 'warning' },
    { user: 'u_78901', plan: 'Enterprise', quota: -1, used: 245800, limit_type: 'none', status: 'active' }
  ];

  // Invoices
  const invoices = [
    { id: 'inv_2025_06', period: 'June 2025', amount: 24700, status: 'paid', due_date: '2025-07-01' },
    { id: 'inv_2025_05', period: 'May 2025', amount: 21400, status: 'paid', due_date: '2025-06-01' },
    { id: 'inv_2025_04', period: 'April 2025', amount: 18900, status: 'paid', due_date: '2025-05-01' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <GlassmorphicTheme variant="hero" className="p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Agent Commerce Rails
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Usage-verified billing & revenue sharing for agent ecosystems
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Invoice
              </Button>
            </div>
          </div>
        </GlassmorphicTheme>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MRR</p>
                  <p className="text-2xl font-bold">$24.7K</p>
                  <p className="text-xs text-green-500">↑ 15.4% growth</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>

          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Customers</p>
                  <p className="text-2xl font-bold">203</p>
                  <p className="text-xs text-blue-500">↑ 12 this month</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>

          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Margin</p>
                  <p className="text-2xl font-bold">71.2%</p>
                  <p className="text-xs text-green-500">Target: 70%</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>

          <GlassmorphicTheme variant="card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Settlements</p>
                  <p className="text-2xl font-bold">$8.4K</p>
                  <p className="text-xs text-muted-foreground">3 invoices</p>
                </div>
                <Receipt className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </GlassmorphicTheme>
        </div>

        {/* Main Content */}
        <GlassmorphicTheme variant="card" className="rounded-2xl">
          <Tabs defaultValue="ledger" className="p-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="ledger">Usage Ledger</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
              <TabsTrigger value="entitlements">Entitlements</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="revshare">Rev Share</TabsTrigger>
            </TabsList>

            <TabsContent value="ledger" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Immutable Usage Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ledgerData.map((item) => (
                      <div key={item.id} className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{item.id}</Badge>
                            <span className="font-medium">{item.agent}</span>
                            <Badge variant={item.status === 'settled' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                          </div>
                          <span className="font-bold">${item.amount.toFixed(5)}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">User</p>
                            <p className="font-mono">{item.user}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Provider/Model</p>
                            <p>{item.provider} / {item.model}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tokens</p>
                            <p>{item.tu_in} in / {item.tu_out} out</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Timestamp</p>
                            <p className="font-mono text-xs">{item.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue & Margin Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                      <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                      <Bar dataKey="margin" fill="#3b82f6" name="Margin" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">15.4%</p>
                    <p className="text-sm text-muted-foreground mt-2">Month-over-month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ARPU</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">$121.67</p>
                    <p className="text-sm text-muted-foreground mt-2">Average revenue per user</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>LTV:CAC</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">4.2:1</p>
                    <p className="text-sm text-muted-foreground mt-2">Lifetime value ratio</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="plans" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="text-3xl font-bold">
                        {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                        {typeof plan.price === 'number' && (
                          <span className="text-sm font-normal text-muted-foreground">/{plan.type}</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Active Users</p>
                        <p className="text-2xl font-bold">{plan.users}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="entitlements" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Entitlements & Quotas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entitlements.map((ent, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-mono">{ent.user}</span>
                            <Badge>{ent.plan}</Badge>
                            <Badge variant={
                              ent.status === 'active' ? 'default' :
                              ent.status === 'warning' ? 'destructive' : 'secondary'
                            }>
                              {ent.status}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {ent.limit_type} limit
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Usage</span>
                            <span className="font-medium">
                              {ent.used.toLocaleString()} / {ent.quota === -1 ? '∞' : ent.quota.toLocaleString()} TU
                            </span>
                          </div>
                          {ent.quota !== -1 && (
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  (ent.used / ent.quota) >= 0.9 ? 'bg-red-500' :
                                  (ent.used / ent.quota) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((ent.used / ent.quota) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{invoice.id}</p>
                            <p className="text-sm text-muted-foreground">{invoice.period}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold">${invoice.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Due: {invoice.due_date}</p>
                          </div>
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                            {invoice.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revshare" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Share Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={revSharePie}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {revSharePie.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Split Amounts (Monthly)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {revShareData.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.party}</span>
                            <div className="text-right">
                              <p className="font-bold">${item.amount.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">{item.share}%</p>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${item.share}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Settlement Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium mb-1">Agent Vendor Split</p>
                      <p className="text-muted-foreground">60% of gross revenue, settled monthly via Stripe Connect</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium mb-1">Platform Fee</p>
                      <p className="text-muted-foreground">30% for infrastructure, support, and compliance</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium mb-1">Reseller Commission</p>
                      <p className="text-muted-foreground">10% promotional period (Q1-Q2 2025), subject to performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </GlassmorphicTheme>
      </div>
    </div>
  );
};

export default AgentCommerceRails;
