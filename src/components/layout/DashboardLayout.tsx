"use client";

import React, { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import Header from "./Header";

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
  userRole = "admin",
  userName = "John Doe",
  userAvatar = "",
}: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

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
    // Navigate to settings or open settings modal
  };

  const handleLogoutClick = () => {
    console.log("Logout clicked");
    // Implement logout logic here
  };

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
