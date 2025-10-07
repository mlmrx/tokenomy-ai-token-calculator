import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { TelemetryDashboard } from "@/components/enterprise/TelemetryDashboard";
import { SLODashboard } from "@/components/enterprise/SLODashboard";
import { BillingPortal } from "@/components/enterprise/BillingPortal";
import { PolicyEditor } from "@/components/enterprise/PolicyEditor";
import { AnomalyDetection } from "@/components/enterprise/AnomalyDetection";
import { RouteHealthMonitor } from "@/components/enterprise/RouteHealthMonitor";
import { Activity, DollarSign, Target, Route, AlertTriangle, TrendingUp } from "lucide-react";
import { Helmet } from "react-helmet-async";

const EnterpriseObservability = () => {
  const [activeTab, setActiveTab] = useState("telemetry");

  return (
    <>
      <Helmet>
        <title>Enterprise AI Observability Platform | Real-time Cost & Performance Tracking</title>
        <meta
          name="description"
          content="Enterprise-grade AI observability with real-time telemetry, SLO tracking, cost analytics, intelligent routing, and automated billing. Monitor and optimize your AI infrastructure at scale."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 backdrop-blur-sm">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Enterprise Observability Platform
                </h1>
                <p className="text-muted-foreground mt-1">
                  Real-time telemetry, cost tracking, SLO monitoring, and intelligent routing for AI infrastructure
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Events/sec</p>
                    <p className="text-2xl font-bold">2.4k</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Today</p>
                    <p className="text-2xl font-bold">$347</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">SLO Conformance</p>
                    <p className="text-2xl font-bold">99.7%</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Savings</p>
                    <p className="text-2xl font-bold">63%</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto">
              <TabsTrigger value="telemetry" className="gap-2">
                <Activity className="w-4 h-4" />
                Telemetry
              </TabsTrigger>
              <TabsTrigger value="slo" className="gap-2">
                <Target className="w-4 h-4" />
                SLOs
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="routing" className="gap-2">
                <Route className="w-4 h-4" />
                Routing
              </TabsTrigger>
              <TabsTrigger value="anomalies" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Anomalies
              </TabsTrigger>
              <TabsTrigger value="health" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Health
              </TabsTrigger>
            </TabsList>

            <TabsContent value="telemetry">
              <TelemetryDashboard />
            </TabsContent>

            <TabsContent value="slo">
              <SLODashboard />
            </TabsContent>

            <TabsContent value="billing">
              <BillingPortal />
            </TabsContent>

            <TabsContent value="routing">
              <PolicyEditor />
            </TabsContent>

            <TabsContent value="anomalies">
              <AnomalyDetection />
            </TabsContent>

            <TabsContent value="health">
              <RouteHealthMonitor />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default EnterpriseObservability;
