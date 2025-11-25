import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { userProfiles, sellerProfiles, buyerProfiles } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phone_number,
      user_type,
      address,
      city,
      state,
      pincode,
      country,
      seller_type,
      organization_name,
      business_registration_number,
      buyer_type,
      company_name,
      company_registration_number,
      tax_id,
    } = body;

    console.log('=== Complete Google Signup START ===');
    console.log('Request body:', { user_type, phone_number, city, state });

    // Get access token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client with the access token
    const supabase = await createClient();
    
    // Set the session using the access token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('No authenticated user:', userError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('User authenticated:', { userId: user.id, email: user.email });

    // Check if profile already exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.userId, user.id),
    });

    if (existingProfile) {
      console.log('Profile already exists');
      return NextResponse.json({ error: 'Profile already exists' }, { status: 400 });
    }

    // Create user profile
    console.log('Creating user profile...');
    const [userProfile] = await db.insert(userProfiles).values({
      userId: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
      phoneNumber: phone_number,
      userType: user_type,
      address,
      city,
      state,
      pincode,
      country: country || 'India',
      isActive: true,
      isVerified: user.email_confirmed_at ? true : false,
    }).returning();

    console.log('User profile created:', userProfile.id);

    // Create seller or buyer profile
    if (user_type === 'seller') {
      console.log('Creating seller profile...');
      await db.insert(sellerProfiles).values({
        userProfileId: userProfile.id,
        sellerType: seller_type || 'individual',
        organizationName: seller_type === 'organization' && organization_name ? organization_name : null,
        businessRegistrationNumber: seller_type === 'organization' && business_registration_number ? business_registration_number : null,
      });
      console.log('Seller profile created');
    } else if (user_type === 'buyer') {
      console.log('Creating buyer profile...');
      await db.insert(buyerProfiles).values({
        userProfileId: userProfile.id,
        buyerType: buyer_type || 'reseller',
        companyName: company_name || null,
        companyRegistrationNumber: company_registration_number || null,
        taxId: tax_id || null,
      });
      console.log('Buyer profile created');
    }

    console.log('=== Complete Google Signup SUCCESS ===');
    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('=== Complete Google Signup ERROR ===', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to complete signup' 
    }, { status: 500 });
  }
}
