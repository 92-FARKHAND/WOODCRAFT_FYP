"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, Phone, MapPin, Pencil, Activity, Loader2, Lock, Key, CheckCircle2, AlertCircle, X, Save, Wrench, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUpdateProfileMutation, useChangePasswordMutation } from "@/redux/api/userApi";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();


  // Inline Edit State
  const [editingField, setEditingField] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    skill: "",
    hourlyRate: 0,
  });
  const [editStatus, setEditStatus] = useState({ type: "", message: "" });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "" });

  // RTK Query Mutations
  const [updateProfile, { isLoading: isSavingField }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  useEffect(() => {
    if (session?.user) {

      setEditData({
        name: session.user.name || "",
        email: session.user.email || "",
        contact: session.user.contact || "",
        address: session.user.address || "",
        skill: session.user.skill || "General",
        hourlyRate: session.user.hourlyRate || 0,
      });
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">You must be logged in to view this page.</p>
      </div>
    );
  }

  const user = session.user;



  const handleSaveField = async (field) => {
    setEditStatus({ type: "", message: "" });
    const value = field === "hourlyRate" ? Number(editData[field]) : editData[field];
    const result = await updateProfile({ [field]: value });

    if (result.data) {
      await update({
        ...session,
        user: {
          ...session.user,
          [field]: value
        }
      });
      setEditingField(null);
    } else if (result.error) {
      setEditStatus({ type: "error", message: result.error.data || `Failed to update ${field}` });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: "", message: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: "error", message: "Passwords do not match" });
      return;
    }

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (result.data) {
      setPasswordStatus({ type: "success", message: "Password updated successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else if (result.error) {
      setPasswordStatus({ type: "error", message: result.error.data || "Failed to update password" });
    }
  };

  const renderEditableField = (label, field, icon, type = "text") => {
    const isEditing = editingField === field;
    const IconComponent = icon;

    return (
      <div className="space-y-1 group relative animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider">{label}</Label>
          {!isEditing && (
            <button
              onClick={() => setEditingField(field)}
              className="p-1.5 rounded-full text-primary hover:bg-secondary hover:text-secondary-foreground transition-all duration-200"
              title={`Edit ${label}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2 animate-in slide-in-from-top-1 duration-200">
            <div className="relative">
              <IconComponent className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type={type}
                value={editData[field]}
                onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                className="pl-10 h-10"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 px-3 gap-1"
                onClick={() => handleSaveField(field)}
                disabled={isSavingField}
              >
                {isSavingField ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 gap-1"
                onClick={() => {
                  setEditingField(null);
                  setEditData({ ...editData, [field]: user[field] || "" });
                }}
                disabled={isSavingField}
              >
                <X className="w-3 h-3" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1">
            <IconComponent className="w-4 h-4 text-muted-foreground" />
            <p className="text-lg font-medium">
              {field === "hourlyRate" 
                ? `$${user[field] ?? 0}` 
                : (user[field] || "Not provided")}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-0">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Pending Approval Notice */}
        {(user.status === "Pending" || user.status === "Rejected") && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg">
            <div className="p-3 bg-amber-500/20 rounded-full">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-amber-500 text-lg">Need Account Approval</h3>
              <p className="text-amber-500/80 leading-relaxed">
                When your status is approved, you will be able to perform any activity. Our team is currently reviewing your account.
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 bg-card/50 backdrop-blur-md p-8 rounded-2xl border shadow-xl">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-primary/20">
              <AvatarImage src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop" alt={user.name} />
              <AvatarFallback className="text-3xl bg-primary/10">
                {user.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <Badge variant="secondary" className="capitalize px-3 py-1 text-sm font-medium">
                {user.role}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">{user.email}</p>
          </div>
        </div>

        {/* Global Error/Success for Inline Edits */}
        {editStatus.message && (
          <div className={`p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2 ${editStatus.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
            }`}>
            {editStatus.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-medium">{editStatus.message}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Personal Information */}
          <Card className="border-none bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderEditableField("Full Name", "name", User)}
              {renderEditableField("Email Address", "email", Mail, "email")}
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card className="border-none bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="w-5 h-5 text-primary" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Account Role</Label>
                <p className="text-lg font-medium capitalize">{user.role}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">User ID</Label>
                <p className="text-sm font-mono text-muted-foreground bg-muted p-2 rounded">{user.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status & Work Details */}
          <Card className="border-none bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="w-5 h-5 text-primary" />
                Status Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Account Status</Label>
                <div>
                  <Badge variant={user.status === "Approved" ? "default" : user.status === "Rejected" ? "destructive" : "secondary"} className="px-3">
                    {user.status || "Pending"}
                  </Badge>
                </div>
              </div>

              {user.role === "employee" && (
                <>
                  {renderEditableField("Professional Skill", "skill", Wrench)}
                  {renderEditableField("Hourly Rate ($)", "hourlyRate", DollarSign, "number")}
                </>
              )}

              {user.role !== "employee" && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider">Member Since</Label>
                  <div className="flex items-center gap-2 py-1">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <p className="text-lg font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact & Address */}
          <Card className="border-none bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Phone className="w-5 h-5 text-primary" />
                Contact & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderEditableField("Contact Number", "contact", Phone)}
              {renderEditableField("Mailing Address", "address", MapPin)}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="md:col-span-2 border-none bg-card/40 backdrop-blur-sm shadow-lg overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="w-5 h-5 text-destructive" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {passwordStatus.message && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${passwordStatus.type === "success" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}>
                    {passwordStatus.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <p className="text-sm font-medium">{passwordStatus.message}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
