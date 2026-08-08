"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Link from "next/link";
import {
  useGetMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} from "@/redux/api/materialApi";
import { useGetSuppliersQuery } from "@/redux/api/supplierApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  Loader2,
  Trash2,
  AlertTriangle,
  Eye,
  Pencil,
} from "lucide-react";
import { toast } from "react-hot-toast";

const categories = ["wood", "paint", "hardware", "tools", "polish", "other"];
const units = ["piece", "kg", "liter", "meter", "box", "set"];

const DEFAULT_VALUES = {
  name: "",
  category: "",
  unit: "",
  quantity: 0,
  minStockLevel: 10,
  pricePerUnit: 0,
  supplierId: "",
  description: "",
};


function MaterialFormDialog({
  open,
  onOpenChange,
  mode, // "create" | "edit"
  defaultValues,
  suppliers,
  onSubmit,
  isSubmitting,
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues || DEFAULT_VALUES,
  });

  // Re-seed the form whenever the dialog opens with new defaultValues.
  useEffect(() => {
    if (open) reset(defaultValues || DEFAULT_VALUES);
  }, [open, defaultValues, reset]);

  const isEdit = mode === "edit";
  const idPrefix = isEdit ? "edit-" : "";

  const submit = async (data) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit && <Pencil className="h-5 w-5 text-amber-500" />}
            {isEdit ? "Edit Material" : "Add New Material"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modify material details and update stock levels."
              : "Add a new item to your workshop inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}name`}>Material Name</Label>
              <Input
                id={`${idPrefix}name`}
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. Oak Wood Plank"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}category`}>Category</Label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}unit`}>Unit</Label>
              <Controller
                name="unit"
                control={control}
                rules={{ required: "Unit is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit && (
                <p className="text-xs text-destructive">{errors.unit.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}pricePerUnit`}>Price per Unit</Label>
              <Input
                id={`${idPrefix}pricePerUnit`}
                type="number"
                step="0.01"
                {...register("pricePerUnit", {
                  valueAsNumber: true,
                  required: "Price is required",
                  min:{
                    value:1,
                    message:"Price must be greater than 0"
                  }
                })}
              />
              {errors.pricePerUnit && (
                <p className="text-xs text-destructive">
                  {errors.pricePerUnit.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}quantity`}>
                {isEdit ? "Current Quantity" : "Initial Quantity"}
              </Label>
              <Input
                id={`${idPrefix}quantity`}
                type="number"
                {...register("quantity", { valueAsNumber: true,
                  required:"Quantity is required",
                  min:{
                    value:1,
                    message:"Quantity must be greater than 0"
                  }
                 })}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive">
                  {errors.quantity.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}minStockLevel`}>Min Stock Level</Label>
              <Input
                id={`${idPrefix}minStockLevel`}
                type="number"
                {...register("minStockLevel", { valueAsNumber: true ,
                  min:{
                    value:0,
                    message:"Min stock must be greater than equal to 0"
                  }
                })}
              />
              {errors.minStockLevel && (
                <p className="text-xs text-destructive">
                  {errors.minStockLevel.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}supplierId`}>Supplier</Label>
            <Controller
              name="supplierId"
              control={control}
              rules={{ required: "Supplier ID is required" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((sup) => (
                      <SelectItem key={sup._id} value={sup._id}>
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.supplierId && (
                <p className="text-xs text-destructive">
                  {errors.supplierId.message}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}description`}>Description</Label>
            <Input
              id={`${idPrefix}description`}
              {...register("description",{
                required:"Description is required"
              })}
              placeholder="Item Details..."
            />
            {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
          </div>

          <DialogFooter className="gap-2">
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={isEdit ? "flex-1" : "w-full"}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Material"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function InventoryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const { data: materials, isLoading: isLoadingMaterials } = useGetMaterialsQuery();
  const { data: suppliers } = useGetSuppliersQuery();
  const [createMaterial, { isLoading: isCreating }] = useCreateMaterialMutation();
  const [updateMaterial, { isLoading: isUpdating }] = useUpdateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  const onCreateSubmit = async (data) => {
    try {
      console.log(data);
      
      await createMaterial(data).unwrap();
      setIsDialogOpen(false);
      toast.success("Material added successfully");
    } catch (err) {
      toast.error("Failed to add material");
      console.error("Failed to create material:", err);
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await updateMaterial({ id: editingMaterial._id, ...data }).unwrap();
      setIsEditDialogOpen(false);
      setEditingMaterial(null);
      toast.success("Material updated successfully");
    } catch (err) {
      toast.error("Failed to update material");
      console.error("Failed to update material:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await deleteMaterial(id).unwrap();
        toast.success("Material deleted successfully");
      } catch (err) {
        toast.error("Failed to delete material");
        console.error("Failed to delete material:", err);
      }
    }
  };

  const openEditDialog = (item) => {
    setEditingMaterial(item);
    setIsEditDialogOpen(true);
  };

  if (isLoadingMaterials) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your workshop materials and stock levels.
          </p>
        </div>
        <Button className="flex gap-2 shadow-md" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Add Material
        </Button>
      </div>

      <MaterialFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode="create"
        defaultValues={DEFAULT_VALUES}
        suppliers={suppliers}
        onSubmit={onCreateSubmit}
        isSubmitting={isCreating}
      />

      <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials?.map((item) => {
              const isLowStock = item.quantity <= item.minStockLevel;
              return (
                <TableRow key={item._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize bg-primary/5">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono ${
                          isLowStock ? "text-destructive font-bold" : "font-medium"
                        }`}
                      >
                        {item.quantity} {item.unit}(s)
                      </span>
                      {isLowStock && (
                        <AlertTriangle
                          className="h-4 w-4 text-destructive animate-pulse"
                          title="Low Stock"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${item.pricePerUnit?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.supplierId?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Link href={`/dashboard/inventory/${item._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item._id)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {materials?.length === 0 && (
          <div className="text-center py-20">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No materials in inventory.</p>
          </div>
        )}
      </div>

      {editingMaterial && (
        <MaterialFormDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setEditingMaterial(null);
          }}
          mode="edit"
          defaultValues={{
            name: editingMaterial.name,
            category: editingMaterial.category,
            unit: editingMaterial.unit,
            quantity: editingMaterial.quantity,
            minStockLevel: editingMaterial.minStockLevel,
            pricePerUnit: editingMaterial.pricePerUnit,
            supplierId: editingMaterial.supplierId?._id || "",
            description: editingMaterial.description || "",
          }}
          suppliers={suppliers}
          onSubmit={onEditSubmit}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  );
}