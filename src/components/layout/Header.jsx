"use client";

import Link from "next/link";
import { CircleUser, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import NotificationBell from "../dashboard/NotificationBell";

export default function Header({ children, wrapNav = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-background/80 backdrop-blur-md border-b transition-all duration-300">
      <div className="flex items-center">
        <img src="/logo.png" width="30px" className="rounded-full shadow-md" alt="WoodForm Studio" />
        <Link href="/">
          <h1 className="px-4 text-xl md:text-2xl font-bold tracking-tight hover:text-primary transition-colors">
            WOODFORM STUDIO
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {wrapNav ? (
          <div className="nav-wrapper">
            {children}
          </div>
        ) : (
          <>
            {children}
            {session?.user?.role === "admin" && <NotificationBell />}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="User menu"
              >
                <CircleUser className="w-6 h-6" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border rounded-xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden">
                  {session?.user && (
                    <div className="px-4 py-3 border-b bg-muted/30">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{session.user.email}</p>
                    </div>
                  )}

                  <div className="py-1">
                    {session?.user?.status?.toLowerCase() === "approved" && (
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Profile Settings</span>
                    </Link>
                  </div>

                  <div className="h-px bg-border my-1" />

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
