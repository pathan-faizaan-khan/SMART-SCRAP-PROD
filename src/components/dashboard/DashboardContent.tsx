'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Clock,
  Package2,
  Leaf,
  Recycle,
  Scale,
  DollarSign,
  Trash2,
  Newspaper,
  Wine,
  Box,
  Boxes,
  Smartphone,
  Battery,
  Shirt,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardContentProps {
  userId?: string;
}

interface DashboardStats {
  earnings: {
    total: number;
    thisMonth: number;
    balance: number;
    withdrawn: number;
  };
  transactions: {
    total: number;
    completedThisWeek: number;
    byStatus: Array<{ count: number; status: string }>;
  };
  recycling: {
    totalItems: number;
    totalWeight: number;
    categories: Array<{ category: string; weight: number; count: number }>;
    categoriesCount: number;
  };
  environmental: {
    co2Saved: number;
    treesEquivalent: number;
    wasteDiverted: number;
  };
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchDashboardStats();
    }
  }, [userId]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plastic': return Recycle;
      case 'paper': return Newspaper;
      case 'glass': return Wine;
      case 'cardboard': return Box;
      case 'metal': return Boxes;
      case 'electronics': return Smartphone;
      case 'batteries': return Battery;
      case 'textiles': return Shirt;
      default: return Trash2;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plastic': return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'paper': return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
      case 'glass': return { bg: 'bg-orange-100', text: 'text-orange-600' };
      case 'cardboard': return { bg: 'bg-amber-100', text: 'text-amber-600' };
      case 'metal': return { bg: 'bg-gray-100', text: 'text-gray-600' };
      case 'electronics': return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'batteries': return { bg: 'bg-red-100', text: 'text-red-600' };
      case 'textiles': return { bg: 'bg-pink-100', text: 'text-pink-600' };
      default: return { bg: 'bg-green-100', text: 'text-green-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
        <Card className="bg-linear-to-br from-teal-500 to-emerald-500 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm opacity-90 font-medium">Total Earnings</p>
            <h3 className="text-3xl font-bold mt-1">
              ₹{((stats?.earnings.total || 0) / 100).toFixed(2)}
            </h3>
            <p className="text-xs opacity-70 mt-2">
              +₹{((stats?.earnings.thisMonth || 0) / 100).toFixed(2)} this month
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-teal-600" />
              <Badge variant="secondary" className="bg-teal-50 text-teal-700">Active</Badge>
            </div>
            <p className="text-sm text-gray-600 font-medium">Total Transactions</p>
            <h3 className="text-3xl font-bold mt-1 text-gray-900">
              {stats?.transactions.total || 0}
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.transactions.completedThisWeek || 0} completed this week
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Package2 className="w-8 h-8 text-teal-600" />
              <Recycle className="w-5 h-5 text-teal-400" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Items Recycled</p>
            <h3 className="text-3xl font-bold mt-1 text-gray-900">
              {stats?.recycling.totalItems || 0}
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              Across {stats?.recycling.categoriesCount || 0} categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recyclable Categories */}
      <Card className="shadow-lg border-gray-100 mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recyclable Inventory</CardTitle>
              <CardDescription>Track your recyclable materials</CardDescription>
            </div>
            <Scale className="w-6 h-6 text-teal-600" />
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recycling.categories.length === 0 ? (
            <div className="text-center py-12">
              <Recycle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recyclables listed yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first listing to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.recycling.categories.map((category, index) => {
                const IconComponent = getCategoryIcon(category.category);
                const colors = getCategoryColor(category.category);
                return (
                  <button
                    key={index}
                    className={`${colors.bg} rounded-2xl p-5 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 active:scale-95`}
                  >
                    <IconComponent className={`w-10 h-10 mb-3 ${colors.text}`} strokeWidth={2} />
                    <p className={`font-bold text-sm ${colors.text} capitalize`}>{category.category}</p>
                    <p className="text-xs text-gray-600 mt-2 font-semibold">
                      {(category.weight / 1000).toFixed(1)} kg
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {category.count} {category.count === 1 ? 'listing' : 'listings'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card className="bg-linear-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl">
        <CardContent className="p-6 lg:p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Your Environmental Impact</h3>
              <p className="text-sm opacity-90">Making Earth greener, one scrap at a time</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Leaf className="w-6 h-6" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-90">CO₂ Saved</p>
              <p className="text-3xl font-bold mt-1">
                {stats?.environmental.co2Saved.toFixed(1) || 0} kg
              </p>
              <p className="text-xs opacity-75 mt-2">
                Equivalent to {stats?.environmental.treesEquivalent || 0} trees planted
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-90">Waste Diverted</p>
              <p className="text-3xl font-bold mt-1">
                {((stats?.environmental.wasteDiverted || 0) / 1000).toFixed(1)} kg
              </p>
              <p className="text-xs opacity-75 mt-2">From landfills this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
