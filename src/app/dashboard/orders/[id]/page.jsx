"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  Truck,
  CircleDot,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Plus,
  ArrowLeft,
  Save,
  FileText,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useGetMaterialsQuery
} from "@/redux/api/orderApi";
import { toast } from "react-hot-toast";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === "admin";
  const isCustomer = role === "customer";
  const isEmployee = role === "employee";

  const { data: order, isLoading: orderLoading, isError } = useGetOrderByIdQuery(id);
  const status = order?.status;
  const isDelivered = status === "Delivered";
  const { data: materials = [] } = useGetMaterialsQuery();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  const [editData, setEditData] = useState({
    status: "",
    paymentStatus: "",
    invoiceAvailable: false,
    laborCost: 0,
  });

  const [materialSelection, setMaterialSelection] = useState({
    materialId: "",
    quantity: 1
  });

  useEffect(() => {
    if (order) {
      setEditData({
        status: order.status,
        paymentStatus: order.paymentStatus,
        invoiceAvailable: order.invoiceAvailable,
        laborCost: order.actualCost?.labor || order.estimatedCost?.labor || 0,
      });
    }
  }, [order]);

  const hasChanges =
  editData.status !== order?.status ||
  editData.paymentStatus !== order?.paymentStatus ||
  editData.invoiceAvailable !== order?.invoiceAvailable ||
  Number(editData.laborCost) !==
    Number(order?.actualCost?.labor || order?.estimatedCost?.labor || 0);

  const handleSaveChanges = async () => {

 // Show warning before marking as Delivered
  if (editData.status === "Delivered") {
    const confirmed = window.confirm(
      "Once you mark this order as Delivered, you will not be able to make further changes. Do you want to continue?"
    );

    if (!confirmed) return;
  }

    try {
      const result = await updateOrder({
        id: order._id,
        status: editData.status,
        paymentStatus: editData.paymentStatus,
        invoiceAvailable: editData.invoiceAvailable,
        actualCost: {
          ...order.actualCost,
          labor: Number(editData.laborCost)
        }
      });

      if (result.data) {
        toast.success("Order updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update order");
    }
  };

  const handleAddMaterial = async () => {
    if (!materialSelection.materialId || !order) return;
    const material = materials.find(m => m._id === materialSelection.materialId);
    if (!material) return;
    
     const requestedQuantity = Number(materialSelection.quantity);

  // Check stock availability
  if (material.quantity < requestedQuantity) {
    toast.error(`Only ${material.quantity} ${material.name} available in stock`);
    return;
  } 
    const newUsedMaterial = {
      materialId: material._id,
      quantity: Number(materialSelection.quantity),
      priceAtTime: material.pricePerUnit
    };

    const currentUsedMaterials = order.usedMaterials || [];
    const formattedExisting = currentUsedMaterials.map(m => ({
      materialId: m.materialId?._id || m.materialId,
      quantity: m.quantity,
      priceAtTime: m.priceAtTime
    }));

    const updatedUsedMaterials = [...formattedExisting, newUsedMaterial];

    const result = await updateOrder({
      id: order._id,
      usedMaterials: updatedUsedMaterials
    });

    if (result.data) {
      setMaterialSelection({ materialId: "", quantity: 1 });
      toast.success("Material added");
    }
  };

  const handleRemoveMaterial = async (index) => {
    if (!order) return;

    const currentUsedMaterials = order.usedMaterials || [];
    const updatedUsedMaterials = currentUsedMaterials
      .filter((_, i) => i !== index)
      .map(m => ({
        materialId: m.materialId?._id || m.materialId,
        quantity: m.quantity,
        priceAtTime: m.priceAtTime
      }));

    const result = await updateOrder({
      id: order._id,
      usedMaterials: updatedUsedMaterials
    });

    if (result.data) {
      toast.success("Material removed");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "In-Progress": return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><CircleDot className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case "Completed": return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "Delivered": return <Badge className="bg-purple-100 text-purple-800 border-purple-200"><Truck className="w-3 h-3 mr-1" /> Delivered</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "Paid": return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case "Partially Paid": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Partially Paid</Badge>;
      case "Unpaid": return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Unpaid</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (orderLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive opacity-50" />
        <div>
          <h2 className="text-xl font-bold">Order Not Found</h2>
          <p className="text-muted-foreground">The order you're looking for doesn't exist or you don't have access.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/orders")} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="gap-2 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3">
          {(isAdmin || isEmployee) && (
            <Button 
              onClick={handleSaveChanges} 
              disabled={isUpdating ||!hasChanges}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              <Save className="h-4 w-4" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Customer */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b bg-muted/20">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold font-mono">
                    #{order._id.slice(-8).toUpperCase()}
                  </CardTitle>
                  <CardDescription>
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                   {getStatusBadge(order.status)}
                   {getPaymentBadge(order.paymentStatus)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Status Management */}
              {(isAdmin || isEmployee) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Work Progress</Label>
                    <Select 
                     disabled={isDelivered}
                      value={editData.status} 
                      onValueChange={(val) => setEditData({...editData, status: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In-Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Payment Status</Label>
                      <Select 
                        value={editData.paymentStatus} 
                        onValueChange={(val) => setEditData({...editData, paymentStatus: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Update Payment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(isAdmin) && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="invoiceAvailable" 
                        checked={editData.invoiceAvailable}
                        onCheckedChange={(checked) => setEditData({...editData, invoiceAvailable: checked})}
                      />
                      <label 
                        htmlFor="invoiceAvailable"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Make Invoice Available to Customer
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Service Details</h3>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="font-bold text-lg text-primary">{order.serviceId?.name || "Custom Order"}</p>
                    <p className="text-sm text-muted-foreground mt-2 italic">"{order.description || "No description provided."}"</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Customer Contact</h3>
                  <div className="p-4 rounded-xl border bg-card space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <UserIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{order.customerId?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{order.customerId?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{order.customerId?.contact || "N/A"}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{order.customerId?.address || "N/A"}</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Materials List */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Materials Breakdown</h3>
                  {(isAdmin || isEmployee) && (
                    <Badge variant="outline" className="font-mono">${order.actualCost?.material || 0}</Badge>
                  )}
                </div>
                
                <div className="rounded-xl border divide-y overflow-hidden">
                  {order.usedMaterials?.length > 0 ? (
                    order.usedMaterials.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-card hover:bg-muted/10 transition-colors gap-3">
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate sm:whitespace-normal sm:break-words">{item.materialId?.name || "Material"}</p>
                            <p className="text-[10px] text-muted-foreground">{item.quantity} units @ ${item.priceAtTime}/unit</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="text-sm font-bold font-mono shrink-0">${(item.quantity * item.priceAtTime).toFixed(2)}</span>
                          {(isAdmin || isEmployee) && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-destructive hover:bg-destructive/10 print:hidden"
                              onClick={() => handleRemoveMaterial(idx)}
                            >
                              <Plus className="h-4 w-4 rotate-45" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground italic text-sm">
                      No materials recorded for this order yet.
                    </div>
                  )}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Financials & Quick Actions */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-muted-foreground">Labor Charges</Label>
                  {isAdmin ? (
                    <div className="flex items-center gap-2 print:hidden">
                      <span className="text-sm">$</span>
                      <Input 
                        type="number"
                        className="h-8 w-24 text-right font-mono"
                        value={editData.laborCost}
                        onChange={(e) => setEditData({...editData, laborCost: e.target.value})}
                      />
                    </div>
                  ) : (
                    <span className="font-mono font-bold">${order.actualCost?.labor || 0}</span>
                  )}
                  {isAdmin && <span className="hidden print:inline font-mono font-bold">${editData.laborCost}</span>}
                </div>
                <div className="flex justify-between items-center border-b pb-3">
                  <Label className="text-muted-foreground">Materials Total</Label>
                  <span className="font-mono font-bold">${order.actualCost?.material || 0}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold">Total Bill</span>
                  <span className="text-2xl font-black text-primary font-mono">${order.totalAmount || 0}</span>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                order.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {order.paymentStatus === 'Paid' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span className="text-xs font-bold uppercase tracking-wider">{order.paymentStatus}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Material Add (Admin/Employee Only) */}
          {(isAdmin || isEmployee) && (
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-sm">Quick Add Material</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Select Material</Label>
                  <Select 
                    disabled={isDelivered}
                    value={materialSelection.materialId} 
                    onValueChange={(val) => setMaterialSelection({...materialSelection, materialId: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map(m => (
                        <SelectItem key={m._id} value={m._id}>{m.name} (${m.pricePerUnit})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Quantity</Label>
                  <Input 
                    type="number" 
                    disabled={isDelivered}
                    value={materialSelection.quantity}
                    onChange={(e) => setMaterialSelection({...materialSelection, quantity: e.target.value})}
                  />
                </div>
                <Button className="w-full gap-2" onClick={handleAddMaterial} disabled={isDelivered}>
                  <Plus className="h-4 w-4" /> Add to Order
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Invoice Quick Link */}
          {(order.invoiceAvailable && (isAdmin || isCustomer)) && (
             <Button variant="outline" className="w-full gap-2 h-12 print:hidden" onClick={() => {
              isAdmin ?
              router.push(`/dashboard/billing`)
              : router.push(`/dashboard/invoices`)
            }

             }>
               <FileText className="h-4 w-4 text-primary" />
               View Generated Invoice
             </Button>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 15mm;
          }
          body {
            background: black !important;
          }
          .print\\:hidden, 
          nav, 
          header, 
          aside,
          button {
            display: none !important;
          }
          .max-w-5xl {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .grid {
            display: block !important;
          }
          .lg\\:col-span-2, .space-y-6 {
            width: 100% !important;
            margin-bottom: 20px !important;
          }
          .Card {
            border: 1px solid #eee !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
