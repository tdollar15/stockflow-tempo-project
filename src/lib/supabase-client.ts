import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Ensure environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Singleton Supabase client
class SupabaseClientSingleton {
  private static instance: SupabaseClient<Database> | null = null;

  private constructor() {}

  public static getInstance(): SupabaseClient<Database> {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = createClient<Database>(
        supabaseUrl, 
        supabaseAnonKey, 
        {
          // Optional global configuration
          auth: {
            persistSession: true
          }
        }
      );
    }
    return SupabaseClientSingleton.instance;
  }

  // Optional: Method to reset client (useful for testing or logout)
  public static reset(): void {
    SupabaseClientSingleton.instance = null;
  }
}

// Export the singleton instance and the class for advanced use cases
export const supabase = SupabaseClientSingleton.getInstance();
export { SupabaseClientSingleton };

// Type definitions for Supabase tables
export interface Transaction {
  id: string;
  transaction_number: string;
  type: 'receipt' | 'issuance' | 'transfer' | 'adjustment';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed';
  source_storeroom_id?: string | null;
  dest_storeroom_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  notes?: string | null;
  reference_number?: string | null;
  supplier_name?: string | null;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_price?: number | null;
  total_price?: number | null;
  notes?: string | null;
}

// Optional utility functions
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    await supabase.from('users').select('id').limit(1);
    return true;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}
