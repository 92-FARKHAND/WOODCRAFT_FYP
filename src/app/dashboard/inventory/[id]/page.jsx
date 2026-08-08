"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetMaterialQuery, useDeleteMaterialMutation } from "@/redux/api/materialApi";
import { 
  Loader2, 
  ArrowLeft, 
  Package, 
  Trash2, 
  Tag, 
  Layers, 
  DollarSign, 
  Truck,
  AlertTriangle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MaterialDetailsPage() {
  const params = useParams(); // Hook to get URL parameters
  const router = useRouter();
  const id = params.id; // Extract the ID from the URL parameter

  // Passing the ID from the URL directly to the API hook
  const { data: material, isLoading, error } = useGetMaterialQuery(id);
  const [deleteMaterial, { isLoading: isDeleting }] = useDeleteMaterialMutation();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this material? This action cannot be undone.")) {
      try {
        // Pass the ID as a parameter to the delete mutation
        await deleteMaterial(id).unwrap();
        router.push("/dashboard/inventory"); // Redirect after successful deletion
      } catch (err) {
        console.error("Failed to delete material:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading material details...</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="container mx-auto p-12 text-center space-y-6">
        <div className="bg-destructive/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Material Not Found</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
            The material you are looking for doesn't exist or has been removed from the system.
        </p>
        <Button onClick={() => router.push("/dashboard/inventory")} variant="outline">
            Back to Inventory
        </Button>
      </div>
    );
  }

  const isLowStock = material.quantity <= material.minStockLevel;

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-primary/10" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{material.name}</h1>
            <p className="text-muted-foreground">Detailed material specifications and stock status.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="destructive" 
            className="gap-2 rounded-xl shadow-lg shadow-destructive/20"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete Material
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-none shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Material Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Category</span>
                <div className="flex items-center gap-2 mt-1">
                    <Tag className="h-4 w-4 text-primary/60" />
                    <Badge variant="outline" className="capitalize text-sm py-1 px-3">
                        {material.category}
                    </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Price per Unit</span>
                <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <p className="text-2xl font-bold">${material.pricePerUnit?.toFixed(2)}</p>
                    <span className="text-muted-foreground">/ {material.unit}</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Description</span>
                <p className="text-foreground leading-relaxed mt-1">
                    {material.description || "No detailed description provided for this material."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-xl bg-card/50 backdrop-blur-sm border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Truck className="h-5 w-5 text-primary" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {material.supplierId ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-primary/10">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {material.supplierId.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{material.supplierId.name}</p>
                        <p className="text-sm text-muted-foreground">{material.supplierId.email}</p>
                      </div>
                   </div>
                   <Button variant="outline" size="sm" className="rounded-lg">Contact Supplier</Button>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground italic">
                    No supplier assigned to this material.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stock Status */}
        <Card className={`rounded-2xl border-none shadow-xl h-fit ${isLowStock ? 'bg-destructive/5' : 'bg-card/50 backdrop-blur-sm'}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Stock Management
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-2xl bg-background shadow-inner border border-border/50">
                    <span className="text-sm text-muted-foreground block mb-2 uppercase tracking-tighter font-semibold">Available Quantity</span>
                    <p className={`text-5xl font-black ${isLowStock ? 'text-destructive' : 'text-primary'}`}>
                        {material.quantity}
                    </p>
                    <span className="text-muted-foreground font-medium">{material.unit}(s)</span>
                </div>

                <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Minimum Stock Level</span>
                        <span className="font-bold">{material.minStockLevel} {material.unit}(s)</span>
                    </div>
                    
                    {isLowStock ? (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 flex gap-3 animate-pulse">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-bold">Low Stock Alert!</p>
                                <p>Current stock is below the minimum threshold. Reorder soon.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 flex gap-3">
                             <Package className="h-5 w-5 shrink-0" />
                             <div className="text-sm">
                                <p className="font-bold">Stock Status Healthy</p>
                                <p>Inventory levels are well above the minimum requirement.</p>
                             </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
