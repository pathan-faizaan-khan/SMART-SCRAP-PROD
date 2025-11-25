import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { listings, notifications } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch listings (all or by seller)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let query = db.select().from(listings);

    const conditions = [];
    if (sellerId) conditions.push(eq(listings.sellerId, sellerId));
    if (status) conditions.push(eq(listings.status, status as any));
    if (category) conditions.push(eq(listings.category, category as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const userListings = await query.orderBy(desc(listings.createdAt));

    return NextResponse.json({ listings: userListings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

// POST - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      sellerId: string;
      title: string;
      description: string;
      category: string;
      weight: string;
      pricePerKg: string;
      totalPrice?: string;
      pickupAddress: string;
      city: string;
      state: string;
      pincode: string;
      status?: string;
      images?: string;
    };
    const {
      sellerId,
      title,
      description,
      category,
      weight,
      pricePerKg,
      totalPrice,
      pickupAddress,
      city,
      state,
      pincode,
      status,
      images,
    } = body;

    // Validation
    if (!sellerId || !title || !description || !category || !weight || !pricePerKg || !pickupAddress || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const weightNum = parseInt(weight);
    const pricePerKgNum = parseInt(pricePerKg);
    const totalPriceNum = totalPrice ? parseInt(totalPrice) : (weightNum * pricePerKgNum);

    const [listing] = await db
      .insert(listings)
      .values({
        sellerId,
        title,
        description,
        category,
        weight: weightNum,
        pricePerKg: pricePerKgNum,
        totalPrice: totalPriceNum,
        pickupAddress,
        city,
        state,
        pincode,
        images: images || null,
        status: status || 'active',
        publishedAt: status === 'active' ? new Date() : null,
      })
      .returning();

    // Create notification for seller
    await db.insert(notifications).values({
      userId: sellerId,
      type: 'account_update',
      title: 'New Listing Created',
      message: `Your listing "${title}" has been created successfully and is now live!`,
      actionUrl: `/dashboard?tab=listings`,
      actionLabel: 'View Listing',
      referenceType: 'listing',
      referenceId: listing.id,
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}

// PATCH - Update a listing
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as { listingId: string; [key: string]: any };
    const { listingId, ...updates } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // If status is being updated to active, set publishedAt
    if (updates.status === 'active' && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }

    const [updatedListing] = await db
      .update(listings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(listings.id, listingId))
      .returning();

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    await db
      .delete(listings)
      .where(eq(listings.id, listingId));

    return NextResponse.json({ success: true, message: 'Listing deleted' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
