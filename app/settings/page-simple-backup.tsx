"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Users,
  Server,
  Download,
  Upload,
  Trash2,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { settingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { toast as sonnerToast } from "sonner";

export default function SettingsPage() {
  const { collapsed } = useSidebar();
  const { toast } = useToast();
  const { theme, setTheme, texts } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    system_name: "",
    company_name: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    timezone: "Asia/Ho_Chi_Minh",
    date_format: "DD/MM/YYYY",
    currency: "VND",
    theme: theme,
  });

  const [securitySettings, setSecuritySettings] = useState({
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: false,
    password_expiry_days: 90,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    two_factor_enabled: false,
    session_timeout_minutes: 30,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: false,
    contract_approval_notifications: true,
    payment_notifications: true,
    deadline_notifications: true,
    security_notifications: true,
    maintenance_notifications: true,
  });

  const [workflowSettings, setWorkflowSettings] = useState({
    require_approval: true,
    multi_level_approval: false,
    auto_approval_limit: 10000000,
    parallel_approval: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenance_mode: false,
    backup_enabled: true,
    backup_frequency: "daily",
    backup_retention_days: 30,
    log_level: "info",
    max_file_upload_size: 10,
    allowed_file_types: [],
    audit_enabled: true,
    rate_limit_requests: 100,
    rate_limit_window: 15,
  });

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, []);

  // Sync generalSettings with context values
  useEffect(() => {
    setGeneralSettings((prev) => ({
      ...prev,
      theme: theme,
    }));
  }, [theme]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getAll();
      if (response.success && response.data) {
        const settings = response.data as any;
        if (settings.general) setGeneralSettings(settings.general);
        if (settings.security) setSecuritySettings(settings.security);
        if (settings.notifications) setNotificationSettings(settings.notifications);
        if (settings.workflow) setWorkflowSettings(settings.workflow);
        if (settings.system) setSystemSettings(settings.system);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "❌ Lỗi",
        description: "Không thể tải cài đặt",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category: string, data: any) => {
    try {
      setSaving(true);
      const response = await settingsApi.updateCategory(category, data);

      if (response.success) {
        // Apply theme immediately if it's general settings
        if (category === "general" && data.theme) {
          setTheme(data.theme, true); // persist=true to save to localStorage
        }

        // Show success notification
        sonnerToast.success("🎉 Lưu thành công!", {
          description: `${texts.general_settings} đã được cập nhật`,
          duration: 2000,
        });

        // Reload settings to get updated values (in real app)
        // await loadSettings();
      } else {
        toast({
          title: "❌ Lỗi",
          description: "Không thể lưu cài đặt",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      sonnerToast.error("🚫 Lỗi kết nối", {
        description: "Không thể kết nối đến server. Kiểm tra kết nối mạng.",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      const allSettings = {
        general: generalSettings,
        security: securitySettings,
        notifications: notificationSettings,
        workflow: workflowSettings,
        system: systemSettings,
      };

      const response = await settingsApi.updateCategory("all", allSettings);

      if (response.success) {
        // Apply theme
        if (generalSettings.theme) {
          setTheme(generalSettings.theme, true); // persist=true to save to localStorage
        }

        // Show success notification
        toast({
          title: "✅ Thành công",
          description: "Tất cả cài đặt đã được lưu và áp dụng thành công",
        });

        if (generalSettings.theme) {
          sonnerToast.info(`⚙️ Cài đặt đã áp dụng`, {
            description: "Giao diện đã được cập nhật",
            duration: 2000,
          });
        }
        // await loadSettings();
      } else {
        toast({
          title: "❌ Lỗi",
          description: "Không thể lưu cài đặt",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving all settings:", error);
      sonnerToast.error("🚫 Lỗi kết nối", {
        description: "Không thể kết nối đến server. Kiểm tra kết nối mạng.",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle theme change with immediate preview (but not saved until user clicks save)
  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    console.log("handleThemeChange called with:", newTheme);
    setGeneralSettings((prev) => ({ ...prev, theme: newTheme }));
    // Apply theme immediately for preview, but don't persist to localStorage yet
    setTheme(newTheme, false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className={cn("flex-1 flex flex-col", collapsed ? "ml-16" : "ml-64")}>
          <Header />
          <main className="flex-1 p-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className={cn("flex-1 flex flex-col", collapsed ? "ml-16" : "ml-64")}>
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {texts.system_settings}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Cấu hình và quản lý hệ thống quản lý hợp đồng
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={saveAllSettings}
                  disabled={saving}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4 mr-2" />
                  )}
                  {texts.save_all}
                </Button>
              </div>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger value="general" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Chung</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Bảo mật</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Thông báo</span>
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Quy trình</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-2">
                  <Server className="w-4 h-4" />
                  <span>Hệ thống</span>
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Cài đặt chung</CardTitle>
                    <CardDescription>
                      Cấu hình thông tin cơ bản của hệ thống
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="system_name">Tên hệ thống</Label>
                        <Input
                          id="system_name"
                          value={generalSettings.system_name}
                          onChange={(e) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              system_name: e.target.value,
                            }))
                          }
                          placeholder="Nhập tên hệ thống"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Tên công ty</Label>
                        <Input
                          id="company_name"
                          value={generalSettings.company_name}
                          onChange={(e) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              company_name: e.target.value,
                            }))
                          }
                          placeholder="Nhập tên công ty"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_address">Địa chỉ</Label>
                      <Textarea
                        id="company_address"
                        value={generalSettings.company_address}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            company_address: e.target.value,
                          }))
                        }
                        placeholder="Nhập địa chỉ công ty"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company_phone">Điện thoại</Label>
                        <Input
                          id="company_phone"
                          value={generalSettings.company_phone}
                          onChange={(e) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              company_phone: e.target.value,
                            }))
                          }
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_email">Email</Label>
                        <Input
                          id="company_email"
                          type="email"
                          value={generalSettings.company_email}
                          onChange={(e) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              company_email: e.target.value,
                            }))
                          }
                          placeholder="Nhập email công ty"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Giao diện</Label>
                        <Select
                          value={generalSettings.theme}
                          onValueChange={handleThemeChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Sáng</SelectItem>
                            <SelectItem value="dark">Tối</SelectItem>
                            <SelectItem value="auto">Tự động</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Múi giờ</Label>
                        <Select
                          value={generalSettings.timezone}
                          onValueChange={(value) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              timezone: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</SelectItem>
                            <SelectItem value="Asia/Bangkok">Bangkok (UTC+7)</SelectItem>
                            <SelectItem value="Asia/Singapore">Singapore (UTC+8)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                        <Select
                          value={generalSettings.currency}
                          onValueChange={(value) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              currency: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VND">Việt Nam Đồng (VND)</SelectItem>
                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => saveSettings("general", generalSettings)}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Lưu cài đặt chung
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Cài đặt bảo mật</CardTitle>
                    <CardDescription>
                      Cấu hình chính sách bảo mật và xác thực
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Password Policy */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Chính sách mật khẩu</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="password_min_length">Độ dài tối thiểu</Label>
                          <Input
                            id="password_min_length"
                            type="number"
                            value={securitySettings.password_min_length}
                            onChange={(e) =>
                              setSecuritySettings((prev) => ({
                                ...prev,
                                password_min_length: parseInt(e.target.value),
                              }))
                            }
                            min="6"
                            max="50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password_expiry_days">Hết hạn sau (ngày)</Label>
                          <Input
                            id="password_expiry_days"
                            type="number"
                            value={securitySettings.password_expiry_days}
                            onChange={(e) =>
                              setSecuritySettings((prev) => ({
                                ...prev,
                                password_expiry_days: parseInt(e.target.value),
                              }))
                            }
                            min="30"
                            max="365"
                          />
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require_uppercase">Yêu cầu chữ hoa</Label>
                          <Switch
                            id="require_uppercase"
                            checked={securitySettings.password_require_uppercase}
                            onCheckedChange={(checked) =>
                              setSecuritySettings((prev) => ({
                                ...prev,
                                password_require_uppercase: checked,
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require_lowercase">Yêu cầu chữ thường</Label>
                          <Switch
                            id="require_lowercase"
                            checked={securitySettings.password_require_lowercase}
                            onCheckedChange={(checked) =>
                              setSecuritySettings((prev) => ({
                                ...prev,
                                password_require_lowercase: checked,
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require_numbers">Yêu cầu số</Label>
                          <Switch
                            id="require_numbers"
                            checked={securitySettings.password_require_numbers}
                            onCheckedChange={(checked) =>
                              setSecuritySettings((prev) => ({
                                ...prev,
                                password_require_numbers: checked,
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="require_symbols">Yêu cầu ký tự đặc biệt</Label>
                          <Switch
                            id="require_symbols"
                            checked={securitySettings.password_require_symbols}
                            onCheckedChange={(checked) =>
                              setSecuritySettings((prev) => ({
                                ...prev,
                                password_require_symbols: checked,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => saveSettings("security", securitySettings)}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Lưu cài đặt bảo mật
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other tabs can be implemented similarly */}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}