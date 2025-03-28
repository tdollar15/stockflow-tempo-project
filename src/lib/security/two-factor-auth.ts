import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import { supabase } from '../supabase-client';

// Supabase client initialization is now handled in the imported supabase-client module

export class TwoFactorAuth {
  // Generate a new 2FA secret
  static generateSecret(userId: string): { 
    secret: string; 
    otpAuthUrl: string; 
    qrCodeUrl: string 
  } {
    // Generate a secret key
    const secret = speakeasy.generateSecret({ 
      name: `StockFlowPro:${userId}` 
    });

    return {
      secret: secret.base32,
      otpAuthUrl: secret.otpauth_url!,
      qrCodeUrl: '' // Placeholder for QR code generation
    };
  }

  // Verify 2FA token
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });
  }

  // Generate QR Code for 2FA setup
  static async generateQRCode(otpAuthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpAuthUrl);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return '';
    }
  }

  // Enable 2FA for a user
  static async enableTwoFactor(userId: string): Promise<{
    secret: string;
    qrCodeUrl: string;
  }> {
    try {
      // Generate 2FA secret
      const { secret, otpAuthUrl } = this.generateSecret(userId);
      
      // Generate QR Code
      const qrCodeUrl = await this.generateQRCode(otpAuthUrl);

      // Store secret in user's profile (securely)
      const { error } = await supabase
        .from('user_security')
        .upsert({
          user_id: userId,
          two_factor_secret: secret,
          two_factor_enabled: false
        });

      if (error) throw error;

      return { secret, qrCodeUrl };
    } catch (error) {
      console.error('2FA setup failed:', error);
      throw new Error('Failed to set up two-factor authentication');
    }
  }

  // Confirm and activate 2FA
  static async confirmTwoFactor(
    userId: string, 
    secret: string, 
    token: string
  ): Promise<boolean> {
    try {
      // Verify the token
      const isValid = this.verifyToken(secret, token);

      if (isValid) {
        // Update user's 2FA status
        const { error } = await supabase
          .from('user_security')
          .update({ 
            two_factor_enabled: true 
          })
          .eq('user_id', userId);

        if (error) throw error;

        return true;
      }

      return false;
    } catch (error) {
      console.error('2FA confirmation failed:', error);
      return false;
    }
  }

  // Disable 2FA
  static async disableTwoFactor(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_security')
        .update({ 
          two_factor_enabled: false,
          two_factor_secret: null 
        })
        .eq('user_id', userId);

      return !error;
    } catch (error) {
      console.error('Disabling 2FA failed:', error);
      return false;
    }
  }
}
