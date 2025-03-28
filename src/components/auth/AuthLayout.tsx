"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { toast } from "../ui/use-toast";
import AccessDenied from "./AccessDenied";
import { RoleManager } from "@/lib/roles";

// Supabase client initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Mapping of routes to required roles
const ROUTE_ROLE_REQUIREMENTS: { [key: string]: string[] } = {
  '/dashboard': ['admin', 'supervisor', 'storeman', 'clerk', 'inventory-manager', 'warehouse-manager', 'financial-controller'],
  '/transactions': ['admin', 'supervisor', 'storeman', 'clerk', 'financial-controller'],
  '/inventory': ['admin', 'supervisor', 'inventory-manager', 'warehouse-manager'],
  '/storerooms': ['admin', 'supervisor', 'warehouse-manager'],
  '/settings': ['admin'],
  '/users': ['admin'],
  '/reports': ['admin', 'financial-controller']
};

interface AuthLayoutProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function AuthLayout({ 
  children, 
  requiredRoles = [] 
}: AuthLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No active session, redirect to login
          router.replace('/login');
          return;
        }

        // Fetch user profile to get role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profileData) {
          throw new Error('Could not fetch user profile');
        }

        const role = profileData.role;
        setUserRole(role);

        // Check route-specific role requirements
        const routeRoles = ROUTE_ROLE_REQUIREMENTS[pathname] || [];
        const explicitRoles = requiredRoles.length > 0 ? requiredRoles : routeRoles;

        if (explicitRoles.length > 0 && !explicitRoles.includes(role)) {
          // User doesn't have required role
          setAccessDenied(true);
          return;
        }

      } catch (error) {
        console.error('Authentication check failed:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRole();
  }, [router, requiredRoles, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (accessDenied) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
