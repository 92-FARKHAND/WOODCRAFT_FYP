"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Plus,
  Wallet,
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  MoreVertical,
  ChevronRight,
  Building2,
  Users2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetAdminInvoicesQuery,
  useRecordPaymentMutation,
  useGetEmployeeWagesQuery,
  useGetExpensesQuery,
  useAddExpenseMutation
} from "@/redux/api/billingApi";
import { usePayEmployeeMutation } from "@/redux/api/userApi";
import { toast } from "react-hot-toast";
import InvoiceDetail from "@/components/dashboard/InvoiceDetail";

export default function BillingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedUserForPay, setSelectedUserForPay] = useState(null);

  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "cash",
    note: ""
  });

  const [expenseData, setExpenseData] = useState({
    category: "Other",
    amount: "",
    description: ""
  });

  // Queries
  const { data: invoices = [], isLoading: isLoadingInvoices } = useGetAdminInvoicesQuery();
  const { data: employeeWages = [], isLoading: isLoadingWages } = useGetEmployeeWagesQuery();
  const { data: expenses = [], isLoading: isLoadingExpenses } = useGetExpensesQuery();

  // Mutations
  const [recordPayment, { isLoading: isRecording }] = useRecordPaymentMutation();
  const [payEmployee, { isLoading: isPaying }] = usePayEmployeeMutation();
  const [addExpense, { isLoading: isAddingExpense }] = useAddExpenseMutation();

  // Handlers
  const handlePayWages = (employee) => {
    setSelectedUserForPay(employee);
    setIsPayDialogOpen(true);
  };

  const confirmPayment = async () => {
    if (!selectedUserForPay) return;
    try {
      await payEmployee(selectedUserForPay._id).unwrap();
      setIsPayDialogOpen(false);
      toast.success("Wages paid successfully and hours reset.");
    } catch (error) {
      toast.error(error?.data?.error || "Failed to process payment");
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      await recordPayment({
        invoiceId: selectedInvoice._id,
        ...paymentData
      }).unwrap();
      setIsPaymentDialogOpen(false);
      toast.success("Payment recorded successfully");
      setPaymentData({ amount: "", method: "cash", note: "" });
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense(expenseData).unwrap();
      setIsExpenseDialogOpen(false);
      toast.success("Expense added successfully");
      setExpenseData({ category: "Other", amount: "", description: "" });
    } catch (error) {
      toast.error("Failed to add expense");
    }
  };

  // Helper functions
  const getStatusBadge = (status) => {
    switch (status) {
      case "unpaid": return <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 border-rose-500/20">Unpaid</Badge>;
      case "partially_paid": return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Partially Paid</Badge>;
      case "paid": return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Paid</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getExpenseCategoryBadge = (category) => {
    const colors = {
      'Material': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Wage': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'Utility': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'Rent': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
      'Other': 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    return <Badge variant="outline" className={colors[category] || colors['Other']}>{category}</Badge>;
  };

  // Calculations for Overview
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalPending = invoices.reduce((sum, inv) => sum + (inv.amount - (inv.amountPaid || 0)), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Filtering
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredWages = employeeWages.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpenses = expenses.filter(exp =>
    exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingInvoices || isLoadingWages || isLoadingExpenses) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-700 max-w-[1600px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Billing & Finance
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive overview of workshop revenue, expenses, and payroll.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsExpenseDialogOpen(true)} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
            <TrendingDown className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          amount={totalRevenue}
          icon={<DollarSign className="text-emerald-500" />}
          description="Total collected payments"
          trend="+12.5%"
          isPositive={true}
        />
        <StatsCard
          title="Pending Payments"
          amount={totalPending}
          icon={<Clock className="text-amber-500" />}
          description="Awaiting customer payment"
          trend="+2.1%"
          isPositive={false}
        />
        <StatsCard
          title="Total Expenses"
          amount={totalExpenses}
          icon={<TrendingDown className="text-rose-500" />}
          description="Material, wages, and bills"
          trend="-4.3%"
          isPositive={true}
        />
        <StatsCard
          title="Net Profit"
          amount={netProfit}
          icon={<TrendingUp className="text-blue-500" />}
          description="Revenue minus expenses"
          trend="+18.2%"
          isPositive={true}
        />
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap space-x-1 space-y-1">
          <TabsList className="bg-muted/50 p-1 border border-border">
            <TabsTrigger value="invoices" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Receipt className="w-4 h-4" /> Invoices
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <TrendingDown className="w-4 h-4" /> Other Expenses
            </TabsTrigger>
            <TabsTrigger value="wages" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users2 className="w-4 h-4" /> Employee Wages
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                className="pl-10 w-[300px] h-9 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9 shadow-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partially_paid">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="invoices" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-xl bg-card/30 backdrop-blur-md">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center text-muted-foreground">
                        <Receipt className="w-12 h-12 mx-auto mb-2 opacity-10" />
                        No invoices found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice._id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell className="font-mono text-xs font-bold text-primary">#{invoice._id.slice(-8).toUpperCase()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {invoice.customerId?.name?.charAt(0) || "C"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{invoice.customerId?.name || "N/A"}</span>
                              <span className="text-xs text-muted-foreground">{invoice.customerId?.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">$ {Number(invoice.amount || 0).toFixed(3)}</TableCell>
                        <TableCell className="text-emerald-500 font-medium">$ {Number(invoice.amountPaid || 0).toFixed(3)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(invoice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {invoice.status !== 'paid' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setIsPaymentDialogOpen(true);
                                }}
                                className="h-8 gap-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                              >
                                <DollarSign className="h-3 w-3" /> Record
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-xl bg-card/30 backdrop-blur-md">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                        <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-10" />
                        No expenses recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense._id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell className="text-xs font-medium">
                          {new Date(expense.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>{getExpenseCategoryBadge(expense.category)}</TableCell>
                        <TableCell className="max-w-[400px] font-medium">{expense.description}</TableCell>
                        <TableCell className="font-bold text-rose-500">
                          -$ {Number(expense.amount || 0).toFixed(3)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wages" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-xl bg-card/30 backdrop-blur-md">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Hours Pending</TableHead>
                    <TableHead>Calculated Wage</TableHead>
                    <TableHead>Work Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                        <Users2 className="w-12 h-12 mx-auto mb-2 opacity-10" />
                        No employee wage records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWages.map((emp) => (
                      <TableRow key={emp._id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">
                              {emp.name?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{emp.name}</span>
                              <span className="text-xs text-muted-foreground">{emp.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-xs">$ {Number(emp.hourlyRate || 0).toFixed(3)}/hr</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20 font-mono">
                            <Clock className="w-3 h-3 mr-1" /> {Number(emp.hoursToPaid || 0).toFixed(3)} hrs
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-lg font-bold text-primary">
                            $ {Number(emp.calculatedWage || 0).toFixed(3)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={emp.workStatus === 'Working' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}
                          >
                            {emp.workStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            disabled={emp.calculatedWage <= 0 || isPaying}
                            onClick={() => handlePayWages(emp)}
                            className="h-8 gap-1 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border-none"
                          >
                            <CreditCard className="h-3 w-3" /> {isPaying ? "Paying..." : "Pay Wages"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-md bg-card border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Collect payment for invoice #{selectedInvoice?._id.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Invoice:</span>
                <span className="font-bold">$ {Number(selectedInvoice?.amount || 0).toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="text-emerald-500 font-medium">$ {Number(selectedInvoice?.amountPaid || 0).toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                <span className="font-semibold">Remaining:</span>
                <span className="font-extrabold text-primary text-lg">$ {Number((selectedInvoice?.amount || 0) - (selectedInvoice?.amountPaid || 0)).toFixed(3)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay-amount">Amount to Record</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pay-amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-10 h-11"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pay-method">Method</Label>
                <Select
                  value={paymentData.method}
                  onValueChange={(val) => setPaymentData({ ...paymentData, method: val })}
                >
                  <SelectTrigger id="pay-method" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-note">Note</Label>
                <Input
                  id="pay-note"
                  placeholder="Optional"
                  className="h-11"
                  value={paymentData.note}
                  onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsPaymentDialogOpen(false)} className="h-11">Cancel</Button>
              <Button type="submit" className="h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20" disabled={isRecording}>
                {isRecording ? "Processing..." : "Confirm Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="max-w-md bg-card border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-500" /> Record Business Expense
            </DialogTitle>
            <DialogDescription>
              Log an outgoing cost for the workshop operations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exp-category">Category</Label>
              <Select
                value={expenseData.category}
                onValueChange={(val) => setExpenseData({ ...expenseData, category: val })}
              >
                <SelectTrigger id="exp-category" className="h-11 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Utility">Utility (Electricity, Water, etc.)</SelectItem>
                  <SelectItem value="Rent">Workshop Rent</SelectItem>
                  <SelectItem value="Material">Material Purchase</SelectItem>
                  <SelectItem value="Wage">Extra Wage/Bonus</SelectItem>
                  <SelectItem value="Other">Other Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="exp-amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-10 h-11"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-description">Description</Label>
              <Input
                id="exp-description"
                placeholder="e.g. Electricity bill for April"
                className="h-11"
                value={expenseData.description}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsExpenseDialogOpen(false)} className="h-11">Cancel</Button>
              <Button type="submit" className="h-11 px-8 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20" disabled={isAddingExpense}>
                {isAddingExpense ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Record Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Invoice Detail Dialog */}
      <InvoiceDetail
        invoice={selectedInvoice}
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
      />

      {/* Wage Payment Confirmation Dialog */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-600" />
              Confirm Wage Payment
            </DialogTitle>
            <DialogDescription>
              Review the payment details for <strong>{selectedUserForPay?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {selectedUserForPay?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{selectedUserForPay?.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">ID: {selectedUserForPay?._id}</p>
            </div>
          </div>

          {selectedUserForPay && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Hourly Rate</span>
                <span className="font-semibold">$ {Number(selectedUserForPay.hourlyRate || 0).toFixed(3)}/hr</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Hours to be Paid</span>
                <span className="font-semibold">{Number(selectedUserForPay.hoursToPaid || 0).toFixed(3)} hours</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <span className="font-medium text-emerald-900">Total Wage Amount</span>
                <span className="text-xl font-bold text-emerald-600">
                  $ {((selectedUserForPay.hourlyRate || 0) * (selectedUserForPay.hoursToPaid || 0)).toFixed(3)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground italic">
                * Clicking proceed will add this as an expense and reset pending hours.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={confirmPayment}
              disabled={isPaying}
            >
              {isPaying ? "Processing..." : "Proceed to Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatsCard({ title, amount, icon, description, trend, isPositive }) {
  return (
    <Card className="border-none shadow-lg bg-card/40 backdrop-blur-sm overflow-hidden relative group hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="p-2 rounded-xl bg-background border border-border group-hover:border-primary/50 transition-colors">
            {icon}
          </div>
          <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
            {trend}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</span>
          <span className="text-2xl font-black tracking-tight">$ {Number(amount || 0).toFixed(3)}</span>
          <span className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            {description}
          </span>
        </div>
      </CardContent>
      {/* Decorative gradient */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
    </Card>
  );
}
