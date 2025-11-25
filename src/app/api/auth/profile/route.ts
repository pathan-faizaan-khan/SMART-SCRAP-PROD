import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles, sellerProfiles, buyerProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user profile
    const userProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch seller or buyer profile based on user type
    let additionalProfile = null;
    
    if (userProfile.userType === 'seller') {
      additionalProfile = await db.query.sellerProfiles.findFirst({
        where: eq(sellerProfiles.userProfileId, userProfile.id),
      });
    } else if (userProfile.userType === 'buyer') {
      additionalProfile = await db.query.buyerProfiles.findFirst({
        where: eq(buyerProfiles.userProfileId, userProfile.id),
      });
    }

    return NextResponse.json({
      userProfile,
      additionalProfile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create user profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      user_id,
      email,
      full_name,
      phone_number,
      user_type,
      address,
      city,
      state,
      pincode,
      country,
      // Seller specific
      seller_type,
      organization_name,
      business_registration_number,
      // Buyer specific
      buyer_type,
      company_name,
      company_registration_number,
      tax_id,
    } = body;

    // Validate required fields
    if (!user_id || !email || !full_name || !phone_number || !user_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if profile already exists
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user_id),
    });

    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already exists',
        userProfile: existingProfile 
      }, { status: 200 });
    }

    // Create user profile
    const [newUserProfile] = await db.insert(userProfiles).values({
      userId: user_id,
      email,
      fullName: full_name,
      phoneNumber: phone_number,
      userType: user_type,
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      country: country || 'India',
    }).returning();

    // Create seller or buyer profile
    let additionalProfile = null;

    if (user_type === 'seller' && seller_type) {
      [additionalProfile] = await db.insert(sellerProfiles).values({
        userProfileId: newUserProfile.id,
        sellerType: seller_type,
        organizationName: organization_name || null,
        businessRegistrationNumber: business_registration_number || null,
      }).returning();
    } else if (user_type === 'buyer' && buyer_type) {
      [additionalProfile] = await db.insert(buyerProfiles).values({
        userProfileId: newUserProfile.id,
        buyerType: buyer_type,
        companyName: company_name || '',
        companyRegistrationNumber: company_registration_number || null,
        taxId: tax_id || null,
      }).returning();
    }

    return NextResponse.json({
      success: true,
      userProfile: newUserProfile,
      additionalProfile,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, ...updates } = body;

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch existing profile
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user_id),
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Update user profile
    const updateData: any = {};
    if (updates.full_name) updateData.fullName = updates.full_name;
    if (updates.phone_number) updateData.phoneNumber = updates.phone_number;
    if (updates.address) updateData.address = updates.address;
    if (updates.city) updateData.city = updates.city;
    if (updates.state) updateData.state = updates.state;
    if (updates.pincode) updateData.pincode = updates.pincode;
    if (updates.country) updateData.country = updates.country;
    if (updates.profile_picture_url) updateData.profilePictureUrl = updates.profile_picture_url;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      
      await db.update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.userId, user_id));
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update user profile by userProfile.id
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as {
      userId: string;
      fullName?: string;
      phoneNumber?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      profilePictureUrl?: string;
    };
    
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update user profile by id
    const updateData: any = {};
    if (updates.fullName !== undefined) updateData.fullName = updates.fullName;
    if (updates.phoneNumber !== undefined) updateData.phoneNumber = updates.phoneNumber;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.pincode !== undefined) updateData.pincode = updates.pincode;
    if (updates.profilePictureUrl !== undefined) updateData.profilePictureUrl = updates.profilePictureUrl;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      
      await db.update(userProfiles)
        .set(updateData)
        .where(eq(userProfiles.id, userId));
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
