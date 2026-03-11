import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../api/api";
import type { User, LoginResponse } from "../types";

// 1. Define what the context provides
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

// 2. Create the context (starts as undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Provider component wraps the app and provides auth state to all children
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user has a saved token and fetch their profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/user")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<LoginResponse>("/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 4. Custom hook — use this in any component to access auth state
//    Example: const { user, isAdmin, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
