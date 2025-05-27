
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call the Supabase Edge Function
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: { ...formData, recipientEmail: 'hr@unifydynamics.com' }
      });
      
      if (error) throw error;
      
      // Success message
      toast({
        title: "Message Sent!",
        description: "We've received your message and will get back to you soon.",
      });
      
      // Reset the form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <section className="py-24 container mx-auto px-4">
        <div
          className="text-center mb-16 opacity-0 translate-y-5 animate-[fadeIn_0.6s_ease-out_forwards]"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500">
            Contact Us
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start max-w-6xl mx-auto">
          <div
            className="opacity-0 -translate-x-5 animate-[fadeIn_0.6s_0.2s_ease-out_forwards]"
          >
            <Card className="p-8 border border-border shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Your name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    name="subject"
                    placeholder="What's this about?" 
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea 
                    id="message" 
                    name="message"
                    placeholder="Your message..." 
                    rows={6}
                    className="resize-none"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
          
          <div
            className="space-y-8 opacity-0 translate-x-5 animate-[fadeIn_0.6s_0.4s_ease-out_forwards]"
          >
            <Card className="p-8 border border-border shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Our Location</h3>
                  <p className="text-muted-foreground">555 Palo Alto</p>
                  <p className="text-muted-foreground">California, USA</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-8 border border-border shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Email Us</h3>
                  <p className="text-muted-foreground">
                    <a href="mailto:hr@unifydynamics.com" className="hover:text-primary transition-colors">
                      hr@unifydynamics.com
                    </a>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    We typically respond within 24-48 hours.
                  </p>
                </div>
              </div>
            </Card>
            
            <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-500/20 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Join Our Community</h3>
              <p className="text-muted-foreground mb-4">
                Connect with us and other users to share ideas, get help, and stay updated on the latest features.
              </p>
              <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="outline" className="bg-background" asChild>
  <a href="https://x.com/Tokenomy_AI" target="_blank" rel="noopener noreferrer">Twitter</a>
</Button>
<Button size="sm" variant="outline" className="bg-background" asChild>
  <a href="https://github.com/mlmrx" target="_blank" rel="noopener noreferrer">GitHub</a>
</Button>
<Button size="sm" variant="outline" className="bg-background" asChild>
  <a href="https://www.linkedin.com/company/tokenomy-ai" target="_blank" rel="noopener noreferrer">LinkedIn</a>
</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
