import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import EmployeeDashboard from "@/components/dashboard/EmployeeDashboard";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || "customer"; // Default to customer if role is missing

  return (
    <div className="min-h-full animate-in fade-in zoom-in-95 duration-500 pb-10">
      {/* Dynamic Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
          Dashboard
        </h1>
        <div className="mt-2 h-1.5 w-20 rounded-full bg-primary" />
      </div>

      {/* Role-Based Views */}
      {role === "admin" && <AdminDashboard user={session?.user} />}
      {role === "employee" && <EmployeeDashboard user={session?.user} />}
      {role === "customer" && <CustomerDashboard user={session?.user} />}
      
      {/* Fallback for unknown roles */}
      {!["admin", "employee", "customer"].includes(role) && (
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-bold">Access Limited</h2>
          <p className="text-muted-foreground mt-2">Please contact support to verify your account role.</p>
        </div>
      )}
    </div>
  );
}
