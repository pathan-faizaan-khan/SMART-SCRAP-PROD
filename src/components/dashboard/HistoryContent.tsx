'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Package, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HistoryContentProps {
  userId?: string;
}

interface Transaction {
  id: string;
  listingId: string;
  sellerId: string;
  buyerId: string | null;
  quantity: number;
  totalAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: string;
  paymentStatus: string;
  pickupDate: string | null;
  pickupTime: string | null;
  createdAt: string;
  listing?: {
    title: string;
    category: string;
    pricePerKg: number;
  };
  seller?: {
    fullName: string;
  };
  buyer?: {
    fullName: string;
  };
}

export default function HistoryContent({ userId }: HistoryContentProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    totalWeight: 0,
  });

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        
        // Calculate stats
        const total = data.transactions.length;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonth = data.transactions.filter((t: Transaction) => {
          const transDate = new Date(t.createdAt);
          return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
        }).length;
        
        const totalWeight = data.transactions.reduce((sum: number, t: Transaction) => sum + (t.quantity || 0), 0);
        
        setStats({
          total,
          thisMonth,
          totalWeight: totalWeight / 1000, // Convert grams to kg
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': 
      case 'confirmed':
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 font-poppins">Transaction History</h2>
        <p className="text-gray-600 mt-2">View all your past transactions and pickups</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="shadow-lg rounded-2xl border-0 bg-linear-to-br from-teal-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-teal-700 font-medium">Total Transactions</div>
                <div className="text-3xl font-bold text-gray-900 mt-2 font-poppins">{stats.total}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-2xl border-0 bg-linear-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-700 font-medium">This Month</div>
                <div className="text-3xl font-bold text-gray-900 mt-2 font-poppins">{stats.thisMonth}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-2xl border-0 bg-linear-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-700 font-medium">Total Recycled</div>
                <div className="text-3xl font-bold text-gray-900 mt-2 font-poppins">
                  {stats.totalWeight >= 1000 
                    ? `${(stats.totalWeight / 1000).toFixed(1)} tons` 
                    : `${stats.totalWeight.toFixed(0)} kg`}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="shadow-lg rounded-2xl border-0">
        <CardHeader>
          <CardTitle className="font-poppins text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"></div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-teal-100 to-emerald-100 flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-teal-600" />
              </div>
              <p className="text-gray-900 font-bold font-poppins mb-2">No transactions yet</p>
              <p className="text-sm text-gray-500">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const isUserSeller = transaction.sellerId === userId;
                const otherParty = isUserSeller ? transaction.buyer : transaction.seller;
                const transactionType = isUserSeller ? 'Sale' : 'Purchase';
                
                return (
                  <div key={transaction.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0 border-gray-100">
                    <div className="mt-1">
                      {getStatusIcon(transaction.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {transaction.listing?.title || 'Transaction'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {transactionType} • {otherParty?.fullName || 'Unknown User'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                        <span className="font-semibold text-teal-600">
                          ₹{(transaction.totalAmount / 100).toFixed(2)}
                        </span>
                        <span className="text-gray-500">
                          {(transaction.quantity / 1000).toFixed(1)} kg
                        </span>
                        {transaction.listing?.category && (
                          <span className="text-gray-500 capitalize">
                            {transaction.listing.category}
                          </span>
                        )}
                        <span className="text-gray-400">
                          {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                        </span>
                      </div>
                      {transaction.pickupDate && (
                        <div className="mt-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Pickup: {formatDate(transaction.pickupDate)}
                          {transaction.pickupTime && ` at ${transaction.pickupTime}`}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
