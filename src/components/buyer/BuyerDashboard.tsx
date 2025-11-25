'use client';

import { useState } from 'react';
import { Package, ShoppingCart, Heart, User, Settings, LogOut } from 'lucide-react';
import BrowseListings from './BrowseListings';
import MyOrders from './MyOrders';
import SavedListings from './SavedListings';
import BuyerProfile from './BuyerProfile';

interface BuyerDashboardProps {
  user: any;
  userProfile: any;
  onLogout: () => void;
}

export default function BuyerDashboard({ user, userProfile, onLogout }: BuyerDashboardProps) {
  const [activeTab, setActiveTab] = useState('browse');

  const tabs = [
    { id: 'browse', label: 'Browse Listings', icon: Package },
    { id: 'orders', label: 'My Orders', icon: ShoppingCart },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return <BrowseListings buyerId={userProfile?.id} />;
      case 'orders':
        return <MyOrders buyerId={userProfile?.id} />;
      case 'saved':
        return <SavedListings buyerId={userProfile?.id} />;
      case 'profile':
        return <BuyerProfile userProfile={userProfile} />;
      default:
        return <BrowseListings buyerId={userProfile?.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">SmartScrap</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{userProfile?.fullName}</p>
                <p className="text-xs text-gray-500">{userProfile?.buyerType}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? 'text-teal-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
