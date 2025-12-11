import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { User, Lock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

type SignUpData = {
  username: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  type: "S" | "T";
  password: string;
  confirm: string;
};

const initialValue: SignUpData = {
  username: "",
  first_name: "",
  last_name: "",
  middle_name: "",
  type: "S",
  password: "",
  confirm: "",
};

export default function Signup() {
  const [formData, setFormData] = useState<SignUpData>(initialValue);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (formData.password !== formData.confirm) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name,
          type: formData.type,
          password: formData.password,
          confirm: formData.confirm,
        }),
      });

      if (res.ok) {
        setSuccessMsg("Registration successful! You can now login.");
        setFormData(initialValue);
      } else {
        const data = await res.json();
        const firstError =
          data.username?.[0] ||
          data.password?.[0] ||
          data.non_field_errors?.[0] ||
          "Something went wrong.";

        setErrorMsg(firstError);
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
          <h1 className="text-2xl font-bold mb-3">Create an Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join us to start reserving classrooms easily.
          </p>
        </div>

        {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
        {successMsg && <p className="text-green-500 text-xs">{successMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="username"
                placeholder="Enter your username"
                className="pl-9 text-sm"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              placeholder="First Name"
              className="text-sm"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              placeholder="Last Name"
              className="text-sm"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="middle_name">Middle Name (optional)</Label>
            <Input
              id="middle_name"
              placeholder="Middle Name"
              className="text-sm"
              value={formData.middle_name}
              onChange={(e) =>
                setFormData({ ...formData, middle_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as "S" | "T" })
              }
              className="w-full border rounded p-2"
              required
            >
              <option value="S">Student</option>
              <option value="T">Teacher</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="pl-9 text-sm"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm"
                type="password"
                placeholder="Confirm your password"
                className="pl-9 text-sm"
                value={formData.confirm}
                onChange={(e) =>
                  setFormData({ ...formData, confirm: e.target.value })
                }
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 h-9 text-sm font-semibold bg-gradient-to-r from-orange-600 to-orange-400 text-white hover:opacity-90 transition flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
