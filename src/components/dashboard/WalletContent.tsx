'use client';

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Download, ArrowUpRight, ArrowDownRight, CreditCard, DollarSign, Loader2, QrCode, Copy, CheckCircle2, IndianRupee, Building2, User, Edit, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WalletContentProps {
  userId?: string;
  userRole?: 'seller' | 'buyer';
}

interface WalletData {
  id: string;
  userId: string;
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  isActive: boolean;
}

interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

interface SellerBankDetails {
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankAccountHolderName?: string;
  bankName?: string;
  upiId?: string;
}

export default function WalletContent({ userId, userRole = 'seller' }: WalletContentProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [bankDetails, setBankDetails] = useState<SellerBankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [editedUpiId, setEditedUpiId] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchWalletData();
      if (userRole === 'seller') {
        fetchBankDetails();
      }
    }
  }, [userId, userRole]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wallet?userId=${userId}&includeTransactions=true&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async () => {
    try {
      // Fetch seller profile with bank details
      const response = await fetch(`/api/seller/profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBankDetails({
          bankAccountNumber: data.bankAccountNumber,
          bankIfscCode: data.bankIfscCode,
          bankAccountHolderName: data.bankAccountHolderName,
          bankName: data.bankName,
          upiId: data.upiId || `${data.phoneNumber}@paytm`, // Generate UPI ID from phone
        });
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEditUpi = () => {
    setEditedUpiId(bankDetails?.upiId || '');
    setIsEditingUpi(true);
  };

  const handleSaveUpi = async () => {
    if (!editedUpiId.trim()) return;
    
    try {
      setSavingUpi(true);
      const response = await fetch(`/api/seller/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, upiId: editedUpiId }),
      });

      if (response.ok) {
        setBankDetails(prev => prev ? { ...prev, upiId: editedUpiId } : { upiId: editedUpiId });
        setIsEditingUpi(false);
      }
    } catch (error) {
      console.error('Error saving UPI ID:', error);
    } finally {
      setSavingUpi(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingUpi(false);
    setEditedUpiId('');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
      case 'earnings':
      case 'refund':
        return <ArrowDownRight className="w-5 h-5 text-green-600" />;
      case 'debit':
      case 'withdrawal':
      case 'fee':
      case 'commission':
        return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      default:
        return <ArrowDownRight className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'earnings':
      case 'refund':
        return 'bg-green-100';
      case 'debit':
      case 'withdrawal':
      case 'fee':
      case 'commission':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'credit':
      case 'earnings':
      case 'refund':
        return 'text-green-600';
      case 'debit':
      case 'withdrawal':
      case 'fee':
      case 'commission':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const rupees = (amount / 100).toFixed(2);
    const prefix = ['credit', 'earnings', 'refund'].includes(type) ? '+' : '-';
    return `${prefix}₹${rupees}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">
            {userRole === 'seller' ? 'Earnings & Payments' : 'Payment Info'}
          </h2>
          <p className="text-gray-600 mt-1">
            {userRole === 'seller' 
              ? 'Track your earnings and receive payments via UPI' 
              : 'Pay sellers directly via UPI after receiving scrap'}
          </p>
        </div>
      </div>

      {/* Seller Stats or Buyer Payment Info */}
      {userRole === 'seller' ? (
        <>
          {/* Seller Total Earnings */}
          <Card className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white border-0 shadow-xl max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <IndianRupee className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-sm opacity-90 font-medium">Total Earnings</p>
              <h3 className="text-5xl font-bold mt-2 font-poppins">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  `₹${((wallet?.totalEarnings || 0) / 100).toFixed(2)}`
                )}
              </h3>
              <p className="text-xs opacity-70 mt-3">From all scrap sales</p>
            </CardContent>
          </Card>

          {/* UPI Payment Details */}
          <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 font-poppins">
                    <QrCode className="w-5 h-5 text-blue-600" />
                    UPI Payment Details
                  </CardTitle>
                  <CardDescription>Share your UPI ID with buyers to receive payments</CardDescription>
                </div>
                {!isEditingUpi && bankDetails?.upiId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditUpi}
                    className="rounded-lg hover:bg-blue-100 border-blue-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingUpi ? (
                <div className="bg-white rounded-xl p-6 border-2 border-teal-200">
                  <Label htmlFor="upiId" className="text-sm font-medium text-gray-700 mb-2 block">
                    UPI ID
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="upiId"
                      type="text"
                      placeholder="yourname@upi"
                      value={editedUpiId}
                      onChange={(e) => setEditedUpiId(e.target.value)}
                      className="flex-1 rounded-lg"
                    />
                    <Button
                      onClick={handleSaveUpi}
                      disabled={savingUpi || !editedUpiId.trim()}
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-lg"
                    >
                      {savingUpi ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={savingUpi}
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter your UPI ID (e.g., 9876543210@paytm, yourname@upi)
                  </p>
                </div>
              ) : bankDetails?.upiId ? (
                <div className="bg-white rounded-xl p-6 border-2 border-teal-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Your UPI ID</p>
                        <p className="font-bold text-xl text-gray-900">{bankDetails.upiId}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.upiId!, 'upi')}
                      className="hover:bg-teal-50 h-10 w-10 rounded-lg"
                    >
                      {copiedField === 'upi' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 font-poppins">No UPI ID Added</h4>
                    <p className="text-sm text-gray-600 mb-4">Add your UPI ID to receive payments from buyers</p>
                    <Button
                      onClick={handleEditUpi}
                      className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add UPI ID
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Buyer Payment Instructions */
        <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins text-xl">
              <QrCode className="w-6 h-6 text-orange-600" />
              Payment Instructions
            </CardTitle>
            <CardDescription>How to pay sellers after receiving scrap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Receive & Verify Scrap</h4>
                  <p className="text-sm text-gray-600">After the seller delivers the scrap materials, verify the quantity and quality matches the listing.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Get Seller's UPI/Bank Details</h4>
                  <p className="text-sm text-gray-600">Request the seller's UPI ID or bank account details for payment transfer.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Pay via UPI</h4>
                  <p className="text-sm text-gray-600">Transfer the agreed amount directly to seller's UPI ID using any UPI app (PhonePe, Google Pay, Paytm, etc.)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Confirm Transaction</h4>
                  <p className="text-sm text-gray-600">Mark the transaction as complete in the app and share payment receipt with seller.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <IndianRupee className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 mb-1 text-sm">Direct Payment - No Platform Fee</h4>
                  <p className="text-xs text-blue-700">SmartScrap facilitates connections. All payments are made directly between buyers and sellers with zero platform charges.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions - Only for Sellers */}
      {userRole === 'seller' && (
        <Card className="shadow-lg rounded-2xl border-0">
          <CardHeader>
            <CardTitle className="font-poppins">Transaction History</CardTitle>
            <CardDescription>Your recent payment activity from buyers</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"></div>
                </div>
                <p className="text-sm text-gray-500 font-medium">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-10 h-10 text-teal-600" />
                </div>
                <p className="text-gray-900 font-bold font-poppins">No transactions yet</p>
                <p className="text-sm text-gray-500 mt-2">Payments from buyers will appear here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 transition-all duration-200 border border-transparent hover:border-teal-200">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 capitalize font-poppins">
                          {transaction.description || transaction.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${getAmountColor(transaction.type)}`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">
                        Balance: ₹{(transaction.balanceAfter / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
