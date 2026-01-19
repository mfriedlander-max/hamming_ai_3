"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Home, Bell, LogOut, Menu, X, Settings, Calendar, Users, UsersRound } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { BottomNav } from "./BottomNav";

const navItems = [
  { href: "/calendar", label: "Content Calendar", icon: Calendar },
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/household", label: "Household", icon: UsersRound },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface NavContentProps {
  pathname: string;
  onNavClick: () => void;
  onSignOut: () => void;
}

function NavContent({ pathname, onNavClick, onSignOut }: NavContentProps) {
  return (
    <>
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground">SubCycle</h1>
        <p className="text-sm text-muted-foreground">Smart subscription manager</p>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={onSignOut}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign out
        </Button>
      </div>
    </>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile header with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-muted-foreground" />
          </button>
          <span className="ml-3 font-bold text-foreground">SubCycle</span>
        </div>
        <NotificationBell />
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-background flex flex-col shadow-xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            <NavContent pathname={pathname} onNavClick={handleNavClick} onSignOut={handleSignOut} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-background border-r border-border flex-col">
        <NavContent pathname={pathname} onNavClick={handleNavClick} onSignOut={handleSignOut} />
      </aside>

      {/* Desktop notification bell (fixed top right) */}
      <div className="hidden md:block fixed top-4 right-4 z-40">
        <NotificationBell />
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </>
  );
}
