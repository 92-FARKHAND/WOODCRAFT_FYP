"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetSupplierQuery } from "@/redux/api/supplierApi";
import { 
  Loader2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Truck,
  Calendar,
  Building,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SupplierDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id; // Access the ID from the URL

  // Pass the ID to the API call
  const { data: supplier, isLoading, error } = useGetSupplierQuery(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Fetching supplier details...</p>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="text-muted-foreground">{error?.data?.error || "Supplier not found"}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-10 w-10" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Profile</h1>
          <p className="text-muted-foreground">Detailed overview of provider information.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info Card */}
        <Card className="lg:col-span-1 rounded-2xl border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden h-fit">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
             <div className="h-20 w-20 rounded-2xl bg-background shadow-lg flex items-center justify-center text-primary border border-primary/10">
                <Truck className="h-10 w-10" />
             </div>
          </div>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{supplier.name}</h2>
              <p className="text-sm text-muted-foreground">{supplier.email}</p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <ShieldCheck className="w-3 h-3 mr-1" /> {supplier.status}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 uppercase tracking-wider text-[10px]">
                {supplier.role}
              </Badge>
            </div>
          </CardContent>
          <div className="p-6 border-t border-border/50 bg-muted/20 space-y-4">
             <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{supplier.contact || "Not provided"}</span>
             </div>
             <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{supplier.address || "No address provided"}</span>
             </div>
          </div>
        </Card>

        {/* Right Column: Detailed Tabs/Sections */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="rounded-2xl border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                 <CardTitle className="text-xl flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Business Information
                 </CardTitle>
                 <CardDescription>Official registration and identification details.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Internal ID</span>
                    <p className="font-mono text-sm bg-muted/50 p-2 rounded">{supplier._id}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Join Date</span>
                    <p className="flex items-center gap-2">
                       <Calendar className="h-4 w-4 text-primary" />
                       {new Date(supplier.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                       })}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Verification Status</span>
                    <p className="flex items-center gap-2 text-green-500 font-semibold">
                       <CheckCircle2 className="h-4 w-4" />
                       Fully Verified
                    </p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Primary Category</span>
                    <p>Raw Material Supply</p>
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-2xl border-none shadow-xl bg-card/50 backdrop-blur-sm border border-dashed border-primary/20">
              <CardContent className="p-8 text-center space-y-4">
                 <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                    <User className="h-6 w-6 text-primary/40" />
                 </div>
                 <h3 className="font-semibold italic">"Working with Woodcraft Studio has been a great partnership for quality timber."</h3>
                 <p className="text-sm text-muted-foreground">— Supplier Note</p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
