import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { transactions, listings, notifications, userProfiles } from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';

// GET - Fetch orders for buyer or seller
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');
    const status = searchParams.get('status');

    if (!buyerId && !sellerId) {
      return NextResponse.json(
        { error: 'Buyer ID or Seller ID is required' },
        { status: 400 }
      );
    }

    let query = db.select({
      id: transactions.id,
      buyerId: transactions.buyerId,
      sellerId: transactions.sellerId,
      listingId: transactions.listingId,
      quantity: transactions.quantity,
      totalPrice: transactions.totalAmount,
      status: transactions.status,
      notes: transactions.buyerNotes,
      createdAt: transactions.createdAt,
      listing: listings,
    })
      .from(transactions)
      .leftJoin(listings, eq(transactions.listingId, listings.id));

    const conditions = [];
    if (buyerId) conditions.push(eq(transactions.buyerId, buyerId));
    if (sellerId) conditions.push(eq(transactions.sellerId, sellerId));
    if (status) conditions.push(eq(transactions.status, status as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const orders = await query.orderBy(transactions.createdAt);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      buyerId: string;
      sellerId: string;
      listingId: string;
      quantity: number;
      totalPrice: number;
      notes?: string;
      pickupAddress?: string;
      paymentMethod?: string;
      pickupDate?: string;
      pickupTimeSlot?: string;
    };

    const { buyerId, sellerId, listingId, quantity, totalPrice, notes, pickupAddress, paymentMethod, pickupDate, pickupTimeSlot } = body;

    if (!buyerId || !sellerId || !listingId || !quantity || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create transaction
    const [order] = await db
      .insert(transactions)
      .values({
        buyerId,
        sellerId,
        listingId,
        quantity,
        pricePerKg: Math.floor(totalPrice / quantity), // Calculate price per kg
        totalAmount: totalPrice,
        platformCommission: Math.floor(totalPrice * 0.05), // 5% platform fee
        sellerAmount: Math.floor(totalPrice * 0.95),
        status: 'pending',
        paymentStatus: 'pending',
        pickupAddress: pickupAddress || '',
        paymentMethod: paymentMethod || null,
        pickupDate: pickupDate ? new Date(pickupDate) : null,
        pickupTimeSlot: pickupTimeSlot || null,
        buyerNotes: notes || null,
      })
      .returning();

    // Update listing status to pending
    await db
      .update(listings)
      .set({ status: 'pending' })
      .where(eq(listings.id, listingId));

    // Create notification for seller with OTP
    await db.insert(notifications).values({
      userId: sellerId,
      type: 'new_offer',
      title: 'New Order Received',
      message: `You have received a new order. OTP for completion: ${otp}`,
      referenceType: 'order',
      referenceId: order.id,
      metadata: JSON.stringify({ otp }), // Store OTP in metadata
    });

    // Create notification for buyer
    await db.insert(notifications).values({
      userId: buyerId,
      type: 'new_message',
      title: 'Order Placed Successfully',
      message: `Your order has been placed. The seller will contact you soon.`,
      referenceType: 'order',
      referenceId: order.id,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
