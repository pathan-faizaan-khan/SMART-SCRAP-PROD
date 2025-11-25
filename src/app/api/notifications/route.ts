import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { notifications } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET - Fetch notifications for a user
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

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount: userNotifications.filter(n => !n.isRead).length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, actionUrl, actionLabel, referenceType, referenceId } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        actionUrl,
        actionLabel,
        referenceType,
        referenceId,
      })
      .returning();

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAllRead, isRead } = body;

    if (markAllRead && userId) {
      // Mark all notifications as read for user
      await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    } else if (notificationId) {
      // Mark single notification as read
      await db
        .update(notifications)
        .set({ isRead: isRead ?? true, readAt: isRead ? new Date() : null })
        .where(eq(notifications.id, notificationId));

      return NextResponse.json({ success: true, message: 'Notification updated' });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notificationId');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));

    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
