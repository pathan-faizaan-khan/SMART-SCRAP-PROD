'use client';

import { useState } from 'react';
import { X, IndianRupee, Calendar, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    weight: number;
    category: string;
    sellerId: string;
  };
  buyerId: string;
  onSuccess?: () => void;
}

export default function PlaceBidModal({ isOpen, onClose, listing, buyerId, onSuccess }: PlaceBidModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pricePerKg: '',
    quantity: listing.weight.toString(),
    pickupDate: '',
    pickupTimeSlot: '',
    paymentMethod: 'cash',
    buyerNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const calculateTotal = () => {
    const pricePerKg = parseFloat(formData.pricePerKg) || 0;
    const quantity = parseFloat(formData.quantity) || 0;
    return (pricePerKg * quantity).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pricePerKg = Math.round(parseFloat(formData.pricePerKg) * 100); // Convert to paise
      const quantity = parseInt(formData.quantity);

      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          buyerId,
          pricePerKg,
          quantity,
          pickupDate: formData.pickupDate || null,
          pickupTimeSlot: formData.pickupTimeSlot || null,
          paymentMethod: formData.paymentMethod,
          buyerNotes: formData.buyerNotes,
        }),
      });

      if (response.ok) {
        alert('Bid placed successfully! The seller will review your offer.');
        onSuccess?.();
        onClose();
        // Reset form
        setFormData({
          pricePerKg: '',
          quantity: listing.weight.toString(),
          pickupDate: '',
          pickupTimeSlot: '',
          paymentMethod: 'cash',
          buyerNotes: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Failed to place bid. Please try again.');
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Place Your Bid</h2>
              <p className="text-gray-600 text-sm mt-1">{listing.title}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Your Offer</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricePerKg">Price per kg (₹) *</Label>
                  <div className="relative mt-1">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="pricePerKg"
                      name="pricePerKg"
                      type="number"
                      value={formData.pricePerKg}
                      onChange={handleChange}
                      placeholder="15.00"
                      required
                      min="0.01"
                      step="0.01"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity (kg) *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="25"
                    required
                    min="1"
                    max={listing.weight}
                    step="1"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max: {listing.weight} kg</p>
                </div>
              </div>

              <Card className="bg-teal-50 border-teal-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Total Bid Amount:</span>
                  <span className="text-2xl font-bold text-teal-600">₹{calculateTotal()}</span>
                </div>
              </Card>
            </div>

            {/* Pickup Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pickup Preferences</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pickupDate">Preferred Date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="pickupDate"
                      name="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pickupTimeSlot">Time Slot</Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      id="pickupTimeSlot"
                      name="pickupTimeSlot"
                      value={formData.pickupTimeSlot}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">Afternoon (12 PM - 3 PM)</option>
                      <option value="evening">Evening (3 PM - 6 PM)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <div className="relative mt-1">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="buyerNotes">Additional Notes (Optional)</Label>
              <textarea
                id="buyerNotes"
                name="buyerNotes"
                value={formData.buyerNotes}
                onChange={handleChange}
                placeholder="Any special requirements or notes for the seller..."
                rows={3}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
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
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                disabled={loading}
              >
                {loading ? 'Placing Bid...' : 'Place Bid'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
