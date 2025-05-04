
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface LearnMoreSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const LearnMoreSidebar = ({ isOpen, onClose }: LearnMoreSidebarProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Learn More</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="how-to" className="mt-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="how-to">How to Use</TabsTrigger>
            <TabsTrigger value="functions">Functions</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="how-to" className="mt-4">
            <ScrollArea className="h-[70vh]">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Getting Started</h3>
                <p>Welcome to our AI Token Calculator! Follow these steps to get the most out of the tool:</p>
                
                <h4 className="text-md font-medium mt-4">1. Select Your Calculator</h4>
                <p>Choose between Token Calculator, Speed Simulator, or Memory Calculator based on your needs.</p>
                
                <h4 className="text-md font-medium mt-4">2. Token Calculator</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Select an AI model from the dropdown</li>
                  <li>Enter your prompt text or upload a file</li>
                  <li>Alternatively, use voice dictation to input text</li>
                  <li>View the token count, cost estimation, and other metrics</li>
                  <li>Use the suggested optimized prompt to reduce costs</li>
                </ol>
                
                <h4 className="text-md font-medium mt-4">3. Speed Simulator</h4>
                <p>Simulate token generation speed for different models:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Select model(s) to compare</li>
                  <li>Input parameters like context size and output tokens</li>
                  <li>View speed comparisons across models</li>
                </ol>
                
                <h4 className="text-md font-medium mt-4">4. Memory Calculator</h4>
                <p>Calculate memory requirements for large language models:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Input model parameters (hidden size, layers, etc.)</li>
                  <li>View memory requirements for training and inference</li>
                  <li>Compare with common hardware configurations</li>
                </ol>
                
                <Separator className="my-4" />
                
                <h3 className="text-lg font-semibold">Additional Features</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Login to save and track your usage history</li>
                  <li>Export results for reporting or analysis</li>
                  <li>Share results directly to social media</li>
                  <li>Subscribe to our newsletter for updates</li>
                  <li>Change interface language to your preference</li>
                </ul>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="functions" className="mt-4">
            <ScrollArea className="h-[70vh]">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Token Calculator</h3>
                <p>Analyzes text to provide:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Token count for different AI models</li>
                  <li>Cost estimation based on current pricing</li>
                  <li>Input/output cost breakdown</li>
                  <li>Character and token ratio analysis</li>
                  <li>Energy consumption estimates</li>
                  <li>Prompt optimization suggestions</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4">Speed Simulator</h3>
                <p>Simulates and compares token generation speeds:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>First token latency comparison</li>
                  <li>Tokens per second generation rates</li>
                  <li>Total request time simulation</li>
                  <li>Throughput analysis under different loads</li>
                  <li>Visual comparison between models</li>
                </ul>
                
                <h3 className="text-lg font-semibold mt-4">Memory Calculator</h3>
                <p>Calculates memory requirements for LLMs:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Model parameter count estimation</li>
                  <li>Training memory requirements</li>
                  <li>Inference memory requirements</li>
                  <li>Hardware recommendations</li>
                  <li>Multi-GPU training configurations</li>
                  <li>Quantization effects simulation</li>
                </ul>
                
                <Separator className="my-4" />
                
                <h3 className="text-lg font-semibold">Account Features</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Save calculation history</li>
                  <li>Custom model presets</li>
                  <li>Usage statistics and trends</li>
                  <li>Export data to CSV, PDF, or JSON</li>
                  <li>API access for enterprise users</li>
                </ul>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="faq" className="mt-4">
            <ScrollArea className="h-[70vh]">
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is a token?</AccordionTrigger>
                    <AccordionContent>
                      Tokens are chunks of text that AI models process. They can be as short as one character or as long as one word. English text typically averages about 4 characters per token.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Why do different models have different token counts?</AccordionTrigger>
                    <AccordionContent>
                      Each AI model uses its own tokenization scheme, trained on different data. This leads to variations in how text is split into tokens across models.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How accurate is the cost estimation?</AccordionTrigger>
                    <AccordionContent>
                      Our cost estimations are based on the latest published pricing from each AI provider. Prices may change, and actual billing might include additional factors like API usage fees.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>What is token speed?</AccordionTrigger>
                    <AccordionContent>
                      Token speed refers to how quickly a model can generate new tokens. It includes first token latency (time to generate the first token) and throughput (tokens per second thereafter).
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How is energy consumption estimated?</AccordionTrigger>
                    <AccordionContent>
                      Energy estimates are based on published research about model efficiency and datacenter energy profiles. These are approximations and actual consumption may vary.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6">
                    <AccordionTrigger>What affects memory requirements for LLMs?</AccordionTrigger>
                    <AccordionContent>
                      Key factors include: model size (parameters), batch size, sequence length, precision (FP16, FP32, INT8), and optimization techniques like activation checkpointing.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-7">
                    <AccordionTrigger>Can I use these calculators for commercial purposes?</AccordionTrigger>
                    <AccordionContent>
                      Yes, these tools are free to use for both personal and commercial planning. For high-volume API access, please contact us about enterprise options.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-8">
                    <AccordionTrigger>How often is pricing data updated?</AccordionTrigger>
                    <AccordionContent>
                      We strive to update pricing information within 24-48 hours of any announced changes by providers.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default LearnMoreSidebar;
