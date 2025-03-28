import { createClient, SupabaseClientOptions } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Use environment variables for configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Connection pooling configuration
const connectionOptions: SupabaseClientOptions<"public"> = {
  auth: {
    persistSession: true,
  },
};

// Create a robust Supabase client
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey, 
  connectionOptions
);

// Enhanced error handling utility
export function handleSupabaseError(error: any, context: string) {
  console.error(`Supabase Error (${context}):`, error);
  
  // Categorize and handle different types of errors
  switch (error.code) {
    case 'PGRST116':  // No rows returned
      return { data: null, error: null };
    case 'AUTH_ERROR':
      throw new Error('Authentication failed');
    case 'NETWORK_ERROR':
      throw new Error('Network connection issue');
    default:
      throw error;
  }
}

// Inventory related functions with improved error handling
export async function getInventoryItems() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { data, error } = await supabase.from("inventory").select(`
      id,
      item_id,
      storeroom_id,
      quantity,
      min_quantity,
      max_quantity,
      last_updated,
      items(id, name, sku, category_id, description, unit),
      storerooms(id, name, location)
    `);

    if (error) return handleSupabaseError(error, 'getInventoryItems');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getInventoryItems');
  }
}

// Storeroom related functions with improved error handling
export async function getStorerooms() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { data, error } = await supabase.from("storerooms").select("*");

    if (error) return handleSupabaseError(error, 'getStorerooms');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getStorerooms');
  }
}

// Item related functions
export async function getItems() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { data, error } = await supabase.from("items").select("*");

    if (error) return handleSupabaseError(error, 'getItems');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getItems');
  }
}

// Category related functions
export async function getCategories() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { data, error } = await supabase.from("categories").select("*");

    if (error) return handleSupabaseError(error, 'getCategories');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getCategories');
  }
}

// User related functions
export async function getUsers() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) return handleSupabaseError(error, 'getUsers');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getUsers');
  }
}

// Authentication functions
export async function signIn(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return handleSupabaseError(error, 'signIn');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'signIn');
  }
}

export async function signOut() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) return handleSupabaseError(error, 'signOut');
  } catch (error) {
    handleSupabaseError(error, 'signOut');
  }
}

export async function getUserRole(userId: string) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) return handleSupabaseError(error, 'getUserRole');
    return data?.role ?? null;
  } catch (error) {
    handleSupabaseError(error, 'getUserRole');
  }
}

// Transaction related functions
export async function createTransaction(transactionData: any) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select();

    if (error) return handleSupabaseError(error, 'createTransaction');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'createTransaction');
  }
}

export async function getTransactionItems(transactionId: string) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    const { data, error } = await supabase
      .from("transaction_items")
      .select("*")
      .eq("transaction_id", transactionId);

    if (error) return handleSupabaseError(error, 'getTransactionItems');
    return data;
  } catch (error) {
    handleSupabaseError(error, 'getTransactionItems');
  }
}
