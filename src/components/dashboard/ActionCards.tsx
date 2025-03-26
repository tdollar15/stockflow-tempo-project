"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import {
  ClipboardList,
  Package,
  ArrowRightLeft,
  FileCheck,
  Users,
  Settings,
  BarChart3,
  AlertCircle,
} from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary" | "secondary" | "danger";
}

const ActionCard = ({
  title = "Action Card",
  description = "Description of this action",
  icon = <ClipboardList />,
  onClick = () => {},
  variant = "default",
}: ActionCardProps) => {
  const variantStyles = {
    default:
      "bg-white bg-opacity-10 backdrop-blur-md border border-gray-200 border-opacity-20 hover:bg-opacity-20",
    primary:
      "bg-blue-500 bg-opacity-10 backdrop-blur-md border border-blue-200 border-opacity-20 hover:bg-opacity-20",
    secondary:
      "bg-purple-500 bg-opacity-10 backdrop-blur-md border border-purple-200 border-opacity-20 hover:bg-opacity-20",
    danger:
      "bg-red-500 bg-opacity-10 backdrop-blur-md border border-red-200 border-opacity-20 hover:bg-opacity-20",
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg cursor-pointer",
        variantStyles[variant],
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className="text-primary p-2 rounded-full bg-primary bg-opacity-10">
            {icon}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          Open <span className="ml-1">→</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ActionCardsProps {
  userRole?: "admin" | "supervisor" | "storeman" | "clerk" | "supplier";
}

const ActionCards = ({ userRole = "clerk" }: ActionCardsProps) => {
  const router = useRouter();

  // Define cards based on user role
  const getCardsForRole = () => {
    const commonCards = [
      {
        title: "View Inventory",
        description: "Check current stock levels across storerooms",
        icon: <Package size={20} />,
        onClick: () => router.push("/inventory"),
        variant: "default" as const,
      },
      {
        title: "Transactions",
        description: "View and manage inventory transactions",
        icon: <ArrowRightLeft size={20} />,
        onClick: () => router.push("/transactions"),
        variant: "primary" as const,
      },
    ];

    switch (userRole) {
      case "admin":
        return [
          ...commonCards,
          {
            title: "User Management",
            description: "Add, edit, or remove system users",
            icon: <Users size={20} />,
            onClick: () => router.push("/users"),
            variant: "secondary" as const,
          },
          {
            title: "System Settings",
            description: "Configure system parameters and preferences",
            icon: <Settings size={20} />,
            onClick: () => router.push("/settings"),
            variant: "default" as const,
          },
          {
            title: "Analytics Dashboard",
            description: "View comprehensive system analytics",
            icon: <BarChart3 size={20} />,
            onClick: () => router.push("/analytics"),
            variant: "primary" as const,
          },
        ];
      case "supervisor":
        return [
          ...commonCards,
          {
            title: "Pending Approvals",
            description: "Review and approve transaction requests",
            icon: <FileCheck size={20} />,
            onClick: () => router.push("/approvals"),
            variant: "danger" as const,
          },
          {
            title: "Department Reports",
            description: "Generate and view department reports",
            icon: <BarChart3 size={20} />,
            onClick: () => router.push("/reports"),
            variant: "secondary" as const,
          },
        ];
      case "storeman":
        return [
          ...commonCards,
          {
            title: "Process Transactions",
            description: "Handle physical stock movements",
            icon: <FileCheck size={20} />,
            onClick: () => router.push("/process-transactions"),
            variant: "secondary" as const,
          },
          {
            title: "Storeroom Status",
            description: "View detailed storeroom information",
            icon: <AlertCircle size={20} />,
            onClick: () => router.push("/storeroom"),
            variant: "default" as const,
          },
        ];
      case "supplier":
        return [
          {
            title: "Purchase Orders",
            description: "View and manage purchase orders",
            icon: <ClipboardList size={20} />,
            onClick: () => router.push("/purchase-orders"),
            variant: "primary" as const,
          },
          {
            title: "Delivery Notes",
            description: "Submit delivery documentation",
            icon: <FileCheck size={20} />,
            onClick: () => router.push("/delivery-notes"),
            variant: "default" as const,
          },
          {
            title: "Payment Status",
            description: "Check payment status for deliveries",
            icon: <BarChart3 size={20} />,
            onClick: () => router.push("/payment-status"),
            variant: "secondary" as const,
          },
        ];
      case "clerk":
      default:
        return [
          ...commonCards,
          {
            title: "Create Transaction",
            description: "Initiate a new inventory transaction",
            icon: <ClipboardList size={20} />,
            onClick: () => router.push("/transactions/new"),
            variant: "secondary" as const,
          },
        ];
    }
  };

  const cards = getCardsForRole();

  return (
    <div className="w-full bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <ActionCard
            key={index}
            title={card.title}
            description={card.description}
            icon={card.icon}
            onClick={card.onClick}
            variant={card.variant}
          />
        ))}
      </div>
    </div>
  );
};

export default ActionCards;
