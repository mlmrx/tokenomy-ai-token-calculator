
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Twitter, Linkedin, Link, Mail, Share, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const ShareOptions = () => {
  const { toast } = useToast();
  const [emailRecipient, setEmailRecipient] = useState("");
  const appUrl = window.location.href;

  const handleSocialShare = (platform: string) => {
    let shareUrl = "";
    const text = "Check out this AI Token Calculator - TOKENOMY";
    
    switch (platform) {
      case "Facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
        break;
      case "Twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`;
        break;
      case "LinkedIn":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
        break;
      case "Email":
        const subject = encodeURIComponent("Check out this AI Token Calculator tool");
        const body = encodeURIComponent(`I thought you might find this useful: ${appUrl}`);
        shareUrl = `mailto:${emailRecipient}?subject=${subject}&body=${body}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
      toast({
        title: "Sharing",
        description: `Opening ${platform} to share this tool.`,
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content has been copied to clipboard.",
    });
  };

  return (
    <Card id="share" className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share className="h-5 w-5 text-primary" />
          <CardTitle>Share TOKENOMY</CardTitle>
        </div>
        <CardDescription>
          Share this tool with colleagues or friends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 min-w-[130px]" 
                onClick={() => handleSocialShare("Facebook")}
              >
                <Facebook size={18} />
                <span>Facebook</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200 min-w-[130px]" 
                onClick={() => handleSocialShare("Twitter")}
              >
                <Twitter size={18} />
                <span>Twitter</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 min-w-[130px]" 
                onClick={() => handleSocialShare("LinkedIn")}
              >
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 min-w-[130px]" 
                onClick={() => handleCopy(window.location.href)}
              >
                <Link size={18} />
                <span>Copy Link</span>
              </Button>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Input 
                  value={window.location.href} 
                  readOnly 
                  className="bg-muted/50"
                />
                <Button 
                  variant="secondary" 
                  onClick={() => handleCopy(window.location.href)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Recipient Email</label>
              <div className="flex items-center space-x-2">
                <Input 
                  type="email" 
                  placeholder="example@email.com" 
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSocialShare("Email")}
                  disabled={!emailRecipient}
                  className="flex items-center gap-2"
                >
                  <Mail size={16} />
                  <span>Send</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This will open your default email client with a pre-filled message.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="embed" className="space-y-4 pt-4">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                Embed this tool on your website by copying this code:
              </p>
              <Textarea 
                value={`<iframe src="${window.location.href}" width="100%" height="600" frameborder="0" title="TOKENOMY AI Token Calculator"></iframe>`}
                readOnly
                className="font-mono text-sm"
              />
              <div className="flex justify-between items-center mt-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => handleCopy(`<iframe src="${window.location.href}" width="100%" height="600" frameborder="0" title="TOKENOMY AI Token Calculator"></iframe>`)}
                >
                  <Link size={14} />
                  Copy Embed Code
                </Button>
                
                <a 
                  href="https://tokenomy.ai/embed-guide" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  Embedding guide
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ShareOptions;
