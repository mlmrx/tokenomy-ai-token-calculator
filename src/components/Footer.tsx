
import React from "react";
import { Linkedin, Twitter, Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t py-4 px-4 md:px-6 bg-background">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} TOKENOMY.AI. All rights reserved.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
             className="text-muted-foreground hover:text-foreground transition-colors">
            <Linkedin size={20} />
            <span className="sr-only">LinkedIn</span>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
             className="text-muted-foreground hover:text-foreground transition-colors">
            <Twitter size={20} />
            <span className="sr-only">Twitter</span>
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
             className="text-muted-foreground hover:text-foreground transition-colors">
            <Github size={20} />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
