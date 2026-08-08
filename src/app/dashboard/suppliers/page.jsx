"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useUpdateSupplierMutation,
} from "@/redux/api/supplierApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Truck,
  Plus,
  Loader2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  User,
  MoreVertical,
  Edit2,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_VALUES = {
  name: "",
  email: "",
  contact: "",
  address: "",
};

/**
 * Shared form used by both the Add and Edit dialogs.
 * `mode` only changes labels/copy; fields and validation are identical.
 */
function SupplierFormDialog({
  open,
  onOpenChange,
  mode, // "create" | "edit"
  defaultValues,
  selectedSupplier,
  onSubmit,
  isSubmitting,
}) {
  const {
    register,
    handleSubmit,
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
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the contact information for ${selectedSupplier?.name}.`
              : "Fill in the details to add a new supplier to your directory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}name`}>Full Name</Label>
            <Input
              id={`${idPrefix}name`}
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Timber Quality Co."
              className="rounded-xl"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${idPrefix}email`}>Email Address</Label>
            <Input
              id={`${idPrefix}email`}
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="supplier@example.com"
              className="rounded-xl"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}contact`}>Contact Number</Label>
              <Input
                id={`${idPrefix}contact`}
                {...register("contact")}
                placeholder="+92 300 1234567"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${idPrefix}address`}>Address</Label>
              <Input
                id={`${idPrefix}address`}
                {...register("address")}
                placeholder="City, Country"
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl py-6"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEdit ? (
                "Update Supplier"
              ) : (
                "Save Supplier"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SuppliersPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const { data: suppliers, isLoading } = useGetSuppliersQuery();
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const onAddSubmit = async (data) => {
    try {
      await createSupplier({ ...data, password: "Password123!" }).unwrap();
      toast.success("Supplier added successfully");
      setIsAddOpen(false);
    } catch (err) {
      toast.error(err.data || "Failed to create supplier");
      console.error("Failed to create supplier:", err);
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await updateSupplier({ id: selectedSupplier._id, ...data }).unwrap();
      toast.success("Supplier updated successfully");
      setIsEditOpen(false);
      setSelectedSupplier(null);
    } catch (err) {
      toast.error(err.data || "Failed to update supplier");
      console.error("Failed to update supplier:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id).unwrap();
        toast.success("Supplier deleted successfully");
      } catch (err) {
        toast.error(err.data || "Failed to delete supplier");
        console.error("Failed to delete supplier:", err);
      }
    }
  };

  const openEditDialog = (supplier) => {
    setSelectedSupplier(supplier);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your material providers and contact information.
          </p>
        </div>

        <Button
          className="flex gap-2 rounded-xl px-6 shadow-lg hover:shadow-primary/20 transition-all"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <SupplierFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        mode="create"
        defaultValues={DEFAULT_VALUES}
        onSubmit={onAddSubmit}
        isSubmitting={isCreating}
      />

      <Card className="rounded-2xl border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="py-4 px-6">Supplier Details</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers?.map((supplier) => (
                <TableRow key={supplier._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {supplier.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {supplier.name}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" /> Supplier ID: {supplier._id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" /> {supplier.email}
                      </span>
                      {supplier.contact && (
                        <span className="text-sm flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {supplier.contact}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {supplier.address || "No address provided"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link
                            href={`/dashboard/suppliers/${supplier._id}`}
                            className="flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(supplier)}
                          className="cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(supplier._id)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Supplier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {suppliers?.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-primary/5 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-10 w-10 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold">No suppliers found</h3>
              <p className="text-muted-foreground mt-2">
                Start by adding your first material supplier.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsAddOpen(true)}
                className="mt-6 rounded-xl"
              >
                Add Supplier
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSupplier && (
        <SupplierFormDialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) setSelectedSupplier(null);
          }}
          mode="edit"
          defaultValues={{
            name: selectedSupplier.name,
            email: selectedSupplier.email,
            contact: selectedSupplier.contact || "",
            address: selectedSupplier.address || "",
          }}
          selectedSupplier={selectedSupplier}
          onSubmit={onEditSubmit}
          isSubmitting={isUpdating}
        />
      )}
    </div>
  );
}