"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/hooks/use-sidebar";
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

const navigation = [
  { name: "Tổng quan", href: "/", icon: Home },
  { name: "Hợp đồng", href: "/contracts", icon: FileText },
  { name: "Phê duyệt hợp đồng", href: "/approvals", icon: CheckCircle },
  { name: "Nhà thầu", href: "/contractors", icon: Building2 },
  { name: "Báo cáo", href: "/reports", icon: BarChart3 },
  { name: "Audit Trail", href: "/audit", icon: History },
  { name: "Người dùng", href: "/users", icon: Users },
  { name: "Bảo mật", href: "/security", icon: Shield },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();

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
        "flex flex-col bg-white border-r border-gray-200 shadow-sm",
        collapsed ? "sidebar-collapsed" : "sidebar-expanded"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed ? (
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Shield className="h-8 w-8 text-violet-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">Quản lý HĐ</h1>
              <p className="text-xs text-gray-500">Blockchain System</p>
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Shield className="h-8 w-8 text-violet-600" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 hover:bg-violet-50 hover:text-violet-600 transition-colors"
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
              // Chỉ hiển thị trang Phê duyệt cho admin và approver
              if (item.href === "/approvals") {
                return user?.role === "admin" || user?.role === "approver";
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
                        ? "bg-violet-600 text-white font-medium"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:scale-105"
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
        <div className="p-4 border-t border-gray-200">
          <div
            className="flex items-center space-x-3 cursor-pointer hover:bg-violet-50 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => router.push("/profile")}
          >
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {getInitials(user.fullName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer khi collapsed */}
      {collapsed && user && (
        <div className="p-2 border-t border-gray-200 flex justify-center">
          <div
            className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-violet-700 transition-colors"
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
