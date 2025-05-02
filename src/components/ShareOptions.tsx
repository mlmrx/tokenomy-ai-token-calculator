
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Facebook, Twitter, Linkedin, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const ShareOptions = () => {
  const { toast } = useToast();

  const handleShare = (platform: string) => {
    toast({
      title: "Share Requested",
      description: `Sharing to ${platform} would open in a new window.`,
    });
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
        <CardTitle>Share</CardTitle>
        <CardDescription>
          Share this tool or embed it on your website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="social">Social Share</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="social" className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShare("Facebook")}>
                <Facebook size={20} />
                <span>Facebook</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShare("Twitter")}>
                <Twitter size={20} />
                <span>Twitter</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => handleShare("LinkedIn")}>
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={() => handleCopy(window.location.href)}>
                <Link size={20} />
                <span>Copy Link</span>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="embed" className="space-y-4 pt-4">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                Embed this tool on your website by copying this code:
              </p>
              <Textarea 
                value={`<iframe src="${window.location.href}" width="100%" height="600" frameborder="0"></iframe>`}
                readOnly
                className="font-mono text-sm"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-2"
                onClick={() => handleCopy(`<iframe src="${window.location.href}" width="100%" height="600" frameborder="0"></iframe>`)}
              >
                Copy Embed Code
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ShareOptions;
