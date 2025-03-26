"use client";

import React from "react";
import { Bell, Search, Settings, User } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface HeaderProps {
  title?: string;
  notificationCount?: number;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

const Header = ({
  title = "StockFlowPro",
  notificationCount = 3,
  userName = "John Doe",
  userRole = "Admin",
  userAvatar = "",
  onNotificationsClick = () => {},
  onSettingsClick = () => {},
  onLogoutClick = () => {},
}: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white bg-opacity-10 backdrop-blur-md border-b border-gray-200 border-opacity-20 h-[70px] px-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-primary mr-8">{title}</h1>

        <div className="relative hidden md:flex items-center max-w-md w-full bg-white bg-opacity-5 rounded-full px-4 py-1.5 border border-gray-200 border-opacity-10">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search inventory, transactions..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={onNotificationsClick}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {notificationCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 p-0"
            >
              <Avatar>
                <AvatarImage
                  src={
                    userAvatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`
                  }
                  alt={userName}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userRole}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={onSettingsClick}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={onLogoutClick}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
