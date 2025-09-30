"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  authApi,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  type AuthResponse,
} from "@/lib/api";

interface User {
  id: number;
  fullName: string;
  email: string;
  company: string;
  role: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    fullName: string;
    email: string;
    password: string;
    company: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    fullName: string;
    company: string;
    department?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Only run on client side
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        if (response.success && response.data) {
          setUser(response.data as User);
        } else {
          // Only log error if it's not an authentication issue
          if (response.message && !response.message.includes("token")) {
            console.error("Auth check failed:", response.message);
          }
          removeAuthToken();
        }
      } catch (error) {
        // Only log unexpected errors, not auth failures
        if (error instanceof Error && !error.message.includes("token")) {
          console.error("Auth check failed:", error);
        }
        removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = (await authApi.login({
        email,
        password,
      })) as AuthResponse;
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        router.push("/");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    password: string;
    company: string;
    role?: string;
  }) => {
    try {
      const response = (await authApi.register(userData)) as AuthResponse;

      console.log("Registration response:", response); // Debug log

      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        router.push("/");
      } else {
        // Handle validation errors specifically
        if (response.errors && Array.isArray(response.errors)) {
          const errorMessages = response.errors
            .map((err) => err.msg || err.message)
            .join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);

      // Handle network/server errors
      if (error instanceof Error && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check if the server is running."
        );
      }

      throw error;
    }
  };

  const logout = async () => {
    try {
      // Try to notify server, but don't block logout if it fails
      await authApi.logout();
    } catch (error) {
      console.error("Server logout error (continuing anyway):", error);
    }

    // Always clear client-side auth state
    removeAuthToken();
    setUser(null);
    router.push("/login");
  };

  const updateProfile = async (data: {
    fullName: string;
    company: string;
    department?: string;
    phone?: string;
  }) => {
    try {
      const response = await authApi.updateProfile(data);
      if (response.success) {
        // Refresh user data
        const profileResponse = await authApi.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data as User);
        }
        return { success: true };
      } else {
        return {
          success: false,
          error: response.message || "Profile update failed",
        };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Profile update failed",
      };
    }
  };

  const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await authApi.changePassword(data);
      if (!response.success) {
        throw new Error(response.message || "Password change failed");
      }
    } catch (error) {
      console.error("Password change error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
