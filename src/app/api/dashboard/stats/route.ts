import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { listings, transactions, wallets, walletTransactions } from '@/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

// GET - Fetch dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Fetch wallet data
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

    // Fetch listings stats
    const userListings = await db
      .select({
        count: sql<number>`count(*)::int`,
        totalWeight: sql<number>`COALESCE(sum(${listings.weight}), 0)::int`,
        category: listings.category,
      })
      .from(listings)
      .where(eq(listings.sellerId, userId))
      .groupBy(listings.category);

    // Fetch transactions stats
    const userTransactions = await db
      .select({
        count: sql<number>`count(*)::int`,
        status: transactions.status,
      })
      .from(transactions)
      .where(eq(transactions.sellerId, userId))
      .groupBy(transactions.status);

    // Get total transactions count
    const [totalTransactionsResult] = await db
      .select({
        count: sql<number>`count(*)::int`,
        totalQuantity: sql<number>`COALESCE(sum(${transactions.quantity}), 0)::int`,
      })
      .from(transactions)
      .where(eq(transactions.sellerId, userId));

    // Get this month's earnings (from completed transactions)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [thisMonthEarnings] = await db
      .select({
        total: sql<number>`COALESCE(sum(${transactions.sellerAmount}), 0)::int`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.sellerId, userId),
          eq(transactions.status, 'completed'),
          gte(transactions.completedAt, startOfMonth)
        )
      );

    // Get total earnings from all completed transactions
    const [totalEarningsResult] = await db
      .select({
        total: sql<number>`COALESCE(sum(${transactions.sellerAmount}), 0)::int`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.sellerId, userId),
          eq(transactions.status, 'completed')
        )
      );

    // Get completed transactions this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [thisWeekCompleted] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.sellerId, userId),
          eq(transactions.status, 'completed'),
          gte(transactions.createdAt, startOfWeek)
        )
      );

    // Calculate category statistics
    const categoryStats = userListings.map(item => ({
      category: item.category,
      weight: item.totalWeight,
      count: item.count,
    }));

    // Calculate total weight recycled
    const totalWeightRecycled = categoryStats.reduce((sum, cat) => sum + cat.weight, 0);

    // Calculate environmental impact (approximations)
    // CO2 saved: ~1.5 kg CO2 per kg of recyclables (average)
    const co2Saved = (totalWeightRecycled / 1000) * 1.5; // Convert grams to kg, then calculate
    
    // Trees equivalent: ~1 tree absorbs ~20 kg CO2 per year
    const treesEquivalent = Math.round(co2Saved / 20);

    // Get this month's recycled weight
    const [thisMonthWeight] = await db
      .select({
        total: sql<number>`COALESCE(sum(${transactions.quantity}), 0)::int`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.sellerId, userId),
          eq(transactions.status, 'completed'),
          gte(transactions.createdAt, startOfMonth)
        )
      );

    return NextResponse.json({
      earnings: {
        total: totalEarningsResult?.total || 0,
        thisMonth: thisMonthEarnings?.total || 0,
        balance: wallet.balance,
        withdrawn: wallet.totalWithdrawn,
      },
      transactions: {
        total: totalTransactionsResult?.count || 0,
        completedThisWeek: thisWeekCompleted?.count || 0,
        byStatus: userTransactions,
      },
      recycling: {
        totalItems: totalTransactionsResult?.count || 0,
        totalWeight: totalWeightRecycled,
        categories: categoryStats,
        categoriesCount: categoryStats.length,
      },
      environmental: {
        co2Saved: Math.round(co2Saved * 100) / 100, // Round to 2 decimal places
        treesEquivalent,
        wasteDiverted: thisMonthWeight?.total || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
