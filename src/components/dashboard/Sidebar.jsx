"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Box,
  Users,
  UserCheck,
  CreditCard,
  FileText,
  Receipt,
  Wallet,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const generalLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/services", label: "Services", icon: Wrench },
];

const adminLinks = [
  { href: "/dashboard/inventory", label: "Inventory", icon: Box },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/customers", label: "Customers", icon: UserCheck },
  { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
];

const customerLinks = [
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
];

const employeeLinks = [
  { href: "/dashboard/payments", label: "Payments", icon: Wallet },
];

export function Sidebar({ role, status, isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();

  let links = [...generalLinks];

  if (role === "admin") {
    links = [...links, ...adminLinks];
  } else if (role === "customer") {
    links = [...links, ...customerLinks];
  } else if (role === "employee") {
    links = [...links, ...employeeLinks];
  }

  // If status is Pending or Rejected, hide all links as per user request
  const isApproved = status?.toLowerCase() === "approved";
  if (!isApproved) {
    links = [];
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background pt-16 transition-all duration-300 overflow-hidden",
        isCollapsed ? "w-0 border-none" : "w-64 border-r border-border"
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "fixed top-20 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-md hover:bg-accent transition-all duration-300",
          isCollapsed ? "left-4" : "left-[208px]"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>

      <div className={cn(
        "flex h-full flex-col px-3 py-4 transition-opacity duration-300 mt-9",
        isCollapsed ? "opacity-0" : "opacity-100"
      )}>

        <ul className="space-y-2 font-medium">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  title={isCollapsed ? link.label : ""}
                  className={cn(
                    "group flex items-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200",
                    isActive && "bg-accent text-accent-foreground font-semibold",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition duration-75 group-hover:text-accent-foreground",
                    !isCollapsed && "mr-3"
                  )} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap transition-opacity duration-300 opacity-100">
                      {link.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
