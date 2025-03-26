"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  CheckSquare,
  Calculator,
  Store,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  userRole?:
    | "admin"
    | "supervisor"
    | "storeman"
    | "clerk"
    | "supplier_driver"
    | "supplier_supervisor";
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({
  userRole = "admin",
  collapsed = false,
  onToggle = () => {},
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    onToggle();
  };

  // Define navigation items based on user role
  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/dashboard",
      roles: [
        "admin",
        "supervisor",
        "storeman",
        "clerk",
        "supplier_driver",
        "supplier_supervisor",
      ],
    },
    {
      title: "Inventory",
      icon: <Package size={20} />,
      href: "/inventory",
      roles: ["admin", "supervisor", "storeman", "clerk"],
    },
    {
      title: "Transactions",
      icon: <ClipboardList size={20} />,
      href: "/transactions",
      roles: [
        "admin",
        "supervisor",
        "storeman",
        "clerk",
        "supplier_driver",
        "supplier_supervisor",
      ],
    },
    {
      title: "Analytics",
      icon: <BarChart3 size={20} />,
      href: "/analytics",
      roles: ["admin", "supervisor"],
    },
    {
      title: "Approvals",
      icon: <CheckSquare size={20} />,
      href: "/approvals",
      roles: ["admin", "supervisor", "storeman"],
    },
    {
      title: "Calculator",
      icon: <Calculator size={20} />,
      href: "/calculator",
      roles: ["admin", "supervisor", "storeman", "clerk"],
    },
    {
      title: "Storerooms",
      icon: <Store size={20} />,
      href: "/storeroom",
      roles: ["admin", "supervisor"],
    },
    {
      title: "Users",
      icon: <Users size={20} />,
      href: "/users",
      roles: ["admin"],
    },
    {
      title: "Settings",
      icon: <Settings size={20} />,
      href: "/settings",
      roles: ["admin", "supervisor"],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <aside
      className={cn(
        "h-full bg-white bg-opacity-10 backdrop-blur-md border-r border-gray-200 border-opacity-20 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-[70px]" : "w-[280px]",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 border-opacity-20">
        {!isCollapsed && (
          <div className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              StockFlowPro
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md transition-all duration-200 group hover:bg-white hover:bg-opacity-10",
                          isActive
                            ? "bg-white bg-opacity-10 text-blue-500"
                            : "text-gray-700",
                        )}
                      >
                        <span
                          className={cn(
                            "transition-transform",
                            isActive ? "text-blue-500" : "text-gray-700",
                            isCollapsed ? "transform scale-110" : "",
                          )}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="ml-3 text-sm font-medium">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 border-opacity-20">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/logout"
                className="flex items-center px-3 py-2 rounded-md transition-all duration-200 text-gray-700 hover:bg-white hover:bg-opacity-10"
              >
                <LogOut size={20} className="text-gray-700" />
                {!isCollapsed && (
                  <span className="ml-3 text-sm font-medium">Logout</span>
                )}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
};

export default Sidebar;
