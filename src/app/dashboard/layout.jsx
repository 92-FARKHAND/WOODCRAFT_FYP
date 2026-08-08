import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/Auth");
  }

  const role = session?.user?.role || "customer";
  const status = session?.user?.status || "Pending";

  return (
    <DashboardShell role={role} status={status}>
      {children}
    </DashboardShell>
  );
}
