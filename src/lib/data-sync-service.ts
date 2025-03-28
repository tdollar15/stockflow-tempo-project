import { InventoryService } from './inventory-service';
import { TransactionService } from './transaction-service';
import { StoreroomService } from './storeroom-service';

// Caching configuration
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DataSyncService {
  // In-memory cache for different data types
  private static cache: {
    inventory: CacheEntry<any> | null;
    transactions: CacheEntry<any> | null;
    storerooms: CacheEntry<any> | null;
  } = {
    inventory: null,
    transactions: null,
    storerooms: null
  };

  // Check if cached data is still valid
  private static isCacheValid(cacheEntry: CacheEntry<any> | null): boolean {
    return cacheEntry !== null && 
           (Date.now() - cacheEntry.timestamp) < CACHE_DURATION_MS;
  }

  // Fetch inventory data with caching
  static async fetchInventoryData(options: { 
    page?: number, 
    pageSize?: number, 
    forceRefresh?: boolean 
  } = {}) {
    const { page = 1, pageSize = 10, forceRefresh = false } = options;

    // Check cache first
    if (!forceRefresh && this.isCacheValid(this.cache.inventory)) {
      return this.cache.inventory.data;
    }

    // Fetch fresh data
    const inventoryData = await InventoryService.getInventoryItems({ page, pageSize });

    // Update cache
    this.cache.inventory = {
      data: inventoryData,
      timestamp: Date.now()
    };

    return inventoryData;
  }

  // Fetch transaction data with caching
  static async fetchTransactionData(options: { 
    page?: number, 
    pageSize?: number, 
    filters?: any, 
    forceRefresh?: boolean 
  } = {}) {
    const { 
      page = 1, 
      pageSize = 10, 
      filters = {}, 
      forceRefresh = false 
    } = options;

    // Check cache first
    if (!forceRefresh && this.isCacheValid(this.cache.transactions)) {
      return this.cache.transactions.data;
    }

    // Fetch fresh data
    const transactionData = await TransactionService.getTransactions({ 
      page, 
      pageSize, 
      filters 
    });

    // Update cache
    this.cache.transactions = {
      data: transactionData,
      timestamp: Date.now()
    };

    return transactionData;
  }

  // Fetch storeroom data with caching
  static async fetchStoreroomData(options: { 
    page?: number, 
    pageSize?: number, 
    filters?: any, 
    forceRefresh?: boolean 
  } = {}) {
    const { 
      page = 1, 
      pageSize = 10, 
      filters = {}, 
      forceRefresh = false 
    } = options;

    // Check cache first
    if (!forceRefresh && this.isCacheValid(this.cache.storerooms)) {
      return this.cache.storerooms.data;
    }

    // Fetch fresh data
    const storeroomData = await StoreroomService.getStorerooms({ 
      page, 
      pageSize, 
      filters 
    });

    // Update cache
    this.cache.storerooms = {
      data: storeroomData,
      timestamp: Date.now()
    };

    return storeroomData;
  }

  // Synchronize all data on page load
  static async synchronizeAllData() {
    try {
      // Fetch data for different entities
      await Promise.all([
        this.fetchInventoryData(),
        this.fetchTransactionData(),
        this.fetchStoreroomData()
      ]);

      return {
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Data synchronization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Clear specific cache or all caches
  static clearCache(type?: 'inventory' | 'transactions' | 'storerooms') {
    if (type) {
      this.cache[type] = null;
    } else {
      this.cache = {
        inventory: null,
        transactions: null,
        storerooms: null
      };
    }
  }
}

// Export individual methods for easier importing
export const {
  fetchInventoryData,
  fetchTransactionData,
  fetchStoreroomData,
  synchronizeAllData,
  clearCache
} = DataSyncService;
