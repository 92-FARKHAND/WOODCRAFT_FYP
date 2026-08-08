"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, Package, Info, Check } from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation
} from "@/redux/api/notificationApi";
import { useGetDashboardStatsQuery } from '@/redux/api/reportsApi';
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { data, isLoading } = useGetDashboardStatsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const { notifications } = data || {};
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter(n => !n.isRead).length
    : 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "low_stock": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "new_order": return <Package className="h-4 w-4 text-purple-500" />;
      case "success": return <Check className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-accent transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute md:right-0 mt-2 w-80 max-h-[400px] overflow-hidden rounded-xl border bg-card shadow-2xl z-[60] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-primary hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
            ) : notifications?.length > 0 ? (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => markAsRead(notification._id)}
                    className={`flex gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${!notification.isRead ? 'font-semibold' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {/* <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p> */}
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Package className="h-8 w-8 text-muted-foreground mb-2 opacity-20" />
                <p className="text-sm text-muted-foreground">All caught up!</p>
              </div>
            )}
          </div>

          <div className="border-t p-2 text-center bg-muted/10">
            <Link href="/dashboard/notifications" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
