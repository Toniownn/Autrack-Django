import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: { username: string; role: string } | null;
  setUser: React.Dispatch<
    React.SetStateAction<{ username: string; role: string } | null>
  >;
  loading: boolean; // ✅ Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{ username: string; role: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true); // ✅ start loading

  useEffect(() => {
    fetch("http://localhost:8000/api/check-session/", {
      method: "GET",
      credentials: "include", // important
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username)
          setUser({ username: data.username, role: data.role });
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false)); // ✅ stop loading
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
