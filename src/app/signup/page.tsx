'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Mail, Lock, User, Building2, Phone, MapPin, 
  ArrowLeft, CheckCircle,
  Briefcase, Factory, Store
} from 'lucide-react';
import { signUp, signInWithGoogle, UserType, SellerType, BuyerType, SignUpData } from '@/lib/auth';
import GoogleLogo from '@/components/icons/GoogleLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if this is a Google OAuth completion flow
  const isGooglePending = searchParams?.get('google_pending') === 'true';
  const googleEmail = searchParams?.get('email') || '';
  const googleName = searchParams?.get('name') || '';
  const googleUserType = searchParams?.get('user_type') as UserType | null;
  const errorParam = searchParams?.get('error');
  
  // Step management
  const [step, setStep] = useState(1);
  
  // Common fields
  const [userType, setUserType] = useState<UserType>(googleUserType || 'seller');
  const [email, setEmail] = useState(googleEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState(googleName);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Address fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  
  // Seller specific
  const [sellerType, setSellerType] = useState<SellerType>('individual');
  const [organizationName, setOrganizationName] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  
  // Buyer specific
  const [buyerType, setBuyerType] = useState<BuyerType>('reseller');
  const [companyName, setCompanyName] = useState('');
  const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-advance to step 2 for Google signups
  useEffect(() => {
    console.log('=== Signup Page Loaded ===');
    console.log('Search params:', {
      google_pending: searchParams?.get('google_pending'),
      email: searchParams?.get('email'),
      name: searchParams?.get('name'),
      user_type: searchParams?.get('user_type'),
      error: searchParams?.get('error')
    });
    console.log('State:', { isGooglePending, googleEmail, googleName, googleUserType });
    
    if (isGooglePending) {
      console.log('Google signup detected - advancing to step 2');
      setStep(2);
    }
    // Show error message if redirected from login
    if (errorParam === 'no_account') {
      setError('No account found. Please sign up with Google to create an account.');
    }
  }, [isGooglePending, errorParam, searchParams, googleEmail, googleName, googleUserType]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If this is a Google signup completion, call the special endpoint
    if (isGooglePending) {
      setLoading(true);
      
      try {
        // Get the current session to pass the access token
        const { supabase } = await import('@/lib/supabase/client');
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setError('Session expired. Please try signing in again.');
          setLoading(false);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const completeSignupData = {
          phone_number: phoneNumber,
          user_type: userType,
          address,
          city,
          state,
          pincode,
          country,
        };

        // Add seller-specific data
        if (userType === 'seller') {
          Object.assign(completeSignupData, {
            seller_type: sellerType,
            organization_name: sellerType === 'organization' ? organizationName : undefined,
            business_registration_number: sellerType === 'organization' ? businessRegistrationNumber : undefined,
          });
        }

        // Add buyer-specific data
        if (userType === 'buyer') {
          Object.assign(completeSignupData, {
            buyer_type: buyerType,
            company_name: companyName,
            company_registration_number: companyRegistrationNumber,
            tax_id: taxId,
          });
        }

        const response = await fetch('/api/auth/complete-google-signup', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(completeSignupData),
        });

        const data = await response.json() as { error?: string; success?: boolean };

        if (!response.ok) {
          setError(data.error || 'Failed to complete signup');
          setLoading(false);
          return;
        }

        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
        
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
      return;
    }

    // Regular email/password signup flow
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const signUpData: SignUpData = {
        email,
        password,
        fullName,
        phoneNumber,
        userType,
        address,
        city,
        state,
        pincode,
        country,
      };

      // Add seller-specific data
      if (userType === 'seller') {
        signUpData.sellerType = sellerType;
        if (sellerType === 'organization') {
          signUpData.organizationName = organizationName;
          signUpData.businessRegistrationNumber = businessRegistrationNumber;
        }
      }

      // Add buyer-specific data
      if (userType === 'buyer') {
        signUpData.buyerType = buyerType;
        signUpData.companyName = companyName;
        signUpData.companyRegistrationNumber = companyRegistrationNumber;
        signUpData.taxId = taxId;
      }

      const { user, error: authError } = await signUp(signUpData);
      
      if (authError) {
        // Check if it's email confirmation required
        if (authError.name === 'EmailConfirmationRequired') {
          setSuccess(true);
          setError('');
          setLoading(false);
          // Don't redirect, show success message
          return;
        }
        
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (user) {
        setSuccess(true);
        setLoading(false);
        // Only redirect if we have a session (no email confirmation needed)
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await signInWithGoogle(userType, 'signup');
      
      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to sign up with Google. Please try again.');
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Skip validation for Google signups on step 1 (email/password not needed)
    if (isGooglePending && step === 1) {
      setError('');
      setStep(step + 1);
      return;
    }
    
    if (step === 1 && (!email || !password || !confirmPassword || !fullName || !phoneNumber)) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 font-poppins">
            {isGooglePending ? 'Complete Your Profile' : 'Create Your Account'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isGooglePending 
              ? 'Just a few more details to get started' 
              : 'Join SmartScrap and start trading recyclables'}
          </p>
          {isGooglePending && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
              <Mail className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">Signing up with <strong>{googleEmail}</strong></span>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-poppins text-lg transition-all ${
                  step >= s ? 'bg-linear-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/30' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-12 sm:w-24 h-1.5 rounded-full ${step > s ? 'bg-linear-to-r from-teal-600 to-emerald-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs sm:text-sm text-gray-600 px-4 font-medium">
            <span>Account</span>
            <span>Profile</span>
            <span>Details</span>
          </div>
        </div>

        {/* Signup Card */}
        <Card className="shadow-2xl border-0 rounded-3xl">
          <CardContent className="p-6 sm:p-10">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h3>
              <p className="text-gray-600">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSignUp}>
              {/* Step 1: Account Type & Credentials */}
              {step === 1 && !isGooglePending && (
                <div className="space-y-6">
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={userType === 'seller' ? 'default' : 'outline'}
                        onClick={() => setUserType('seller')}
                        className={`h-auto flex-col py-5 rounded-xl transition-all ${
                          userType === 'seller' 
                            ? 'bg-linear-to-r from-teal-600 to-emerald-600 shadow-lg shadow-teal-500/30' 
                            : 'border-2 hover:border-teal-500 hover:bg-teal-50'
                        }`}
                      >
                        <User className="w-8 h-8 mb-2" />
                        <span className="font-semibold">Sell Scrap</span>
                        <span className="text-xs mt-1 opacity-70">Individual/Org</span>
                      </Button>
                      <Button
                        type="button"
                        variant={userType === 'buyer' ? 'default' : 'outline'}
                        onClick={() => setUserType('buyer')}
                        className={`h-auto flex-col py-5 rounded-xl transition-all ${
                          userType === 'buyer' 
                            ? 'bg-linear-to-r from-teal-600 to-emerald-600 shadow-lg shadow-teal-500/30' 
                            : 'border-2 hover:border-teal-500 hover:bg-teal-50'
                        }`}
                      >
                        <Building2 className="w-8 h-8 mb-2" />
                        <span className="font-semibold">Buy Scrap</span>
                        <span className="text-xs mt-1 opacity-70">Business</span>
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label htmlFor="fullName" className="block text-sm font-semibold text-gray-800 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="John Doe"
                        className="h-12 rounded-xl border-gray-300 focus:border-teal-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                        Email Address <span className="text-red-500">*</span>
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
                      <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-800 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="tel"
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          className="pl-11 h-12 rounded-xl border-gray-300 focus:border-teal-500"
                          placeholder="+91 9000 000 000"
                        />
                      </div>
                    </div>

                    <div></div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                          className="pl-11 h-12 rounded-xl border-gray-300 focus:border-teal-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="password"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="pl-11 h-12 rounded-xl border-gray-300 focus:border-teal-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 my-6"></div>

                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-3.5 border-2 border-gray-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 font-semibold text-gray-700"
                  >
                    <GoogleLogo className="w-5 h-5 mr-3" />
                    <span>Sign up with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl text-base"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Type Selection */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Phone number for Google signups */}
                  {isGooglePending && (
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-800 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          type="tel"
                          id="phoneNumber"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                          className="pl-11 h-12 rounded-xl border-gray-300 focus:border-teal-500"
                          placeholder="+91 9000 000 000"
                        />
                      </div>
                    </div>
                  )}

                  {userType === 'seller' ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3 font-poppins">I am</label>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setSellerType('individual')}
                            className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${
                              sellerType === 'individual'
                                ? 'border-teal-600 bg-linear-to-br from-teal-50 to-emerald-50 shadow-lg'
                                : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50'
                            }`}
                          >
                            <User className="w-12 h-12 mb-3 text-teal-600" />
                            <span className="font-bold text-gray-900">Individual Citizen</span>
                            <span className="text-xs text-gray-500 mt-2 text-center">Sell household scrap</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSellerType('organization')}
                            className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${
                              sellerType === 'organization'
                                ? 'border-teal-600 bg-linear-to-br from-teal-50 to-emerald-50 shadow-lg'
                                : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50'
                            }`}
                          >
                            <Building2 className="w-12 h-12 mb-3 text-teal-600" />
                            <span className="font-bold text-gray-900">Organization</span>
                            <span className="text-xs text-gray-500 mt-2 text-center">Sell commercial scrap</span>
                          </button>
                        </div>
                      </div>

                      {sellerType === 'organization' && (
                        <>
                          <div>
                            <label htmlFor="organizationName" className="block text-sm font-semibold text-gray-800 mb-2">
                              Organization Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="organizationName"
                              value={organizationName}
                              onChange={(e) => setOrganizationName(e.target.value)}
                              required
                              className="w-full px-4 py-3 h-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              placeholder="ABC Company Pvt Ltd"
                            />
                          </div>
                          <div>
                            <label htmlFor="businessRegistrationNumber" className="block text-sm font-semibold text-gray-800 mb-2">
                              Business Registration Number
                            </label>
                            <input
                              type="text"
                              id="businessRegistrationNumber"
                              value={businessRegistrationNumber}
                              onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                              className="w-full px-4 py-3 h-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                              placeholder="CIN/Registration Number"
                            />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3 font-poppins">Business Type</label>
                        <div className="grid gap-4">
                          <button
                            type="button"
                            onClick={() => setBuyerType('reseller')}
                            className={`flex items-start p-5 rounded-2xl border-2 transition-all ${
                              buyerType === 'reseller'
                                ? 'border-teal-600 bg-linear-to-br from-teal-50 to-emerald-50 shadow-lg'
                                : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50'
                            }`}
                          >
                            <Store className="w-8 h-8 mr-4 text-teal-600 shrink-0" />
                            <div className="text-left">
                              <span className="font-bold text-gray-900 block">Reseller</span>
                              <span className="text-sm text-gray-500">Buy and resell scrap materials</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBuyerType('scrap_company')}
                            className={`flex items-start p-5 rounded-2xl border-2 transition-all ${
                              buyerType === 'scrap_company'
                                ? 'border-teal-600 bg-linear-to-br from-teal-50 to-emerald-50 shadow-lg'
                                : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50'
                            }`}
                          >
                            <Briefcase className="w-8 h-8 mr-4 text-teal-600 shrink-0" />
                            <div className="text-left">
                              <span className="font-bold text-gray-900 block">Scrap Company</span>
                              <span className="text-sm text-gray-500">Collect and process scrap materials</span>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setBuyerType('recycling_factory')}
                            className={`flex items-start p-5 rounded-2xl border-2 transition-all ${
                              buyerType === 'recycling_factory'
                                ? 'border-teal-600 bg-linear-to-br from-teal-50 to-emerald-50 shadow-lg'
                                : 'border-gray-200 hover:border-teal-400 hover:bg-teal-50'
                            }`}
                          >
                            <Factory className="w-8 h-8 mr-4 text-teal-600 shrink-0" />
                            <div className="text-left">
                              <span className="font-bold text-gray-900 block">Recycling Factory</span>
                              <span className="text-sm text-gray-500">Recycle materials into new products</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="companyName" className="block text-sm font-semibold text-gray-800 mb-2">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="w-full px-4 py-3 h-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                          placeholder="Company Name"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="companyRegistrationNumber" className="block text-sm font-semibold text-gray-800 mb-2">
                            Registration Number
                          </label>
                          <input
                            type="text"
                            id="companyRegistrationNumber"
                            value={companyRegistrationNumber}
                            onChange={(e) => setCompanyRegistrationNumber(e.target.value)}
                            className="w-full px-4 py-3 h-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            placeholder="CIN"
                          />
                        </div>
                        <div>
                          <label htmlFor="taxId" className="block text-sm font-semibold text-gray-800 mb-2">
                            GST Number
                          </label>
                          <input
                            type="text"
                            id="taxId"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            className="w-full px-4 py-3 h-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            placeholder="GST Number"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl text-base"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Address Details */}
              {step === 3 && (
                <div className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-800 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="House/Building No, Street, Locality"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-semibold text-gray-800 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 h-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        placeholder="Hyderabad"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-semibold text-gray-800 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        className="w-full px-4 py-3 h-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        placeholder="Telangana"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pincode" className="block text-sm font-semibold text-gray-800 mb-2">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                        className="w-full px-4 py-3 h-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        placeholder="500001"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-semibold text-gray-800 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="w-full px-4 py-3 h-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        placeholder="India"
                      />
                    </div>
                  </div>


                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Login Link */}
          {!success && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}
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
