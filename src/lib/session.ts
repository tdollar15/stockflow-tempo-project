import { cookies } from "next/headers";
import { supabase } from './supabase-client';
import { Session } from "@supabase/supabase-js";

/**
 * Manages user session persistence and refresh
 */
export const SessionManager = {
  /**
   * Store session data securely in cookies
   * @param session Supabase session object
   */
  async storeSession(session: Session | null) {
    if (!session) return;

    // Store session in secure, HTTP-only cookie
    cookies().set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: session.expires_in,
      path: '/'
    });

    cookies().set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });
  },

  /**
   * Refresh the current session
   * @returns Refreshed session or null
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      if (data.session) {
        await this.storeSession(data.session);
        return data.session;
      }
      
      return null;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return null;
    }
  },

  /**
   * Logout and clear all session data
   */
  async logout() {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // Clear all cookies
      cookies().delete('sb-access-token');
      cookies().delete('sb-refresh-token');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  /**
   * Check if the current session is valid
   * @returns Boolean indicating session validity
   */
  async isSessionValid() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch {
      return false;
    }
  }
};

export default SessionManager;
