"use client";

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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockchainStatus } from "@/components/blockchain-status";
import { BlockchainTransaction } from "@/components/blockchain-transaction";
import {
  Shield,
  Key,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  Database,
} from "lucide-react";

export default function SecurityPage() {
  const { collapsed } = useSidebar();
  const mockTransactionData = {
    id: "security-audit-001",
    type: "SECURITY_AUDIT",
    description: "Kiểm tra bảo mật hệ thống",
    data: {
      timestamp: new Date().toISOString(),
      auditType: "SYSTEM_SECURITY",
      findings: [],
    },
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
                Bảo mật & Blockchain
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý bảo mật hệ thống và giám sát blockchain Hyperledger
                Fabric
              </p>
            </div>
          </div>

          <Tabs defaultValue="blockchain" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
              <TabsTrigger value="security">Bảo mật</TabsTrigger>
              <TabsTrigger value="access">Quyền truy cập</TabsTrigger>
              <TabsTrigger value="monitoring">Giám sát</TabsTrigger>
            </TabsList>

            <TabsContent value="blockchain" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Blockchain Status */}
                <BlockchainStatus />

                {/* Transaction Demo */}
                <BlockchainTransaction
                  transactionData={mockTransactionData}
                  onComplete={(txHash) =>
                    console.log("Transaction completed:", txHash)
                  }
                  onError={(error) =>
                    console.error("Transaction error:", error)
                  }
                />
              </div>

              {/* Network Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Thông tin mạng Hyperledger
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Network Configuration</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Network: government-contracts-network</p>
                        <p>Channel: contract-management</p>
                        <p>Chaincode: contract-mgmt-v1.2.0</p>
                        <p>MSP ID: GovernmentMSP</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Peers</h4>
                      <div className="space-y-2">
                        {[
                          { name: "peer0.government.vn", status: "active" },
                          { name: "peer1.government.vn", status: "active" },
                          { name: "peer0.contractor.vn", status: "active" },
                          {
                            name: "peer1.contractor.vn",
                            status: "maintenance",
                          },
                        ].map((peer) => (
                          <div
                            key={peer.name}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{peer.name}</span>
                            <Badge
                              className={
                                peer.status === "active"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              }
                            >
                              {peer.status === "active"
                                ? "Hoạt động"
                                : "Bảo trì"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Orderers</h4>
                      <div className="space-y-2">
                        {[
                          { name: "orderer0.government.vn", status: "active" },
                          { name: "orderer1.government.vn", status: "active" },
                          { name: "orderer2.government.vn", status: "active" },
                        ].map((orderer) => (
                          <div
                            key={orderer.name}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{orderer.name}</span>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Hoạt động
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              {/* Security Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Mức bảo mật
                    </CardTitle>
                    <Shield className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">Cao</div>
                    <p className="text-xs text-muted-foreground">
                      Tất cả kiểm tra đều pass
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Chứng chỉ SSL
                    </CardTitle>
                    <Lock className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      Hợp lệ
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hết hạn: 15/12/2024
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Mã hóa
                    </CardTitle>
                    <Key className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">AES-256</div>
                    <p className="text-xs text-muted-foreground">
                      Dữ liệu được mã hóa
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Lỗ hổng
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <p className="text-xs text-muted-foreground">
                      Không phát hiện
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Security Checks */}
              <Card>
                <CardHeader>
                  <CardTitle>Kiểm tra bảo mật</CardTitle>
                  <CardDescription>
                    Kết quả kiểm tra bảo mật hệ thống gần nhất
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        check: "Xác thực đa yếu tố (MFA)",
                        status: "pass",
                        description: "Tất cả tài khoản admin đã bật MFA",
                      },
                      {
                        check: "Mã hóa dữ liệu",
                        status: "pass",
                        description: "Dữ liệu được mã hóa AES-256",
                      },
                      {
                        check: "Kiểm soát truy cập",
                        status: "pass",
                        description: "RBAC được triển khai đúng cách",
                      },
                      {
                        check: "Audit logging",
                        status: "pass",
                        description: "Tất cả hoạt động được ghi log",
                      },
                      {
                        check: "Network security",
                        status: "pass",
                        description: "Firewall và VPN hoạt động tốt",
                      },
                      {
                        check: "Backup & Recovery",
                        status: "warning",
                        description: "Cần kiểm tra backup định kỳ",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {item.status === "pass" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <p className="font-medium">{item.check}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            item.status === "pass"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {item.status === "pass" ? "Đạt" : "Cảnh báo"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="access" className="space-y-6">
              {/* Access Control */}
              <Card>
                <CardHeader>
                  <CardTitle>Kiểm soát quyền truy cập</CardTitle>
                  <CardDescription>
                    Quản lý quyền truy cập và vai trò người dùng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        role: "Quản trị viên",
                        users: 2,
                        permissions: ["Toàn quyền"],
                        color: "red",
                      },
                      {
                        role: "Giám đốc",
                        users: 3,
                        permissions: ["Phê duyệt hợp đồng", "Xem báo cáo"],
                        color: "blue",
                      },
                      {
                        role: "Quản lý dự án",
                        users: 8,
                        permissions: ["Tạo hợp đồng", "Cập nhật tiến độ"],
                        color: "green",
                      },
                      {
                        role: "Kế toán",
                        users: 4,
                        permissions: ["Xem tài chính", "Thanh toán"],
                        color: "yellow",
                      },
                      {
                        role: "Nhân viên",
                        users: 15,
                        permissions: ["Xem hợp đồng", "Cập nhật thông tin"],
                        color: "gray",
                      },
                    ].map((role, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full bg-${role.color}-500`}
                          ></div>
                          <div>
                            <p className="font-medium">{role.role}</p>
                            <p className="text-sm text-muted-foreground">
                              {role.users} người dùng
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-wrap gap-1 justify-end">
                            {role.permissions.slice(0, 2).map((perm, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {perm}
                              </Badge>
                            ))}
                            {role.permissions.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              {/* System Monitoring */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Uptime
                    </CardTitle>
                    <Activity className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      99.9%
                    </div>
                    <p className="text-xs text-muted-foreground">30 ngày qua</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Response Time
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">245ms</div>
                    <p className="text-xs text-muted-foreground">Trung bình</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Users
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">28</div>
                    <p className="text-xs text-muted-foreground">Đang online</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Alerts
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <p className="text-xs text-muted-foreground">
                      Cảnh báo chưa xử lý
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Cảnh báo gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        type: "warning",
                        message: "Backup database cần được kiểm tra",
                        time: "2 giờ trước",
                        severity: "medium",
                      },
                      {
                        type: "info",
                        message: "Blockchain network đã đồng bộ thành công",
                        time: "4 giờ trước",
                        severity: "low",
                      },
                      {
                        type: "warning",
                        message: "Disk space trên server đạt 85%",
                        time: "6 giờ trước",
                        severity: "medium",
                      },
                    ].map((alert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {alert.type === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          )}
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.time}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            alert.severity === "medium"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          }
                        >
                          {alert.severity === "medium" ? "Trung bình" : "Thấp"}
                        </Badge>
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
