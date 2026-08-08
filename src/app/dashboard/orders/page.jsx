"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import {
  ShoppingCart,
  Eye,
  UserPlus,
  CheckCircle2,
  Clock,
  Truck,
  CircleDot,
  Search,
  Filter,
  User as UserIcon,
  Plus
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
  DialogTrigger,
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
import { useGetOrdersQuery, useUpdateOrderMutation, useCreateOrderMutation, useGetMaterialsQuery, useGetServicesQuery } from "@/redux/api/orderApi";
import { useGetAdminUsersQuery } from "@/redux/api/userApi";

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role;
  const isAdmin = role === "admin";
  const isEmployee = role === "employee";
  const isCustomer = role === "customer";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);

  const { data: orders = [], isLoading: ordersLoading } = useGetOrdersQuery();
  const { data: employees = [] } = useGetAdminUsersQuery('employee');
  const { data: materials = [] } = useGetMaterialsQuery();
  const { data: services = [] } = useGetServicesQuery();

  const [updateOrder] = useUpdateOrderMutation();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  // ---- react-hook-form setup (no schema resolver, plain rules) ----
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onSubmit",
    defaultValues: {
      serviceId: "",
      description: "",
      laborCost: 0,
    },
  });

  const watchedServiceId = watch("serviceId");
  const watchedLaborCost = watch("laborCost");

  const onSubmit = async (data) => {
    const result = await createOrder({
      serviceId: data.serviceId,
      description: data.description,
      totalAmount: Number(data.laborCost),
      estimatedCost: {
        labor: Number(data.laborCost),
        material: 0,
        total: Number(data.laborCost),
      },
    });

    if (result.data) {
      setIsPlaceOrderOpen(false);
      reset();
    } else if (result.error) {
      // Surface backend/mongoose validation errors on the relevant field if possible
      const message =
        result.error?.data?.message ||
        result.error?.error ||
        "Something went wrong placing your order.";
      setError("root", { type: "server", message });
    }
  };

  const handleDialogChange = (open) => {
    setIsPlaceOrderOpen(open);
    if (!open) reset();
  };

  const handleUpdateOrder = async (orderId, field, value) => {
    const result = await updateOrder({ id: orderId, [field]: value });
    if (result.data) {
      // handled by cache invalidation / refetch
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending": return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "In-Progress": return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200"><CircleDot className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case "Completed": return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "Delivered": return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200"><Truck className="w-3 h-3 mr-1" /> Delivered</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Oversee all customer orders and assign tasks." :
              isEmployee ? "Manage your assigned orders and update progress." :
                "Track your woodcraft orders and check their status."}
          </p>
        </div>
        {isCustomer && (
          <Button onClick={() => setIsPlaceOrderOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Place New Order
          </Button>
        )}
      </div>

      <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID or Customer..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In-Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-background/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  {!isCustomer && <TableHead>Customer</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-xs font-mono">{order._id.slice(-8).toUpperCase()}</TableCell>
                      {!isCustomer && (
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{order.customerId?.name || "N/A"}</span>
                            <span className="text-xs text-muted-foreground">{order.customerId?.email}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Select
                            value={order.assignEmployeeId?._id || "unassigned"}
                            onValueChange={(val) => handleUpdateOrder(order._id, "assignEmployeeId", val)}
                          >
                            <SelectTrigger className="h-8 w-[140px] text-xs">
                              <SelectValue placeholder="Assign To" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {employees.map(emp => (
                                <SelectItem key={emp._id} value={emp._id}>{emp.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">{order.assignEmployeeId?.name || "Unassigned"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">${order.totalAmount || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Place Order Dialog */}
      <Dialog open={isPlaceOrderOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Place New Order</DialogTitle>
            <DialogDescription>
              Select the service and primary material for your custom woodcraft project.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service Type</Label>
              <Controller
                name="serviceId"
                control={control}
                rules={{ required: "Please select a service" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      const service = services.find(s => s._id === val);
                      field.onChange(val);
                      setValue("laborCost", service?.basePrice || 0);
                    }}
                  >
                    <SelectTrigger id="service" className={errors.serviceId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s._id} value={s._id}>{s.serviceTitle}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.serviceId && (
                <p className="text-xs text-destructive">{errors.serviceId.message}</p>
              )}
            </div>

            {watchedServiceId && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div>
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Estimated Cost
                  </Label>
                </div>
                <div>
                  <div className="text-3xl font-mono font-bold text-primary">
                    ${services.find(s => s._id === watchedServiceId)?.estimatedCost || 0}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Material Description & Preferences</Label>
              <textarea
                id="description"
                className={`flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.description ? "border-destructive" : "border-input"
                }`}
                placeholder="Describe what kind of material, color, or finish you want..."
                {...register("description", { required: "Please describe your preferences" })}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs text-white">Base Labor Charge</Label>
                <div className="text-lg font-mono font-bold text-primary">${watchedLaborCost || 0}</div>
              </div>
            </div>
            {errors.root && (
              <p className="text-sm text-destructive text-center">{errors.root.message}</p>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreatingOrder}>
                {isCreatingOrder ? "Placing Order..." : "Confirm Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}