
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  provider: string;
  documentationUrl: string;
  sampleRequest?: string;
  sampleResponse?: string;
  authHeaders: Record<string, string>;
  responseStructure: string;
  usageMethod: string;
  validationRules?: {
    endpoint?: RegExp[];
    apiKey?: RegExp[];
    requiredParams?: string[];
  };
}

interface IntegrationDocumentationProps {
  integration: Integration;
}

const IntegrationDocumentation: React.FC<IntegrationDocumentationProps> = ({ integration }) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${type} copied successfully`,
    });
  };

  const getProviderInfo = () => {
    switch (integration.provider) {
      case 'openai':
        return {
          description: "OpenAI provides a direct usage API endpoint to retrieve your consumption data.",
          features: ["Direct usage endpoint", "Daily cost breakdown", "Model-specific costs"],
          authInfo: "Use Bearer token authentication with your API key from OpenAI Platform."
        };
      case 'google':
        return {
          description: "Google Gemini includes usage metadata in each API response.",
          features: ["Response metadata", "Per-request token counts", "Real-time usage tracking"],
          authInfo: "Use API key authentication. Get your key from Google AI Studio."
        };
      case 'azure':
        return {
          description: "Azure provides usage data through the Management API.",
          features: ["Subscription-based usage", "Location-specific data", "Quota monitoring"],
          authInfo: "Requires Azure subscription ID, location, and access token."
        };
      case 'aws':
        return {
          description: "AWS Bedrock usage is monitored through CloudWatch metrics.",
          features: ["CloudWatch integration", "Real-time metrics", "Custom dashboards"],
          authInfo: "Uses AWS IAM credentials with appropriate CloudWatch permissions."
        };
      case 'anthropic':
        return {
          description: "Anthropic includes usage data in each API response.",
          features: ["Response metadata", "Input/output token tracking", "Per-request billing"],
          authInfo: "Use Bearer token with API key format: sk-ant-..."
        };
      case 'mistral':
        return {
          description: "Mistral AI includes usage in response body and rate limits in headers.",
          features: ["Response metadata", "Rate limit headers", "Monthly quota tracking"],
          authInfo: "Use Bearer token from La Plateforme dashboard."
        };
      case 'cohere':
        return {
          description: "Cohere includes billing units in the response metadata.",
          features: ["Billed units tracking", "Input/output token counts", "Response metadata"],
          authInfo: "Use Bearer token from Cohere dashboard."
        };
      case 'ai21':
        return {
          description: "AI21 Labs tracks usage through the dashboard. No direct usage API.",
          features: ["Dashboard monitoring", "Enterprise analytics", "Custom reporting"],
          authInfo: "Use Bearer token from AI21 Studio."
        };
      case 'salesforce':
        return {
          description: "Salesforce Einstein integration is in development.",
          features: ["Coming soon", "Enterprise integration", "Salesforce ecosystem"],
          authInfo: "OAuth integration planned."
        };
      default:
        return {
          description: "Integration details for this provider.",
          features: ["API integration", "Usage tracking"],
          authInfo: "Authentication required."
        };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          {integration.name} Documentation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="request">Sample Request</TabsTrigger>
            <TabsTrigger value="response">Sample Response</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{providerInfo.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {providerInfo.features.map((feature, index) => (
                  <Badge key={index} variant="outline">{feature}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Usage Method</h4>
              <Badge variant="secondary">{integration.usageMethod.replace('_', ' ').toUpperCase()}</Badge>
            </div>

            <div>
              <h4 className="font-medium mb-2">Response Structure</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded block">{integration.responseStructure}</code>
            </div>

            <div>
              <h4 className="font-medium mb-2">Official Documentation</h4>
              <a 
                href={integration.documentationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-500 hover:underline text-sm"
              >
                View API Documentation <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </TabsContent>

          <TabsContent value="request" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Sample API Request</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(integration.sampleRequest || '', 'Request')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs">
                <code>{integration.sampleRequest || 'Sample request not available'}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="response" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Sample API Response</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(integration.sampleResponse || '', 'Response')}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs">
                <code>{integration.sampleResponse || 'Sample response not available'}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Authentication Method</h4>
              <p className="text-sm text-muted-foreground mb-4">{providerInfo.authInfo}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Required Headers</h4>
              <div className="space-y-2">
                {Object.entries(integration.authHeaders).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-muted p-2 rounded">
                    <div className="font-mono text-sm">
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${key}: ${value}`, 'Header')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {integration.validationRules && (
              <div>
                <h4 className="font-medium mb-2">Validation Rules</h4>
                <div className="space-y-2">
                  {integration.validationRules.requiredParams && (
                    <div>
                      <span className="text-sm font-medium">Required Parameters:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {integration.validationRules.requiredParams.map((param, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{param}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IntegrationDocumentation;
