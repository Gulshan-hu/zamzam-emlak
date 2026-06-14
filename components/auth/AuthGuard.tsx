"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "AGENCY_OWNER" | "AGENT" | "USER";
  fallbackUrl?: string;
};

export function AuthGuard({
  children,
  requiredRole,
  fallbackUrl = "/auth/login",
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        // Not logged in - redirect to login with return URL
        const returnUrl = encodeURIComponent(pathname);
        router.push(`${fallbackUrl}?returnUrl=${returnUrl}`);
        setIsAuthorized(false);
        return;
      }

      // Check role if required
      if (requiredRole) {
        const userRole = currentUser.user_metadata?.role as string | undefined;

        if (userRole !== requiredRole) {
          // Insufficient permissions - redirect to home
          router.push("/");
          setIsAuthorized(false);
          return;
        }
      }

      setIsAuthorized(true);
    }

    checkAuth();
  }, [pathname, router, fallbackUrl, requiredRole]);

  // Show nothing while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-text-muted">Yoxlanılır...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
