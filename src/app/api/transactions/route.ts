import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { transactions, listings, userProfiles } from '@/db/schema';
import { eq, desc, and, or, gte, lte } from 'drizzle-orm';

// GET - Fetch transactions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const sellerId = searchParams.get('sellerId');
    const buyerId = searchParams.get('buyerId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId && !sellerId && !buyerId) {
      return NextResponse.json({ error: 'userId, sellerId, or buyerId is required' }, { status: 400 });
    }

    // Build where conditions
    const conditions = [];

    if (sellerId) {
      conditions.push(eq(transactions.sellerId, sellerId));
    }
    
    if (buyerId) {
      conditions.push(eq(transactions.buyerId, buyerId));
    }

    // If userId is provided, find transactions where user is either seller or buyer
    if (userId && !sellerId && !buyerId) {
      conditions.push(
        or(
          eq(transactions.sellerId, userId),
          eq(transactions.buyerId, userId)
        )
      );
    }

    if (status) {
      conditions.push(eq(transactions.status, status as any));
    }

    if (startDate) {
      conditions.push(gte(transactions.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(transactions.createdAt, new Date(endDate)));
    }

    // Fetch transactions with listing and user details
    const transactionsList = await db
      .select({
        transaction: transactions,
        listing: listings,
        seller: userProfiles,
      })
      .from(transactions)
      .leftJoin(listings, eq(transactions.listingId, listings.id))
      .leftJoin(userProfiles, eq(transactions.sellerId, userProfiles.userId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactions.createdAt));

    // Fetch buyer details separately
    const transactionsWithBuyer = await Promise.all(
      transactionsList.map(async (item) => {
        let buyer = null;
        if (item.transaction.buyerId) {
          const buyerData = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.userId, item.transaction.buyerId),
          });
          buyer = buyerData;
        }

        return {
          ...item.transaction,
          listing: item.listing,
          seller: item.seller,
          buyer,
        };
      })
    );

    return NextResponse.json({ transactions: transactionsWithBuyer });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST - Create transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      listingId,
      sellerId,
      buyerId,
      quantity,
      totalAmount,
      commissionAmount,
      netAmount,
      status,
      paymentStatus,
      pickupDate,
      pickupTime,
      pickupAddress,
      notes,
    } = body;

    // Validate required fields
    if (!listingId || !sellerId || !buyerId || !quantity || !totalAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create transaction
    const [newTransaction] = await db.insert(transactions).values({
      listingId,
      sellerId,
      buyerId,
      quantity: parseInt(quantity),
      totalAmount: parseInt(totalAmount),
      commissionAmount: commissionAmount ? parseInt(commissionAmount) : 0,
      netAmount: netAmount ? parseInt(netAmount) : parseInt(totalAmount),
      status: status || 'pending',
      paymentStatus: paymentStatus || 'pending',
      pickupDate: pickupDate ? new Date(pickupDate) : null,
      pickupTime: pickupTime || null,
      pickupAddress: pickupAddress || null,
      notes: notes || null,
    }).returning();

    return NextResponse.json({ transaction: newTransaction }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

// PATCH - Update transaction
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const updateData: any = {};

    if (updates.status) updateData.status = updates.status;
    if (updates.paymentStatus) updateData.paymentStatus = updates.paymentStatus;
    if (updates.pickupDate) updateData.pickupDate = new Date(updates.pickupDate);
    if (updates.pickupTime) updateData.pickupTime = updates.pickupTime;
    if (updates.pickupAddress) updateData.pickupAddress = updates.pickupAddress;
    if (updates.deliveryDate) updateData.deliveryDate = new Date(updates.deliveryDate);
    if (updates.notes) updateData.notes = updates.notes;
    if (updates.cancellationReason) updateData.cancellationReason = updates.cancellationReason;

    if (updates.status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    if (updates.status === 'cancelled' && !updateData.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    updateData.updatedAt = new Date();

    const [updatedTransaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    return NextResponse.json({ transaction: updatedTransaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

// DELETE - Delete transaction
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    await db.delete(transactions).where(eq(transactions.id, id));

    return NextResponse.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
