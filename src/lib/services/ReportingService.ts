import { z } from 'zod';
import { supabase } from '$lib/supabaseClient';
import { TransactionService } from '../transaction-service';
import { InventoryService } from '../inventory-service';
import { StoreroomService } from '../storeroom-service';
import { UserRole } from '../types/UserTypes';
import { TransactionType, TransactionStatus } from '../types/TransactionTypes';
import { logService } from './LogService';

// Report generation schemas
export const ReportFilterSchema = z.object({
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  transaction_type: z.nativeEnum(TransactionType).optional(),
  transaction_status: z.nativeEnum(TransactionStatus).optional(),
  storeroom_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional()
});

export const TransactionReportSchema = z.object({
  total_transactions: z.number(),
  transactions_by_type: z.record(z.nativeEnum(TransactionType), z.number()),
  transactions_by_status: z.record(z.nativeEnum(TransactionStatus), z.number()),
  total_transaction_value: z.number(),
  average_transaction_value: z.number()
});

export const InventoryReportSchema = z.object({
  total_items: z.number(),
  total_inventory_value: z.number(),
  low_stock_items: z.array(z.object({
    item_id: z.string().uuid(),
    item_name: z.string(),
    current_quantity: z.number(),
    min_quantity: z.number(),
    storeroom_id: z.string().uuid()
  })),
  items_by_storeroom: z.record(z.string().uuid(), z.number())
});

export class ReportingService {
  // Generate transaction report with advanced filtering
  async generateTransactionReport(
    filters: z.infer<typeof ReportFilterSchema>,
    userRole: UserRole
  ): Promise<z.infer<typeof TransactionReportSchema>> {
    try {
      // Validate user permissions
      if (userRole !== 'admin' && userRole !== 'supervisor') {
        throw new Error('Insufficient permissions');
      }

      // Validate filters
      const validatedFilters = ReportFilterSchema.parse(filters);

      // Fetch transactions with applied filters
      const transactions = await TransactionService.getTransactions({
        filters: validatedFilters
      });

      // Calculate transaction metrics
      const transactions_by_type = transactions.data.reduce((acc, transaction) => {
        acc[transaction.type] = (acc[transaction.type] || 0) + 1;
        return acc;
      }, {} as Record<TransactionType, number>);

      const transactions_by_status = transactions.data.reduce((acc, transaction) => {
        acc[transaction.status] = (acc[transaction.status] || 0) + 1;
        return acc;
      }, {} as Record<TransactionStatus, number>);

      const total_transaction_value = transactions.data.reduce(
        (sum, transaction) => sum + transaction.total_value, 
        0
      );

      return {
        total_transactions: transactions.data.length,
        transactions_by_type,
        transactions_by_status,
        total_transaction_value,
        average_transaction_value: total_transaction_value / transactions.data.length || 0
      };

    } catch (error) {
      logService.error('ReportingService.generateTransactionReport', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filters
      });
      throw error;
    }
  }

  // Generate comprehensive inventory status report
  async generateInventoryReport(
    filters: z.infer<typeof ReportFilterSchema>,
    userRole: UserRole
  ): Promise<z.infer<typeof InventoryReportSchema>> {
    try {
      // Validate user permissions
      if (userRole !== 'admin' && userRole !== 'supervisor') {
        throw new Error('Insufficient permissions');
      }

      // Validate filters
      const validatedFilters = ReportFilterSchema.parse(filters);

      // Fetch inventory items
      const inventoryItems = await InventoryService.getInventoryItems({
        filters: { 
          storeroom_id: validatedFilters.storeroom_id 
        }
      });

      // Calculate total inventory value
      const total_inventory_value = inventoryItems.data.reduce(
        (sum, item) => sum + (item.quantity * (item.item_details.unit_price || 0)), 
        0
      );

      // Identify low stock items
      const low_stock_items = inventoryItems.data
        .filter(item => item.quantity < item.min_quantity)
        .map(item => ({
          item_id: item.item_id,
          item_name: item.item_details.name,
          current_quantity: item.quantity,
          min_quantity: item.min_quantity,
          storeroom_id: item.storeroom_id
        }));

      // Group items by storeroom
      const items_by_storeroom = inventoryItems.data.reduce((acc, item) => {
        acc[item.storeroom_id] = (acc[item.storeroom_id] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>);

      return {
        total_items: inventoryItems.data.length,
        total_inventory_value,
        low_stock_items,
        items_by_storeroom
      };

    } catch (error) {
      logService.error('ReportingService.generateInventoryReport', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filters
      });
      throw error;
    }
  }

  // Generate custom report with flexible configuration
  async generateCustomReport(
    reportType: 'transaction' | 'inventory',
    filters: z.infer<typeof ReportFilterSchema>,
    customFields: string[],
    userRole: UserRole
  ): Promise<Record<string, any>> {
    try {
      // Validate user permissions
      if (userRole !== 'admin') {
        throw new Error('Only admins can generate custom reports');
      }

      // Select report generation method based on type
      const reportMethod = reportType === 'transaction'
        ? this.generateTransactionReport
        : this.generateInventoryReport;

      // Generate base report
      const baseReport = await reportMethod(filters, userRole);

      // Filter and transform report based on custom fields
      const customReport = customFields.reduce((acc, field) => {
        if (field in baseReport) {
          acc[field] = baseReport[field];
        }
        return acc;
      }, {});

      return customReport;

    } catch (error) {
      logService.error('ReportingService.generateCustomReport', {
        error: error instanceof Error ? error.message : 'Unknown error',
        reportType,
        filters,
        customFields
      });
      throw error;
    }
  }
}

export const reportingService = new ReportingService();
