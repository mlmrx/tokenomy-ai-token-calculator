
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Copy,
  Code,
  FileText,
  ExternalLink,
} from 'lucide-react';

const ShareWidget = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('social');
  const shareUrl = window.location.href;
  const title = 'TOKENOMY - Smart AI Token Management & Optimization';

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: message,
    });
  };

  const openShareWindow = (url: string) => {
    window.open(
      url,
      'share-dialog',
      'width=600,height=400,location=no,menubar=no'
    );
  };

  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" style="border:none;"></iframe>`;

  return (
    <Card id="share" className="w-full max-w-2xl shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Share Tokenomy
        </CardTitle>
        <CardDescription>
          Share this tool with your team or embed it on your website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="social"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="social" className="flex gap-2 items-center">
              <ExternalLink className="h-4 w-4" />
              <span>Social Share</span>
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex gap-2 items-center">
              <Code className="h-4 w-4" />
              <span>Embed</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex gap-2 items-center">
              <FileText className="h-4 w-4" />
              <span>Link</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="social">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  openShareWindow(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      shareUrl
                    )}&text=${encodeURIComponent(title)}`
                  )
                }
                className="flex items-center gap-2 justify-center hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors"
              >
                <Twitter className="h-4 w-4" />
                <span>Twitter</span>
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  openShareWindow(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      shareUrl
                    )}&quote=${encodeURIComponent(title)}`
                  )
                }
                className="flex items-center gap-2 justify-center hover:bg-[#4267B2] hover:text-white hover:border-[#4267B2] transition-colors"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  openShareWindow(
                    `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                      shareUrl
                    )}&title=${encodeURIComponent(title)}`
                  )
                }
                className="flex items-center gap-2 justify-center hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors"
              >
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  window.location.href = `mailto:?subject=${encodeURIComponent(
                    title
                  )}&body=${encodeURIComponent(
                    `Check out this awesome tool: ${shareUrl}`
                  )}`
                }
                className="flex items-center gap-2 justify-center hover:bg-[#EA4335] hover:text-white hover:border-[#EA4335] transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="embed">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <code className="text-xs sm:text-sm whitespace-pre-wrap break-all">{embedCode}</code>
              </div>
              <Button
                onClick={() => handleCopy(embedCode, 'Embed code copied to clipboard')}
                className="w-full sm:w-auto"
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Embed Code
              </Button>
              <div className="border rounded-md p-4">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <div className="border border-dashed p-2 flex items-center justify-center">
                  <p className="text-muted-foreground">Embed preview would appear here</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="link">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => handleCopy(shareUrl, 'Link copied to clipboard')}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <p>
                  You can also copy the URL from your browser's address bar.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ShareWidget;

// Add missing Share2 import
import { Share2 } from "lucide-react";
