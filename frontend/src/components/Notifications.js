// src/components/Notifications.js
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { notificationAPI } from '../services/paymentService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filter]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === 'unread' ? { unread_only: true } : {};
      const response = await notificationAPI.getAll(params);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5d6258] transition hover:bg-[#f7f5ef] hover:text-[#151713]"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#151713] px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 z-50 mt-2 flex max-h-[600px] w-96 flex-col overflow-hidden rounded-lg border border-black/10 bg-white text-[#151713] shadow-xl max-sm:right-[-84px] max-sm:w-[calc(100vw-32px)]">
            {/* Header */}
            <div className="border-b border-black/[0.06] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[21px] font-semibold leading-[1.19] text-[#151713]">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-black/50 hover:bg-[#f7f5ef]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`rounded-[980px] px-3 py-1 text-sm ${
                    filter === 'all' 
                      ? 'bg-[#151713] text-white' 
                      : 'bg-[#f7f5ef] text-[#5d6258]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`rounded-[980px] px-3 py-1 text-sm ${
                    filter === 'unread' 
                      ? 'bg-[#151713] text-white' 
                      : 'bg-[#f7f5ef] text-[#5d6258]'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="ml-auto flex items-center gap-1 rounded-md bg-[#f7f5ef] px-3 py-1 text-sm text-[#5d6258] hover:bg-[#eeebe1]"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-sm text-black/50">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-black/50">
                  <Bell className="mx-auto mb-2 h-10 w-10 text-black/20" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-black/[0.06]">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors hover:bg-[#f7f5ef] ${
                        !notification.is_read ? 'bg-[#f7f5ef]' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#e7ecdf] text-[#2f6f4e]">
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-[#151713]">
                              {notification.title}
                            </h4>
                            <span className="flex-shrink-0 text-xs text-black/50">
                              {formatDate(notification.created_at)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-[1.29] text-black/70">
                            {notification.message}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="flex items-center gap-1 text-xs text-[#2f6f4e] hover:underline"
                              >
                                <Check className="w-3 h-3" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="flex items-center gap-1 text-xs text-black/50 hover:text-[#2f6f4e] hover:underline"
                            >
                              <X className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;
