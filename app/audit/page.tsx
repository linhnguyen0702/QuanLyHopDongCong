"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  Shield,
  FileText,
  User,
  CalendarIcon,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Mock audit data
const auditLogs = [
  {
    id: "audit-001",
    timestamp: "2024-01-15T10:30:00Z",
    action: "CREATE_CONTRACT",
    actionText: "Tạo hợp đồng mới",
    user: "Nguyễn Văn A",
    userRole: "Quản lý dự án",
    entityType: "CONTRACT",
    entityId: "HĐ-2024-001",
    entityName: "Xây dựng cầu Nhật Tân 2",
    details: "Tạo hợp đồng với giá trị 450M VNĐ",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890",
    status: "SUCCESS",
    severity: "INFO",
  },
  {
    id: "audit-002",
    timestamp: "2024-01-16T14:20:00Z",
    action: "APPROVE_CONTRACT",
    actionText: "Phê duyệt hợp đồng",
    user: "Trần Thị B",
    userRole: "Giám đốc",
    entityType: "CONTRACT",
    entityId: "HĐ-2024-001",
    entityName: "Xây dựng cầu Nhật Tân 2",
    details: "Phê duyệt hợp đồng sau khi xem xét",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    blockchainHash: "0x2b3c4d5e6f7890abcdef1234567890ab",
    status: "SUCCESS",
    severity: "INFO",
  },
  {
    id: "audit-003",
    timestamp: "2024-01-17T09:15:00Z",
    action: "LOGIN_FAILED",
    actionText: "Đăng nhập thất bại",
    user: "unknown@example.com",
    userRole: "N/A",
    entityType: "USER",
    entityId: "unknown",
    entityName: "Tài khoản không xác định",
    details: "Thử đăng nhập với mật khẩu sai 3 lần",
    ipAddress: "203.162.4.191",
    userAgent: "Mozilla/5.0 (Linux; Android 10)",
    blockchainHash: null,
    status: "FAILED",
    severity: "WARNING",
  },
  {
    id: "audit-004",
    timestamp: "2024-03-01T16:45:00Z",
    action: "UPDATE_PROGRESS",
    actionText: "Cập nhật tiến độ",
    user: "Lê Văn C",
    userRole: "Kỹ sư giám sát",
    entityType: "CONTRACT",
    entityId: "HĐ-2024-001",
    entityName: "Xây dựng cầu Nhật Tân 2",
    details: "Cập nhật tiến độ từ 50% lên 75%",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    blockchainHash: "0x3c4d5e6f7890abcdef1234567890abcd",
    status: "SUCCESS",
    severity: "INFO",
  },
  {
    id: "audit-005",
    timestamp: "2024-04-15T11:30:00Z",
    action: "DELETE_ATTEMPT",
    actionText: "Thử xóa hợp đồng",
    user: "Phạm Thị D",
    userRole: "Nhân viên",
    entityType: "CONTRACT",
    entityId: "HĐ-2024-002",
    entityName: "Nâng cấp hệ thống điện",
    details: "Thử xóa hợp đồng đang hoạt động - bị từ chối",
    ipAddress: "192.168.1.103",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    blockchainHash: null,
    status: "BLOCKED",
    severity: "ERROR",
  },
];

export default function AuditPage() {
  const { collapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "INFO":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Thông tin
          </Badge>
        );
      case "WARNING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Cảnh báo
          </Badge>
        );
      case "ERROR":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Lỗi
          </Badge>
        );
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Thành công
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Thất bại
          </Badge>
        );
      case "BLOCKED":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Bị chặn
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE_CONTRACT":
        return <Plus className="h-4 w-4" />;
      case "UPDATE_PROGRESS":
        return <Edit className="h-4 w-4" />;
      case "APPROVE_CONTRACT":
        return <CheckCircle className="h-4 w-4" />;
      case "DELETE_ATTEMPT":
        return <Trash2 className="h-4 w-4" />;
      case "LOGIN_FAILED":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      selectedAction === "all" || log.action === selectedAction;
    const matchesSeverity =
      selectedSeverity === "all" || log.severity === selectedSeverity;

    return matchesSearch && matchesAction && matchesSeverity;
  });

  return (
    <div className="layout-container bg-background">
      <Sidebar />
      <div className={cn("main-content", collapsed && "sidebar-collapsed")}>
        <Header />
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Audit Trail
              </h1>
              <p className="text-muted-foreground mt-2">
                Theo dõi tất cả hoạt động và thay đổi trong hệ thống với xác
                thực blockchain
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>

          <Tabs defaultValue="logs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="logs">Nhật ký hoạt động</TabsTrigger>
              <TabsTrigger value="blockchain">Blockchain Records</TabsTrigger>
              <TabsTrigger value="analytics">Phân tích</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select
                      value={selectedAction}
                      onValueChange={setSelectedAction}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Loại hoạt động" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả hoạt động</SelectItem>
                        <SelectItem value="CREATE_CONTRACT">
                          Tạo hợp đồng
                        </SelectItem>
                        <SelectItem value="UPDATE_PROGRESS">
                          Cập nhật tiến độ
                        </SelectItem>
                        <SelectItem value="APPROVE_CONTRACT">
                          Phê duyệt
                        </SelectItem>
                        <SelectItem value="LOGIN_FAILED">
                          Đăng nhập thất bại
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedSeverity}
                      onValueChange={setSelectedSeverity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Mức độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả mức độ</SelectItem>
                        <SelectItem value="INFO">Thông tin</SelectItem>
                        <SelectItem value="WARNING">Cảnh báo</SelectItem>
                        <SelectItem value="ERROR">Lỗi</SelectItem>
                      </SelectContent>
                    </Select>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom
                            ? format(dateFrom, "dd/MM/yyyy", { locale: vi })
                            : "Từ ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo
                            ? format(dateTo, "dd/MM/yyyy", { locale: vi })
                            : "Đến ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Nhật ký hoạt động</CardTitle>
                  <CardDescription>
                    Tổng cộng {filteredLogs.length} bản ghi được tìm thấy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{log.actionText}</h4>
                              {getSeverityBadge(log.severity)}
                              {getStatusBadge(log.status)}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(log.timestamp).toLocaleString("vi-VN")}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">
                                Người thực hiện:
                              </p>
                              <p className="font-medium">
                                {log.user} ({log.userRole})
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Đối tượng:
                              </p>
                              <p className="font-medium">
                                {log.entityName} ({log.entityId})
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mt-2">
                            {log.details}
                          </p>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>IP: {log.ipAddress}</span>
                              <span>•</span>
                              <span>ID: {log.id}</span>
                            </div>
                            {log.blockchainHash && (
                              <div className="flex items-center space-x-1">
                                <Shield className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-green-600 font-mono">
                                  {log.blockchainHash}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blockchain" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Blockchain Records
                  </CardTitle>
                  <CardDescription>
                    Tất cả giao dịch được xác thực trên Hyperledger Fabric
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredLogs
                      .filter((log) => log.blockchainHash)
                      .map((log) => (
                        <div
                          key={log.id}
                          className="p-4 border border-green-200 rounded-lg bg-green-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="font-medium">
                                {log.actionText}
                              </span>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Đã xác thực
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString("vi-VN")}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-muted-foreground">
                                Block Hash:
                              </p>
                              <p className="font-mono text-xs break-all">
                                {log.blockchainHash}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">
                                Transaction ID:
                              </p>
                              <p className="font-mono text-xs">{log.id}</p>
                            </div>
                          </div>

                          <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                            <p>Network: Hyperledger Fabric v2.4</p>
                            <p>Channel: government-contracts</p>
                            <p>Chaincode: audit-trail-v1.0</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Tổng hoạt động
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{auditLogs.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Trong 30 ngày qua
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Thành công
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {
                        auditLogs.filter((log) => log.status === "SUCCESS")
                          .length
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(
                        (auditLogs.filter((log) => log.status === "SUCCESS")
                          .length /
                          auditLogs.length) *
                          100
                      )}
                      % tỷ lệ thành công
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cảnh báo
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {
                        auditLogs.filter(
                          (log) =>
                            log.severity === "WARNING" ||
                            log.severity === "ERROR"
                        ).length
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">Cần xem xét</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Blockchain
                    </CardTitle>
                    <Shield className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {auditLogs.filter((log) => log.blockchainHash).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Giao dịch đã xác thực
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Activity by User */}
              <Card>
                <CardHeader>
                  <CardTitle>Hoạt động theo người dùng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      auditLogs.reduce((acc, log) => {
                        acc[log.user] = (acc[log.user] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort(([, a], [, b]) => b - a)
                      .map(([user, count]) => (
                        <div
                          key={user}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user}</span>
                          </div>
                          <Badge variant="outline">{count} hoạt động</Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
