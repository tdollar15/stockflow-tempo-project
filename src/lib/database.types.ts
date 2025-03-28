export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          department: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: string;
          department?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          department?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      storerooms: {
        Row: {
          id: string;
          name: string;
          location: string;
          manager_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          manager_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          manager_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          name: string;
          sku: string;
          category_id: string;
          description: string | null;
          unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sku: string;
          category_id: string;
          description?: string | null;
          unit: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sku?: string;
          category_id?: string;
          description?: string | null;
          unit?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          item_id: string;
          storeroom_id: string;
          quantity: number;
          min_quantity: number;
          max_quantity: number | null;
          last_updated: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          storeroom_id: string;
          quantity: number;
          min_quantity?: number;
          max_quantity?: number | null;
          last_updated?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          storeroom_id?: string;
          quantity?: number;
          min_quantity?: number;
          max_quantity?: number | null;
          last_updated?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          transaction_number: string;
          type: string;
          status: string;
          source_storeroom_id: string | null;
          dest_storeroom_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          notes: string | null;
          reference_number: string | null;
          supplier_name: string | null;
        };
        Insert: {
          id?: string;
          transaction_number: string;
          type: string;
          status?: string;
          source_storeroom_id?: string | null;
          dest_storeroom_id?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          notes?: string | null;
          reference_number?: string | null;
          supplier_name?: string | null;
        };
        Update: {
          id?: string;
          transaction_number?: string;
          type?: string;
          status?: string;
          source_storeroom_id?: string | null;
          dest_storeroom_id?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          notes?: string | null;
          reference_number?: string | null;
          supplier_name?: string | null;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          item_id: string;
          quantity: number;
          unit_price: number | null;
          total_price: number | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          item_id: string;
          quantity: number;
          unit_price?: number | null;
          total_price?: number | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          item_id?: string;
          quantity?: number;
          unit_price?: number | null;
          total_price?: number | null;
          notes?: string | null;
        };
      };
      approvals: {
        Row: {
          id: string;
          transaction_id: string;
          approver_id: string;
          status: 'pending' | 'approved' | 'rejected';
          comments: string | null;
          approved_at: string | null;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          approver_id: string;
          status?: 'pending' | 'approved' | 'rejected';
          comments?: string | null;
          approved_at?: string | null;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          approver_id?: string;
          status?: 'pending' | 'approved' | 'rejected';
          comments?: string | null;
          approved_at?: string | null;
        };
      };
      approval_workflows: {
        Row: {
          id: string;
          transaction_id: string;
          approver_role: string;
          sequence_number: number;
          status: string;
          approver_id: string | null;
          approved_at: string | null;
          comments: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          approver_role: string;
          sequence_number: number;
          status?: string;
          approver_id?: string | null;
          approved_at?: string | null;
          comments?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          approver_role?: string;
          sequence_number?: number;
          status?: string;
          approver_id?: string | null;
          approved_at?: string | null;
          comments?: string | null;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          transaction_id: string;
          name: string;
          file_path: string;
          file_type: string | null;
          uploaded_by: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          name: string;
          file_path: string;
          file_type?: string | null;
          uploaded_by: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          name?: string;
          file_path?: string;
          file_type?: string | null;
          uploaded_by?: string;
          uploaded_at?: string;
        };
      };
    };
    Views: {
      // Add any database views if needed
    };
    Functions: {
      // Add any custom database functions if needed
    };
  };
}
