
import { Card } from "@/components/ui/card";
import { Rocket, Activity, Globe, Users } from "lucide-react";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <section className="py-24 container mx-auto px-4">
        <div
          className="text-center mb-16 opacity-0 translate-y-5 animate-[fadeIn_0.6s_ease-out_forwards]"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500">
            About Tokenomy
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            Smart AI Token Management & Optimization
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div
            className="opacity-0 -translate-x-5 animate-[fadeIn_0.6s_0.2s_ease-out_forwards]"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Purpose</h2>
            <p className="text-lg mb-4 text-muted-foreground">
              Tokenomy was created to help developers and businesses optimize their AI interactions by providing
              powerful tools for token analysis, cost estimation, and performance optimization.
            </p>
            <p className="text-lg mb-4 text-muted-foreground">
              In today's AI landscape, efficient token management can significantly reduce costs and improve
              system performance. Tokenomy makes these optimizations accessible to everyone, from individual developers
              to enterprise teams.
            </p>
          </div>
          
          <div
            className="opacity-0 translate-x-5 animate-[fadeIn_0.6s_0.2s_ease-out_forwards]"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Vision</h2>
            <p className="text-lg mb-4 text-muted-foreground">
              We envision a future where AI is more accessible, efficient, and sustainable. By providing tools that
              help users understand and optimize their token usage, we aim to reduce the environmental and financial
              costs of AI while maximizing its benefits.
            </p>
            <p className="text-lg text-muted-foreground">
              Tokenomy is committed to evolving alongside AI technologies, continuously adding support for new models
              and developing innovative features that help our users stay at the forefront of AI optimization.
            </p>
          </div>
        </div>

        <div
          className="mb-16 opacity-0 translate-y-5 animate-[fadeIn_0.6s_0.4s_ease-out_forwards]"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: <Rocket className="h-8 w-8 text-purple-500" />, 
                title: "Innovation", 
                description: "We continuously push the boundaries of what's possible in token optimization." 
              },
              { 
                icon: <Activity className="h-8 w-8 text-blue-500" />, 
                title: "Efficiency", 
                description: "We're committed to helping users achieve maximum results with minimum resources." 
              },
              { 
                icon: <Globe className="h-8 w-8 text-green-500" />, 
                title: "Accessibility", 
                description: "We believe AI tools should be accessible to everyone, regardless of technical expertise." 
              },
              { 
                icon: <Users className="h-8 w-8 text-amber-500" />, 
                title: "Community", 
                description: "We grow through collaboration and feedback from our diverse user community." 
              }
            ].map((value, index) => (
              <Card key={index} className="p-6 border border-border hover:border-primary/20 transition-all duration-300 opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <div
          className="text-center opacity-0 translate-y-5 animate-[fadeIn_0.6s_0.6s_ease-out_forwards]"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Us On Our Mission</h2>
          <p className="text-lg max-w-3xl mx-auto text-muted-foreground">
            Whether you're an AI researcher, developer, business owner, or simply curious about AI,
            Tokenomy is designed for you. Join our community and help us shape the future of AI optimization.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default About;
