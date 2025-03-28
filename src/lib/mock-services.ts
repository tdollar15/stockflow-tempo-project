import { faker } from '@faker-js/faker';
import { 
  validateUser, 
  validateStoreroom, 
  validateCategory, 
  validateItem, 
  validateInventory, 
  validateTransaction, 
  validateTransactionItem,
  validateApproval 
} from './schema-validation';

// Utility function to simulate network delay
function simulateNetworkDelay(minMs = 100, maxMs = 500): Promise<void> {
  const delay = faker.number.int({ min: minMs, max: maxMs });
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Mock error generator
function generateMockError(probability = 0.05): void {
  if (Math.random() < probability) {
    const errorTypes = [
      'NetworkError',
      'ValidationError',
      'PermissionDenied',
      'ResourceNotFound'
    ];
    const errorType = faker.helpers.arrayElement(errorTypes);
    throw new Error(`Simulated ${errorType}`);
  }
}

// Mock Data Generators
export class MockDataService {
  // User-related mock services
  static async getUsers(options: { 
    page?: number, 
    pageSize?: number 
  } = {}) {
    await simulateNetworkDelay();
    generateMockError();

    const { page = 1, pageSize = 10 } = options;
    const totalUsers = faker.number.int({ min: 50, max: 200 });
    const users = Array.from({ length: pageSize }, () => ({
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      role: faker.helpers.arrayElement([
        'admin', 'supervisor', 'storeman', 'clerk', 'inventory_manager'
      ]),
      department: faker.helpers.arrayElement([
        'Logistics', 'Warehouse', 'Procurement', 'Finance', null
      ]),
      status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString()
    }));

    return {
      data: users.map(validateUser),
      meta: {
        page,
        pageSize,
        total: totalUsers
      }
    };
  }

  // Storeroom-related mock services
  static async getStorerooms(options: { 
    page?: number, 
    pageSize?: number 
  } = {}) {
    await simulateNetworkDelay();
    generateMockError();

    const { page = 1, pageSize = 10 } = options;
    const totalStorerooms = faker.number.int({ min: 10, max: 50 });
    const storerooms = Array.from({ length: pageSize }, () => ({
      id: faker.string.uuid(),
      name: `${faker.commerce.department()} Warehouse`,
      location: faker.location.streetAddress(),
      manager_id: faker.string.uuid(),
      status: faker.helpers.arrayElement(['active', 'inactive', 'maintenance']),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString()
    }));

    return {
      data: storerooms.map(validateStoreroom),
      meta: {
        page,
        pageSize,
        total: totalStorerooms
      }
    };
  }

  // Transaction-related mock services
  static async getTransactions(options: { 
    page?: number, 
    pageSize?: number,
    type?: string 
  } = {}) {
    await simulateNetworkDelay();
    generateMockError();

    const { page = 1, pageSize = 10, type } = options;
    const totalTransactions = faker.number.int({ min: 100, max: 500 });
    const transactions = Array.from({ length: pageSize }, () => ({
      id: faker.string.uuid(),
      transaction_number: `TRX-${faker.string.alphanumeric(6)}`,
      type: type || faker.helpers.arrayElement([
        'receipt', 'issuance', 'transfer', 'adjustment'
      ]),
      status: faker.helpers.arrayElement([
        'draft', 'pending', 'approved', 'rejected', 'completed'
      ]),
      source_storeroom_id: faker.string.uuid(),
      dest_storeroom_id: faker.string.uuid(),
      created_by: faker.string.uuid(),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString(),
      notes: faker.lorem.sentence(),
      reference_number: `REF-${faker.string.alphanumeric(6)}`,
      supplier_name: faker.company.name()
    }));

    return {
      data: transactions.map(validateTransaction),
      meta: {
        page,
        pageSize,
        total: totalTransactions
      }
    };
  }

  // Create transaction mock service
  static async createTransaction(transactionData: any) {
    await simulateNetworkDelay(500, 1000);
    generateMockError(0.1);

    const transaction = {
      ...transactionData,
      id: faker.string.uuid(),
      transaction_number: `TRX-${faker.string.alphanumeric(6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft'
    };

    return validateTransaction(transaction);
  }

  // Approval mock services
  static async getPendingApprovals(userId: string) {
    await simulateNetworkDelay();
    generateMockError();

    const approvals = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
      id: faker.string.uuid(),
      transaction_id: faker.string.uuid(),
      approver_id: userId,
      status: 'pending',
      comments: null,
      approved_at: null
    }));

    return approvals.map(validateApproval);
  }

  // Approval action mock service
  static async approveTransaction(transactionId: string, approverId: string) {
    await simulateNetworkDelay(300, 800);
    generateMockError(0.1);

    return {
      id: faker.string.uuid(),
      transaction_id: transactionId,
      approver_id: approverId,
      status: 'approved',
      comments: faker.lorem.sentence(),
      approved_at: new Date().toISOString()
    };
  }
}

// Export individual mock service functions for easier importing
export const {
  getUsers,
  getStorerooms,
  getTransactions,
  createTransaction,
  getPendingApprovals,
  approveTransaction
} = MockDataService;
