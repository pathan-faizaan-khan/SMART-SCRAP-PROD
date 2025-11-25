'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Upload, MapPin, IndianRupee, Camera, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';

interface NewListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

export default function NewListingModal({ isOpen, onClose, userId, onSuccess }: NewListingModalProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ url: string; file?: File }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'plastic',
    weight: '',
    pickupAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Load saved addresses when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      fetch(`/api/addresses?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          const typedData = data as { addresses?: any[] };
          setSavedAddresses(typedData.addresses || []);
          // Auto-select default address if exists
          const defaultAddr = typedData.addresses?.find((a: any) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setFormData(prev => ({
              ...prev,
              pickupAddress: defaultAddr.address,
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
            }));
          }
        })
        .catch(err => console.error('Failed to load addresses:', err));
    }
  }, [isOpen, userId]);

  const categories = [
    { value: 'plastic', label: 'Plastic' },
    { value: 'paper', label: 'Paper' },
    { value: 'glass', label: 'Glass' },
    { value: 'cardboard', label: 'Cardboard' },
    { value: 'metal', label: 'Metal' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'batteries', label: 'Batteries' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selected = savedAddresses.find(a => a.id === addressId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        pickupAddress: selected.address,
        city: selected.city,
        state: selected.state,
        pincode: selected.pincode,
      }));
    } else {
      // Manual entry
      setFormData(prev => ({
        ...prev,
        pickupAddress: '',
        city: '',
        state: '',
        pincode: '',
      }));
    }
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newImages: { url: string; file?: File }[] = [];
      
      for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
        const file = files[i];
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newImages.push({ url: previewUrl, file });
      }
      
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Failed to process images:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      setUploadingImage(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const removed = prev[index];
      // Revoke object URL to free memory
      if (removed.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images to Supabase Storage
      const uploadedImageUrls: string[] = [];
      
      for (const image of images) {
        if (image.file) {
          const fileExt = image.file.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('smart-scrap-bucket')
            .upload(fileName, image.file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error('Image upload error:', error);
            throw new Error('Failed to upload image');
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('smart-scrap-bucket')
            .getPublicUrl(fileName);
          
          uploadedImageUrls.push(publicUrl);
        }
      }

      const weight = parseInt(formData.weight);

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sellerId: userId,
          weight,
          pricePerKg: 0, // Price will be determined by bids
          totalPrice: 0, // Price will be determined by bids
          status: 'active',
          images: JSON.stringify(uploadedImageUrls),
        }),
      });

      if (response.ok) {
        // Clean up object URLs
        images.forEach(img => {
          if (img.url.startsWith('blob:')) {
            URL.revokeObjectURL(img.url);
          }
        });
        
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'plastic',
          weight: '',
          pickupAddress: '',
          city: '',
          state: '',
          pincode: '',
        });
        setImages([]);
      } else {
        const error = await response.json() as { message?: string };
        alert(error.message || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Listing</h2>
              <p className="text-gray-600 text-sm mt-1">List your recyclable materials for sale</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Photos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photos ({images.length}/5)
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group">
                    <img src={img.url} alt={`Scrap ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <>
                    {/* Camera Capture */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-teal-600"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="text-xs font-medium">Camera</span>
                    </button>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      capture="environment"
                      onChange={handleImageCapture}
                      className="hidden"
                    />

                    {/* File Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-teal-500 hover:bg-teal-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-teal-600"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-medium">Upload</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageCapture}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                Add up to 5 photos. Take clear photos showing the condition and quantity of your materials.
              </p>
            </div>

            {/* Basic Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Basic Details</h3>
              
              <div>
                <Label htmlFor="title">Listing Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Mixed Plastic Bottles - Clean & Sorted"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your materials, condition, sorting details, etc."
                  required
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Quantity & Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quantity & Pricing</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="25"
                    required
                    min="1"
                    step="0.1"
                    className="mt-1"
                  />
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200 p-4">
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-blue-900">📢 Bidding System</p>
                  <p className="mt-1">Buyers will place bids on your listing. You can review all bids and choose the best offer!</p>
                </div>
              </Card>
            </div>

            {/* Pickup Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Pickup Location
              </h3>
              
              {/* Saved Addresses Selector */}
              {savedAddresses.length > 0 && (
                <div>
                  <Label htmlFor="savedAddress">Select Saved Address</Label>
                  <select
                    id="savedAddress"
                    value={selectedAddressId}
                    onChange={(e) => handleAddressSelect(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Enter manually...</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} - {addr.city}, {addr.state}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <Label htmlFor="pickupAddress">Pickup Address *</Label>
                <textarea
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder="Street address, building name, landmark"
                  required
                  rows={2}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="400001"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
