'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Weight, IndianRupee, Heart, ShoppingCart, Filter, Eye, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ListingDetailModal from './ListingDetailModal';

interface BrowseListingsProps {
  buyerId: string;
}

export default function BrowseListings({ buyerId }: BrowseListingsProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());

  const categories = [
    'all', 'plastic', 'paper', 'glass', 'cardboard', 'metal', 
    'electronics', 'batteries', 'textiles', 'other'
  ];

  useEffect(() => {
    fetchListings();
    fetchSavedListings();
  }, [selectedCategory]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('status', 'active');
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      const response = await fetch(`/api/listings?${params}`);
      if (response.ok) {
        const data = await response.json() as { listings: any[] };
        setListings(data.listings || []);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedListings = async () => {
    try {
      const response = await fetch(`/api/saved-listings?buyerId=${buyerId}`);
      if (response.ok) {
        const data = await response.json() as { savedListings: any[] };
        const ids = new Set(data.savedListings?.map((s: any) => s.listingId) || []);
        setSavedListings(ids);
      }
    } catch (error) {
      console.error('Failed to fetch saved listings:', error);
    }
  };

  const toggleSaveListing = async (listingId: string) => {
    try {
      const isSaved = savedListings.has(listingId);
      
      if (isSaved) {
        await fetch(`/api/saved-listings?buyerId=${buyerId}&listingId=${listingId}`, {
          method: 'DELETE',
        });
        setSavedListings(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
      } else {
        await fetch('/api/saved-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ buyerId, listingId }),
        });
        setSavedListings(prev => new Set(prev).add(listingId));
      }
    } catch (error) {
      console.error('Failed to toggle save listing:', error);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const images = listing.images ? JSON.parse(listing.images) : [];
            const isSaved = savedListings.has(listing.id);
            
            return (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
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
                    onClick={() => toggleSaveListing(listing.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                  </button>
                  <Badge className="absolute bottom-3 left-3 bg-teal-600">
                    {listing.category}
                  </Badge>
                </div>

                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 line-clamp-1">
                    {listing.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Weight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{listing.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="truncate">{listing.city}, {listing.state}</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                    <span className="text-xl sm:text-2xl font-bold text-teal-600">
                      {(listing.totalPrice / 100).toFixed(2)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      (₹{(listing.pricePerKg / 100).toFixed(2)}/kg)
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedListing(listing)}
                      variant="outline"
                      className="flex-1 text-xs sm:text-sm h-8 sm:h-10"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      onClick={() => setSelectedListing(listing)}
                      className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-xs sm:text-sm h-8 sm:h-10"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Buy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          buyerId={buyerId}
          isSaved={savedListings.has(selectedListing.id)}
          onClose={() => setSelectedListing(null)}
          onToggleSave={() => toggleSaveListing(selectedListing.id)}
          onOrderPlaced={fetchListings}
        />
      )}
    </div>
  );
}
