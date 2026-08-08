"use client";
import React from 'react';
import {
  Package,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  DollarSign,
  Bell,
  Plus
} from 'lucide-react';
import StatCard from './StatCard';
import { useGetDashboardStatsQuery } from '@/redux/api/reportsApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const AdminDashboard = () => {
  const router = useRouter();
  const { data, isLoading, isError } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-10 bg-destructive/10 rounded-xl text-destructive">
        <p>Error loading dashboard data. Please try again later.</p>
      </div>
    );
  }

  const { stats, recentOrders, notifications } = data || {};
  

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${Number(stats?.totalRevenue || 0).toFixed(3)}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: "emerald"
    },
    {
      title: "Total Employees",
      value: stats?.totalEmployees || 0,
      icon: <Users className="h-5 w-5" />,
      color: "indigo"
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: <Package className="h-5 w-5" />,
      description: `${stats?.pendingOrders || 0} pending orders`,
      color: "blue"
    },
    {
      title: "Inventory Alerts",
      value: stats?.inventoryAlerts || 0,
      icon: <AlertTriangle className="h-5 w-5" />,
      description: stats?.inventoryAlerts > 0 ? "Items below threshold" : "Stock level healthy",
      color: stats?.inventoryAlerts > 0 ? "rose" : "emerald"
    }
  ];

  return (
    <div className="space-y-6 -mt-4">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Admin Overview</h2>
        <p className="text-sm text-muted-foreground">Monitor your woodcraft business performance and operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Orders Card */}
        <div className="lg:col-span-4 rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b p-5">
            <h3 className="font-semibold">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y overflow-y-auto max-h-[400px]">
            {recentOrders?.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.mongoId} className="flex items-center justify-between p-5 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.mongoId}`)}>
                  <div className="flex items-center gap-4">
                    <div className={`rounded-full p-2 ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                      order.status === 'In-Progress' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {order.status === 'Completed' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.customer}</p>
                      <p className="text-xs text-muted-foreground">ID: {order.id} • {formatDistanceToNow(new Date(order.date), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{(order.amount || 0)}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${order.status === 'Completed' ? 'text-emerald-500' :
                      order.status === 'In-Progress' ? 'text-blue-500' : 'text-amber-500'
                      }`}>{order.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-muted-foreground italic">No orders found.</div>
            )}
          </div>
        </div>


        {/* Notifications and Quick Actions */}
        <div className="lg:col-span-3 space-y-6">
          {/* Notifications Card */}
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b p-5">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </h3>
            </div>
            <div className="divide-y overflow-y-auto max-h-[250px]">
              {notifications?.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 hover:bg-muted/50 transition-colors ${!notif.isRead ? 'bg-primary/5 border-l-4 border-primary' : ''}`}>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-semibold">{notif.title}</p>
                      <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(notif.date), { addSuffix: true })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{notif.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">No new notifications.</div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4 text-sm">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/orders" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 hover:bg-primary/5 hover:border-primary/50 transition-all group">
                <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="text-xs font-medium">New Order</span>
              </Link>
              <Link href="/dashboard/suppliers" className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 hover:bg-primary/5 hover:border-primary/50 transition-all group">
                <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="text-xs font-medium">Add Supplier</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
