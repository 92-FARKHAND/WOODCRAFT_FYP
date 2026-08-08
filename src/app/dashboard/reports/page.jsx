"use client";

import { useGetReportsQuery, useAddExpenseMutation } from "@/redux/api/reportsApi";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ReportsPage() {
  const [months, setMonths] = useState(6);

  const { data, isLoading, error, refetch } = useGetReportsQuery(months);

  if (isLoading) return <div className="flex items-center justify-center h-96">Loading Reports...</div>;
  if (error) return <div className="text-destructive">Error loading reports.</div>;

  const {
    incomeAndExpenses,
    materialUsage,
    avgCompletionTimeHours,
    employeePerformance,
    billingAnalytics
  } = data;

  // Calculate totals for summary
  const totalIncome = incomeAndExpenses.income.reduce((sum, item) => sum + item.totalIncome, 0);
  const totalExpenses = incomeAndExpenses.expenses.reduce((sum, item) => sum + item.totalExpense, 0);
  const netProfit = totalIncome - totalExpenses;

  // Prepare monthly data for a simple CSS chart
  const monthsList = Array.from({ length: months }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (months - 1 - i));
    return { month: d.getMonth() + 1, year: d.getFullYear(), label: d.toLocaleString('default', { month: 'short' }) };
  });

  const chartData = monthsList.map(m => {
    const inc = incomeAndExpenses.income.find(item => item._id.month === m.month && item._id.year === m.year)?.totalIncome || 0;
    const exp = incomeAndExpenses.expenses.find(item => item._id.month === m.month && item._id.year === m.year)?.totalExpense || 0;
    return { ...m, income: inc, expenses: exp };
  });

  const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expenses)), 100);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overview of Woodcraft's business performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
            className="bg-background border border-border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={`$ ${totalIncome.toLocaleString()}`}
          icon={<DollarSign className="text-emerald-500" />}
          trend={<span className="text-emerald-500 flex items-center text-xs"><ArrowUpRight size={14} /> +12%</span>}
        />
        <SummaryCard
          title="Total Expenses"
          value={`$ ${totalExpenses.toLocaleString()}`}
          icon={<TrendingDown className="text-rose-500" />}
          trend={<span className="text-rose-500 flex items-center text-xs"><ArrowDownRight size={14} /> +5%</span>}
        />
        <SummaryCard
          title="Net Profit"
          value={`$ ${netProfit.toLocaleString()}`}
          icon={<TrendingUp className="text-blue-500" />}
          trend={<span className={netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}>
            {netProfit >= 0 ? "Profitable" : "Loss"}
          </span>}
        />
        <SummaryCard
          title="Avg. Completion"
          value={`${avgCompletionTimeHours} Hours`}
          icon={<Clock className="text-amber-500" />}
        />
      </div>

      {/* NEW: Billing & Service Analytics Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <DollarSign size={20} className="text-primary" />
          Billing & Service Profit Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Service Revenue</p>
            <p className="text-2xl font-bold text-primary">$ {billingAnalytics.totalServicePrice.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total earned from labor/services</p>
          </div>
          <div className="space-y-1 border-l border-border pl-6">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Employee Wages</p>
            <p className="text-2xl font-bold text-rose-500">$ {billingAnalytics.totalWagesToBePaid.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Wages to be paid from services</p>
          </div>
          <div className="space-y-1 border-l border-border pl-6">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Service Profit</p>
            <p className={`text-2xl font-bold ${billingAnalytics.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              $ {billingAnalytics.netProfit.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">Remaining after paying wages</p>
          </div>
          <div className="space-y-1 border-l border-border pl-6">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Loss (Unpaid)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-amber-500">$ {billingAnalytics.remainingPayments.toLocaleString()}</p>
              <span className="text-xs font-semibold text-rose-500">({billingAnalytics.lossPercentage}%)</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Outstanding payments from invoices</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Material Cost vs. Service Revenue</span>
              <span className="text-xs text-muted-foreground">Distribution</span>
            </div>
            <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(billingAnalytics.totalMaterialCost / (billingAnalytics.totalMaterialCost + billingAnalytics.totalServicePrice)) * 100}%` }}
                className="h-full bg-amber-500"
                title="Material Cost"
              />
              <div
                style={{ width: `${(billingAnalytics.totalServicePrice / (billingAnalytics.totalMaterialCost + billingAnalytics.totalServicePrice)) * 100}%` }}
                className="h-full bg-primary"
                title="Service Revenue"
              />
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Materials ($ {billingAnalytics.totalMaterialCost.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Services ($ {billingAnalytics.totalServicePrice.toLocaleString()})</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Service Revenue Utilization</span>
              <span className="text-xs text-muted-foreground">Wages vs. Profit</span>
            </div>
            <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
              <div
                style={{ width: `${Math.min((billingAnalytics.totalWagesToBePaid / Math.max(billingAnalytics.totalServicePrice, 1)) * 100, 100)}%` }}
                className="h-full bg-rose-500"
                title="Wages"
              />
              <div
                style={{ width: `${Math.max(0, (billingAnalytics.netProfit / Math.max(billingAnalytics.totalServicePrice, 1)) * 100)}%` }}
                className="h-full bg-emerald-500"
                title="Profit"
              />
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Wages ($ {billingAnalytics.totalWagesToBePaid.toLocaleString()})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Profit ($ {billingAnalytics.netProfit.toLocaleString()})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income vs Expenses Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Income vs Expenses
          </h2>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="w-full flex justify-center gap-1 h-48 items-end">
                  <div
                    style={{ height: `${(d.income / maxVal) * 100}%` }}
                    className="w-1/3 bg-emerald-500/80 rounded-t-sm transition-all group-hover:bg-emerald-500"
                    title={`Income: ${d.income}`}
                  />
                  <div
                    style={{ height: `${(d.expenses / maxVal) * 100}%` }}
                    className="w-1/3 bg-rose-500/80 rounded-t-sm transition-all group-hover:bg-rose-500"
                    title={`Expenses: ${d.expenses}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{d.label}</span>

                {/* Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] p-2 rounded shadow-lg z-10 whitespace-nowrap pointer-events-none border border-border">
                  <p>Inc: <span className="font-bold">$ {d.income}</span></p>
                  <p>Exp: <span className="font-bold">$ {d.expenses}</span></p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
              <span>Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-sm" />
              <span>Expenses</span>
            </div>
          </div>
        </div>

        {/* Most Used Materials */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Package size={20} className="text-primary" />
            Top Materials
          </h2>
          <div className="space-y-4">
            {materialUsage.length > 0 ? materialUsage.map((m, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.materialInfo.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{m.materialInfo.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{m.totalQuantity} {m.materialInfo.unit}</p>
                  <p className="text-[10px] text-muted-foreground">$ {m.totalCost.toLocaleString()}</p>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground italic text-center py-10">No usage data yet</p>}
          </div>
        </div>
      </div>

      {/* Employee Performance */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Employee Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 font-semibold text-sm">Employee Name</th>
                <th className="pb-3 font-semibold text-sm">Completed Orders</th>
                <th className="pb-3 font-semibold text-sm">Total Labor Contribution</th>
                <th className="pb-3 font-semibold text-sm">Efficiency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employeePerformance.length > 0 ? employeePerformance.map((emp, i) => (
                <tr key={i} className="group hover:bg-accent/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {emp.employeeInfo.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{emp.employeeInfo.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm">{emp.completedOrders} Orders</td>
                  <td className="py-4 text-sm font-semibold">$ {emp.totalLaborCost.toLocaleString()}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(emp.completedOrders * 10, 100)}%` }}
                          className="h-full bg-primary"
                        />
                      </div>
                      <span className="text-xs font-medium">{Math.min(emp.completedOrders * 10, 100)}%</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground italic">
                    No performance data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
}

function SummaryCard({ title, value, icon, trend }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-lg bg-background border border-border group-hover:border-primary/50 transition-colors">
          {icon}
        </div>
        {trend}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
    </div>
  );
}
