import { SupabaseClient } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  export interface SupabaseClient {
    from(table: string): {
      select(columns?: string): {
        eq(column: string, value: any): any;
        gte(column: string, value: any): any;
        lte(column: string, value: any): any;
        range(start: number, end: number): any;
        single(): Promise<{ data: any; error: any }>;
        insert(data: any): any;
        update(data: any): any;
      };
    };
  }
}
