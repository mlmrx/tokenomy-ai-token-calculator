
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

const NewsletterForm = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email) {
      toast({
        title: "Success!",
        description: "You've been subscribed to the newsletter.",
      });
      setSubmitted(true);
    }
  };

  return (
    <Card id="newsletter" className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Subscribe to Our Newsletter</CardTitle>
        <CardDescription>
          Get the latest updates on pricing, model releases, and optimization tips.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit">Subscribe</Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg font-medium">Thank you for subscribing!</p>
            <p className="text-sm text-center text-muted-foreground">
              You'll start receiving our newsletter at {email}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NewsletterForm;
