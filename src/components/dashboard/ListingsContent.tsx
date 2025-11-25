'use client';

import { useState, useEffect } from 'react';
import { Package2, Plus, Edit, Trash2, MapPin, Calendar, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ListingsContentProps {
  onNewListing?: () => void;
  userId?: string;
}

export default function ListingsContent({ onNewListing, userId }: ListingsContentProps) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    sold: 0,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchListings();
    }
  }, [userId]);

  const fetchListings = async () => {
    try {
      const response = await fetch(`/api/listings?sellerId=${userId}`);
      if (response.ok) {
        const data = await response.json() as { listings: any[] };
        setListings(data.listings || []);
        
        // Calculate stats
        const total = data.listings.length;
        const active = data.listings.filter((l: any) => l.status === 'active').length;
        const pending = data.listings.filter((l: any) => l.status === 'pending').length;
        const sold = data.listings.filter((l: any) => l.status === 'sold').length;
        setStats({ total, active, pending, sold });
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      setDeletingId(listingId);
      const response = await fetch(`/api/listings?listingId=${listingId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        setListings(prev => prev.filter(l => l.id !== listingId));
        // Recalculate stats
        const newListings = listings.filter(l => l.id !== listingId);
        const total = newListings.length;
        const active = newListings.filter((l: any) => l.status === 'active').length;
        const pending = newListings.filter((l: any) => l.status === 'pending').length;
        const sold = newListings.filter((l: any) => l.status === 'sold').length;
        setStats({ total, active, pending, sold });
      } else {
        alert('Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'sold': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 font-poppins">My Listings</h2>
          <p className="text-gray-600 mt-2">Manage your recyclable material listings</p>
        </div>
        <Button 
          onClick={onNewListing}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 h-12 rounded-xl shadow-lg shadow-teal-500/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Listing
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 font-medium">Total Listings</div>
            <div className="text-3xl font-bold text-gray-900 mt-2 font-poppins">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-2xl border-0 bg-linear-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="text-sm text-green-700 font-medium">Active</div>
            <div className="text-3xl font-bold text-green-600 mt-2 font-poppins">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-2xl border-0 bg-linear-to-br from-yellow-50 to-amber-50">
          <CardContent className="p-6">
            <div className="text-sm text-yellow-700 font-medium">Pending</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2 font-poppins">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-2xl border-0 bg-linear-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="text-sm text-blue-700 font-medium">Sold</div>
            <div className="text-3xl font-bold text-blue-600 mt-2 font-poppins">{stats.sold}</div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <Card className="p-12 shadow-lg rounded-2xl border-0">
          <div className="text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Package2 className="w-12 h-12 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins">No listings yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first listing</p>
            <Button 
              onClick={onNewListing}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 h-12 rounded-xl shadow-lg shadow-teal-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Listing
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900 font-poppins">{listing.title}</h3>
                      <Badge className={`${getStatusColor(listing.status)} rounded-lg px-3`}>
                        {listing.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package2 className="w-4 h-4" />
                        {listing.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {listing.city}, {listing.state}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-600">
                      ₹{(listing.totalPrice / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">{listing.weight} kg</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {listing.viewCount} views
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => alert('Edit functionality coming soon!')}
                      title="Edit listing"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteListing(listing.id)}
                      disabled={deletingId === listing.id}
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
