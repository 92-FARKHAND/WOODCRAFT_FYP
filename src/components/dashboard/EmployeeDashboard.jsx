"use client"
import React from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Timer,
  Calendar,
  Eye
} from 'lucide-react';
import StatCard from './StatCard';
import { ClockingCard } from './ClockingCard';
import { Button } from '@/components/ui/button';

import { useGetOrdersQuery } from '@/redux/api/orderApi';
import { useRouter } from 'next/navigation';


const EmployeeDashboard = ({ user = {} }) => {
  const router = useRouter();
  const { data: orders, isLoading } = useGetOrdersQuery();

  const stats = [
    {
      title: "Active Tasks",
      value: orders?.filter(order => order.status === "In-Progress").length || 0,
      icon: <ClipboardList className="h-5 w-5" />,
      color: "blue"
    },
    {
      title: "Total Hours",
      value: Number(user.totalTime || 0).toFixed(3),
      icon: <Timer className="h-5 w-5" />,
      description: "Current session",
      color: "emerald"
    },
    {
      title: "Completed",
      value: orders?.filter(order => (order.status === "Completed" || order.status === "Delivered" )).length || 0,
      icon: <CheckCircle className="h-5 w-5" />,
      description: "All time",
      color: "indigo"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Workstation</h2>
          <p className="text-muted-foreground">Manage your tasks and track your work hours.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-full text-sm font-medium">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Task List */}

          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b p-6">
              <h3 className="font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Assigned Tasks
              </h3>
            </div>

            <div className="divide-y max-h-[300px] overflow-y-auto">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order._id}
                    className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex gap-4">
                      <div
                        className={`mt-1 h-3 w-3 rounded-full shrink-0 ${order.status === "Pending"
                          ? "bg-amber-500"
                          : order.status === "In-Progress"
                            ? "bg-blue-500"
                            : "bg-emerald-500"
                          }`}
                      />

                      <div>
                        <h4 className="font-semibold">
                          {order.serviceId?.name ||
                            order.description ||
                            "Custom Woodwork"}
                        </h4>

                        <p className="text-sm text-muted-foreground">
                          Customer: {order.customerId?.name || "N/A"} •{" "}
                          {order._id.toString().slice(-6).toUpperCase()}
                        </p>

                        <div className="mt-2 flex items-center gap-3">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${order.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : order.status === "In-Progress"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-amber-100 text-amber-700 border-amber-200"
                              }`}
                          >
                            {order.status}
                          </span>

                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Created{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground italic">
                  No tasks assigned to you yet.
                </div>
              )}
            </div>
          </div>


        </div> {/* End Main Section */}

        {/* Sidebar Section */}
        <div className="space-y-6 lg:col-span-1">
          <ClockingCard />

          <div className="rounded-2xl border bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 border-emerald-100">
            <h3 className="font-semibold text-emerald-900 flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5" />
              Recent Achievements
            </h3>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0">
                  ★
                </div>

                <div>
                  <p className="text-xs font-semibold text-emerald-900">
                    Efficiency Boost
                  </p>

                  <p className="text-[10px] text-emerald-700/70">
                    Completed 3 orders 15% faster than estimated this week.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0">
                  ✔
                </div>

                <div>
                  <p className="text-xs font-semibold text-emerald-900">
                    Perfect Quality
                  </p>

                  <p className="text-[10px] text-emerald-700/70">
                    Last 5 customers gave 5-star feedback on your craftsmanship.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div> 
      </div> 
    </div> 
  );
};

export default EmployeeDashboard;
