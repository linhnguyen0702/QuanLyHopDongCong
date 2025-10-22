"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { data: session, status, update } = useSession();

  // Set client flag on mount to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (!isClient) return; // Wait for client hydration

    const checkAuth = async () => {
      // Handle NextAuth session
      if (status === "loading") {
        return; // Still loading session
      }

      if (status === "authenticated" && session?.user) {
        // Convert NextAuth user to our User format with full database info
        const nextAuthUser: User = {
          id: parseInt(session.user.id) || 0,
          fullName: session.user.name || "",
          email: session.user.email || "",
          company: (session.user as any).company || "Google Account",
          role: (session.user as any).role || "user",
          department: (session.user as any).department,
          phone: (session.user as any).phone,
          createdAt: (session.user as any).createdAt,
        };

        // Kiểm tra nếu user chưa được đăng ký thì hiển thị thông báo
        if (!(session.user as any).isRegistered) {
          // Có thể thêm logic hiển thị banner thông báo ở đây
          console.log(
            "⚠️ User not registered in system but authenticated via Google"
          );
        }

        // Expose session globally so api client can forward email header
        if (typeof window !== 'undefined') {
          (window as any).nextauthSession = session as any;
        }

        setUser(nextAuthUser);
        setLoading(false);
        return;
      }

      // Only run on client side for custom auth
      if (typeof window === "undefined") {
        setLoading(false);
        return;
      }

      // If we have NextAuth session, don't try custom auth
      if (status === "authenticated" || (session && (session as any).user)) {
        setLoading(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        console.log(
          "Attempting to get profile from:",
          process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:5000/api" + "/auth/profile"
        );
        const response = await authApi.getProfile();
        console.log("Profile response:", response);

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
        console.error("Auth check error (full details):", error);
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
  }, [session, status, refreshTrigger, isClient]);

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
      // Handle NextAuth logout
      if (status === "authenticated") {
        await signOut({ redirect: false });
      } else {
        // Try to notify server for custom auth, but don't block logout if it fails
        await authApi.logout();
      }
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
      console.log("🔄 UpdateProfile called with data:", data);
      console.log("🔍 Auth status:", {
        status,
        hasSession: !!session,
        sessionUser: (session as any)?.user,
        sessionEmail: (session as any)?.user?.email,
      });

      // Try NextAuth API first (it will handle authentication internally)
      console.log("🔄 Trying NextAuth API route...");
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("📥 Profile update response:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        result: result,
      });

      if (response.ok && result.success) {
        console.log("✅ NextAuth API succeeded");

        // Update local user state immediately with the new data
        console.log("🔄 Updating local user state immediately");
        setUser((prev) => {
          if (!prev) return null;

          const updatedUser = {
            ...prev,
            fullName: data.fullName,
            company: data.company,
            department: data.department || "",
            phone: data.phone || "",
            // Update with backend data if available, otherwise keep existing
            ...(result.data && {
              id: result.data.id || prev.id,
              email: result.data.email || prev.email,
              role: result.data.role || prev.role,
              createdAt: result.data.createdAt || prev.createdAt,
              updatedAt: result.data.updatedAt || new Date().toISOString(),
            }),
          };

          console.log("✅ User state updated immediately:", updatedUser);
          return updatedUser;
        });

        // Try to update NextAuth session for persistence
        try {
          console.log("🔄 Updating NextAuth session...");
          await update();
          console.log("✅ NextAuth session updated");
        } catch (error) {
          console.error("❌ Failed to update NextAuth session:", error);
          // Continue anyway since we already updated local state
        }

        return { success: true };
      } else if (response.status === 401) {
        // NextAuth API failed due to no session, try traditional auth
        console.log(
          "� NextAuth API failed (no session), trying traditional auth..."
        );

        const token = getAuthToken();
        if (!token) {
          console.error("❌ No authentication token found");
          return {
            success: false,
            error: "Authentication required. Please login again.",
          };
        }

        console.log("Using traditional auth API for profile update");
        const authResponse = await authApi.updateProfile(data);
        if (authResponse.success) {
          // Update local user state immediately for traditional auth too
          setUser((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              fullName: data.fullName,
              company: data.company,
              department: data.department || "",
              phone: data.phone || "",
              updatedAt: new Date().toISOString(),
            };
          });

          // Also try to refresh from server for complete data
          try {
            const profileResponse = await authApi.getProfile();
            if (profileResponse.success && profileResponse.data) {
              setUser(profileResponse.data as User);
            }
          } catch (error) {
            console.error("❌ Failed to refresh user data:", error);
            // Continue anyway since we already updated local state
          }

          return { success: true };
        } else {
          console.error(
            "Traditional auth profile update failed:",
            authResponse
          );
          return {
            success: false,
            error: authResponse.message || "Profile update failed",
          };
        }
      } else {
        // NextAuth API failed for other reasons - DON'T fallback to traditional auth
        console.error(
          "❌ NextAuth API failed with status:",
          response.status,
          result
        );

        // If it's a NextAuth user but API failed, return the error instead of trying traditional auth
        return {
          success: false,
          error:
            result.message ||
            `API Error: ${response.status} ${response.statusText}`,
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
