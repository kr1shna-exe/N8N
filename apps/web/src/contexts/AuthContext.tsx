import { authApi, type AuthUser } from "@/lib/auth";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to get current user:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signin = async (email: string, password: string) => {
    const userData = await authApi.signin({ email, password });
    setUser(userData);
  };

  const signup = async (email: string, password: string) => {
    const userData = await authApi.signup({ email, password });
    setUser(userData);
  };

  const signout = async () => {
    await authApi.signout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signin,
    signup,
    signout,
    isAuthenticated: !!user && authApi.isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
