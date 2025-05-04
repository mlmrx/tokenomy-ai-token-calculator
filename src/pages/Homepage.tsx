
import React from "react";
import Layout from "@/components/Layout";

const Homepage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <section className="mb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Welcome to Tokenomy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Advanced AI token calculator and cost estimator for language models.
              Optimize your prompts and save on API costs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="/tools" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
              >
                Try Token Calculator
              </a>
              <a 
                href="/tools/energy" 
                className="inline-flex items-center justify-center rounded-md bg-secondary px-8 py-3 font-medium text-secondary-foreground shadow hover:bg-secondary/90 transition-colors"
              >
                Energy Estimator
              </a>
            </div>
          </div>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-3">Token Analysis</h3>
            <p className="text-muted-foreground">Calculate tokens and estimate costs across different AI models.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-3">Speed Simulation</h3>
            <p className="text-muted-foreground">Simulate token generation speeds for different models.</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-3">Energy Estimation</h3>
            <p className="text-muted-foreground">Calculate the environmental impact of your AI usage.</p>
          </div>
        </section>
        
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Tokenomy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold mb-3">Cost Optimization</h3>
              <p className="text-muted-foreground mb-4">
                Analyze and optimize your prompts to reduce token usage and save on API costs.
              </p>
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold mb-3">Model Comparison</h3>
              <p className="text-muted-foreground mb-4">
                Compare token counts and costs across different AI models to find the best fit.
              </p>
            </div>
          </div>
        </section>
        
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to optimize your AI usage?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start using our tools today to analyze, optimize, and save on your AI costs.
          </p>
          <a 
            href="/tools" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Get Started
          </a>
        </section>
      </div>
    </Layout>
  );
};

export default Homepage;
