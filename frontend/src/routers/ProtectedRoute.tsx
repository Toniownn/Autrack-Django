import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedProps {
  children: React.ReactNode; // ✅ use React.ReactNode instead of JSX.Element
}

export const ProtectedRoute: React.FC<ProtectedProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // wrap children in fragment
};
