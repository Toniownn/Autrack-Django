import React from "react";
import { NavLink } from "react-router-dom";

interface NavbarItemProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const NavbarItem: React.FC<NavbarItemProps> = ({
  to,
  children,
  className = "",
}) => {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `
        flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
        ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/80"}
        ${className}
      `
      }
    >
      {children}
    </NavLink>
  );
};
