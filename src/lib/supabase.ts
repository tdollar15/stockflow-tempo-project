import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Create a single supabase client for interacting with your database
const supabaseUrl = "https://hfgtxcpkhcnwdsyjbojs.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZ3R4Y3BraGNud2RzeWpib2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMTQzMzksImV4cCI6MjA1NzU5MDMzOX0.Vhm8Xh88m2O8bwXYNAaIan260EU9H8axiAv-25UoPUM";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common database operations

// Inventory related functions
export async function getInventoryItems() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

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

  if (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }

  return data;
}

// Storeroom related functions
export async function getStorerooms() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await supabase.from("storerooms").select("*");

  if (error) {
    console.error("Error fetching storerooms:", error);
    throw error;
  }

  return data;
}

// Item related functions
export async function getItems() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await supabase.from("items").select("*");

  if (error) {
    console.error("Error fetching items:", error);
    throw error;
  }

  return data;
}

// Category related functions
export async function getCategories() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }

  return data;
}

// User related functions
export async function getUsers() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    console.error("Error fetching users:", error);
    throw error;
  }

  return data;
}

// Authentication functions
export async function signIn(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error);
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export async function getUserRole(userId: string) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user role:", error);
    throw error;
  }

  return data?.role;
}

// Transaction related functions
export async function createTransaction(transactionData: any) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionData)
    .select();

  if (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }

  return data;
}

export async function getTransactionItems(transactionId: string) {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  const { data, error } = await supabase
    .from("transaction_items")
    .select("*")
    .eq("transaction_id", transactionId);

  if (error) {
    console.error("Error fetching transaction items:", error);
    throw error;
  }

  return data;
}
