"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  CreditCard,
  Plus,
  ArrowUpRight,
  MessageSquare,
  FileText,
  Loader2
} from 'lucide-react';
import StatCard from './StatCard';
import { useGetOrdersQuery } from '@/redux/api/orderApi';
import { useGetInvoicesQuery } from '@/redux/api/billingApi';

const CustomerDashboard = ({ user = {} }) => {
  const router = useRouter();

  const { data: orders = [], isLoading: ordersLoading } = useGetOrdersQuery();
  const { data: invoices = [], isLoading: invoicesLoading } = useGetInvoicesQuery();

  // Calculate Stats
  const activeOrders = orders.filter(o => !['Completed', 'Delivered'].includes(o.status));
  const totalSpent = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const pendingInvoices = invoices.filter(inv => ['unpaid', 'partially_paid'].includes(inv.status));

  const stats = [
    {
      title: "Active Orders",
      value: ordersLoading ? "..." : activeOrders.length.toString(),
      icon: <Package className="h-5 w-5" />,
      color: "blue"
    },
    {
      title: "Total Spent",
      value: invoicesLoading ? "..." : `$ ${totalSpent.toLocaleString()}`,
      icon: <CreditCard className="h-5 w-5" />,
      color: "emerald"
    },
    {
      title: "Invoices Pending",
      value: invoicesLoading ? "..." : pendingInvoices.length.toString(),
      icon: <FileText className="h-5 w-5" />,
      color: "indigo" 
    }
  ];

  // Prepare Order Timeline Data
  const orderTimeline = activeOrders.slice(0, 3).map(order => {
    // Determine progress based on status
    const progressMap = {
      'Pending': 10,
      'In-Progress': 65,
      'Completed': 100,
      'Delivered': 100
    };

    return {
      id: order._id?.substring(order._id.length - 6).toUpperCase() || "ORD-NEW",
      item: order.description || "Custom Wood Project",
      status: order.status,
      progress: progressMap[order.status] || 0,
      lastUpdate: order.status === 'In-Progress' ? "Our craftsmen are working on your piece" : "Order received and pending review"
    };
  });

  const isLoading = ordersLoading || invoicesLoading;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white">Hello, {user.name || 'Customer'}!</h2>
          <p className="mt-2 text-slate-400 max-w-md">
            Track your custom woodcraft orders or start a new project with our expert craftsmen.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
              onClick={() => router.push(`/dashboard/orders`)}
            >
              View My Orders
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-transform hover:bg-white/20"
              onClick={() => router.push(`/dashboard/orders`)}
            >
              <Plus className="h-4 w-4" /> Place New Order
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Orders Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold">Recent Active Orders</h3>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>

          <div className="space-y-4">
            {orderTimeline.length > 0 ? (
              orderTimeline.map((order) => (
                <div key={order.id} className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{order.item}</h4>
                        <p className="text-sm text-muted-foreground">ID: {order.id} • {order.status}</p>
                      </div>
                    </div>
                    <button
                      className="rounded-full p-2 hover:bg-muted"
                      onClick={() => router.push(`/dashboard/orders`)}
                    >
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-primary">{order.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-1000"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 p-3">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <p className="text-xs font-medium">Latest Update: <span className="text-muted-foreground font-normal">{order.lastUpdate}</span></p>
                  </div>
                </div>
              ))
            ) : !isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-bold text-lg text-foreground">No Active Orders</h4>
                <p className="text-muted-foreground text-sm max-w-[250px] mt-1">
                  You don't have any active orders at the moment. Ready to start something new?
                </p>
                <button
                  className="mt-6 text-sm font-semibold text-primary hover:underline"
                  onClick={() => router.push(`/dashboard/orders`)}
                >
                  Request a new project
                </button>
              </div>
            ) : (
              // Loading placeholders
              [1, 2].map((i) => (
                <div key={i} className="h-40 w-full animate-pulse rounded-2xl bg-muted/50" />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <button
                className="flex w-full items-center justify-between rounded-xl p-3 text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => router.push('/dashboard/invoices')}
              >
                <span className="flex items-center gap-3"><FileText className="h-4 w-4 text-blue-500" /> My Invoices</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                className="flex w-full items-center justify-between rounded-xl p-3 text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => router.push('/dashboard/profile')}
              >
                <span className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-purple-500" /> My Profile</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="flex w-full items-center justify-between rounded-xl p-3 text-sm font-medium hover:bg-muted transition-colors">
                <span className="flex items-center gap-3"><MessageSquare className="h-4 w-4 text-emerald-500" /> Support Chat</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-primary/5 p-6 border border-primary/10">
            <h4 className="font-bold text-primary mb-2">Woodcraft Care Tip</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To maintain the natural luster of your walnut furniture, avoid direct sunlight and wipe with a dry micro-fiber cloth weekly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
