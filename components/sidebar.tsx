"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

const navigation = [
  { name: "Tổng quan", href: "/", icon: Home },
  { name: "Hợp đồng", href: "/contracts", icon: FileText },
  { name: "Nhà thầu", href: "/contractors", icon: Building2 },
  { name: "Báo cáo", href: "/reports", icon: BarChart3 },
  { name: "Audit Trail", href: "/audit", icon: History },
  { name: "Người dùng", href: "/users", icon: Users },
  { name: "Bảo mật", href: "/security", icon: Shield },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-violet-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-800">Quản lý HĐ</h1>
              <p className="text-xs text-gray-500">Blockchain System</p>
            </div>
          </div>
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
          {navigation.map((item) => {
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
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-500 truncate">admin@gov.vn</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
