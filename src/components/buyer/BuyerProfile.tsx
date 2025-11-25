'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Building2, MapPin } from 'lucide-react';

interface BuyerProfileProps {
  userProfile: any;
}

export default function BuyerProfile({ userProfile }: BuyerProfileProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Buyer Profile</h2>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{userProfile?.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{userProfile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-medium">{userProfile?.phoneNumber || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Buyer Type</p>
              <p className="font-medium capitalize">{userProfile?.buyerType || 'Not specified'}</p>
            </div>
          </div>

          {userProfile?.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">
                  {userProfile.address}, {userProfile.city}, {userProfile.state} - {userProfile.pincode}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
