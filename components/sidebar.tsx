"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/hooks/use-sidebar";
import { useTheme } from "@/contexts/theme-context";
import {
  FileText,
  BarChart3,
  Users,
  Settings,
  Shield,
  History,
  Home,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";

const getNavigation = (texts: Record<string, string>) => [
  {
    name: texts.dashboard || "Tổng quan",
    nameEn: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: texts.contracts || "Hợp đồng",
    nameEn: "Contracts",
    href: "/contracts",
    icon: FileText,
  },
  {
    name: texts.approvals || "Phê duyệt hợp đồng",
    nameEn: "Approvals",
    href: "/approvals",
    icon: CheckCircle,
  },
  {
    name: texts.contractors || "Nhà thầu",
    nameEn: "Contractors",
    href: "/contractors",
    icon: Building2,
  },
  {
    name: texts.reports || "Báo cáo",
    nameEn: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: texts.audit || "Audit Trail",
    nameEn: "Audit Trail",
    href: "/audit",
    icon: History,
  },
  {
    name: "Blockchain",
    nameEn: "Blockchain",
    href: "/blockchain",
    icon: Shield,
  },
  {
    name: texts.users || "Người dùng",
    nameEn: "Users",
    href: "/users",
    icon: Users,
  },
  {
    name: texts.security || "Bảo mật",
    nameEn: "Security",
    href: "/security",
    icon: Shield,
  },
  {
    name: texts.settings || "Cài đặt",
    nameEn: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const { texts } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = getNavigation(texts);

  // Helper function để tạo initials từ tên
  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const names = fullName.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm",
        collapsed ? "sidebar-collapsed" : "sidebar-expanded"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed ? (
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Shield className="h-8 w-8 text-violet-600 dark:text-violet-400" />
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {mounted ? "Quản lý HĐ" : "Contract Mgmt"}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Blockchain System
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Shield className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation
            .filter((item) => {
              // Chỉ hiển thị trang Users cho admin
              if (item.href === "/users") {
                return user?.role === "admin";
              }
              // Chỉ hiển thị trang Phê duyệt cho admin, manager và approver
              if (item.href === "/approvals") {
                return (
                  user?.role === "admin" ||
                  user?.role === "manager" ||
                  user?.role === "approver"
                );
              }
              return true;
            })
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left transition-all duration-200",
                      collapsed ? "px-2" : "px-3",
                      isActive
                        ? "bg-violet-600 dark:bg-violet-700 text-white font-medium"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:scale-105"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        collapsed ? "mr-0" : "mr-3",
                        isActive ? "text-white" : ""
                      )}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              );
            })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!collapsed && user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div
            className="flex items-center space-x-3 cursor-pointer hover:bg-violet-50 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => router.push("/profile")}
          >
            <div className="w-8 h-8 bg-violet-600 dark:bg-violet-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {getInitials(user.fullName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer khi collapsed */}
      {collapsed && user && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-center">
          <div
            className="w-8 h-8 bg-violet-600 dark:bg-violet-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors"
            onClick={() => router.push("/profile")}
            title={user.fullName}
          >
            <span className="text-xs font-medium text-white">
              {getInitials(user.fullName)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
