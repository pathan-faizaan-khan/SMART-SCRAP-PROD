'use client';

import { useState } from 'react';
import { X, MapPin, Weight, IndianRupee, Calendar, User, Phone, Heart, ShoppingCart, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ListingDetailModalProps {
  listing: any;
  buyerId: string;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
  onOrderPlaced: () => void;
}

export default function ListingDetailModal({
  listing,
  buyerId,
  isSaved,
  onClose,
  onToggleSave,
  onOrderPlaced,
}: ListingDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('morning');

  const images = listing.images ? JSON.parse(listing.images) : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handlePlaceOrder = async () => {
    // Validate required fields
    if (!pickupAddress.trim()) {
      alert('Please enter your pickup address');
      return;
    }
    if (!pickupDate) {
      alert('Please select a pickup date');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId,
          listingId: listing.id,
          sellerId: listing.sellerId,
          quantity: parseFloat(listing.weight) || 1,
          totalPrice: parseFloat(listing.totalPrice) || 0,
          notes: orderNotes,
          pickupAddress,
          paymentMethod,
          pickupDate,
          pickupTimeSlot,
        }),
      });

      if (response.ok) {
        alert('Order placed successfully! The seller will be notified.');
        onOrderPlaced();
        onClose();
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        // Close modal when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-4 sm:my-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Listing Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="relative">
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Title and Actions */}
          <div className="flex justify-between items-start gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{listing.title}</h3>
                <Badge className="bg-teal-600 text-xs sm:text-sm">{listing.category}</Badge>
              </div>
              <p className="text-sm sm:text-base text-gray-600">{listing.description}</p>
            </div>
            <button
              onClick={onToggleSave}
              className="p-2 sm:p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            >
              <Heart
                className={`w-5 h-5 sm:w-6 sm:h-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-teal-100 rounded-lg">
                    <Weight className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Quantity</p>
                    <p className="text-base sm:text-lg font-semibold">{listing.weight} kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg">
                    <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Price per kg</p>
                    <p className="text-base sm:text-lg font-semibold">₹{(listing.pricePerKg / 100).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Location</p>
                    <p className="text-sm font-semibold">{listing.city}, {listing.state}</p>
                    <p className="text-xs text-gray-500">{listing.pincode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Posted</p>
                    <p className="text-sm font-semibold">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pickup Address */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Pickup Address
              </h4>
              <p className="text-gray-600">{listing.pickupAddress}</p>
            </CardContent>
          </Card>

          {/* Total Price */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Price</p>
                <div className="flex items-baseline gap-2">
                  <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                  <span className="text-3xl sm:text-4xl font-bold text-teal-600">
                    {(listing.totalPrice / 100).toFixed(2)}
                  </span>
                </div>
              </div>
              {!showOrderForm && (
                <Button
                  onClick={() => setShowOrderForm(true)}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto text-sm sm:text-base"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Place Order
                </Button>
              )}
            </div>
          </div>

          {/* Order Form */}
          {showOrderForm && (
            <Card className="border-2 border-teal-200">
              <CardContent className="p-4 sm:p-6 space-y-4">
                <h4 className="font-semibold text-base sm:text-lg text-gray-900">Order Details</h4>
                
                {/* Pickup Address */}
                <div>
                  <Label htmlFor="pickupAddress" className="text-sm font-semibold text-gray-700">
                    Pickup Address <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="pickupAddress"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Enter your complete address for pickup..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent mt-1 text-sm sm:text-base"
                    rows={3}
                    required
                  />
                </div>

                {/* Pickup Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickupDate" className="text-sm font-semibold text-gray-700">
                      Preferred Pickup Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupTimeSlot" className="text-sm font-semibold text-gray-700">
                      Time Slot
                    </Label>
                    <select
                      id="pickupTimeSlot"
                      value={pickupTimeSlot}
                      onChange={(e) => setPickupTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent mt-1 text-sm sm:text-base"
                    >
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 3 PM)</option>
                      <option value="evening">Evening (3 PM - 6 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <Label htmlFor="paymentMethod" className="text-sm font-semibold text-gray-700">
                    Payment Method
                  </Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent mt-1 text-sm sm:text-base"
                  >
                    <option value="cash">Cash on Pickup</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="orderNotes" className="text-sm font-semibold text-gray-700">
                    Additional Notes (Optional)
                  </Label>
                  <textarea
                    id="orderNotes"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Add any special instructions or requirements..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent mt-1 text-sm sm:text-base"
                    rows={2}
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Note:</strong> The seller will contact you to confirm the pickup details and finalize the transaction.
                  </p>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h5 className="font-semibold text-gray-900 text-sm">Order Summary</h5>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{listing.weight} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-semibold">₹{(listing.pricePerKg / 100).toFixed(2)}/kg</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-teal-600 text-lg">₹{(listing.totalPrice / 100).toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => setShowOrderForm(false)}
                    variant="outline"
                    className="flex-1 text-sm sm:text-base"
                    disabled={isPlacingOrder}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-sm sm:text-base"
                  >
                    {isPlacingOrder ? 'Placing Order...' : 'Confirm Order'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
