"use client";

import React from "react";
import { useGetAdminUsersQuery, useUpdateUserAdminMutation, useDeleteUserAdminMutation } from "@/redux/api/userApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, XCircle, Trash2, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function CustomersPage() {
  const { data: users, isLoading } = useGetAdminUsersQuery("customer");
  const [updateUser] = useUpdateUserAdminMutation();
  const [deleteUser] = useDeleteUserAdminMutation();

  const handleStatusChange = async (id, status) => {
    try {
      await updateUser({ id, status }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUser({ id, role }).unwrap();
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await deleteUser(id).unwrap();
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pendingUsers = users?.filter((u) => u.status === "Pending") || [];
  const approvedUsers = users?.filter((u) => u.status !== "Pending") || [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
        <p className="text-muted-foreground">Manage your workshop customers and account status.</p>
      </div>

      {/* Pending Approvals Section */}
      <Card className="border-blue-200 bg-blue-50/10">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center gap-2">
            <Users className="h-5 w-5" /> Pending Registrations ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable 
            users={pendingUsers} 
            onStatusChange={handleStatusChange} 
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
          {pendingUsers.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">No pending registrations.</p>
          )}
        </CardContent>
      </Card>

      {/* Approved Customers Section */}
      <Card>
        <CardHeader>
          <CardTitle>Active Customers ({approvedUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable 
            users={approvedUsers} 
            onStatusChange={handleStatusChange} 
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
          {approvedUsers.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">No active customers yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserTable({ users, onStatusChange, onRoleChange, onDelete }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select onValueChange={(val) => onRoleChange(user._id, val)} defaultValue={user.role}>
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={user.status === "Approved" ? "success" : user.status === "Pending" ? "warning" : "destructive"}
                  className="capitalize"
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.status === "Pending" ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => onStatusChange(user._id, "Approved")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onStatusChange(user._id, "Rejected")}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </>
                  ) : (
                    <Select onValueChange={(val) => onStatusChange(user._id, val)} defaultValue={user.status}>
                      <SelectTrigger className="w-[110px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(user._id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
