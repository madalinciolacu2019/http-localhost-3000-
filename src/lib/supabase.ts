import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Graceful fallback — features requiring Supabase won't work until real keys are added
const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseAnonKey && !supabaseAnonKey.includes('placeholder');

export let isSupabaseConfigured = Boolean(isConfigured);

export function disableSupabaseConfig() {
  isSupabaseConfigured = false;
}

// In the browser, check immediately if we can reach the Supabase server to fail fast.
if (typeof window !== 'undefined' && isSupabaseConfigured) {
  fetch(`${supabaseUrl}/auth/v1/health`, { method: 'GET', mode: 'no-cors' })
    .catch(() => {
      console.warn("Supabase local/configured server is unreachable. Falling back to mock database/authentication.");
      disableSupabaseConfig();
    });
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder');


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          driver_rank: string;
          credits: number;
          xp: number;
          level: number;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          price: number;
          stock_count: number;
          category: string;
          metadata: any;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: string;
          total_amount: number;
          stripe_session_id: string | null;
          shipping_address: any;
          created_at: string;
          fulfillment_method: string | null;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          printful_order_id: string | null;
          fulfillment_status: string | null;
          tracking_number: string | null;
          tracking_url: string | null;
          net_amount: number;
          vat_rate: number;
          vat_amount: number;
          billing_name: string | null;
          billing_address: any;
          billing_cui: string | null;
          billing_j: string | null;
          billing_iban: string | null;
          billing_bank: string | null;
          invoice_number: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: number;
          quantity: number;
          unit_price: number;
        };
      };
    };
  };
};
