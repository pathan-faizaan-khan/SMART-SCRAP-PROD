import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bids, listings, transactions, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH - Update bid status (accept/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: { status: string; sellerResponse?: string } = await request.json();
    const { status, sellerResponse } = body;

    // Get the bid
    const [bid] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, id))
      .limit(1);

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    if (bid.status !== 'pending') {
      return NextResponse.json({ error: 'Bid is no longer pending' }, { status: 400 });
    }

    // Update the bid
    const [updatedBid] = await db
      .update(bids)
      .set({
        status: status as 'accepted' | 'rejected',
        sellerResponse,
        acceptedAt: status === 'accepted' ? new Date() : null,
        rejectedAt: status === 'rejected' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(bids.id, id))
      .returning();

    // If accepted, create a transaction/order
    if (status === 'accepted') {
      // Reject all other pending bids for this listing
      await db
        .update(bids)
        .set({
          status: 'rejected',
          sellerResponse: 'Seller accepted another bid',
          rejectedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          eq(bids.listingId, bid.listingId)
        );

      // Re-update the accepted bid (since we just rejected all)
      await db
        .update(bids)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
        })
        .where(eq(bids.id, id));

      // Generate OTP for order completion
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Create transaction/order
      const platformCommission = Math.round(bid.totalAmount * 0.05); // 5% commission
      const sellerAmount = bid.totalAmount - platformCommission;

      const [newTransaction] = await db
        .insert(transactions)
        .values({
          listingId: bid.listingId,
          bidId: bid.id,
          sellerId: bid.sellerId,
          buyerId: bid.buyerId,
          quantity: bid.quantity,
          pricePerKg: bid.pricePerKg,
          totalAmount: bid.totalAmount,
          platformCommission,
          sellerAmount,
          status: 'pending',
          paymentStatus: 'pending',
          pickupAddress: '', // Will be filled by buyer
          pickupDate: bid.pickupDate,
          pickupTimeSlot: bid.pickupTimeSlot,
          paymentMethod: bid.paymentMethod,
          buyerNotes: bid.buyerNotes,
        })
        .returning();

      // Notify buyer that bid was accepted
      await db.insert(notifications).values({
        userId: bid.buyerId,
        type: 'offer_accepted',
        title: 'Bid Accepted!',
        message: `Your bid has been accepted! Please proceed with the order.`,
        metadata: JSON.stringify({ 
          bidId: bid.id, 
          transactionId: newTransaction.id,
          otp 
        }),
      });

      // Notify seller with order details and OTP
      await db.insert(notifications).values({
        userId: bid.sellerId,
        type: 'new_offer',
        title: 'Order Created',
        message: `Order created from accepted bid. OTP: ${otp}`,
        metadata: JSON.stringify({ 
          bidId: bid.id, 
          transactionId: newTransaction.id,
          otp 
        }),
      });

      return NextResponse.json({ 
        bid: updatedBid, 
        transaction: newTransaction,
        otp 
      });
    }

    // If rejected, notify buyer
    if (status === 'rejected') {
      await db.insert(notifications).values({
        userId: bid.buyerId,
        type: 'offer_rejected',
        title: 'Bid Declined',
        message: `Your bid was declined. ${sellerResponse || 'The seller chose another offer.'}`,
        metadata: JSON.stringify({ bidId: bid.id }),
      });
    }

    return NextResponse.json({ bid: updatedBid });
  } catch (error) {
    console.error('Error updating bid:', error);
    return NextResponse.json({ error: 'Failed to update bid' }, { status: 500 });
  }
}

// DELETE - Cancel bid (buyer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const [bid] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, id))
      .limit(1);

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    if (bid.status !== 'pending') {
      return NextResponse.json({ error: 'Can only cancel pending bids' }, { status: 400 });
    }

    await db
      .update(bids)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(bids.id, id));

    return NextResponse.json({ message: 'Bid cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling bid:', error);
    return NextResponse.json({ error: 'Failed to cancel bid' }, { status: 500 });
  }
}
