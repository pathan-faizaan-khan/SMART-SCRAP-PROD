'use client';

import { useState, useEffect } from 'react';
import { X, Check, Package2, DollarSign, TrendingUp, MessageSquare, Bell, CheckCheck, Trash2, Settings, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: string; // JSON string containing OTP and other data
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function NotificationPanel({ isOpen, onClose, userId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications for userId:', userId);
      const response = await fetch(`/api/notifications?userId=${userId}`);
      console.log('Notification response status:', response.status);
      
      if (response.ok) {
        const data = await response.json() as { notifications: Notification[] };
        console.log('Notifications received:', data.notifications?.length || 0);
        setNotifications(data.notifications || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch notifications:', response.status, errorData);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, isRead: true }),
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, markAllRead: true }),
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_offer':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Package2 className="w-5 h-5 text-white" />
          </div>
        );
      case 'payment_received':
      case 'payment_sent':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        );
      case 'listing_view':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        );
      case 'new_message':
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-500/30">
            <Bell className="w-5 h-5 text-white" />
          </div>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getOtpFromMetadata = (metadata?: string): string | null => {
    if (!metadata) return null;
    try {
      const parsed = JSON.parse(metadata) as { otp?: string };
      return parsed.otp || null;
    } catch {
      return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl animate-in slide-in-from-right">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 opacity-10"></div>
          <div className="relative p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 font-poppins">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600">{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose}
                className="rounded-xl hover:bg-teal-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"></div>
                <Sparkles className="w-6 h-6 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-gray-500 font-medium">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 py-24">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mb-6">
                <Bell className="w-12 h-12 text-teal-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 font-poppins">All caught up!</h4>
              <p className="text-sm text-gray-500 max-w-xs">You have no notifications right now. We'll let you know when something new happens.</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group ${
                      !notification.isRead 
                        ? 'bg-gradient-to-br from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200' 
                        : 'bg-gray-50/50 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-sm text-gray-900 font-poppins">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2.5 h-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex-shrink-0 mt-1 shadow-lg shadow-teal-500/50"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        {getOtpFromMetadata(notification.metadata) && (
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-3 mb-3">
                            <p className="text-xs font-semibold text-amber-900 mb-1">🔐 Order Completion OTP</p>
                            <div className="flex items-center justify-between">
                              <code className="text-2xl font-bold text-amber-700 tracking-widest font-mono">
                                {getOtpFromMetadata(notification.metadata)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(getOtpFromMetadata(notification.metadata) || '');
                                  alert('OTP copied to clipboard!');
                                }}
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 h-8 px-3"
                              >
                                Copy
                              </Button>
                            </div>
                            <p className="text-xs text-amber-700 mt-2">Share this OTP with the buyer to complete the order</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-400">
                            {formatTime(notification.createdAt)}
                          </p>
                          {notification.actionLabel && (
                            <Button 
                              variant="ghost"
                              size="sm" 
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 p-0 h-auto font-semibold text-xs rounded-lg px-2 py-1"
                            >
                              {notification.actionLabel} →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                  {index < notifications.length - 1 && (
                    <Separator className="my-2 bg-gray-100" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
}
