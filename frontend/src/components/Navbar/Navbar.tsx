import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { NavigationLinks } from "./NavigationLinks";
import { UserProfile } from "./UserProfile";

interface NavbarProps {
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav
      className={`w-full bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section - Logo */}
          <Logo />

          {/* Center Section - Navigation Links (Desktop) */}
          <NavigationLinks />

          {/* Right Section - User Profile & Dark Mode */}
          <div className="flex items-center space-x-2">
            <UserProfile />

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <NavigationLinks mobile />
        </div>
      )}
    </nav>
  );
};
