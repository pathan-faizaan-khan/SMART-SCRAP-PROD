import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { transactions, notifications, userProfiles, listings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as {
      status?: string;
      paymentStatus?: string;
      otp?: string;
    };

    const { status, paymentStatus, otp } = body;

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: 'No update fields provided' },
        { status: 400 }
      );
    }

    // If completing order, verify OTP
    if (status === 'completed' && otp) {
      // Find notification with OTP for this order
      const orderNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.referenceId, id));

      const notificationWithOtp = orderNotifications.find(n => {
        if (n.metadata) {
          try {
            const metadata = JSON.parse(n.metadata as string);
            return metadata.otp === otp;
          } catch {
            return false;
          }
        }
        return false;
      });

      if (!notificationWithOtp) {
        return NextResponse.json(
          { error: 'Invalid OTP. Please check the OTP from seller.' },
          { status: 400 }
        );
      }
    } else if (status === 'completed' && !otp) {
      return NextResponse.json(
        { error: 'OTP is required to complete the order' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
      } else if (status === 'accepted') {
        updateData.acceptedAt = new Date();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }
    }
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    updateData.updatedAt = new Date();

    const [updatedOrder] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If order is marked as "accepted" (out for pickup), send notification to seller with OTP
    if (status === 'accepted') {
      // Check if OTP notification already exists
      const existingNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.referenceId, id));

      const existingOtpNotification = existingNotifications.find(n => {
        if (n.metadata) {
          try {
            const metadata = JSON.parse(n.metadata as string);
            return metadata.otp;
          } catch {
            return false;
          }
        }
        return false;
      });

      // If OTP notification exists, send it again to seller for "out for pickup" status
      if (existingOtpNotification && existingOtpNotification.metadata) {
        const metadata = JSON.parse(existingOtpNotification.metadata as string);
        const otp = metadata.otp;

        // Send notification to seller
        await db.insert(notifications).values({
          userId: updatedOrder.sellerId,
          type: 'new_message',
          title: 'Order Out for Pickup',
          message: `Order is out for pickup. OTP for completion: ${otp}`,
          referenceType: 'order',
          referenceId: id,
          metadata: JSON.stringify({ otp }),
        });

        // Send notification to buyer
        await db.insert(notifications).values({
          userId: updatedOrder.buyerId,
          type: 'new_message',
          title: 'Order Status Updated',
          message: `Your order is now out for pickup. You'll need the seller's OTP to complete.`,
          referenceType: 'order',
          referenceId: id,
        });
      }
    }

    // If order is completed, update listing status and send notifications
    if (status === 'completed') {
      // Update listing status to sold
      await db
        .update(listings)
        .set({ 
          status: 'sold',
          updatedAt: new Date()
        })
        .where(eq(listings.id, updatedOrder.listingId));

      // Send completion notifications
      await db.insert(notifications).values({
        userId: updatedOrder.sellerId,
        type: 'payment_received',
        title: 'Order Completed',
        message: `Order #${updatedOrder.id.slice(0, 8)} has been completed. Amount: ₹${(updatedOrder.sellerAmount / 100).toFixed(2)}`,
        referenceType: 'order',
        referenceId: id,
      });

      await db.insert(notifications).values({
        userId: updatedOrder.buyerId,
        type: 'new_message',
        title: 'Order Completed',
        message: `Your order has been completed successfully. Thank you for using SmartScrap!`,
        referenceType: 'order',
        referenceId: id,
      });
    }

    // If order is cancelled, update listing status back to active
    if (status === 'cancelled') {
      await db
        .update(listings)
        .set({ 
          status: 'active',
          updatedAt: new Date()
        })
        .where(eq(listings.id, updatedOrder.listingId));

      // Send cancellation notifications
      await db.insert(notifications).values({
        userId: updatedOrder.sellerId,
        type: 'new_message',
        title: 'Order Cancelled',
        message: `Order #${updatedOrder.id.slice(0, 8)} has been cancelled.`,
        referenceType: 'order',
        referenceId: id,
      });

      await db.insert(notifications).values({
        userId: updatedOrder.buyerId,
        type: 'new_message',
        title: 'Order Cancelled',
        message: `Your order has been cancelled. The listing is now available again.`,
        referenceType: 'order',
        referenceId: id,
      });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
