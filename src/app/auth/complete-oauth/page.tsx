'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function CompleteOAuthPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('=== Complete OAuth Page ===');
        
        // Get the hash params (Supabase returns tokens in URL hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Hash params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken 
        });

        // Get stored user type and intent from session storage
        const userType = sessionStorage.getItem('oauth_user_type') || 'seller';
        const intent = sessionStorage.getItem('oauth_intent') || 'login';
        
        console.log('Session storage:', { userType, intent });

        if (!accessToken) {
          console.error('No access token in URL hash');
          setError('Authentication failed. Please try again.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Set the session using the tokens from the hash
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });

        if (sessionError) {
          console.error('Error setting session:', sessionError);
          setError('Authentication failed. Please try again.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        console.log('Session set successfully:', sessionData.user?.email);

        // Update user metadata with user type
        await supabase.auth.updateUser({
          data: { user_type: userType }
        });

        const user = sessionData.user;
        if (!user) {
          console.error('No user after setting session');
          setError('Authentication failed. Please try again.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Check if user profile exists in database
        const response = await fetch('/api/auth/profile?user_id=' + user.id);
        
        let profileExists = false;
        if (response.ok) {
          const profileData = await response.json() as { userProfile?: any; error?: string };
          profileExists = !!profileData.userProfile;
          console.log('Profile check:', { exists: profileExists, intent, response: profileData });
        } else {
          console.log('Profile check:', { exists: false, intent, status: response.status });
        }
        
        if (!profileExists) {
          // User doesn't exist in database
          if (intent === 'login') {
            // User tried to login but doesn't have account - redirect to signup
            console.log('Login attempt with no profile - signing out and redirecting to signup');
            await supabase.auth.signOut();
            sessionStorage.removeItem('oauth_user_type');
            sessionStorage.removeItem('oauth_intent');
            router.push('/signup?error=no_account&user_type=' + userType);
          } else {
            // User wants to signup - redirect to complete signup (KEEP SESSION ACTIVE)
            console.log('Signup intent with no profile - redirecting to complete signup');
            const signupUrl = new URL('/signup', window.location.origin);
            signupUrl.searchParams.set('google_pending', 'true');
            signupUrl.searchParams.set('user_type', userType);
            signupUrl.searchParams.set('email', user.email || '');
            signupUrl.searchParams.set('name', user.user_metadata?.full_name || user.user_metadata?.name || '');
            
            // Clear session storage
            sessionStorage.removeItem('oauth_user_type');
            sessionStorage.removeItem('oauth_intent');
            
            console.log('Redirecting to:', signupUrl.toString());
            router.push(signupUrl.toString());
          }
        } else {
          // User exists in database
          if (intent === 'signup') {
            // User tried to signup but already has account - redirect to login with error
            console.log('Signup attempt with existing profile - redirecting to login');
            sessionStorage.removeItem('oauth_user_type');
            sessionStorage.removeItem('oauth_intent');
            router.push('/login?error=account_exists');
          } else {
            // User wants to login and has account - redirect to dashboard
            console.log('Login successful - redirecting to dashboard');
            sessionStorage.removeItem('oauth_user_type');
            sessionStorage.removeItem('oauth_intent');
            router.push('/dashboard');
          }
        }
      } catch (err) {
        console.error('Error handling OAuth callback:', err);
        setError('An error occurred. Please try again.');
        setTimeout(() => router.push('/login'), 2000);
      }
    };

    handleOAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-600 text-lg">{error}</div>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  );
}
