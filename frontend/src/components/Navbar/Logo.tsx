import React from "react";
import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react"; // or another icon

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <Link to="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <CalendarDays className="w-5 h-5 text-primary-foreground" />
      </div>
      <span className="text-xl font-bold text-foreground">Autrack</span>
    </Link>
  );
};
