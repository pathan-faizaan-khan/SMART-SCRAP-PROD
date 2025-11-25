'use client';

import { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, MapPin, IndianRupee, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SavedListingsProps {
  buyerId: string;
}

export default function SavedListings({ buyerId }: SavedListingsProps) {
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (buyerId) {
      fetchSavedListings();
    }
  }, [buyerId]);

  const fetchSavedListings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/saved-listings?buyerId=${buyerId}`);
      if (response.ok) {
        const data = await response.json() as { savedListings: any[] };
        setSavedListings(data.savedListings || []);
      }
    } catch (error) {
      console.error('Failed to fetch saved listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId: string) => {
    try {
      await fetch(`/api/saved-listings?buyerId=${buyerId}&listingId=${listingId}`, {
        method: 'DELETE',
      });
      setSavedListings(prev => prev.filter(s => s.listingId !== listingId));
    } catch (error) {
      console.error('Failed to remove saved listing:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Saved Listings</h2>
        <p className="text-sm text-gray-600">{savedListings.length} saved</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : savedListings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved listings</h3>
            <p className="text-gray-600">Start browsing and save listings you're interested in</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedListings.map((saved) => {
            const listing = saved.listing;
            if (!listing) return null;

            const images = listing.images ? JSON.parse(listing.images) : [];
            
            return (
              <Card key={saved.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {images.length > 0 ? (
                    <img
                      src={images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(listing.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                  <Badge className="absolute bottom-3 left-3 bg-teal-600">
                    {listing.category}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{listing.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.city}, {listing.state}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <IndianRupee className="w-5 h-5 text-teal-600" />
                    <span className="text-2xl font-bold text-teal-600">
                      {(listing.totalPrice / 100).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Place Order
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
