"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from "@/redux/api/serviceApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Wrench, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

const DEFAULT_VALUES = {
  serviceTitle: "",
  description: "",
  basePrice: 0,
  estimatedCost: 0,
  employeeId: "",
  estimatedTime: "",
};

function ServiceFormDialog({
  open,
  onOpenChange,
  mode, // "create" | "edit"
  defaultValues,
  onSubmit,
  isSubmitting,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaultValues || DEFAULT_VALUES,
  });

  // Re-seed the form whenever the dialog opens with new defaultValues
  // (needed for edit, since we reuse one form instance for every row).
  React.useEffect(() => {
    if (open) reset(defaultValues || DEFAULT_VALUES);
  }, [open, defaultValues, reset]);

  const isEdit = mode === "edit";

  const handleClose = () => onOpenChange(false);

  const submit = async (data) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit && <Pencil className="h-5 w-5 text-primary" />}
            {isEdit ? "Edit Service" : "Create New Service"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the service details below. Changes are applied immediately to the system."
              : "Define a new service for the workshop. All fields marked are essential."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor={`${mode}-serviceTitle`}>Service Title</Label>
            <Input
              id={`${mode}-serviceTitle`}
              {...register("serviceTitle", { required: "Title is required" })}
              placeholder="e.g. Premium Oak Cabinetry"
              className="focus-visible:ring-primary"
            />
            {errors.serviceTitle && (
              <p className="text-xs text-destructive">
                {errors.serviceTitle.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-description`}>Description</Label>
            <Input
              id={`${mode}-description`}
              {...register("description", {
                required: "Description is required",
              })}
              placeholder="Detailed service description..."
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${mode}-basePrice`}>Base Price ($)</Label>
              <Input
                id={`${mode}-basePrice`}
                type="number"
                {...register("basePrice", {
                  valueAsNumber: true,
                  min: { value: 10, message: "Please enter valid amount" },
                })}
              />
              {errors.basePrice && (
                <p className="text-xs text-destructive">
                  {errors.basePrice.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${mode}-estimatedCost`}>
                Estimated Cost ($)
              </Label>
              <Input
                id={`${mode}-estimatedCost`}
                type="number"
                {...register("estimatedCost", {
                  valueAsNumber: true,
                  min: { value: 10, message: "Please enter valid amount" },
                })}
              />
              {errors.estimatedCost && (
                <p className="text-xs text-destructive">
                  {errors.estimatedCost.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-estimatedTime`}>
              Expected Completion
            </Label>
            <Input
              id={`${mode}-estimatedTime`}
              placeholder="2 days or week (optional)"
              {...register("estimatedTime")}
            />
          </div>

          <DialogFooter className="gap-2">
            {isEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={isEdit ? "flex-1 sm:flex-none" : "w-full sm:w-auto"}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Service"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ServicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const { data: session } = useSession();
  const role = session?.user?.role;
  const isAdmin = role === "admin";

  const { data: services, isLoading: isLoadingServices } = useGetServicesQuery();

  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const onCreateSubmit = async (data) => {
    try {
      await createService(data).unwrap();
      setIsCreateDialogOpen(false);
      toast.success("Service created successfully");
    } catch (err) {
      toast.error("Failed to create service");
      console.error("Failed to create service:", err);
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await updateService({ id: editingService._id, ...data }).unwrap();
      setIsEditDialogOpen(false);
      setEditingService(null);
      toast.success("Service updated successfully");
    } catch (err) {
      toast.error("Failed to update service");
      console.error("Failed to update service:", err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService(id).unwrap();
        toast.success("Service deleted successfully");
      } catch (err) {
        toast.error("Failed to delete service");
        console.error("Failed to delete service:", err);
      }
    }
  };

  const openEditDialog = (service) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  };

  if (isLoadingServices) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Manage and track workshop service offerings.
          </p>
        </div>
        {isAdmin && (
          <>
            <Button
              className="flex gap-2 bg-primary hover:bg-primary/90 transition-all active:scale-95 shadow-md"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" /> Add New Service
            </Button>

            <ServiceFormDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              mode="create"
              defaultValues={DEFAULT_VALUES}
              onSubmit={onCreateSubmit}
              isSubmitting={isCreating}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <Card
            key={service._id}
            className="group relative hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur-sm shadow-md overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">
                  {service.serviceTitle}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {service.description}
                </CardDescription>
              </div>
              <Wrench className="h-5 w-5 text-primary/60" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Base Price
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ${service.basePrice}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Estimated Price
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ${service.estimatedCost}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {service.estimatedTime ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Due: {service.estimatedTime}
                    </div>
                  ) : (
                    <div />
                  )}

                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-primary/20 hover:border-primary hover:bg-primary/10 text-primary transition-colors"
                        onClick={() => openEditDialog(service)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-destructive/20 hover:border-destructive hover:bg-destructive/10 text-destructive transition-colors"
                        onClick={() => handleDelete(service._id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingService && (
        <ServiceFormDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) setEditingService(null);
          }}
          mode="edit"
          defaultValues={{
            serviceTitle: editingService.serviceTitle,
            description: editingService.description,
            basePrice: editingService.basePrice,
            estimatedCost: editingService.estimatedCost,
            employeeId: editingService.employeeId?._id || "",
            estimatedTime: editingService.estimatedTime,
          }}
          onSubmit={onEditSubmit}
          isSubmitting={isUpdating}
        />
      )}

      {services?.length === 0 && (
        <div className="text-center py-24 bg-card/30 rounded-3xl border-2 border-dashed border-muted-foreground/20">
          <Wrench className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No services found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Get started by creating your first workshop service above.
          </p>
        </div>
      )}
    </div>
  );
}