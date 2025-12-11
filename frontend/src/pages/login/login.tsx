import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext

export default function LoginUI() {
  const { setUser } = useAuth(); // Get setUser from context
  const navigate = useNavigate(); // To navigate after login

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Save user in context and localStorage
        setUser({ username: data.username, role: data.role });
        localStorage.setItem(
          "user",
          JSON.stringify({ username: data.username, role: data.role })
        );

        // ✅ Navigate automatically to app routes
        navigate("/");

        setUsername("");
        setPassword("");
      } else {
        setErrorMsg(data.errors.join(", "));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-blue-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-xl border bg-gray-100 text-card-foreground shadow-xl p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in and don’t let your ideas fade. Note them down and make them
            happen.
          </p>
        </div>

        {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="pl-9 text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 h-9 text-sm font-semibold bg-gradient-to-r from-orange-600 to-orange-400 text-white hover:opacity-90 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
