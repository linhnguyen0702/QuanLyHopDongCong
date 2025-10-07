"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface ThemeContextType {
  theme: "light" | "dark" | "auto";
  setTheme: (theme: "light" | "dark" | "auto", persist?: boolean) => void;
  toggleTheme: () => void;
  texts: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Texts chỉ dùng tiếng Việt
const texts = {
  // Header và Navigation
  system_title: "Hệ thống Quản lý Hợp đồng Công",
  dashboard: "Tổng quan",
  contracts: "Hợp đồng",
  contractors: "Nhà thầu",
  users: "Người dùng",
  approvals: "Phê duyệt hợp đồng",
  reports: "Báo cáo",
  audit: "Audit Trail",
  settings: "Cài đặt",
  security: "Bảo mật",
  profile: "Hồ sơ",
  logout: "Đăng xuất",

  // Settings page
  general_settings: "Cài đặt chung",
  security_settings: "Cài đặt bảo mật",
  notification_settings: "Cài đặt thông báo",
  blockchain_settings: "Cài đặt blockchain",
  workflow_settings: "Cài đặt quy trình",
  system_settings: "Cài đặt hệ thống",
  language: "Ngôn ngữ",
  theme: "Giao diện",
  light_mode: "Sáng",
  dark_mode: "Tối",
  auto_mode: "Tự động",
  save_settings: "Lưu cài đặt",
  save_all: "Lưu tất cả",
  export_settings: "Xuất cài đặt",
  import_settings: "Nhập cài đặt",

  // Common actions
  save: "Lưu",
  cancel: "Hủy",
  delete: "Xóa",
  edit: "Sửa",
  add: "Thêm",
  search: "Tìm kiếm",
  filter: "Lọc",
  export: "Xuất",
  import: "Nhập",
  refresh: "Làm mới",

  // Messages
  settings_saved: "Cài đặt đã được lưu thành công",
  theme_changed: "Giao diện đã thay đổi",
  error: "Lỗi",
  success: "Thành công",
  loading: "Đang tải...",

  // Additional common texts
  notifications: "Thông báo",
  search_placeholder: "Tìm kiếm hợp đồng, nhà thầu...",
  account: "Tài khoản",
  logout_success: "Đăng xuất thành công!",
  logout_error: "Có lỗi xảy ra khi đăng xuất",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<"light" | "dark" | "auto">("light");
  const [mounted, setMounted] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    setMounted(true);

    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark" | "auto") || "light";

    setThemeState(savedTheme);

    // Apply theme immediately
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: "light" | "dark" | "auto") => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      // Auto theme - follow system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const setTheme = (
    newTheme: "light" | "dark" | "auto",
    persist: boolean = true
  ) => {
    console.log("setTheme called with:", newTheme, "persist:", persist);
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      applyTheme(newTheme);
      // Only save to localStorage if persist is true (when user actually saves)
      if (persist) {
        console.log("Persisting theme to localStorage:", newTheme);
        localStorage.setItem("theme", newTheme);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    texts,
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
