"use client";

import React from "react";
import {
  useGetAdminUsersQuery,
  useUpdateUserAdminMutation,
  useDeleteUserAdminMutation,
  usePayEmployeeMutation
} from "@/redux/api/userApi";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Trash2, UserCog, Wallet, IndianRupee } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EmployeesPage() {
  const { data: users, isLoading } = useGetAdminUsersQuery("employee");
  const [updateUser] = useUpdateUserAdminMutation();
  const [deleteUser] = useDeleteUserAdminMutation();
  const router = useRouter();

  const handleStatusChange = async (id, status) => {
    try {
      await updateUser({ id, status }).unwrap();
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUser({ id, role }).unwrap();
      toast.success(`Role updated to ${role}`);
    } catch (err) {
      toast.error("Failed to update role");
    }
  };
  const handlePayClick = () => {
    router.push("/dashboard/billing")
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();
        toast.success("User deleted successfully");
      } catch (err) {
        toast.error("Failed to delete user");
      }
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pendingUsers = users?.filter((u) => u.status === "Pending") || [];
  const approvedUsers = users?.filter((u) => u.status !== "Pending") || [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
        <p className="text-muted-foreground">Manage workshop employees, approvals, and roles.</p>
      </div>

      {/* Pending Approvals Section */}
      <Card className="border-orange-200 bg-orange-50/10">
        <CardHeader>
          <CardTitle className="text-orange-700 flex items-center gap-2">
            <UserCog className="h-5 w-5" /> Pending Approvals ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={pendingUsers}
            onStatusChange={handleStatusChange}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
            onPay={handlePayClick}
          />
          {pendingUsers.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">No pending requests.</p>
          )}
        </CardContent>
      </Card>

      {/* Approved Employees Section */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Employees ({approvedUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={approvedUsers}
            onStatusChange={handleStatusChange}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
            onPay={handlePayClick}
          />
          {approvedUsers.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">No approved employees yet.</p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

function UserTable({ users, onStatusChange, onRoleChange, onDelete, onPay }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Hourly Rate</TableHead>
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
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="font-semibold text-primary">
                $ {user.hourlyRate || 0}/hr
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
                  {user.status === "Approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                      onClick={() => onPay(user)}
                      disabled={user.hoursToPaid <= 0}
                    >
                      <Wallet className="h-4 w-4 mr-1" /> Pay
                    </Button>
                  )}
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
