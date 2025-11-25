import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedAddresses } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch all saved addresses for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const addresses = await db
      .select()
      .from(savedAddresses)
      .where(eq(savedAddresses.userId, userId))
      .orderBy(savedAddresses.isDefault, savedAddresses.createdAt);

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

// POST - Create a new saved address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, label, address, city, state, pincode, landmark, isDefault } = body;

    if (!userId || !label || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // If this is being set as default, unset all other defaults for this user
    if (isDefault) {
      await db
        .update(savedAddresses)
        .set({ isDefault: false })
        .where(eq(savedAddresses.userId, userId));
    }

    const [newAddress] = await db
      .insert(savedAddresses)
      .values({
        userId,
        label,
        address,
        city,
        state,
        pincode,
        landmark: landmark || null,
        isDefault: isDefault || false,
      })
      .returning();

    return NextResponse.json({ address: newAddress }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}

// PUT - Update an existing address
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, label, address, city, state, pincode, landmark, isDefault } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: 'Address ID and User ID are required' }, { status: 400 });
    }

    // If this is being set as default, unset all other defaults for this user
    if (isDefault) {
      await db
        .update(savedAddresses)
        .set({ isDefault: false })
        .where(and(eq(savedAddresses.userId, userId), eq(savedAddresses.isDefault, true)));
    }

    const [updatedAddress] = await db
      .update(savedAddresses)
      .set({
        label,
        address,
        city,
        state,
        pincode,
        landmark,
        isDefault,
        updatedAt: new Date(),
      })
      .where(and(eq(savedAddresses.id, id), eq(savedAddresses.userId, userId)))
      .returning();

    if (!updatedAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

// DELETE - Delete an address
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'Address ID and User ID are required' }, { status: 400 });
    }

    await db
      .delete(savedAddresses)
      .where(and(eq(savedAddresses.id, id), eq(savedAddresses.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
