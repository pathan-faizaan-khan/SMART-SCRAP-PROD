'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  TrendingUp, 
  Wallet, 
  ChevronRight,
  Bell,
  Settings,
  User,
  Home,
  Package2,
  FileText,
  Clock,
  Leaf,
  Scale,
  DollarSign,
  ShoppingCart,
  Trash2,
  Newspaper,
  Wine,
  Box,
  Boxes,
  Recycle,
  Smartphone,
  Cpu,
  Loader2,
  ChevronDown,
  LogOut,
  Plus,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase/client';
import { signOut } from '@/lib/auth';
import DashboardContent from '@/components/dashboard/DashboardContent';
import ListingsContent from '@/components/dashboard/ListingsContent';
import HistoryContent from '@/components/dashboard/HistoryContent';
import WalletContent from '@/components/dashboard/WalletContent';
import SettingsContent from '@/components/dashboard/SettingsContent';
import NotificationPanel from '@/components/dashboard/NotificationPanel';
import NewListingModal from '@/components/dashboard/NewListingModal';
import BuyerDashboard from '@/components/buyer/BuyerDashboard';
import SellerOrders from '@/components/dashboard/SellerOrders';
import SellerBids from '@/components/dashboard/SellerBids';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewListing, setShowNewListing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session:', session);
        
        if (!session || sessionError) {
          console.log('No session found, redirecting to login...');
          window.location.href = '/login';
          return;
        }
        
        console.log('User authenticated:', session.user.email);
        setUser(session.user);
        
        // Fetch user profile from database
        try {
          const response = await fetch(`/api/auth/profile?user_id=${session.user.id}`);
          if (response.ok) {
            const data = await response.json() as { userProfile?: any };
            setUserProfile(data.userProfile);
            
            // Fetch notification count using profile ID
            if (data.userProfile?.id) {
              const notifResponse = await fetch(`/api/notifications?userId=${data.userProfile.id}`);
              if (notifResponse.ok) {
                const notifData = await notifResponse.json();
                setNotificationCount(notifData.unreadCount || 0);
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
      }
    };

    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_OUT' || !session) {
        window.location.href = '/login';
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const getInitials = (name: string): string => {
    if (!name) return '??';
    const names = name.trim().split(' ').filter(n => n.length > 0);
    if (names.length === 0) return '??';
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const userDisplayName = userProfile?.fullName || user?.user_metadata?.full_name || user?.user_metadata?.name || 'User';
  const profilePicture = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || userProfile?.profilePictureUrl;

  // Render buyer dashboard for buyers
  if (!isLoading && userProfile?.userType === 'buyer') {
    return <BuyerDashboard user={user} userProfile={userProfile} onLogout={handleLogout} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'listings':
        return <ListingsContent onNewListing={() => setShowNewListing(true)} userId={userProfile?.id} />;
      case 'bids':
        return <SellerBids sellerId={userProfile?.id} />;
      case 'orders':
        return <SellerOrders sellerId={userProfile?.id} />;
      case 'history':
        return <HistoryContent userId={userProfile?.id} />;
      case 'wallet':
        return <WalletContent userId={userProfile?.id} />;
      case 'settings':
        return <SettingsContent userProfile={userProfile} />;
      default:
        return <DashboardContent userId={userProfile?.id} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="SmartScrap Logo" 
              width={80} 
              height={80} 
              className="w-20 h-20 mx-auto mb-6 animate-pulse"
            />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 font-[family-name:var(--font-poppins)]">Loading Your Dashboard</h3>
          <p className="text-gray-600">Please wait while we prepare everything...</p>
        </div>
      </div>
    );
  }

  // Sample data
  const recyclableCategories = [
    { id: 1, name: 'Plastic', icon: Recycle, weight: '12.5 kg', color: 'bg-blue-100', textColor: 'text-blue-600' },
    { id: 2, name: 'Paper', icon: FileText, weight: '8.3 kg', color: 'bg-yellow-100', textColor: 'text-yellow-600' },
    { id: 3, name: 'Glass', icon: Wine, weight: '5.7 kg', color: 'bg-orange-100', textColor: 'text-orange-600' },
    { id: 4, name: 'Cardboard', icon: Box, weight: '15.2 kg', color: 'bg-amber-100', textColor: 'text-amber-600' },
    { id: 5, name: 'Newspapers', icon: Newspaper, weight: '20.4 kg', color: 'bg-slate-100', textColor: 'text-slate-600' },
    { id: 6, name: 'Metal', icon: Boxes, weight: '9.1 kg', color: 'bg-gray-100', textColor: 'text-gray-600' },
    { id: 7, name: 'Electronics', icon: Smartphone, weight: '3.2 kg', color: 'bg-purple-100', textColor: 'text-purple-600' },
    { id: 8, name: 'Bottles', icon: Trash2, weight: '6.8 kg', color: 'bg-green-100', textColor: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 pb-28 lg:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-lg shadow-teal-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="SmartScrap Logo" 
                width={44} 
                height={44} 
                className="w-11 h-11 shadow-lg shadow-teal-500/30 ring-4 ring-teal-100 rounded-2xl"
              />
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent font-poppins">SmartScrap</h1>
                <p className="text-xs text-gray-500 font-medium">Recycle Smarter, Earn Better</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowNewListing(true)}
                size="sm"
                className="hidden sm:flex bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/30 gap-2 px-5 h-10 rounded-xl font-semibold"
              >
                <Plus className="w-4 h-4" />
                New Listing
              </Button>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 hover:bg-teal-50 rounded-xl transition-all relative group"
              >
                <Bell className="w-5 h-5 text-gray-700 group-hover:text-teal-600 transition-colors" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 hover:bg-teal-50 rounded-xl transition-all group"
              >
                  <Avatar className="w-10 h-10 shadow-lg shadow-teal-500/30 ring-2 ring-white">
                    {profilePicture && <AvatarImage src={profilePicture} alt={userDisplayName} />}
                    <AvatarFallback className="bg-linear-to-br from-teal-500 via-emerald-500 to-teal-600 text-white font-bold">
                      {getInitials(userDisplayName)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-teal-600 transition-colors hidden sm:block" />
                </button>                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 bg-linear-to-r from-teal-500 to-emerald-500">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-12 h-12 ring-2 ring-white/30">
                          {profilePicture && <AvatarImage src={profilePicture} alt={userDisplayName} />}
                          <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white font-bold text-lg">
                            {getInitials(userDisplayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">
                            {userDisplayName}
                          </p>
                          <p className="text-sm text-teal-100 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm capitalize text-xs">
                        {userProfile?.userType || user?.user_metadata?.user_type || 'Member'}
                      </Badge>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-3 hover:bg-teal-50 rounded-xl flex items-center gap-3 text-gray-700 transition-all group"
                      >
                        <Settings className="w-4 h-4 text-gray-500 group-hover:text-teal-600" />
                        <span className="font-medium">Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 rounded-xl flex items-center gap-3 text-red-600 transition-all group"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-5">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-28">
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
                <Avatar className="w-16 h-16 shadow-lg shadow-teal-500/30 ring-4 ring-teal-100">
                  {profilePicture && <AvatarImage src={profilePicture} alt={userDisplayName} />}
                  <AvatarFallback className="bg-linear-to-br from-teal-500 via-emerald-500 to-teal-600 text-white font-bold text-xl">
                    {getInitials(userDisplayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg truncate font-poppins">
                    {userDisplayName.split(' ')[0]}!
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-2">
                <Button 
                  variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full justify-start h-12 rounded-xl font-medium text-base ${activeTab === 'dashboard' ? 'bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/30' : 'hover:bg-teal-50'}`}
                >
                  <Home className="w-5 h-5 mr-3" />
                  <span>Dashboard</span>
                </Button>
                <Button 
                  variant={activeTab === 'listings' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('listings')}
                  className={`w-full justify-start h-12 rounded-xl font-medium text-base ${activeTab === 'listings' ? 'bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/30' : 'hover:bg-teal-50'}`}
                >
                  <Package2 className="w-5 h-5 mr-3" />
                  <span>My Listings</span>
                </Button>
                <Button 
                  variant={activeTab === 'bids' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('bids')}
                  className={`w-full justify-start h-12 rounded-xl font-medium text-base ${activeTab === 'bids' ? 'bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/30' : 'hover:bg-teal-50'}`}
                >
                  <TrendingUp className="w-5 h-5 mr-3" />
                  <span>Bids</span>
                </Button>
                <Button 
                  variant={activeTab === 'orders' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('orders')}
                  className={`w-full justify-start h-12 rounded-xl font-medium text-base ${activeTab === 'orders' ? 'bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/30' : 'hover:bg-teal-50'}`}
                >
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  <span>Orders</span>
                </Button>
                <Button 
                  variant={activeTab === 'history' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('history')}
                  className={`w-full justify-start h-12 rounded-xl font-medium text-base ${activeTab === 'history' ? 'bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/30' : 'hover:bg-teal-50'}`}
                >
                  <FileText className="w-5 h-5 mr-3" />
                  <span>History</span>
                </Button>
                <Button 
                  variant={activeTab === 'wallet' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('wallet')}
                  className={`w-full justify-start h-12 rounded-xl font-medium text-base ${activeTab === 'wallet' ? 'bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/30' : 'hover:bg-teal-50'}`}
                >
                  <Wallet className="w-5 h-5 mr-3" />
                  <span>Wallet</span>
                </Button>
                <Button 
                  variant={activeTab === 'settings' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('settings')}
                  className={`w-full justify-start h-12 rounded-xl font-medium text-base ${activeTab === 'settings' ? 'bg-linear-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/30' : 'hover:bg-teal-50'}`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </Button>
              </nav>
            </div>

          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            {renderContent()}
          </main>
        </div>

        {/* Mobile Content */}
        <div className="lg:hidden">
          {renderContent()}
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-gray-200 shadow-2xl z-50">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'dashboard' ? 'text-teal-600' : 'text-gray-500'
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'bids' ? 'text-teal-600' : 'text-gray-500'
            }`}
          >
            <TrendingUp className="w-5 h-5" strokeWidth={activeTab === 'bids' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Bids</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'orders' ? 'text-teal-600' : 'text-gray-500'
            }`}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={activeTab === 'orders' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'listings' ? 'text-teal-600' : 'text-gray-500'
            }`}
          >
            <Package2 className="w-5 h-5" strokeWidth={activeTab === 'listings' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Listings</span>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === 'wallet' ? 'text-teal-600' : 'text-gray-500'
            }`}
          >
            <Wallet className="w-5 h-5" strokeWidth={activeTab === 'wallet' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Wallet</span>
          </button>
        </div>
        {/* Second Row for Additional Tabs */}
        <div className="grid grid-cols-3 h-12 border-t border-gray-100">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-2 transition-all ${
              activeTab === 'history' ? 'text-teal-600 bg-teal-50' : 'text-gray-500'
            }`}
          >
            <FileText className="w-4 h-4" strokeWidth={activeTab === 'history' ? 2.5 : 2} />
            <span className="text-xs font-semibold">History</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center gap-2 transition-all ${
              activeTab === 'settings' ? 'text-teal-600 bg-teal-50' : 'text-gray-500'
            }`}
          >
            <Settings className="w-4 h-4" strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-xs font-semibold">Settings</span>
          </button>
          <button
            onClick={() => setShowNewListing(true)}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-teal-500 to-emerald-500 text-white"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-xs font-semibold">New Listing</span>
          </button>
        </div>
      </nav>

      {/* Notification Panel */}
      {userProfile && (
        <NotificationPanel 
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          userId={userProfile.id}
        />
      )}

      {/* New Listing Modal */}
      {userProfile && (
        <NewListingModal
          isOpen={showNewListing}
          onClose={() => setShowNewListing(false)}
          userId={userProfile.id}
          onSuccess={() => {
            setActiveTab('listings');
          }}
        />
      )}
    </div>
  );
}
