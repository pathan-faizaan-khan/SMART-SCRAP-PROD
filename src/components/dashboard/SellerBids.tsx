'use client';

import { useEffect, useState } from 'react';
import { Package, TrendingUp, Clock, CheckCircle, X as XIcon, IndianRupee, User, Calendar, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SellerBidsProps {
  sellerId: string;
}

interface Bid {
  bid: {
    id: string;
    pricePerKg: number;
    quantity: number;
    totalAmount: number;
    status: string;
    pickupDate: string | null;
    pickupTimeSlot: string | null;
    paymentMethod: string | null;
    buyerNotes: string | null;
    createdAt: string;
  };
  listing: {
    id: string;
    title: string;
    category: string;
    weight: number;
  };
  buyer: {
    fullName: string;
    companyName: string | null;
    phone: string | null;
  };
}

export default function SellerBids({ sellerId }: SellerBidsProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBids = async () => {
    try {
      const response = await fetch(`/api/bids?sellerId=${sellerId}`);
      const data = await response.json();
      setBids(data.bids || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) {
      fetchBids();
    }
  }, [sellerId]);

  const filteredBids = bids.filter(b => {
    if (filter === 'all') return true;
    return b.bid.status === filter;
  });

  const pendingCount = bids.filter(b => b.bid.status === 'pending').length;
  const acceptedCount = bids.filter(b => b.bid.status === 'accepted').length;

  const handleAcceptBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to accept this bid? This will create an order and reject all other bids for this listing.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'accepted',
          sellerResponse: 'Bid accepted! Order created.',
        }),
      });

      if (response.ok) {
        alert('Bid accepted successfully! An order has been created.');
        fetchBids();
        setSelectedBid(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to accept bid');
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      alert('Failed to accept bid. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          sellerResponse: reason || 'Bid declined',
        }),
      });

      if (response.ok) {
        alert('Bid rejected successfully.');
        fetchBids();
        setSelectedBid(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reject bid');
      }
    } catch (error) {
      console.error('Error rejecting bid:', error);
      alert('Failed to reject bid. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Bids</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted Bids</p>
                <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bids</p>
                <p className="text-2xl font-bold text-teal-600">{bids.length}</p>
              </div>
              <Package className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className={filter === status ? 'bg-teal-600 hover:bg-teal-700' : ''}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Bids List */}
      {filteredBids.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No {filter !== 'all' ? filter : ''} bids found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBids.map((item) => (
            <Card key={item.bid.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Bid Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{item.listing.title}</h3>
                        <p className="text-sm text-gray-600">
                          Category: <span className="font-medium">{item.listing.category}</span>
                        </p>
                      </div>
                      <Badge
                        className={
                          item.bid.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : item.bid.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {item.bid.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Price/kg</p>
                        <p className="font-semibold text-teal-600">₹{(item.bid.pricePerKg / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="font-semibold">{item.bid.quantity} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Amount</p>
                        <p className="font-semibold text-green-600">₹{(item.bid.totalAmount / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Buyer</p>
                        <p className="font-semibold text-sm">{item.buyer.fullName}</p>
                      </div>
                    </div>

                    {item.bid.buyerNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Buyer Notes:
                        </p>
                        <p className="text-sm text-gray-800">{item.bid.buyerNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {item.bid.status === 'pending' && (
                    <div className="flex md:flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptBid(item.bid.id)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectBid(item.bid.id)}
                        disabled={actionLoading}
                        className="border-red-300 text-red-600 hover:bg-red-50 flex-1 md:flex-none"
                      >
                        <XIcon className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
