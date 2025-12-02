import React from "react";
import { Building, Calendar, MessageSquare } from "lucide-react"; // changed icon
import { NavbarItem } from "./NavbarItem";

const role: "user" | "admin" = "admin"; // Todo: Replace with actual role check logic

interface NavigationLinksProps {
  className?: string;
  mobile?: boolean;
}

export const NavigationLinks: React.FC<NavigationLinksProps> = ({
  className = "",
  mobile = false,
}) => {
  const links = [
    {
      to: role === "admin" ? "admin/edit-room" : "/rooms",
      icon: Building,
      label: "Rooms",
    },
    {
      to: "/schedules",
      icon: Calendar,
      label: "Schedules",
    },
    {
      to: "/messages", // changed path
      icon: MessageSquare, // changed icon
      label: "Messages", // changed label
    },
  ];

  if (mobile) {
    return (
      <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${className}`}>
        {links.map((link) => (
          <NavbarItem key={link.to} to={link.to}>
            <link.icon className="w-4 h-4 mr-2" />
            {link.label}
          </NavbarItem>
        ))}
      </div>
    );
  }

  return (
    <div className={`hidden md:flex items-center space-x-1 ${className}`}>
      {links.map((link) => (
        <NavbarItem key={link.to} to={link.to}>
          <link.icon className="w-4 h-4 mr-2" />
          {link.label}
        </NavbarItem>
      ))}
    </div>
  );
};
