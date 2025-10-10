import React from 'react';
import { Logo } from './Navbar/Logo';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-background border-t border-border mt-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo */}
          <Logo className="scale-90" />
          
          {/* Copyright */}
          <div className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Acme Inc. All rights reserved.
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <a 
              href="/privacy" 
              className="hover:text-foreground transition-colors duration-200"
            >
              Privacy
            </a>
            <a 
              href="/terms" 
              className="hover:text-foreground transition-colors duration-200"
            >
              Terms
            </a>
            <a 
              href="/contact" 
              className="hover:text-foreground transition-colors duration-200"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;