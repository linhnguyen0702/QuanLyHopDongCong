"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function SettingsPage() {
  const { collapsed } = useSidebar();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    contractExpiry: true,
    paymentDue: true,
    approvalRequired: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAttempts: "5",
  });

  const [blockchain, setBlockchain] = useState({
    network: "hyperledger",
    nodeUrl: "https://blockchain-node.gov.vn",
    autoSync: true,
    gasLimit: "100000",
  });

  const [approvalWorkflow, setApprovalWorkflow] = useState([
    { level: 1, role: "Trưởng phòng", minAmount: 0, maxAmount: 100000000 },
    {
      level: 2,
      role: "Phó giám đốc",
      minAmount: 100000000,
      maxAmount: 500000000,
    },
    { level: 3, role: "Giám đốc", minAmount: 500000000, maxAmount: 1000000000 },
    {
      level: 4,
      role: "Hội đồng quản trị",
      minAmount: 1000000000,
      maxAmount: null,
    },
  ]);

  const addApprovalLevel = () => {
    const newLevel = {
      level: approvalWorkflow.length + 1,
      role: "",
      minAmount: 0,
      maxAmount: null,
    };
    setApprovalWorkflow([...approvalWorkflow, newLevel]);
  };

  const removeApprovalLevel = (index: number) => {
    setApprovalWorkflow(approvalWorkflow.filter((_, i) => i !== index));
  };

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
                Cài đặt hệ thống
              </h1>
              <p className="text-muted-foreground mt-2">
                Cấu hình và quản lý hệ thống quản lý hợp đồng
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Xuất cấu hình
              </Button>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Nhập cấu hình
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
                      <Input id="orgName" defaultValue="Sở Xây dựng Hà Nội" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgCode">Mã tổ chức</Label>
                      <Input id="orgCode" defaultValue="SXD-HN-001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgAddress">Địa chỉ</Label>
                      <Textarea
                        id="orgAddress"
                        defaultValue="Số 1 Phạm Ngũ Lão, Hoàn Kiếm, Hà Nội"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="orgPhone">Điện thoại</Label>
                        <Input id="orgPhone" defaultValue="024-3825-1234" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="orgEmail">Email</Label>
                        <Input
                          id="orgEmail"
                          defaultValue="info@sxd.hanoi.gov.vn"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cài đặt giao diện</CardTitle>
                    <CardDescription>
                      Tùy chỉnh giao diện người dùng
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Chủ đề</Label>
                      <Select defaultValue="light">
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
                      <Label htmlFor="language">Ngôn ngữ</Label>
                      <Select defaultValue="vi">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Múi giờ</Label>
                      <Select defaultValue="asia/ho_chi_minh">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asia/ho_chi_minh">
                            GMT+7 (Việt Nam)
                          </SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Định dạng ngày</Label>
                      <Select defaultValue="dd/mm/yyyy">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
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
                        checked={security.twoFactor}
                        onCheckedChange={(checked) =>
                          setSecurity({ ...security, twoFactor: checked })
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
                        value={security.sessionTimeout}
                        onChange={(e) =>
                          setSecurity({
                            ...security,
                            sessionTimeout: e.target.value,
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
                        value={security.passwordExpiry}
                        onChange={(e) =>
                          setSecurity({
                            ...security,
                            passwordExpiry: e.target.value,
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
                        value={security.loginAttempts}
                        onChange={(e) =>
                          setSecurity({
                            ...security,
                            loginAttempts: e.target.value,
                          })
                        }
                      />
                    </div>
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
                        checked={notifications.email}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, email: checked })
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
                        checked={notifications.sms}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, sms: checked })
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
                        checked={notifications.push}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, push: checked })
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
                        checked={notifications.contractExpiry}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            contractExpiry: checked,
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
                        checked={notifications.paymentDue}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            paymentDue: checked,
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
                        checked={notifications.approvalRequired}
                        onCheckedChange={(checked) =>
                          setNotifications({
                            ...notifications,
                            approvalRequired: checked,
                          })
                        }
                      />
                    </div>
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
                      <Input id="smtpHost" defaultValue="smtp.gov.vn" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input id="smtpPort" type="number" defaultValue="587" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">Username</Label>
                      <Input
                        id="smtpUser"
                        defaultValue="system@sxd.hanoi.gov.vn"
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
                    <Switch id="smtpTls" defaultChecked />
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
                    <Button onClick={addApprovalLevel} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm cấp
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {approvalWorkflow.map((level, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Cấp {level.level}</h4>
                          {approvalWorkflow.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeApprovalLevel(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <Label>Vai trò</Label>
                            <Input
                              value={level.role}
                              onChange={(e) => {
                                const newWorkflow = [...approvalWorkflow];
                                newWorkflow[index].role = e.target.value;
                                setApprovalWorkflow(newWorkflow);
                              }}
                              placeholder="Nhập vai trò"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Giá trị tối thiểu (VNĐ)</Label>
                            <Input
                              type="number"
                              value={level.minAmount}
                              onChange={(e) => {
                                const newWorkflow = [...approvalWorkflow];
                                newWorkflow[index].minAmount = Number.parseInt(
                                  e.target.value
                                );
                                setApprovalWorkflow(newWorkflow);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Giá trị tối đa (VNĐ)</Label>
                            <Input
                              type="number"
                              value={level.maxAmount || ""}
                              onChange={(e) => {
                                const newWorkflow = [...approvalWorkflow];
                                newWorkflow[index].maxAmount = e.target.value
                                  ? Number.parseInt(e.target.value)
                                  : null;
                                setApprovalWorkflow(newWorkflow);
                              }}
                              placeholder="Không giới hạn"
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
                      <Select
                        value={blockchain.network}
                        onValueChange={(value) =>
                          setBlockchain({ ...blockchain, network: value })
                        }
                      >
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
                        value={blockchain.nodeUrl}
                        onChange={(e) =>
                          setBlockchain({
                            ...blockchain,
                            nodeUrl: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gasLimit">Gas Limit</Label>
                      <Input
                        id="gasLimit"
                        value={blockchain.gasLimit}
                        onChange={(e) =>
                          setBlockchain({
                            ...blockchain,
                            gasLimit: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Tự động đồng bộ</Label>
                        <p className="text-sm text-muted-foreground">
                          Đồng bộ dữ liệu tự động với blockchain
                        </p>
                      </div>
                      <Switch
                        checked={blockchain.autoSync}
                        onCheckedChange={(checked) =>
                          setBlockchain({ ...blockchain, autoSync: checked })
                        }
                      />
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
            <Button variant="outline">Khôi phục mặc định</Button>
            <Button>Lưu cài đặt</Button>
          </div>
        </main>
      </div>
    </div>
  );
}
