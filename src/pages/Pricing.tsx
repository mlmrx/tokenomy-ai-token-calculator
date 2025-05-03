
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Footer from "@/components/Footer";

const features = [
  "Unlimited token calculations",
  "Real-time model comparisons",
  "Speed simulation",
  "Memory calculator",
  "Token optimization suggestions",
  "Export results to CSV/PDF",
  "Support for all major AI models"
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <section className="py-24 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500">
            Simple & Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            Tokenomy is completely free to use. No hidden fees, no credit card required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-xl mx-auto"
        >
          <Card className="overflow-hidden border-2 border-primary shadow-lg">
            <div className="bg-primary p-6 text-white text-center">
              <h2 className="text-3xl font-bold mb-2">Free Forever</h2>
              <p className="opacity-90">No credit card required</p>
            </div>
            
            <div className="p-8">
              <div className="flex justify-center mb-8">
                <div className="text-center">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <CheckIcon className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                Get Started Now
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <h3 className="text-xl md:text-2xl font-bold mb-6">
            Why is Tokenomy completely free?
          </h3>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            We believe in making AI accessible to everyone. Tokenomy is our contribution to the AI community,
            helping developers and users optimize their AI interactions without any financial barriers.
          </p>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default Pricing;
