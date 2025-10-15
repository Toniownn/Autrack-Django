import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Facebook } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultView?: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  defaultView = "login",
}) => {
  const [view, setView] = useState<"login" | "register">(defaultView);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[340px] p-6 rounded-xl shadow-xl bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {view === "login" ? "Welcome Back" : "Create an Account"}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            {view === "login"
              ? "Sign in to access your classroom dashboard."
              : "Join us to start reserving classrooms easily."}
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <form className="mt-4 space-y-4">
          {view === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Carl Dayoc"
                  className="pl-9 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="carlgwapo123@example.com"
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {view === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 text-sm"
                />
              </div>
            </div>
          )}

          <Button className="w-full mt-2 h-9 text-sm font-semibold bg-gradient-to-r from-orange-600 to-orange-400 text-white hover:opacity-90 transition">
            {view === "login" ? "Login" : "Register"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-muted" />
          <span className="text-[11px] text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-muted" />
        </div>

        {/* Social Buttons */}
        <div className="flex flex-col gap-2.5">
          {/* Google Login */}
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 text-sm h-9 border border-orange-500/30 text-orange-600 hover:bg-orange-50"
          >
            {/* Custom Google "G" Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-4 h-4"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.82 2.56 30.24 0 24 0 14.64 0 6.4 5.35 2.54 13.11l7.98 6.2C12.34 13.04 17.74 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.1 24.5c0-1.64-.15-3.22-.44-4.75H24v9.01h12.46c-.54 2.91-2.15 5.38-4.57 7.05l7.01 5.44C43.78 37.12 46.1 31.24 46.1 24.5z"
              />
              <path
                fill="#4A90E2"
                d="M10.52 28.31A14.5 14.5 0 0 1 9.5 24c0-1.48.25-2.91.71-4.24l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.77.9 7.34 2.49 10.52l8.03-6.21z"
              />
              <path
                fill="#FBBC05"
                d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.01-5.44C30.91 38.7 27.63 39.5 24 39.5c-6.26 0-11.66-3.54-14.48-8.61l-8.03 6.21C6.4 42.65 14.64 48 24 48z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Facebook Login */}
          <Button className="flex items-center justify-center gap-2 text-sm h-9 bg-[#1877F2] text-white hover:bg-[#1565d8]">
            <Facebook className="w-4 h-4" /> Continue with Facebook
          </Button>
        </div>

        {/* Toggle */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {view === "login"
            ? "Don’t have an account?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setView(view === "login" ? "register" : "login")}
            className="text-orange-600 font-semibold hover:underline"
          >
            {view === "login" ? "Register" : "Login"}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};
