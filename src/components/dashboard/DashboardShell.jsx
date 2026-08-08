"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardShell({ children, role, status }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        role={role} 
        status={status}
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      <div 
        className={cn(
          "p-4 mt-5 h-full transition-all duration-300",
          isCollapsed ? "sm:ml-0" : "sm:ml-64"
        )}
      >
        <main className="max-w-7xl mx-auto h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
