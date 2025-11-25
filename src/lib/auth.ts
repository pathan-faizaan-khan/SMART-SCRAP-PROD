import { supabase } from './supabase/client';
import { AuthError, User } from '@supabase/supabase-js';

export type UserType = 'seller' | 'buyer';
export type SellerType = 'individual' | 'organization';
export type BuyerType = 'reseller' | 'scrap_company' | 'recycling_factory';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  userType: UserType;
  
  // Seller specific fields
  sellerType?: SellerType;
  organizationName?: string;
  businessRegistrationNumber?: string;
  
  // Buyer specific fields
  buyerType?: BuyerType;
  companyName?: string;
  companyRegistrationNumber?: string;
  taxId?: string;
  
  // Common address fields
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface LoginData {
  email: string;
  password: string;
  userType: UserType;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: SignUpData): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: {
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          user_type: data.userType,
        },
      },
    });

    if (authError) {
      return { user: null, error: authError };
    }

    // Store additional user profile data via API immediately after user creation
    if (authData.user) {
      const profileData = {
        user_id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        user_type: data.userType,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country,
        
        // Seller specific
        seller_type: data.sellerType,
        organization_name: data.organizationName,
        business_registration_number: data.businessRegistrationNumber,
        
        // Buyer specific
        buyer_type: data.buyerType,
        company_name: data.companyName,
        company_registration_number: data.companyRegistrationNumber,
        tax_id: data.taxId,
      };

      // Call API to create profile immediately
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });

        if (!response.ok) {
          console.error('Failed to create profile:', await response.text());
        }
      } catch (err) {
        console.error('Failed to create profile:', err);
      }
    }

    // Check if email confirmation is required
    if (authData.user && !authData.session) {
      // Email confirmation required - user created but not logged in
      return { 
        user: authData.user, 
        error: {
          message: 'Please check your email to confirm your account before logging in.',
          name: 'EmailConfirmationRequired',
          status: 200
        } as AuthError 
      };
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(data: LoginData): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { user: null, error };
    }

    // Optional: Log user type mismatch as warning but don't block login
    const userMetadata = authData.user?.user_metadata;
    if (userMetadata?.user_type && userMetadata.user_type !== data.userType) {
      console.warn(`User type mismatch: registered as ${userMetadata.user_type}, logging in as ${data.userType}`);
    }

    return { user: authData.user, error: null };
  } catch (error) {
    return { user: null, error: error as AuthError };
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(userType: UserType, intent: 'login' | 'signup' = 'login'): Promise<{ error: AuthError | null }> {
  try {
    // Store user type and intent in session storage for callback handling
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_user_type', userType);
      sessionStorage.setItem('oauth_intent', intent);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        skipBrowserRedirect: false,
      },
    });

    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}

/**
 * Get the current user session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // First check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found');
      return null;
    }
    
    // Then get the user
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string) {
  try {
    const response = await fetch(`/api/auth/profile?user_id=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<SignUpData>) {
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...updates }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error };
  } catch (error) {
    return { error: error as AuthError };
  }
}
