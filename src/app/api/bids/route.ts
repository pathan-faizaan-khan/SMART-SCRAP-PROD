import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bids, listings, userProfiles, notifications } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// GET - Fetch bids (for buyer or seller)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');
    const listingId = searchParams.get('listingId');

    let query = db.select({
      bid: bids,
      listing: listings,
      buyer: userProfiles,
    })
    .from(bids)
    .leftJoin(listings, eq(bids.listingId, listings.id))
    .leftJoin(userProfiles, eq(bids.buyerId, userProfiles.id))
    .orderBy(desc(bids.createdAt));

    // Filter by buyer
    if (buyerId) {
      const result = await query.where(eq(bids.buyerId, buyerId));
      return NextResponse.json({ bids: result });
    }

    // Filter by seller
    if (sellerId) {
      const result = await query.where(eq(bids.sellerId, sellerId));
      return NextResponse.json({ bids: result });
    }

    // Filter by listing
    if (listingId) {
      const result = await query.where(eq(bids.listingId, listingId));
      return NextResponse.json({ bids: result });
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 });
  }
}

// POST - Create a new bid
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      listingId,
      buyerId,
      pricePerKg,
      quantity,
      pickupDate,
      pickupTimeSlot,
      paymentMethod,
      buyerNotes,
    }: {
      listingId: string;
      buyerId: string;
      pricePerKg: number;
      quantity: number;
      pickupDate?: string;
      pickupTimeSlot?: string;
      paymentMethod?: string;
      buyerNotes?: string;
    } = body;

    // Validate required fields
    if (!listingId || !buyerId || !pricePerKg || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get listing details
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is not available' }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = pricePerKg * quantity;

    // Create the bid
    const [newBid] = await db
      .insert(bids)
      .values({
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        pricePerKg,
        quantity,
        totalAmount,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
        pickupTimeSlot,
        paymentMethod,
        buyerNotes,
        status: 'pending',
      })
      .returning();

    // Notify seller about new bid
    await db.insert(notifications).values({
      userId: listing.sellerId,
      type: 'new_offer',
      title: 'New Bid Received',
      message: `You received a new bid of ₹${(pricePerKg / 100).toFixed(2)}/kg for ${quantity}kg on your listing "${listing.title}"`,
      metadata: JSON.stringify({ bidId: newBid.id, listingId }),
    });

    return NextResponse.json({ bid: newBid }, { status: 201 });
  } catch (error) {
    console.error('Error creating bid:', error);
    return NextResponse.json({ error: 'Failed to create bid' }, { status: 500 });
  }
}
