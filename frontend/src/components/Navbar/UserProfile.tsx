import React, { useState } from "react";
import {
  Moon,
  Sun,
  LayoutDashboard,
  Settings,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useNavigate } from "react-router-dom"; 

export const UserProfile: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate(); // ✅ ADD THIS

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors duration-200">
              <User className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            {isLoggedIn ? (
              <>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => setIsLoggedIn(false)}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* AUTO LOGIN — NO AUTH MODAL */}
                <DropdownMenuItem onClick={() => setIsLoggedIn(true)}>
                  <LogIn className="w-4 h-4 mr-2" /> Login
                </DropdownMenuItem>

                {/* AUTO LOGIN FOR SIGN UP TOO */}
                <DropdownMenuItem onClick={() => setIsLoggedIn(true)}>
                  <User className="w-4 h-4 mr-2" /> Sign Up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
