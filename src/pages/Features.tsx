
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart4, Zap, Database, Shield, FileText, Rocket } from "lucide-react";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Token Calculation",
    description: "Precisely calculate tokens for any AI model. Understand and optimize your prompt usage for maximum efficiency.",
    icon: <BarChart4 className="h-12 w-12 text-blue-500" />,
    color: "bg-blue-100",
    animation: { delay: 0.1 },
    linkTo: "/?tab=calculator"
  },
  {
    title: "Speed Simulation",
    description: "Visualize model processing speeds. See how different AI models process your content in real-time.",
    icon: <Zap className="h-12 w-12 text-purple-500" />,
    color: "bg-purple-100",
    animation: { delay: 0.2 },
    linkTo: "/?tab=speed"
  },
  {
    title: "Cost Estimation",
    description: "Get accurate cost estimates for all major AI providers. Make informed decisions about your AI investments.",
    icon: <Database className="h-12 w-12 text-green-500" />,
    color: "bg-green-100",
    animation: { delay: 0.3 },
    linkTo: "/?tab=calculator&subtab=model-comparison"
  },
  {
    title: "Memory Calculation", 
    description: "Plan your AI system's memory requirements. Understand how tokens translate to computational resources.",
    icon: <Shield className="h-12 w-12 text-amber-500" />,
    color: "bg-amber-100",
    animation: { delay: 0.4 },
    linkTo: "/?tab=memory"
  },
  {
    title: "Tokenization Analysis",
    description: "See how different models tokenize your content. Understand the differences between various encoding schemes.",
    icon: <FileText className="h-12 w-12 text-rose-500" />,
    color: "bg-rose-100",
    animation: { delay: 0.5 },
    linkTo: "/?tab=calculator&subtab=tokenization"
  },
  {
    title: "Model Comparison",
    description: "Compare different AI models side-by-side. Find the perfect balance between performance and cost.",
    icon: <Rocket className="h-12 w-12 text-indigo-500" />,
    color: "bg-indigo-100",
    animation: { delay: 0.6 },
    linkTo: "/?tab=calculator&subtab=visualization"
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <section className="py-24 container mx-auto px-4">
        <div
          className="text-center mb-16 opacity-0 translate-y-5 animate-[fadeIn_0.6s_ease-out_forwards]"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500">
            Powerful Token Management Features
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            Tokenomy provides powerful tools to analyze, optimize, and manage your AI token usage across all major models.
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="group opacity-0 translate-y-4 animate-[fadeIn_0.5s_ease-out_forwards] hover:scale-103 transition-transform duration-200"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <Link to={feature.linkTo} className="block h-full">
                <Card className="p-6 h-full border border-border hover:border-primary/20 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex flex-col h-full">
                    <div className={`p-4 rounded-lg w-fit mb-5 ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <div className="mt-4">
                      <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/10 p-0 flex items-center gap-2">
                        Try Now <span className="text-lg">→</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        <div
          className="bg-gradient-to-r from-violet-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl p-8 md:p-12 shadow-xl opacity-0 scale-95 animate-[fadeIn_0.5s_0.4s_ease-out_forwards,scaleIn_0.5s_0.4s_ease-out_forwards]"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Interactive Visualizations</h2>
              <p className="text-lg mb-6 text-muted-foreground">
                See your token usage come to life with interactive charts and graphs. Understand patterns, costs, and optimization opportunities at a glance.
              </p>
              <ul className="space-y-3">
                {["Real-time token counting", "Dynamic cost projections", "Model comparison tools", "Token distribution analysis"].map((item, i) => (
                <li key={i} className="flex items-center">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary mr-3">✓</span>
                  {item}
                </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link to="/?tab=calculator&subtab=visualization">
                  <Button variant="outline" className="border-primary/30 bg-primary/10 hover:bg-primary/20">
                    Try Interactive Charts
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-lg border border-border/50 overflow-hidden">
              <div className="h-64 w-full">
                <img 
                  src="https://framerusercontent.com/images/MfRYOoU4j3j96zgK3WiQfAUjCc.png" 
                  alt="Interactive visualization chart" 
                  className="w-full h-full object-cover object-center rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Features;
