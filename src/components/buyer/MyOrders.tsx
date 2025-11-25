'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Clock, CheckCircle, XCircle, Phone, MapPin, Calendar, IndianRupee, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MyOrdersProps {
  buyerId: string;
}

export default function MyOrders({ buyerId }: MyOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [otpInput, setOtpInput] = useState<{ [key: string]: string }>({});
  const [completingOrder, setCompletingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (buyerId) {
      fetchOrders();
    }
  }, [buyerId, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ buyerId });
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`/api/orders?${params}`);
      if (response.ok) {
        const data = await response.json() as { orders: any[] };
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        fetchOrders();
      } else {
        alert('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">Accepted</p>
                <p className="text-2xl font-bold text-blue-900">
                  {orders.filter(o => o.status === 'accepted').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-700 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-teal-900">{orders.length}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
        <div className="flex items-center justify-between sm:hidden">
          <h3 className="text-sm font-semibold text-gray-700">Filter Orders</h3>
          <div className="relative">
            <button
              onClick={() => {
                const dropdown = document.getElementById('filter-dropdown');
                if (dropdown) dropdown.classList.toggle('hidden');
              }}
              className="p-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            <div id="filter-dropdown" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              {['all', 'pending', 'accepted', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setFilter(status);
                    document.getElementById('filter-dropdown')?.classList.add('hidden');
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    filter === status ? 'bg-teal-50 text-teal-600 font-semibold' : 'text-gray-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          {['all', 'pending', 'accepted', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="sm:hidden flex items-center justify-center py-2 px-4 bg-teal-50 rounded-lg border border-teal-200">
          <span className="text-sm text-teal-700">Showing: <span className="font-semibold">{filter.charAt(0).toUpperCase() + filter.slice(1)}</span></span>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't placed any orders yet"
                : `No ${filter} orders found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{order.listing?.category || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">
                        {order.listing?.city}, {order.listing?.state}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{order.quantity} kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <IndianRupee className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium text-teal-600">
                        ₹{(order.totalPrice / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {order.notes}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        onClick={async () => {
                          if (!confirm('Mark this order as out for pickup? The seller will be notified.')) return;
                          try {
                            const response = await fetch(`/api/orders/${order.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'accepted' }),
                            });
                            if (response.ok) {
                              fetchOrders();
                              alert('Order is now out for pickup! You can complete it with the seller\'s OTP.');
                            } else {
                              alert('Failed to update order');
                            }
                          } catch (error) {
                            console.error('Error updating order:', error);
                            alert('Failed to update order');
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Out for Pickup
                      </Button>
                      <Button
                        onClick={() => handleCancelOrder(order.id)}
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Order
                      </Button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter OTP from seller"
                          value={otpInput[order.id] || ''}
                          onChange={(e) => setOtpInput({ ...otpInput, [order.id]: e.target.value })}
                          maxLength={6}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                        <Button
                          onClick={async () => {
                            const otp = otpInput[order.id]?.trim();
                            if (!otp || otp.length !== 6) {
                              alert('Please enter a valid 6-digit OTP');
                              return;
                            }
                            
                            setCompletingOrder(order.id);
                            try {
                              const response = await fetch(`/api/orders/${order.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'completed', otp }),
                              });
                              
                              if (response.ok) {
                                setOtpInput({ ...otpInput, [order.id]: '' });
                                fetchOrders();
                                alert('Order completed successfully!');
                              } else {
                                const data = await response.json();
                                alert(data.error || 'Failed to complete order. Please check the OTP.');
                              }
                            } catch (error) {
                              console.error('Error completing order:', error);
                              alert('Failed to complete order');
                            } finally {
                              setCompletingOrder(null);
                            }
                          }}
                          disabled={completingOrder === order.id}
                          className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {completingOrder === order.id ? 'Verifying...' : 'Complete'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600">
                        Ask the seller for the 6-digit OTP to complete this order
                      </p>
                    </div>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto my-4 sm:my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500">Order #{selectedOrder.id.slice(0, 12)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <Badge className={`${getStatusColor(selectedOrder.status)} text-base px-4 py-2`}>
                  {selectedOrder.status.toUpperCase()}
                </Badge>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at{' '}
                  {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {/* Listing Details */}
              {selectedOrder.listing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Listing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-semibold">{selectedOrder.listing.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge className="bg-teal-100 text-teal-700">{selectedOrder.listing.category}</Badge>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Description:</span>
                      <span className="text-sm text-gray-700 text-right max-w-xs">{selectedOrder.listing.description}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{selectedOrder.quantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per kg:</span>
                    <span className="font-semibold">₹{((selectedOrder.totalPrice / selectedOrder.quantity) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-teal-600">₹{(selectedOrder.totalPrice / 100).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pickup Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="text-gray-600 block text-sm">Pickup Address:</span>
                      <span className="font-medium">{selectedOrder.listing?.pickupAddress || 'Not specified'}</span>
                    </div>
                  </div>
                  {selectedOrder.listing && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <span className="text-gray-600 block text-sm">Location:</span>
                        <span className="font-medium">{selectedOrder.listing.city}, {selectedOrder.listing.state} - {selectedOrder.listing.pincode}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <Badge className={selectedOrder.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {selectedOrder.status === 'completed' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">Cash on Pickup</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-4 pt-4">
                {selectedOrder.status === 'pending' && (
                  <>
                    <Button
                      onClick={async () => {
                        if (!confirm('Mark this order as out for pickup? The seller will be notified.')) return;
                        try {
                          const response = await fetch(`/api/orders/${selectedOrder.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'accepted' }),
                          });
                          if (response.ok) {
                            fetchOrders();
                            setSelectedOrder(null);
                            alert('Order is now out for pickup! You can complete it with the seller\'s OTP.');
                          } else {
                            alert('Failed to update order');
                          }
                        } catch (error) {
                          console.error('Error updating order:', error);
                          alert('Failed to update order');
                        }
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Out for Pickup
                    </Button>
                    <Button
                      onClick={() => {
                        handleCancelOrder(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  </>
                )}
                {selectedOrder.status === 'accepted' && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 font-medium mb-2">
                        Order Ready for Completion
                      </p>
                      <p className="text-xs text-blue-700">
                        Ask the seller for the 6-digit OTP to complete this order securely.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Enter OTP</label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otpInput[selectedOrder.id] || ''}
                        onChange={(e) => setOtpInput({ ...otpInput, [selectedOrder.id]: e.target.value })}
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                      />
                    </div>
                    <Button
                      onClick={async () => {
                        const otp = otpInput[selectedOrder.id]?.trim();
                        if (!otp || otp.length !== 6) {
                          alert('Please enter a valid 6-digit OTP');
                          return;
                        }
                        
                        setCompletingOrder(selectedOrder.id);
                        try {
                          const response = await fetch(`/api/orders/${selectedOrder.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'completed', otp }),
                          });
                          
                          if (response.ok) {
                            setOtpInput({ ...otpInput, [selectedOrder.id]: '' });
                            fetchOrders();
                            setSelectedOrder(null);
                            alert('Order completed successfully!');
                          } else {
                            const data = await response.json() as { error?: string };
                            alert(data.error || 'Invalid OTP. Please check with the seller.');
                          }
                        } catch (error) {
                          console.error('Error completing order:', error);
                          alert('Failed to complete order');
                        } finally {
                          setCompletingOrder(null);
                        }
                      }}
                      disabled={completingOrder === selectedOrder.id || !otpInput[selectedOrder.id] || otpInput[selectedOrder.id].length !== 6}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {completingOrder === selectedOrder.id ? 'Verifying OTP...' : 'Complete Order'}
                    </Button>
                  </div>
                )}
                <Button
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
