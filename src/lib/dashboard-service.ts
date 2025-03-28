import { z } from 'zod';
import { InventoryService } from './inventory-service';
import { TransactionService } from './transaction-service';
import { StoreroomService } from './storeroom-service';
import { AnalyticsService } from './analytics-service';

// Role-based dashboard configuration schema
const DashboardConfigSchema = z.object({
  role: z.enum([
    'admin', 
    'supervisor', 
    'storeman', 
    'clerk', 
    'inventory_manager', 
    'warehouse_manager', 
    'financial_controller'
  ]),
  permissions: z.object({
    view_inventory: z.boolean(),
    view_transactions: z.boolean(),
    view_analytics: z.boolean(),
    create_transaction: z.boolean(),
    manage_storerooms: z.boolean()
  })
});

// Dashboard summary card schema
const SummaryCardSchema = z.object({
  title: z.string(),
  value: z.number(),
  change: z.number().optional(),
  icon: z.string(),
  color: z.string(),
  link: z.string().optional()
});

export class DashboardService {
  // Get dashboard configuration based on user role
  static async getDashboardConfig(role: z.infer<typeof DashboardConfigSchema>['role']) {
    const permissionsMap = {
      'admin': {
        view_inventory: true,
        view_transactions: true,
        view_analytics: true,
        create_transaction: true,
        manage_storerooms: true
      },
      'supervisor': {
        view_inventory: true,
        view_transactions: true,
        view_analytics: false,
        create_transaction: false,
        manage_storerooms: true
      },
      'storeman': {
        view_inventory: true,
        view_transactions: true,
        view_analytics: false,
        create_transaction: true,
        manage_storerooms: false
      },
      'clerk': {
        view_inventory: false,
        view_transactions: true,
        view_analytics: false,
        create_transaction: true,
        manage_storerooms: false
      },
      'inventory_manager': {
        view_inventory: true,
        view_transactions: true,
        view_analytics: true,
        create_transaction: false,
        manage_storerooms: false
      },
      'warehouse_manager': {
        view_inventory: true,
        view_transactions: true,
        view_analytics: false,
        create_transaction: true,
        manage_storerooms: true
      },
      'financial_controller': {
        view_inventory: false,
        view_transactions: true,
        view_analytics: true,
        create_transaction: false,
        manage_storerooms: false
      }
    };

    return DashboardConfigSchema.parse({
      role,
      permissions: permissionsMap[role]
    });
  }

  // Generate summary cards for dashboard
  static async generateSummaryCards(role: z.infer<typeof DashboardConfigSchema>['role']) {
    // Fetch data based on role
    const inventoryData = await InventoryService.getInventoryItems();
    const transactionsData = await TransactionService.getTransactions();
    const storeroomsData = await StoreroomService.getStorerooms();
    const analyticsData = await AnalyticsService.aggregateData();

    // Generate role-specific summary cards
    const summaryCards: z.infer<typeof SummaryCardSchema>[] = [];

    switch (role) {
      case 'admin':
      case 'inventory_manager':
        summaryCards.push(
          {
            title: 'Total Inventory Items',
            value: inventoryData.data.length,
            change: this.calculatePercentageChange(inventoryData.data.length),
            icon: 'package',
            color: 'blue',
            link: '/inventory'
          },
          {
            title: 'Total Storerooms',
            value: storeroomsData.data.length,
            icon: 'warehouse',
            color: 'green',
            link: '/storerooms'
          }
        );
        break;

      case 'supervisor':
      case 'warehouse_manager':
        summaryCards.push(
          {
            title: 'Pending Transactions',
            value: transactionsData.data.filter(t => t.status === 'pending').length,
            icon: 'clock',
            color: 'yellow',
            link: '/transactions'
          }
        );
        break;

      case 'storeman':
      case 'clerk':
        summaryCards.push(
          {
            title: 'Recent Transactions',
            value: transactionsData.data.length,
            change: this.calculatePercentageChange(transactionsData.data.length),
            icon: 'exchange',
            color: 'purple',
            link: '/transactions'
          }
        );
        break;

      case 'financial_controller':
        summaryCards.push(
          {
            title: 'Total Transaction Value',
            value: analyticsData.total_transaction_value,
            change: this.calculatePercentageChange(analyticsData.total_transaction_value),
            icon: 'dollar',
            color: 'green',
            link: '/analytics'
          }
        );
        break;
    }

    return summaryCards.map(card => SummaryCardSchema.parse(card));
  }

  // Utility method to calculate percentage change
  private static calculatePercentageChange(currentValue: number, previousValue?: number): number {
    // For demonstration, using a mock calculation
    const baseValue = previousValue || currentValue * 0.9;
    return Math.round(((currentValue - baseValue) / baseValue) * 100);
  }

  // Generate quick action buttons based on role
  static getQuickActions(role: z.infer<typeof DashboardConfigSchema>['role']) {
    const actionMap = {
      'admin': [
        { label: 'Create Transaction', link: '/transactions/create', icon: 'plus' },
        { label: 'Manage Storerooms', link: '/storerooms', icon: 'warehouse' },
        { label: 'User Management', link: '/users', icon: 'users' }
      ],
      'supervisor': [
        { label: 'Approve Transactions', link: '/transactions/approval', icon: 'check' },
        { label: 'View Inventory', link: '/inventory', icon: 'package' }
      ],
      'storeman': [
        { label: 'Create Transaction', link: '/transactions/create', icon: 'plus' },
        { label: 'View Inventory', link: '/inventory', icon: 'package' }
      ],
      'clerk': [
        { label: 'Create Transaction', link: '/transactions/create', icon: 'plus' },
        { label: 'Transaction History', link: '/transactions', icon: 'list' }
      ],
      'inventory_manager': [
        { label: 'Inventory Analytics', link: '/analytics/inventory', icon: 'chart' },
        { label: 'Manage Inventory', link: '/inventory', icon: 'package' }
      ],
      'warehouse_manager': [
        { label: 'Create Transaction', link: '/transactions/create', icon: 'plus' },
        { label: 'Manage Storerooms', link: '/storerooms', icon: 'warehouse' }
      ],
      'financial_controller': [
        { label: 'Transaction Analytics', link: '/analytics/transactions', icon: 'dollar' },
        { label: 'View Transactions', link: '/transactions', icon: 'list' }
      ]
    };

    return actionMap[role] || [];
  }
}

// Export individual methods for easier importing
export const {
  getDashboardConfig,
  generateSummaryCards,
  getQuickActions
} = DashboardService;
