import { z } from 'zod';
import { faker } from '@faker-js/faker';
import { InventoryService } from './inventory-service';
import { TransactionService } from './transaction-service';
import { StoreroomService } from './storeroom-service';

// Schemas for analytics queries
const InventoryStatusQuerySchema = z.object({
  storeroom_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  low_stock_threshold: z.number().positive().optional().default(20),
  high_stock_threshold: z.number().positive().optional().default(500)
});

const TransactionHistoryQuerySchema = z.object({
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  transaction_type: z.enum(['receipt', 'issuance', 'transfer', 'adjustment']).optional(),
  storeroom_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional()
});

const AggregationQuerySchema = z.object({
  groupBy: z.enum(['category', 'storeroom', 'transaction_type']).optional(),
  metric: z.enum(['total_quantity', 'total_value', 'transaction_count']).optional().default('total_quantity')
});

export class AnalyticsService {
  // Inventory status calculations
  static async getInventoryStatus(options: z.infer<typeof InventoryStatusQuerySchema> = {
    low_stock_threshold: 20,
    high_stock_threshold: 500
  }) {
    const validatedOptions = InventoryStatusQuerySchema.parse(options);

    // Fetch inventory items
    const inventoryData = await InventoryService.getInventoryItems({
      filters: {
        storeroom_id: validatedOptions.storeroom_id,
        category_id: validatedOptions.category_id
      }
    });

    // Analyze inventory status
    const inventoryStatus = inventoryData.data.map(item => ({
      ...item,
      status: this.calculateItemStatus(
        item.quantity, 
        validatedOptions.low_stock_threshold, 
        validatedOptions.high_stock_threshold
      )
    }));

    // Aggregate status summary
    const statusSummary = {
      total_items: inventoryStatus.length,
      low_stock_items: inventoryStatus.filter(item => item.status === 'low_stock').length,
      optimal_stock_items: inventoryStatus.filter(item => item.status === 'optimal').length,
      overstocked_items: inventoryStatus.filter(item => item.status === 'overstocked').length
    };

    return {
      items: inventoryStatus,
      summary: statusSummary
    };
  }

  // Calculate individual item status
  private static calculateItemStatus(
    quantity: number, 
    lowThreshold: number, 
    highThreshold: number
  ): 'low_stock' | 'optimal' | 'overstocked' {
    if (quantity < lowThreshold) return 'low_stock';
    if (quantity > highThreshold) return 'overstocked';
    return 'optimal';
  }

  // Transaction history tracking
  static async getTransactionHistory(options: z.infer<typeof TransactionHistoryQuerySchema> = {}) {
    const validatedOptions = TransactionHistoryQuerySchema.parse(options);

    // Fetch transactions with filters
    const transactionsData = await TransactionService.getTransactions({
      filters: {
        type: validatedOptions.transaction_type,
        start_date: validatedOptions.start_date,
        end_date: validatedOptions.end_date,
        created_by: validatedOptions.user_id
      }
    });

    // Group transactions by type or storeroom
    const groupedTransactions = this.groupTransactions(
      transactionsData.data, 
      validatedOptions
    );

    return {
      transactions: transactionsData.data,
      grouped_transactions: groupedTransactions
    };
  }

  // Group transactions for analytics
  private static groupTransactions(
    transactions: any[], 
    options: z.infer<typeof TransactionHistoryQuerySchema>
  ) {
    const groupedByType = transactions.reduce((acc, transaction) => {
      const key = transaction.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(transaction);
      return acc;
    }, {});

    const groupedByStoreroom = transactions.reduce((acc, transaction) => {
      const key = transaction.source_storeroom_id;
      if (!acc[key]) acc[key] = [];
      acc[key].push(transaction);
      return acc;
    }, {});

    return {
      by_type: groupedByType,
      by_storeroom: groupedByStoreroom
    };
  }

  // Aggregation functions for analytics
  static async aggregateData(options: z.infer<typeof AggregationQuerySchema> = {
    metric: 'total_quantity'
  }) {
    const validatedOptions = AggregationQuerySchema.parse(options);

    // Fetch data based on aggregation type
    const inventoryData = await InventoryService.getInventoryItems();
    const transactionsData = await TransactionService.getTransactions();
    const storeroomsData = await StoreroomService.getStorerooms();

    // Perform aggregation
    const aggregationResults = this.performAggregation(
      inventoryData.data, 
      transactionsData.data, 
      storeroomsData.data, 
      validatedOptions
    );

    return aggregationResults;
  }

  // Perform data aggregation
  private static performAggregation(
    inventoryData: any[], 
    transactionsData: any[], 
    storeroomsData: any[], 
    options: z.infer<typeof AggregationQuerySchema>
  ) {
    switch (options.groupBy) {
      case 'category':
        return this.aggregateByCategory(inventoryData, options.metric);
      case 'storeroom':
        return this.aggregateByStoreroom(inventoryData, storeroomsData, options.metric);
      case 'transaction_type':
        return this.aggregateByTransactionType(transactionsData, options.metric);
      default:
        return this.aggregateOverall(inventoryData, transactionsData, options.metric);
    }
  }

  // Aggregation methods (simplified mock implementations)
  private static aggregateByCategory(data: any[], metric: string) {
    const categoryAggregation = data.reduce((acc, item) => {
      const category = item.item_details.category_id;
      if (!acc[category]) acc[category] = { total: 0, count: 0 };
      acc[category].total += item.quantity;
      acc[category].count++;
      return acc;
    }, {});

    return categoryAggregation;
  }

  private static aggregateByStoreroom(inventoryData: any[], storeroomsData: any[], metric: string) {
    const storeroomAggregation = storeroomsData.reduce((acc, storeroom) => {
      const storeroomInventory = inventoryData.filter(
        item => item.storeroom_id === storeroom.id
      );
      acc[storeroom.id] = {
        name: storeroom.name,
        total_quantity: storeroomInventory.reduce((sum, item) => sum + item.quantity, 0),
        item_count: storeroomInventory.length
      };
      return acc;
    }, {});

    return storeroomAggregation;
  }

  private static aggregateByTransactionType(data: any[], metric: string) {
    const typeAggregation = data.reduce((acc, transaction) => {
      if (!acc[transaction.type]) acc[transaction.type] = { count: 0, total_value: 0 };
      acc[transaction.type].count++;
      // Simplified value calculation
      acc[transaction.type].total_value += transaction.items.reduce(
        (sum: number, item: any) => sum + (item.quantity * (item.unit_price || 0)), 
        0
      );
      return acc;
    }, {});

    return typeAggregation;
  }

  private static aggregateOverall(inventoryData: any[], transactionsData: any[], metric: string) {
    return {
      total_inventory_quantity: inventoryData.reduce((sum: number, item: any) => sum + item.quantity, 0),
      total_transactions: transactionsData.length,
      total_transaction_value: transactionsData.reduce(
        (sum: number, transaction: any) => sum + transaction.items.reduce(
          (itemSum: number, item: any) => itemSum + (item.quantity * (item.unit_price || 0)), 
          0
        ), 
        0
      )
    };
  }
}

// Export individual methods for easier importing
export const {
  getInventoryStatus,
  getTransactionHistory,
  aggregateData
} = AnalyticsService;
