
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, BarChart, LineChart, Leaf } from "lucide-react";
import Footer from "@/components/Footer";

const ToolsPage = () => {
  const tools = [
    {
      id: "calculator",
      title: "Token Calculator",
      description: "Calculate tokens for any AI model. Understand and optimize your prompt usage.",
      icon: <Calculator className="h-12 w-12 text-blue-500" />,
      gradient: "from-blue-600 to-indigo-500",
      path: "/tools"
    },
    {
      id: "speed",
      title: "Speed Simulator",
      description: "Visualize model processing speeds. See how different AI models process your content in real-time.",
      icon: <LineChart className="h-12 w-12 text-purple-500" />,
      gradient: "from-purple-600 to-pink-500",
      path: "/tools"
    },
    {
      id: "memory",
      title: "Memory Calculator",
      description: "Plan your AI system's memory requirements. Understand how tokens translate to computational resources.",
      icon: <BarChart className="h-12 w-12 text-amber-500" />,
      gradient: "from-amber-500 to-orange-600",
      path: "/tools"
    },
    {
      id: "energy",
      title: "Energy Estimator",
      description: "Calculate and visualize the environmental impact of AI token processing for more sustainable choices.",
      icon: <Leaf className="h-12 w-12 text-green-500" />,
      gradient: "from-green-500 to-emerald-600",
      path: "/tools/energy"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <section className="py-24 container mx-auto px-4">
        <div className="text-center mb-16 opacity-0 translate-y-5 animate-[fadeIn_0.6s_ease-out_forwards]">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500">
            AI Token Management Tools
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            Explore our suite of tools designed to help you understand, optimize, and manage your AI token usage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tools.map((tool, index) => (
            <div
              key={tool.id}
              className="opacity-0 translate-y-4 animate-[fadeIn_0.5s_ease-out_forwards]"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <Card className="h-full overflow-hidden border border-border hover:border-primary/20 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className={`h-2 bg-gradient-to-r ${tool.gradient}`}></div>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">{tool.icon}</div>
                    <CardTitle className="text-2xl">{tool.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">{tool.description}</CardDescription>
                  <Button asChild className={`bg-gradient-to-r ${tool.gradient} hover:opacity-90`}>
                    <Link to={tool.path}>Explore Tool</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ToolsPage;
