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
  onPlaceBid: () => void;
}

export default function ListingDetailModal({
  listing,
  buyerId,
  isSaved,
  onClose,
  onToggleSave,
  onPlaceBid,
}: ListingDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = listing.images ? JSON.parse(listing.images) : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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

          {/* Bidding Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Bidding Available</h4>
                  <p className="text-sm text-gray-600">
                    This listing is available for bidding. Place your offer and the seller will review all bids to choose the best one.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <p className="text-xs text-gray-600"> <strong>How it works:</strong></p>
                <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                  <li>Submit your price offer per kg</li>
                  <li>Seller reviews all bids received</li>
                  <li>If your bid is accepted, it becomes an order</li>
                  <li>Complete the transaction with OTP verification</li>
                </ol>
              </div>
              <Button
                onClick={onPlaceBid}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 text-base font-semibold"
                size="lg"
              >
                <IndianRupee className="w-5 h-5 mr-2" />
                Place Your Bid
              </Button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
