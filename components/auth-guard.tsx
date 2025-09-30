"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push("/login");
    }
  }, [loading, user, requireAuth, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        suppressHydrationWarning={true}
      >
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
          suppressHydrationWarning={true}
        ></div>
      </div>
    );
  }

  // If auth is required but user is not logged in, don't render children
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
}
