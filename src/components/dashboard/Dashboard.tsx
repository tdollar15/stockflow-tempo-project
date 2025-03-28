import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Clock, 
  DollarSign, 
  Warehouse, 
  Plus, 
  List, 
  Users, 
  Check, 
  BarChart 
} from "lucide-react";
import { DashboardService } from "@/lib/dashboard-service";

// Explicitly define allowed roles
type UserRole = 
  | 'admin' 
  | 'supervisor' 
  | 'storeman' 
  | 'clerk' 
  | 'inventory_manager' 
  | 'warehouse_manager' 
  | 'financial_controller';

// Mock auth context (to be replaced with actual implementation)
const useAuth = () => {
  return {
    user: {
      role: 'admin' as UserRole, // Default role for testing
      id: 'mock-user-id'
    }
  };
};

// Define types for better type safety
type SummaryCard = {
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: number;
  link?: string;
};

type QuickAction = {
  label: string;
  link: string;
  icon: string;
};

// Icon mapping with explicit type
const ICONS: Record<string, React.ComponentType<{className?: string}>> = {
  'package': Package,
  'clock': Clock,
  'dollar': DollarSign,
  'warehouse': Warehouse,
  'plus': Plus,
  'list': List,
  'users': Users,
  'check': Check,
  'chart': BarChart
};

export function Dashboard() {
  const { user } = useAuth();
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [dashboardConfig, setDashboardConfig] = useState<any>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;

      try {
        // Fetch dashboard configuration
        const config = await DashboardService.getDashboardConfig(user.role);
        setDashboardConfig(config);

        // Generate summary cards
        const cards = await DashboardService.generateSummaryCards(user.role);
        setSummaryCards(cards);

        // Get quick actions
        const actions = DashboardService.getQuickActions(user.role);
        setQuickActions(actions);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
        // TODO: Add error handling UI
      }
    }

    loadDashboardData();
  }, [user]);

  if (!user || !dashboardConfig) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Summary Cards Section */}
      <div className="summary-cards col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {summaryCards.map((card, index) => {
          const Icon = ICONS[card.icon] || Package;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 text-${card.color}-500`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.change && (
                  <p className={`text-xs ${card.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {card.change > 0 ? '+' : ''}{card.change}% from last period
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions col-span-full">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = ICONS[action.icon] || Package;
            return (
              <Button 
                key={index} 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => window.location.href = action.link}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
