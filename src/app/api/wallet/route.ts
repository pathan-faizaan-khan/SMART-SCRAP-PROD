import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { wallets, walletTransactions } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

// GET - Fetch wallet data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const includeTransactions = searchParams.get('includeTransactions') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch wallet
    let wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, userId),
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      [wallet] = await db.insert(wallets).values({
        userId,
        balance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        isActive: true,
      }).returning();
    }

    let transactions = [];
    if (includeTransactions) {
      transactions = await db.query.walletTransactions.findMany({
        where: eq(walletTransactions.userId, userId),
        orderBy: [desc(walletTransactions.createdAt)],
        limit,
      });
    }

    return NextResponse.json({ 
      wallet,
      transactions: includeTransactions ? transactions : undefined,
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}

// POST - Create wallet transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      amount,
      referenceType,
      referenceId,
      description,
      metadata,
    } = body;

    if (!userId || !type || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get or create wallet
    let wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, userId),
    });

    if (!wallet) {
      [wallet] = await db.insert(wallets).values({
        userId,
        balance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        isActive: true,
      }).returning();
    }

    const amountInt = parseInt(amount);
    const balanceBefore = wallet.balance;
    let balanceAfter = balanceBefore;
    let newTotalEarnings = wallet.totalEarnings;
    let newTotalWithdrawn = wallet.totalWithdrawn;

    // Calculate new balance based on transaction type
    switch (type) {
      case 'credit':
      case 'earnings':
        balanceAfter = balanceBefore + amountInt;
        newTotalEarnings += amountInt;
        break;
      case 'debit':
      case 'withdrawal':
        balanceAfter = balanceBefore - amountInt;
        newTotalWithdrawn += amountInt;
        break;
      case 'refund':
        balanceAfter = balanceBefore + amountInt;
        break;
      case 'fee':
      case 'commission':
        balanceAfter = balanceBefore - amountInt;
        break;
      default:
        return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    // Create wallet transaction
    const [transaction] = await db.insert(walletTransactions).values({
      walletId: wallet.id,
      userId,
      type,
      amount: amountInt,
      balanceBefore,
      balanceAfter,
      referenceType: referenceType || null,
      referenceId: referenceId || null,
      description: description || null,
      metadata: metadata || null,
    }).returning();

    // Update wallet
    await db.update(wallets)
      .set({
        balance: balanceAfter,
        totalEarnings: newTotalEarnings,
        totalWithdrawn: newTotalWithdrawn,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, wallet.id));

    return NextResponse.json({ 
      transaction,
      wallet: {
        ...wallet,
        balance: balanceAfter,
        totalEarnings: newTotalEarnings,
        totalWithdrawn: newTotalWithdrawn,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating wallet transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

// PATCH - Update wallet
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, userId),
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    await db.update(wallets)
      .set(updateData)
      .where(eq(wallets.id, wallet.id));

    return NextResponse.json({ success: true, message: 'Wallet updated' });
  } catch (error) {
    console.error('Error updating wallet:', error);
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
  }
}
