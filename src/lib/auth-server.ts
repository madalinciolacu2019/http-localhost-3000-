import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export type AuthenticatedUser = {
  id: string;
  email?: string;
  user_metadata: {
    role: 'CEO' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';
    is_vip?: boolean;
    full_name?: string;
  };
};

export async function verifyAuth(req: Request): Promise<{ user: AuthenticatedUser | null; error: string | null }> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No authorization header or bearer token provided' };
    }

    const token = authHeader.substring(7);

    // 1. Check if it's a mock token
    if (token.startsWith('mock-jwt-')) {
      try {
        const payloadBase64 = token.substring(9);
        const decodedString = Buffer.from(payloadBase64, 'base64').toString('utf8');
        const payload = JSON.parse(decodedString);
        
        return {
          user: {
            id: payload.id,
            email: payload.email,
            user_metadata: {
              role: payload.role || 'CUSTOMER',
              is_vip: payload.is_vip || false,
              full_name: payload.full_name || 'Demo Driver',
            }
          },
          error: null
        };
      } catch (e) {
        return { user: null, error: 'Malformed mock token' };
      }
    }

    // 2. Real Supabase check if configured
    const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseAnonKey && !supabaseAnonKey.includes('placeholder');
    
    if (isSupabaseConfigured) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return { user: null, error: error?.message || 'Invalid or expired token' };
      }

      // Map Supabase User to our AuthenticatedUser type
      return {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            role: (user.user_metadata?.role as any) || 'CUSTOMER',
            is_vip: user.user_metadata?.is_vip === true,
            full_name: user.user_metadata?.full_name,
          }
        },
        error: null
      };
    }

    // Fallback: If in local/dev mode without real keys, accept basic mock tokens for compatibility
    if (token === 'mock-token' || token === 'firebase-token') {
      return {
        user: {
          id: 'mock-fallback-id',
          email: 'driver@apexbrews.com',
          user_metadata: {
            role: 'CUSTOMER',
            is_vip: false,
          }
        },
        error: null
      };
    }

    return { user: null, error: 'Authentication service not configured and invalid token format' };
  } catch (err: any) {
    return { user: null, error: err.message || 'Internal authentication error' };
  }
}
