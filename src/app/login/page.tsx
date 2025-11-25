'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, User, Building2, ArrowLeft } from 'lucide-react';
import { signIn, signInWithGoogle, UserType } from '@/lib/auth';
import GoogleLogo from '@/components/icons/GoogleLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<UserType>('seller');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for error messages from OAuth redirect
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam === 'account_exists') {
      setError('An account with this Google email already exists. Please sign in instead.');
    } else if (errorParam === 'auth_callback_error') {
      setError('Authentication error. Please try again.');
    } else if (errorParam === 'auth_error') {
      setError('An error occurred during authentication. Please try again.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, error: authError } = await signIn({ email, password, userType });
      
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (user) {
        console.log('Login successful, user:', user.email);
        // Wait a moment for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        // Force full page reload to update auth state
        window.location.href = '/dashboard';
      } else {
        setError('Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await signInWithGoogle(userType, 'login');
      
      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
      // Google will redirect, so we don't need to handle success here
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center group mb-6">
            <Image 
              src="/logo.png" 
              alt="SmartScrap Logo" 
              width={56} 
              height={56} 
              className="w-14 h-14 mr-3 group-hover:scale-110 transition-transform"
            />
            <span className="text-3xl font-bold bg-linear-to-r from-teal-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent font-poppins">
              SmartScrap
            </span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 font-poppins">Welcome Back</h1>
          <p className="text-gray-600 text-lg">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl rounded-3xl">
          <CardContent className="pt-8 px-6 sm:px-10 pb-8 sm:pb-10">
            {/* User Type Selection */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-semibold text-gray-800 font-poppins">I am a</label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={userType === 'seller' ? 'default' : 'outline'}
                onClick={() => setUserType('seller')}
                className={`h-auto py-4 flex-col gap-2 rounded-xl transition-all ${
                  userType === 'seller' 
                    ? 'bg-linear-to-r from-teal-600 to-emerald-600 shadow-lg shadow-teal-500/30' 
                    : 'border-2 hover:border-teal-500 hover:bg-teal-50'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="font-semibold">Seller</span>
              </Button>
              <Button
                type="button"
                variant={userType === 'buyer' ? 'default' : 'outline'}
                onClick={() => setUserType('buyer')}
                className={`h-auto py-4 flex-col gap-2 rounded-xl transition-all ${
                  userType === 'buyer' 
                    ? 'bg-linear-to-r from-teal-600 to-emerald-600 shadow-lg shadow-teal-500/30' 
                    : 'border-2 hover:border-teal-500 hover:bg-teal-50'
                }`}
              >
                <Building2 className="w-6 h-6" />
                <span className="font-semibold">Buyer</span>
              </Button>
            </div>
          </div>          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-gray-300 focus:border-teal-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl border-gray-300 focus:border-teal-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer" />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>              
              <Button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 h-13 font-semibold text-base rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>            {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-13 border-2 border-gray-300 hover:border-teal-500 hover:bg-teal-50 rounded-xl transition-all"
          >
            <GoogleLogo className="w-5 h-5 mr-2" />
            <span className="font-semibold">Sign in with Google</span>
          </Button>          {/* Sign Up Link */}
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-teal-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
