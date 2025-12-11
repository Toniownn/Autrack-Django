import React, { useEffect, useState } from "react";
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
import { useAuth } from "../../context/AuthContext";
import EditProfileModal from "../../modals/EditProfileModal";

export const UserProfile: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Modal state
  const [openProfile, setOpenProfile] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors duration-200"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/80 transition-colors duration-200">
            <User className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {user ? (
            <>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setOpenProfile(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      "http://127.0.0.1:8000/api/logout/",
                      {
                        method: "POST",
                        credentials: "include",
                      }
                    );

                    if (res.ok) {
                      setUser(null);
                      navigate("/login");
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate("/login")}>
                <LogIn className="w-4 h-4 mr-2" /> Login
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/signup")}>
                <User className="w-4 h-4 mr-2" /> Sign Up
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PROFILE MODAL */}
      {openProfile && user && (
        <EditProfileModal onClose={() => setOpenProfile(false)} user={user} />
      )}
    </div>
  );
};
