
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NewsletterPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsletterPopup = ({ open, onOpenChange }: NewsletterPopupProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Stay Updated!</DialogTitle>
          <DialogDescription>
            Subscribe to our newsletter for the latest updates on AI token optimization.
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-2">
          <iframe 
            src="https://embeds.beehiiv.com/090961f9-f60f-46a0-9376-6a17d6a558f9?slim=true" 
            data-test-id="beehiiv-embed" 
            height="52" 
            frameBorder="0" 
            scrolling="no" 
            style={{ 
              margin: 0, 
              borderRadius: '0px !important', 
              backgroundColor: 'transparent',
              width: '100%'
            }}
            title="Newsletter subscription"
          />
        </div>
        
        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button variant="outline" className="mt-2">
              Maybe later
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterPopup;
