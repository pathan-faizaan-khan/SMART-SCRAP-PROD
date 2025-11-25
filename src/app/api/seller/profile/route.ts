import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { sellerProfiles, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch seller profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile first
    const userProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, userId),
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get seller profile
    const sellerProfile = await db.query.sellerProfiles.findFirst({
      where: eq(sellerProfiles.userProfileId, userId),
    });

    if (!sellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...sellerProfile,
      phoneNumber: userProfile.phoneNumber,
    });
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller profile' },
      { status: 500 }
    );
  }
}

// PATCH - Update seller profile
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as {
      userId: string;
      upiId?: string;
      bankAccountNumber?: string;
      bankIfscCode?: string;
      bankAccountHolderName?: string;
      bankName?: string;
    };

    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get seller profile
    const sellerProfile = await db.query.sellerProfiles.findFirst({
      where: eq(sellerProfiles.userProfileId, userId),
    });

    if (!sellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    // Update seller profile
    const [updatedProfile] = await db
      .update(sellerProfiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(sellerProfiles.userProfileId, userId))
      .returning();

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating seller profile:', error);
    return NextResponse.json(
      { error: 'Failed to update seller profile' },
      { status: 500 }
    );
  }
}
