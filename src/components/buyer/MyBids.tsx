'use client';

import { useState, useEffect } from 'react';
import { IndianRupee, Clock, CheckCircle, XCircle, Package, Calendar, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MyBidsProps {
  buyerId: string;
}

export default function MyBids({ buyerId }: MyBidsProps) {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (buyerId) {
      fetchBids();
    }
  }, [buyerId, filter]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ buyerId });
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`/api/bids?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBids(data.bids || []);
      }
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to cancel this bid?')) return;

    try {
      const response = await fetch(`/api/bids/${bidId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBids();
      } else {
        alert('Failed to cancel bid');
      }
    } catch (error) {
      console.error('Error cancelling bid:', error);
      alert('Failed to cancel bid');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: bids.length,
    pending: bids.filter(b => b.status === 'pending').length,
    accepted: bids.filter(b => b.status === 'accepted').length,
    rejected: bids.filter(b => b.status === 'rejected').length,
  };

  const filteredBids = filter === 'all' 
    ? bids 
    : bids.filter(bid => bid.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Bids</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Accepted</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Rejected</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          className="text-xs sm:text-sm"
        >
          All Bids
        </Button>
        <Button
          onClick={() => setFilter('pending')}
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Pending
        </Button>
        <Button
          onClick={() => setFilter('accepted')}
          variant={filter === 'accepted' ? 'default' : 'outline'}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Accepted
        </Button>
        <Button
          onClick={() => setFilter('rejected')}
          variant={filter === 'rejected' ? 'default' : 'outline'}
          size="sm"
          className="text-xs sm:text-sm"
        >
          Rejected
        </Button>
      </div>

      {/* Bids List */}
      {filteredBids.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">
              {filter === 'all' ? 'No bids placed yet' : `No ${filter} bids`}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Browse listings and place your first bid!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredBids.map((bid) => (
            <Card key={bid.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                        {bid.listing?.title || 'Listing'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {bid.listing?.category}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(bid.status)} flex items-center gap-1 text-xs`}>
                      {getStatusIcon(bid.status)}
                      <span className="capitalize">{bid.status}</span>
                    </Badge>
                  </div>

                  {/* Bid Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Your Offer</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="font-semibold text-sm sm:text-base text-blue-600">
                          {(bid.pricePerKg / 100).toFixed(2)}/kg
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Quantity</p>
                      <p className="font-semibold text-sm sm:text-base mt-1">{bid.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span className="font-semibold text-sm sm:text-base text-green-600">
                          {(bid.totalAmount / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Bid Date</p>
                      <p className="text-xs sm:text-sm font-medium mt-1">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-2 sm:p-3">
                    <User className="w-4 h-4" />
                    <span>Seller: {bid.seller?.fullName || bid.seller?.businessName || 'Unknown'}</span>
                  </div>

                  {/* Pickup Details */}
                  {bid.pickupDate && (
                    <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(bid.pickupDate).toLocaleDateString()}</span>
                      </div>
                      {bid.pickupTimeSlot && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="capitalize">{bid.pickupTimeSlot}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {bid.buyerNotes && (
                    <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                      <p className="text-xs text-gray-600 mb-1">Your Notes:</p>
                      <p className="text-xs sm:text-sm text-gray-800">{bid.buyerNotes}</p>
                    </div>
                  )}

                  {/* Seller Response */}
                  {bid.sellerResponse && (
                    <div className="bg-yellow-50 rounded-lg p-2 sm:p-3">
                      <p className="text-xs text-gray-600 mb-1">Seller Response:</p>
                      <p className="text-xs sm:text-sm text-gray-800">{bid.sellerResponse}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {bid.status === 'pending' && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleCancelBid(bid.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                      >
                        Cancel Bid
                      </Button>
                    </div>
                  )}

                  {bid.status === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                      <p className="text-xs sm:text-sm text-green-800 font-medium">
                        ✅ Your bid was accepted! Check "My Orders" for order details.
                      </p>
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
