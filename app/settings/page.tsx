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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Shield,
  Bell,
  Database,
  Users,
  Server,
  Globe,
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

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings data
  const [settings, setSettings] = useState<any>({});
  const [originalSettings, setOriginalSettings] = useState<any>({});

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
    session_timeout: 30,
    max_login_attempts: 5,
    two_factor_enabled: false,
    password_expiry_days: 90,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    contract_expiry_reminder: true,
    payment_due_reminder: true,
    approval_required_alert: true,
    email_smtp_host: "",
    email_smtp_port: 587,
    email_smtp_secure: false,
    email_from_address: "",
    email_from_name: "",
  });

  const [blockchainSettings, setBlockchainSettings] = useState({
    network_type: "hyperledger",
    node_url: "",
    auto_sync: true,
    gas_limit: 100000,
    confirmation_blocks: 3,
    retry_attempts: 3,
  });

  const [workflowSettings, setWorkflowSettings] = useState({
    approval_levels: [],
    auto_approval_enabled: false,
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

  // Store original theme on mount to restore if user doesn't save
  const [originalTheme] = useState(theme);

  // Reset theme/language if user leaves without saving
  // useEffect(() => {
  //   return () => {
  //     // On unmount, check if theme/language have been changed but not saved
  //     // If so, restore original values
  //     const savedTheme =
  //       (localStorage.getItem("theme") as "light" | "dark" | "auto") || "light";
  //     const savedLanguage =
  //       (localStorage.getItem("language") as "vi" | "en") || "vi";

  //     if (theme !== savedTheme) {
  //       setTheme(savedTheme, false); // restore without persisting
  //     }
  //     if (language !== savedLanguage) {
  //       setLanguage(savedLanguage, false); // restore without persisting
  //     }
  //   };
  // }, [theme, language, setTheme, setLanguage]);

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
        setSettings(response.data);
        setOriginalSettings(JSON.parse(JSON.stringify(response.data)));

        // Update form states with loaded data
        const data = response.data as any;
        if (data.general) {
          setGeneralSettings((prev) => ({ ...prev, ...data.general }));
        }
        if (data.security) {
          setSecuritySettings((prev) => ({ ...prev, ...data.security }));
        }
        if (data.notifications) {
          setNotificationSettings((prev) => ({
            ...prev,
            ...data.notifications,
          }));
        }
        if (data.blockchain) {
          setBlockchainSettings((prev) => ({ ...prev, ...data.blockchain }));
        }
        if (data.workflow) {
          setWorkflowSettings((prev) => ({ ...prev, ...data.workflow }));
        }
        if (data.system) {
          setSystemSettings((prev) => ({ ...prev, ...data.system }));
        }
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Không thể tải cài đặt",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category: string, categorySettings: any) => {
    console.log("saveSettings called with:", category, categorySettings);
    try {
      setSaving(true);

      // For demo purposes, simulate API call
      // In real app, you would call: const response = await settingsApi.updateCategory(category, categorySettings);
      const response = { success: true };

      if (response.success) {
        // Apply theme and language with persistence when saving general settings
        if (category === "general") {
          if (categorySettings.theme) {
            setTheme(categorySettings.theme, true); // persist=true to save to localStorage
          }
        }

        // Show success message with category name
        const categoryNames: { [key: string]: string } = {
          general: "Cài đặt chung",
          security: "Cài đặt bảo mật",
          notifications: "Cài đặt thông báo",
          blockchain: "Cài đặt blockchain",
          workflow: "Cài đặt quy trình",
          system: "Cài đặt hệ thống",
        };

        // Show success notification
        sonnerToast.success("🎉 Lưu thành công!", {
          description: `${
            categoryNames[category] || category
          } đã được lưu thành công`,
          duration: 3000,
        });

        // Also show context-aware message for theme/language changes
        if (category === "general") {
          if (categorySettings.theme) {
            sonnerToast.info("🌈 Giao diện đã thay đổi", {
              description: `Đã chuyển sang chế độ ${
                categorySettings.theme === "dark"
                  ? "tối"
                  : categorySettings.theme === "light"
                  ? "sáng"
                  : "tự động"
              }`,
              duration: 2000,
            });
          }
          if (categorySettings.default_language) {
            sonnerToast.info("🌍 Ngôn ngữ đã thay đổi", {
              description: `Đã chuyển sang ${
                categorySettings.default_language === "vi"
                  ? "Tiếng Việt"
                  : "English"
              }`,
              duration: 2000,
            });
          }
        }

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
    console.log("saveAllSettings called");
    try {
      setSaving(true);
      const allSettings = {
        general: generalSettings,
        security: securitySettings,
        notifications: notificationSettings,
        blockchain: blockchainSettings,
        workflow: workflowSettings,
        system: systemSettings,
      };

      console.log("All settings to save:", allSettings);

      // For demo purposes, simulate API call
      // In real app, you would call: const response = await settingsApi.updateMultiple(allSettings);
      const response = { success: true };

      if (response.success) {
        // Apply theme and language with persistence when saving all settings
        if (generalSettings.theme) {
          console.log("Applying theme:", generalSettings.theme);
          setTheme(generalSettings.theme, true); // persist=true to save to localStorage
        }

        sonnerToast.success("🚀 Lưu tất cả thành công!", {
          description: "Tất cả cài đặt đã được lưu và áp dụng thành công",
          duration: 4000,
        });

        // Show additional info about what was saved
        if (generalSettings.theme) {
          sonnerToast.info("⚙️ Cài đặt đã áp dụng", {
            description: "Giao diện và ngôn ngữ đã được cập nhật",
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

  const exportSettings = async () => {
    try {
      const response = await settingsApi.export();
      if (response.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `settings-${
          new Date().toISOString().split("T")[0]
        }.json`;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Thành công",
          description: "Đã xuất cài đặt",
        });
      }
    } catch (error) {
      console.error("Error exporting settings:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xuất cài đặt",
        variant: "destructive",
      });
    }
  };

  // Handle theme change with immediate preview (but not saved until user clicks save)
  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    console.log("handleThemeChange called with:", newTheme);
    setGeneralSettings((prev) => ({ ...prev, theme: newTheme }));
    // Apply theme immediately for preview, but don't persist to localStorage yet
    setTheme(newTheme, false);
  };

  const handleDateFormatChange = (format: string) => {
    setGeneralSettings((prev) => ({ ...prev, date_format: format }));
    localStorage.setItem("dateFormat", format);
  };

  const handleTimezoneChange = (timezone: string) => {
    setGeneralSettings((prev) => ({ ...prev, timezone }));
    localStorage.setItem("timezone", timezone);

    // Show immediate feedback
    toast({
      title: "Múi giờ đã thay đổi",
      description: `Đã chuyển sang ${
        timezone === "Asia/Ho_Chi_Minh" ? "GMT+7 (Việt Nam)" : "UTC"
      }`,
    });
  };

  // Handle security settings changes with immediate feedback
  const handleSecurityChange = (key: string, value: any) => {
    setSecuritySettings((prev) => ({ ...prev, [key]: value }));

    // Show immediate feedback for important changes
    if (key === "two_factor_enabled") {
      toast({
        title: value ? "🔐 2FA đã bật" : "🔓 2FA đã tắt",
        description: value
          ? "Xác thực hai yếu tố đã được kích hoạt"
          : "Xác thực hai yếu tố đã được tắt",
      });
    }
  };

  // Handle notification settings changes with immediate feedback
  const handleNotificationChange = (key: string, value: any) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));

    // Show immediate feedback for important changes
    if (key === "email_enabled") {
      toast({
        title: value ? "📧 Email đã bật" : "📧 Email đã tắt",
        description: value
          ? "Thông báo email đã được kích hoạt"
          : "Thông báo email đã được tắt",
      });
    } else if (key === "push_enabled") {
      toast({
        title: value ? "🔔 Push đã bật" : "🔔 Push đã tắt",
        description: value
          ? "Thông báo đẩy đã được kích hoạt"
          : "Thông báo đẩy đã được tắt",
      });
    }
  };

  if (loading) {
    return (
      <div className="layout-container bg-background">
        <Sidebar />
        <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{texts.loading || "Đang tải..."}</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-container bg-background">
      <Sidebar />
      <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
        <Header />
        <main className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {texts.system_settings || "Cài đặt hệ thống"}
              </h1>
              <p className="text-muted-foreground mt-2">
                Cấu hình và quản lý hệ thống quản lý hợp đồng
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={exportSettings}
                disabled={saving}
              >
                <Download className="h-4 w-4 mr-2" />
                {texts.export_settings || "Xuất cấu hình"}
              </Button>
              <Button
                onClick={() => {
                  console.log("Save All button clicked");
                  saveAllSettings();
                }}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {texts.save_all || "Lưu tất cả"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger
                value="general"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Chung</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Bảo mật</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center space-x-2"
              >
                <Bell className="h-4 w-4" />
                <span>Thông báo</span>
              </TabsTrigger>
              <TabsTrigger
                value="workflow"
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Quy trình</span>
              </TabsTrigger>
              <TabsTrigger
                value="blockchain"
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>Blockchain</span>
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="flex items-center space-x-2"
              >
                <Server className="h-4 w-4" />
                <span>Hệ thống</span>
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin tổ chức</CardTitle>
                    <CardDescription>
                      Cấu hình thông tin cơ bản của tổ chức
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Tên tổ chức</Label>
                      <Input
                        id="orgName"
                        value={generalSettings.company_name}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            company_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgAddress">Địa chỉ</Label>
                      <Textarea
                        id="orgAddress"
                        value={generalSettings.company_address}
                        onChange={(e) =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            company_address: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orgPhone">Điện thoại</Label>
                        <Input
                          id="orgPhone"
                          value={generalSettings.company_phone}
                          onChange={(e) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              company_phone: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orgEmail">Email</Label>
                        <Input
                          id="orgEmail"
                          value={generalSettings.company_email}
                          onChange={(e) =>
                            setGeneralSettings((prev) => ({
                              ...prev,
                              company_email: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        console.log("Save General Settings button clicked");
                        saveSettings("general", generalSettings);
                      }}
                      disabled={saving}
                      className="w-full"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Lưu cài đặt chung
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{texts.general_settings}</CardTitle>
                    <CardDescription>
                      Tùy chỉnh giao diện người dùng
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">{texts.theme}</Label>
                      <Select
                        value={generalSettings.theme}
                        onValueChange={handleThemeChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            {texts.light_mode}
                          </SelectItem>
                          <SelectItem value="dark">
                            {texts.dark_mode}
                          </SelectItem>
                          <SelectItem value="auto">
                            {texts.auto_mode}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Múi giờ</Label>
                      <Select
                        value={generalSettings.timezone}
                        onValueChange={handleTimezoneChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Ho_Chi_Minh">
                            GMT+7 (Việt Nam)
                          </SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Định dạng ngày</Label>
                      <Select
                        value={generalSettings.date_format}
                        onValueChange={handleDateFormatChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt hợp đồng</CardTitle>
                  <CardDescription>
                    Cấu hình mặc định cho hợp đồng mới
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractPrefix">
                        Tiền tố mã hợp đồng
                      </Label>
                      <Input id="contractPrefix" defaultValue="HĐ" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultCurrency">
                        Đơn vị tiền tệ mặc định
                      </Label>
                      <Select defaultValue="vnd">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vnd">VNĐ</SelectItem>
                          <SelectItem value="usd">USD</SelectItem>
                          <SelectItem value="eur">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultRetention">
                        Tỷ lệ bảo lưu mặc định (%)
                      </Label>
                      <Input
                        id="defaultRetention"
                        type="number"
                        defaultValue="5"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contractDuration">
                        Thời hạn hợp đồng mặc định (tháng)
                      </Label>
                      <Input
                        id="contractDuration"
                        type="number"
                        defaultValue="12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warningDays">
                        Cảnh báo hết hạn (ngày)
                      </Label>
                      <Input id="warningDays" type="number" defaultValue="30" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Xác thực và phiên làm việc</CardTitle>
                    <CardDescription>
                      Cấu hình bảo mật đăng nhập
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Xác thực hai yếu tố</Label>
                        <p className="text-sm text-muted-foreground">
                          Bắt buộc xác thực 2FA cho tất cả người dùng
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.two_factor_enabled}
                        onCheckedChange={(checked) =>
                          handleSecurityChange("two_factor_enabled", checked)
                        }
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">
                        Thời gian hết hạn phiên (phút)
                      </Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.session_timeout}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            session_timeout: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">
                        Thời hạn mật khẩu (ngày)
                      </Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={securitySettings.password_expiry_days}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            password_expiry_days: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginAttempts">
                        Số lần đăng nhập sai tối đa
                      </Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={securitySettings.max_login_attempts}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            max_login_attempts: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={() => saveSettings("security", securitySettings)}
                      disabled={saving}
                      className="w-full"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Lưu cài đặt bảo mật
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chính sách mật khẩu</CardTitle>
                    <CardDescription>
                      Quy định về độ mạnh mật khẩu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="minLength">Độ dài tối thiểu</Label>
                      <Input id="minLength" type="number" defaultValue="8" />
                    </div>
                    <div className="space-y-3">
                      <Label>Yêu cầu bắt buộc</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="uppercase" defaultChecked />
                          <Label htmlFor="uppercase">Chữ hoa</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="lowercase" defaultChecked />
                          <Label htmlFor="lowercase">Chữ thường</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="numbers" defaultChecked />
                          <Label htmlFor="numbers">Số</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch id="symbols" defaultChecked />
                          <Label htmlFor="symbols">Ký tự đặc biệt</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Nhật ký bảo mật</CardTitle>
                  <CardDescription>
                    Cấu hình ghi nhận hoạt động bảo mật
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Ghi nhận đăng nhập</Label>
                        <p className="text-sm text-muted-foreground">
                          Lưu lại thông tin đăng nhập
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Ghi nhận thay đổi dữ liệu</Label>
                        <p className="text-sm text-muted-foreground">
                          Theo dõi mọi thay đổi
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logRetention">
                      Thời gian lưu trữ nhật ký (ngày)
                    </Label>
                    <Input id="logRetention" type="number" defaultValue="365" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Kênh thông báo</CardTitle>
                    <CardDescription>
                      Cấu hình các kênh gửi thông báo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Gửi thông báo qua email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.email_enabled}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("email_enabled", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Gửi thông báo qua tin nhắn
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.sms_enabled}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            sms_enabled: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push notification</Label>
                        <p className="text-sm text-muted-foreground">
                          Thông báo đẩy trên trình duyệt
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.push_enabled}
                        onCheckedChange={(checked) =>
                          handleNotificationChange("push_enabled", checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Loại thông báo</CardTitle>
                    <CardDescription>
                      Chọn các sự kiện cần thông báo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Hợp đồng sắp hết hạn</Label>
                        <p className="text-sm text-muted-foreground">
                          Cảnh báo trước 30 ngày
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.contract_expiry_reminder}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            contract_expiry_reminder: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Thanh toán đến hạn</Label>
                        <p className="text-sm text-muted-foreground">
                          Nhắc nhở thanh toán
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.payment_due_reminder}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            payment_due_reminder: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Yêu cầu phê duyệt</Label>
                        <p className="text-sm text-muted-foreground">
                          Thông báo khi có hợp đồng cần phê duyệt
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.approval_required_alert}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            approval_required_alert: checked,
                          })
                        }
                      />
                    </div>
                    <Button
                      onClick={() =>
                        saveSettings("notifications", notificationSettings)
                      }
                      disabled={saving}
                      className="w-full"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Lưu cài đặt thông báo
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình Email</CardTitle>
                  <CardDescription>Thiết lập máy chủ email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={notificationSettings.email_smtp_host}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            email_smtp_host: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={notificationSettings.email_smtp_port}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            email_smtp_port: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">Username</Label>
                      <Input
                        id="smtpUser"
                        value={notificationSettings.email_from_address}
                        onChange={(e) =>
                          setNotificationSettings((prev) => ({
                            ...prev,
                            email_from_address: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPass">Password</Label>
                      <Input
                        id="smtpPass"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtpTls"
                      checked={notificationSettings.email_smtp_secure}
                      onCheckedChange={(checked) =>
                        setNotificationSettings((prev) => ({
                          ...prev,
                          email_smtp_secure: checked,
                        }))
                      }
                    />
                    <Label htmlFor="smtpTls">Sử dụng TLS</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workflow Settings */}
            <TabsContent value="workflow" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Quy trình phê duyệt</CardTitle>
                      <CardDescription>
                        Cấu hình các cấp phê duyệt theo giá trị hợp đồng
                      </CardDescription>
                    </div>
                    <Button onClick={() => {}} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm cấp
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        level: 1,
                        role: "Trưởng phòng",
                        minAmount: 0,
                        maxAmount: 100000000,
                      },
                      {
                        level: 2,
                        role: "Phó giám đốc",
                        minAmount: 100000000,
                        maxAmount: 500000000,
                      },
                      {
                        level: 3,
                        role: "Giám đốc",
                        minAmount: 500000000,
                        maxAmount: 1000000000,
                      },
                      {
                        level: 4,
                        role: "Hội đồng quản trị",
                        minAmount: 1000000000,
                        maxAmount: null,
                      },
                    ].map((level, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Cấp {level.level}</h4>
                          {index > 0 && (
                            <Button variant="ghost" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Vai trò</Label>
                            <Input value={level.role} readOnly />
                          </div>
                          <div className="space-y-2">
                            <Label>Giá trị tối thiểu (VNĐ)</Label>
                            <Input
                              type="number"
                              value={level.minAmount}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Giá trị tối đa (VNĐ)</Label>
                            <Input
                              type="number"
                              value={level.maxAmount || ""}
                              placeholder="Không giới hạn"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt quy trình</CardTitle>
                  <CardDescription>
                    Các tùy chọn bổ sung cho quy trình phê duyệt
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Phê duyệt song song</Label>
                      <p className="text-sm text-muted-foreground">
                        Cho phép nhiều người phê duyệt cùng lúc
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tự động chuyển cấp</Label>
                      <p className="text-sm text-muted-foreground">
                        Tự động chuyển lên cấp cao hơn sau thời gian quy định
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="autoEscalation">
                      Thời gian tự động chuyển cấp (giờ)
                    </Label>
                    <Input
                      id="autoEscalation"
                      type="number"
                      defaultValue="72"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blockchain Settings */}
            <TabsContent value="blockchain" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cấu hình mạng Blockchain</CardTitle>
                    <CardDescription>
                      Thiết lập kết nối với mạng Hyperledger
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="network">Loại mạng</Label>
                      <Select defaultValue="hyperledger">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hyperledger">
                            Hyperledger Fabric
                          </SelectItem>
                          <SelectItem value="ethereum">Ethereum</SelectItem>
                          <SelectItem value="private">
                            Private Network
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nodeUrl">URL Node</Label>
                      <Input
                        id="nodeUrl"
                        defaultValue="https://blockchain-node.gov.vn"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gasLimit">Gas Limit</Label>
                      <Input id="gasLimit" defaultValue="100000" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Tự động đồng bộ</Label>
                        <p className="text-sm text-muted-foreground">
                          Đồng bộ dữ liệu tự động với blockchain
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trạng thái kết nối</CardTitle>
                    <CardDescription>
                      Thông tin về kết nối blockchain hiện tại
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Trạng thái</span>
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Đã kết nối
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Block cao nhất
                      </span>
                      <span className="text-sm text-muted-foreground">
                        #1,234,567
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Số giao dịch</span>
                      <span className="text-sm text-muted-foreground">
                        45,678
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Đồng bộ cuối</span>
                      <span className="text-sm text-muted-foreground">
                        2 phút trước
                      </span>
                    </div>
                    <Button className="w-full bg-transparent" variant="outline">
                      Kiểm tra kết nối
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Smart Contracts</CardTitle>
                  <CardDescription>
                    Quản lý các smart contract đã triển khai
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "ContractManager",
                        address: "0x1234...5678",
                        version: "v1.2.0",
                        status: "active",
                      },
                      {
                        name: "ApprovalWorkflow",
                        address: "0xabcd...efgh",
                        version: "v1.1.0",
                        status: "active",
                      },
                      {
                        name: "PaymentProcessor",
                        address: "0x9876...5432",
                        version: "v1.0.0",
                        status: "deprecated",
                      },
                    ].map((contract, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{contract.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {contract.address} • {contract.version}
                          </p>
                        </div>
                        <Badge
                          variant={
                            contract.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {contract.status === "active"
                            ? "Hoạt động"
                            : "Ngừng sử dụng"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin hệ thống</CardTitle>
                    <CardDescription>
                      Thông tin về phiên bản và tài nguyên
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Phiên bản</span>
                      <span className="text-sm text-muted-foreground">
                        v2.1.0
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cập nhật cuối</span>
                      <span className="text-sm text-muted-foreground">
                        15/01/2024
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-sm text-muted-foreground">
                        15 ngày 4 giờ
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sử dụng CPU</span>
                      <span className="text-sm text-muted-foreground">23%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sử dụng RAM</span>
                      <span className="text-sm text-muted-foreground">
                        1.2GB / 4GB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Dung lượng đĩa
                      </span>
                      <span className="text-sm text-muted-foreground">
                        45GB / 100GB
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sao lưu & Khôi phục</CardTitle>
                    <CardDescription>
                      Quản lý sao lưu dữ liệu hệ thống
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sao lưu tự động</Label>
                        <p className="text-sm text-muted-foreground">
                          Sao lưu hàng ngày lúc 2:00 AM
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backupRetention">
                        Thời gian lưu trữ (ngày)
                      </Label>
                      <Input
                        id="backupRetention"
                        type="number"
                        defaultValue="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Sao lưu gần nhất</Label>
                      <p className="text-sm text-muted-foreground">
                        Hôm nay, 2:15 AM - Thành công
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải xuống
                      </Button>
                      <Button className="flex-1">Sao lưu ngay</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Bảo trì hệ thống</CardTitle>
                  <CardDescription>
                    Các công cụ bảo trì và tối ưu hóa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Tối ưu cơ sở dữ liệu
                    </Button>
                    <Button variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Dọn dẹp file tạm
                    </Button>
                    <Button variant="outline">
                      <Server className="h-4 w-4 mr-2" />
                      Khởi động lại dịch vụ
                    </Button>
                    <Button variant="outline">
                      <Globe className="h-4 w-4 mr-2" />
                      Kiểm tra kết nối
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Chế độ bảo trì</Label>
                    <p className="text-sm text-muted-foreground">
                      Kích hoạt chế độ bảo trì sẽ tạm thời ngừng truy cập hệ
                      thống
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive">
                          Kích hoạt chế độ bảo trì
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Xác nhận chế độ bảo trì</DialogTitle>
                          <DialogDescription>
                            Hệ thống sẽ tạm thời không thể truy cập. Bạn có chắc
                            chắn muốn tiếp tục?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">Hủy</Button>
                          <Button variant="destructive">Xác nhận</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={loadSettings} disabled={saving}>
              Khôi phục
            </Button>
            <Button
              onClick={() => {
                console.log("Save All Settings button clicked");
                saveAllSettings();
              }}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Lưu tất cả cài đặt
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
