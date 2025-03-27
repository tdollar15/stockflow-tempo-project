"use client";

import React, { useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { supabase, signOut } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?:
    | "admin"
    | "supervisor"
    | "storeman"
    | "clerk"
    | "supplier_driver"
    | "supplier_supervisor";
  userName?: string;
  userAvatar?: string;
}

const DashboardLayout = ({
  children,
  userRole: initialUserRole = "admin",
  userName: initialUserName = "John Doe",
  userAvatar: initialUserAvatar = "",
}: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState(initialUserRole);
  const [userName, setUserName] = useState(initialUserName);
  const [userAvatar, setUserAvatar] = useState(initialUserAvatar);
  const [isLoading, setIsLoading] = useState(false); // Changed to false to avoid loading screen
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Get user data from Supabase
          const { data: userData, error } = await supabase
            .from("users")
            .select("name, role")
            .eq("id", session.user.id)
            .single();

          if (!error && userData) {
            setUserRole(userData.role);
            setUserName(userData.name);
          }
        } else {
          // For demo purposes, we'll use a default admin user
          // In a real app, you might redirect to login
          const storedSession = localStorage.getItem("stockflowpro_session");
          if (storedSession) {
            try {
              const sessionData = JSON.parse(storedSession);
              if (sessionData.user) {
                setUserRole(sessionData.user.role);
                setUserName(
                  sessionData.user.name || sessionData.user.email.split("@")[0],
                );
              }
            } catch (e) {
              console.error("Error parsing stored session:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error in user authentication:", error);
        // Don't show error toast for demo purposes
      }
    };

    fetchUserData();
  }, []);

  // Get the current page title based on the pathname
  const getPageTitle = () => {
    const path = pathname.split("/").pop() || "dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNotificationsClick = () => {
    console.log("Notifications clicked");
    // Implement notifications panel logic here
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
    router.push("/settings");
  };

  const handleLogoutClick = async () => {
    try {
      // Sign out from Supabase
      await signOut();

      // Clear local storage
      localStorage.removeItem("stockflowpro_session");

      // Redirect to login page
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-200 overflow-hidden">
      <Sidebar
        userRole={userRole}
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getPageTitle()}
          userName={userName}
          userRole={userRole}
          userAvatar={userAvatar}
          onNotificationsClick={handleNotificationsClick}
          onSettingsClick={handleSettingsClick}
          onLogoutClick={handleLogoutClick}
        />

        <main
          className={cn(
            "flex-1 overflow-y-auto p-6 transition-all duration-300",
            sidebarCollapsed ? "ml-[70px]" : "ml-0",
          )}
        >
          <div className="container mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
