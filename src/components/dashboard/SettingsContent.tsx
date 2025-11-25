'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Moon, Sun, LogOut, Save, MapPin, Plus, Edit2, Trash2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

interface SettingsContentProps {
  userProfile?: any;
}

export default function SettingsContent({ userProfile }: SettingsContentProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false,
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Load user data
    const loadUserData = async () => {
      if (userProfile) {
        setUserId(userProfile.id);
        setProfile({
          fullName: userProfile.fullName || '',
          email: userProfile.email || '',
          phone: userProfile.phoneNumber || '',
        });
        
        // Load saved addresses
        loadAddresses(userProfile.id);
      }
    };
    loadUserData();

    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, [userProfile]);

  const loadAddresses = async (uid: string) => {
    try {
      const response = await fetch(`/api/addresses?userId=${uid}`);
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          fullName: profile.fullName,
          phoneNumber: profile.phone,
        }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    setIsSaving(true);
    try {
      const method = editingAddressId ? 'PUT' : 'POST';
      const body = editingAddressId 
        ? { ...newAddress, id: editingAddressId, userId }
        : { ...newAddress, userId };

      const response = await fetch('/api/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await loadAddresses(userId);
        setShowAddressForm(false);
        setEditingAddressId(null);
        setNewAddress({
          label: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          isDefault: false,
        });
      }
    } catch (error) {
      console.error('Failed to save address:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditAddress = (address: SavedAddress) => {
    setNewAddress({
      label: address.label,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      isDefault: address.isDefault,
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await fetch(`/api/addresses?id=${id}&userId=${userId}`, {
        method: 'DELETE',
      });
      await loadAddresses(userId);
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 font-poppins">Settings</h2>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="shadow-lg rounded-2xl border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-poppins">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-gray-50 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Enter your phone number"
                className="mt-1"
              />
            </div>
          </div>
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 h-12 rounded-xl shadow-lg shadow-teal-500/30"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Saved Addresses */}
      <Card className="shadow-lg rounded-2xl border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="font-poppins">Saved Addresses</CardTitle>
                <CardDescription>Manage your pickup addresses for listings</CardDescription>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingAddressId(null);
                setNewAddress({
                  label: '',
                  address: '',
                  city: '',
                  state: '',
                  pincode: '',
                  landmark: '',
                  isDefault: false,
                });
                setShowAddressForm(!showAddressForm);
              }}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address Form */}
          {showAddressForm && (
            <Card className="border-2 border-teal-200 bg-teal-50/50">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-semibold text-gray-900">
                  {editingAddressId ? 'Edit Address' : 'New Address'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addressLabel">Label *</Label>
                    <Input
                      id="addressLabel"
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      placeholder="Home, Office, Warehouse"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressPincode">Pincode *</Label>
                    <Input
                      id="addressPincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      placeholder="400001"
                      maxLength={6}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="addressFull">Address *</Label>
                  <textarea
                    id="addressFull"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                    placeholder="Street address, building name"
                    rows={2}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="addressCity">City *</Label>
                    <Input
                      id="addressCity"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="Mumbai"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressState">State *</Label>
                    <Input
                      id="addressState"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressLandmark">Landmark</Label>
                    <Input
                      id="addressLandmark"
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      placeholder="Optional"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">Set as default address</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveAddress}
                    disabled={isSaving || !newAddress.label || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode}
                    className="bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                    size="sm"
                  >
                    {isSaving ? 'Saving...' : 'Save Address'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Address List */}
          {savedAddresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No saved addresses yet</p>
              <p className="text-sm text-gray-400">Add an address to quickly fill listing details</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-xl border-2 ${
                    addr.isDefault 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  } transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{addr.label}</h4>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{addr.address}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {addr.city}, {addr.state} - {addr.pincode}
                        {addr.landmark && ` • ${addr.landmark}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditAddress(addr)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteAddress(addr.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="shadow-lg rounded-2xl border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="font-poppins">Appearance</CardTitle>
              <CardDescription>Customize how SmartScrap looks for you</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Dark Mode</p>
              <p className="text-sm text-gray-600">Toggle dark theme</p>
            </div>
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className="rounded-lg"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="shadow-lg rounded-2xl border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-poppins">Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">Receive SMS updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-lg rounded-2xl border-2 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-red-600 font-poppins">Account Actions</CardTitle>
              <CardDescription>Logout or manage your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 h-11 rounded-xl"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
