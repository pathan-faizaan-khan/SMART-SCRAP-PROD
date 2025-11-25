import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { savedListings, listings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch saved listings for a buyer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');

    if (!buyerId) {
      return NextResponse.json(
        { error: 'Buyer ID is required' },
        { status: 400 }
      );
    }

    // Query to get saved listings with listing details
    const results = await db
      .select({
        id: savedListings.id,
        buyerId: savedListings.buyerId,
        listingId: savedListings.listingId,
        createdAt: savedListings.createdAt,
        listing: listings,
      })
      .from(savedListings)
      .leftJoin(listings, eq(savedListings.listingId, listings.id))
      .where(eq(savedListings.buyerId, buyerId))
      .orderBy(savedListings.createdAt);

    return NextResponse.json({ savedListings: results });
  } catch (error) {
    console.error('Error fetching saved listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved listings' },
      { status: 500 }
    );
  }
}

// POST - Save a listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      buyerId: string;
      listingId: string;
    };

    const { buyerId, listingId } = body;

    if (!buyerId || !listingId) {
      return NextResponse.json(
        { error: 'Buyer ID and Listing ID are required' },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await db
      .select()
      .from(savedListings)
      .where(
        and(
          eq(savedListings.buyerId, buyerId),
          eq(savedListings.listingId, listingId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: 'Listing already saved' },
        { status: 200 }
      );
    }

    // Insert new saved listing
    await db.insert(savedListings).values({
      buyerId,
      listingId,
    });

    return NextResponse.json(
      { message: 'Listing saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving listing:', error);
    return NextResponse.json(
      { error: 'Failed to save listing' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a saved listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const listingId = searchParams.get('listingId');

    if (!buyerId || !listingId) {
      return NextResponse.json(
        { error: 'Buyer ID and Listing ID are required' },
        { status: 400 }
      );
    }

    await db
      .delete(savedListings)
      .where(
        and(
          eq(savedListings.buyerId, buyerId),
          eq(savedListings.listingId, listingId)
        )
      );

    return NextResponse.json({ message: 'Listing removed from saved' });
  } catch (error) {
    console.error('Error removing saved listing:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved listing' },
      { status: 500 }
    );
  }
}
